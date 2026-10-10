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

  // Fetch all issues from Supabase
  async getIssues() {
    if (!isSupabaseConfigured) return null;
    try {
      const url = `${SUPABASE_URL}/rest/v1/issues?select=*,resolution_evidence(*),issue_confirmations(*),issue_history(*)&order=created_at.desc`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) {
        console.warn(`Supabase getIssues returned status ${res.status}. Falling back to local storage.`);
        return null;
      }
      const data = await res.json();
      
      // Transform PostgreSQL snake_case to frontend camelCase
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category,
        location: {
          zone: item.zone,
          area: item.area,
          fullText: item.location_full_text
        },
        urgency: item.urgency,
        status: item.status,
        affectedCount: item.affected_count || 1,
        priorityScore: item.priority_score,
        priorityTier: item.priority_tier,
        photoUrl: item.photo_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        reportedBy: {
          id: item.reported_by_id || 'anonymous',
          name: item.is_anonymous ? 'Anonymous Member' : 'Member',
          initials: item.is_anonymous ? '??' : 'MB',
          isAnonymous: item.is_anonymous
        },
        confirmedUserIds: (item.issue_confirmations || []).map(c => c.user_id),
        resolutionEvidence: item.resolution_evidence?.[0] ? {
          resolvedAt: item.resolution_evidence[0].resolved_at,
          resolvedBy: item.resolution_evidence[0].resolved_by_name,
          note: item.resolution_evidence[0].resolution_note,
          afterPhotoUrl: item.resolution_evidence[0].after_photo_url,
          verifiedCount: item.resolution_evidence[0].verified_count || 0,
          reopenCount: item.resolution_evidence[0].reopened_count || 0
        } : null,
        history: (item.issue_history || []).map(h => ({
          id: h.id,
          timestamp: h.created_at,
          status: h.status,
          actor: h.actor_name,
          note: h.note
        }))
      }));
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local data', e);
      return null;
    }
  },

  // Insert a new issue to Supabase
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
      return res.ok;
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
          note: note || `Status changed to ${status}`
        })
      });

      return true;
    } catch (e) {
      console.warn('Supabase updateStatus error', e);
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

      return true;
    } catch (e) {
      console.warn('Supabase resolveIssue error', e);
      return false;
    }
  }
};
