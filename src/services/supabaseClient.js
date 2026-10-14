// Campus Pulse — Zero-dependency Supabase PostgREST Client Adapter
// Works with pure browser fetch and automatically connects to your Supabase instance.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.includes('supabase.co') &&
  !SUPABASE_ANON_KEY.includes('your-')
);

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const supabaseClient = {
  isConfigured: isSupabaseConfigured,
  url: SUPABASE_URL,

  // Test connection to Supabase
  async ping() {
    if (!isSupabaseConfigured) return { ok: false, error: 'Not configured' };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/issues?select=count`, {
        headers: getHeaders()
      });
      if (res.ok) {
        return { ok: true, status: 'Connected and tables exist' };
      }
      if (res.status === 404 || res.status === 400) {
        return { ok: false, status: 'need_schema', error: 'Connected to Supabase, but schema.sql needs to be run in the SQL Editor.' };
      }
      return { ok: false, status: 'error', error: `HTTP ${res.status}: ${res.statusText}` };
    } catch (e) {
      return { ok: false, status: 'network_error', error: e.message };
    }
  },

  // Fetch all issues from Supabase with relations
  async getIssues() {
    if (!isSupabaseConfigured) return null;
    try {
      const url = `${SUPABASE_URL}/rest/v1/issues?select=*,resolution_evidence(*),issue_confirmations(*),issue_history(*)&order=created_at.desc`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) {
        console.warn(`Supabase getIssues returned status ${res.status}. Falling back to local cache.`);
        return null;
      }
      const data = await res.json();
      
      // Transform PostgreSQL snake_case to frontend camelCase
      return data.map(item => {
        const confirmations = item.issue_confirmations || [];
        const historyEvents = (item.issue_history || []).map(h => ({
          id: h.id,
          timestamp: h.created_at,
          status: h.status,
          actor: h.actor_name || 'System',
          note: h.note || ''
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const evidence = item.resolution_evidence?.[0] ? {
          resolvedAt: item.resolution_evidence[0].resolved_at,
          resolvedBy: item.resolution_evidence[0].resolved_by_name || 'Operations Staff',
          note: item.resolution_evidence[0].resolution_note || '',
          afterPhotoUrl: item.resolution_evidence[0].after_photo_url || null,
          verifiedCount: item.resolution_evidence[0].verified_count || 0,
          reopenCount: item.resolution_evidence[0].reopened_count || 0
        } : null;

        return {
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: item.category,
          location: {
            zone: item.zone || 'Main Zone',
            area: item.area || 'General',
            fullText: item.location_full_text || `${item.zone || ''}, ${item.area || ''}`
          },
          urgency: item.urgency,
          status: item.status,
          affectedCount: Math.max(item.affected_count || 1, confirmations.length),
          priorityScore: item.priority_score,
          priorityTier: item.priority_tier,
          photoUrl: item.photo_url || null,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          reportedBy: {
            id: item.reported_by_id || 'anonymous',
            name: item.is_anonymous ? 'Anonymous Member' : 'Campus Member',
            initials: item.is_anonymous ? '??' : 'MB',
            isAnonymous: item.is_anonymous
          },
          assignedTo: item.assigned_to_id ? {
            id: item.assigned_to_id,
            name: item.assigned_to_id,
            role: 'Assigned Specialist'
          } : null,
          confirmedUserIds: confirmations.map(c => c.user_id),
          resolutionEvidence: evidence,
          history: historyEvents
        };
      });
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local data', e);
      return null;
    }
  },

  // Insert a new issue to Supabase (including initial history and confirmation)
  async createIssue(issue) {
    if (!isSupabaseConfigured) return null;
    try {
      const payload = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        zone: issue.location.zone || 'Main Zone',
        area: issue.location.area || 'General',
        location_full_text: issue.location.fullText,
        urgency: issue.urgency,
        status: issue.status,
        affected_count: issue.affectedCount || 1,
        priority_score: issue.priorityScore || 20,
        priority_tier: issue.priorityTier || 'medium',
        is_anonymous: Boolean(issue.reportedBy?.isAnonymous),
        photo_url: issue.photoUrl || null
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/issues`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.warn(`Supabase createIssue returned HTTP ${res.status}`);
        return false;
      }

      // Add initial history event
      await fetch(`${SUPABASE_URL}/rest/v1/issue_history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          issue_id: issue.id,
          status: 'reported',
          actor_name: issue.reportedBy?.isAnonymous ? 'Anonymous Member' : (issue.reportedBy?.name || 'Reporter'),
          note: 'Issue submitted.'
        })
      });

      // Add reporter confirmation if present
      if (issue.reportedBy?.id && issue.reportedBy.id !== 'anonymous') {
        await fetch(`${SUPABASE_URL}/rest/v1/issue_confirmations`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            issue_id: issue.id,
            user_id: issue.reportedBy.id
          })
        });
      }

      return true;
    } catch (e) {
      console.warn('Supabase createIssue error', e);
      return false;
    }
  },

  // Toggle confirmation in Supabase
  async toggleConfirmation(issueId, userId, isConfirmed) {
    if (!isSupabaseConfigured) return false;
    try {
      if (isConfirmed) {
        // Delete confirmation
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/issue_confirmations?issue_id=eq.${issueId}&user_id=eq.${userId}`,
          { method: 'DELETE', headers: getHeaders() }
        );
        return res.ok;
      } else {
        // Insert confirmation
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/issue_confirmations`,
          {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ issue_id: issueId, user_id: userId })
          }
        );
        return res.ok;
      }
    } catch (e) {
      console.warn('Supabase toggleConfirmation error', e);
      return false;
    }
  },

  // Update status and append history
  async updateStatus(issueId, status, note, actorName) {
    if (!isSupabaseConfigured) return false;
    try {
      // 1. Update issue status
      await fetch(`${SUPABASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status,
          updated_at: new Date().toISOString()
        })
      });

      // 2. Add history entry
      await fetch(`${SUPABASE_URL}/rest/v1/issue_history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          issue_id: issueId,
          status,
          actor_name: actorName || 'Operations Staff',
          note: note || `Status changed to ${status.replace('_', ' ')}`
        })
      });

      return true;
    } catch (e) {
      console.warn('Supabase updateStatus error', e);
      return false;
    }
  },

  // Assign issue to handler
  async assignIssue(issueId, handlerUser, note, actorName) {
    if (!isSupabaseConfigured) return false;
    try {
      const handlerName = handlerUser.name || handlerUser.id || 'Assigned Specialist';
      await fetch(`${SUPABASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          assigned_to_id: handlerName,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
      });

      await fetch(`${SUPABASE_URL}/rest/v1/issue_history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          issue_id: issueId,
          status: 'assigned',
          actor_name: actorName || 'Operations Staff',
          note: note || `Assigned to ${handlerName}`
        })
      });

      return true;
    } catch (e) {
      console.warn('Supabase assignIssue error', e);
      return false;
    }
  },

  // Save resolution evidence
  async resolveIssue(issueId, { note, afterPhotoUrl, resolvedBy }) {
    if (!isSupabaseConfigured) return false;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
      });

      await fetch(`${SUPABASE_URL}/rest/v1/resolution_evidence`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          issue_id: issueId,
          resolved_by_name: resolvedBy || 'Operations Staff',
          resolution_note: note,
          after_photo_url: afterPhotoUrl || null,
          resolved_at: new Date().toISOString()
        })
      });

      await fetch(`${SUPABASE_URL}/rest/v1/issue_history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          issue_id: issueId,
          status: 'resolved',
          actor_name: resolvedBy || 'Operations Staff',
          note: `Resolved: ${note}`
        })
      });

      return true;
    } catch (e) {
      console.warn('Supabase resolveIssue error', e);
      return false;
    }
  },

  // Member verification ("Fixed" vs "Reopen")
  async verifyResolution(issueId, isFixed, feedbackText, actorName) {
    if (!isSupabaseConfigured) return false;
    try {
      if (isFixed) {
        // Fetch current resolution evidence to increment count
        const evRes = await fetch(`${SUPABASE_URL}/rest/v1/resolution_evidence?issue_id=eq.${issueId}`, { headers: getHeaders() });
        if (evRes.ok) {
          const evData = await evRes.json();
          if (evData && evData[0]) {
            await fetch(`${SUPABASE_URL}/rest/v1/resolution_evidence?id=eq.${evData[0].id}`, {
              method: 'PATCH',
              headers: getHeaders(),
              body: JSON.stringify({
                verified_count: (evData[0].verified_count || 0) + 1
              })
            });
          }
        }
      } else {
        // Reopen issue
        await fetch(`${SUPABASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            status: 'reopened',
            urgency: 'high',
            updated_at: new Date().toISOString()
          })
        });

        // Update evidence reopened_count
        const evRes = await fetch(`${SUPABASE_URL}/rest/v1/resolution_evidence?issue_id=eq.${issueId}`, { headers: getHeaders() });
        if (evRes.ok) {
          const evData = await evRes.json();
          if (evData && evData[0]) {
            await fetch(`${SUPABASE_URL}/rest/v1/resolution_evidence?id=eq.${evData[0].id}`, {
              method: 'PATCH',
              headers: getHeaders(),
              body: JSON.stringify({
                reopened_count: (evData[0].reopened_count || 0) + 1
              })
            });
          }
        }

        // Add history
        await fetch(`${SUPABASE_URL}/rest/v1/issue_history`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            issue_id: issueId,
            status: 'reopened',
            actor_name: actorName || 'Campus Member',
            note: feedbackText ? `Member flagged issue persists: "${feedbackText}"` : 'Member reported issue has not been resolved.'
          })
        });
      }

      return true;
    } catch (e) {
      console.warn('Supabase verifyResolution error', e);
      return false;
    }
  },

  // Delete issue from Supabase
  async deleteIssue(issueId) {
    if (!isSupabaseConfigured) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/issues?id=eq.${issueId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase deleteIssue error', e);
      return false;
    }
  },

  // Organization settings
  async getOrganization() {
    if (!isSupabaseConfigured) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/organizations?limit=1`, { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data[0]) {
        return {
          id: data[0].id,
          name: data[0].name,
          campusName: data[0].campus_name,
          emergencyHotline: {
            number: data[0].emergency_hotline_number,
            label: data[0].emergency_hotline_label,
            note: data[0].emergency_hotline_note
          }
        };
      }
      return null;
    } catch (e) {
      console.warn('Supabase getOrganization error', e);
      return null;
    }
  },

  async updateOrganization(org) {
    if (!isSupabaseConfigured || !org?.id) return false;
    try {
      const payload = {
        name: org.name,
        campus_name: org.campusName,
        emergency_hotline_number: org.emergencyHotline?.number,
        emergency_hotline_label: org.emergencyHotline?.label,
        emergency_hotline_note: org.emergencyHotline?.note
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/organizations?id=eq.${org.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase updateOrganization error', e);
      return false;
    }
  },

  // User profile persistence
  async saveProfile(user) {
    if (!isSupabaseConfigured) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          id: user.id,
          full_name: user.name,
          initials: user.initials,
          role: user.role,
          role_label: user.roleLabel,
          department: user.department || 'General Campus'
        })
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase saveProfile error', e);
      return false;
    }
  },

  async getProfiles() {
    if (!isSupabaseConfigured) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers: getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Supabase getProfiles error', e);
      return null;
    }
  }
};
