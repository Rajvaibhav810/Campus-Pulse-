import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { calculatePriorityScore, getPriorityTier } from '../services/priorityEngine';
import { supabaseClient } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const IssueContext = createContext();

export function IssueProvider({ children }) {
  const { currentUser } = useAuth();
  const [rawIssues, setRawIssues] = useState(() => storageService.loadIssues());
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'need_schema' | 'local_fallback' | 'local_only'

  // Initialize and sync with Supabase if configured
  useEffect(() => {
    async function initBackend() {
      if (supabaseClient.isConfigured) {
        try {
          const pingResult = await supabaseClient.ping();
          if (pingResult.ok) {
            setBackendStatus('connected');
            const remote = await supabaseClient.getIssues();
            if (remote && remote.length > 0) {
              setRawIssues(remote);
              storageService.saveIssues(remote);
            }
          } else if (pingResult.status === 'need_schema') {
            setBackendStatus('need_schema');
          } else {
            setBackendStatus('local_fallback');
          }
        } catch (e) {
          console.warn('Backend sync check failed', e);
          setBackendStatus('local_fallback');
        }
      } else {
        setBackendStatus('local_only');
      }
    }
    initBackend();
  }, []);

  // Save to local storage whenever issues change (hybrid cache)
  useEffect(() => {
    storageService.saveIssues(rawIssues);
  }, [rawIssues]);

  // Enrich issues with computed dynamic priority
  const issues = rawIssues.map(issue => {
    const score = calculatePriorityScore(issue);
    const tier = getPriorityTier(score);
    return {
      ...issue,
      priorityScore: score,
      priorityTier: tier.tier,
      priorityLabel: tier.label
    };
  });

  // Create new issue
  const createIssue = (draft) => {
    const newId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIssue = {
      id: newId,
      title: draft.title.trim(),
      description: draft.description || '',
      category: draft.category || 'other',
      location: {
        zone: draft.zone || 'Main Campus',
        area: draft.area || draft.locationText || 'General',
        fullText: draft.locationText || `${draft.zone || 'Main'}, ${draft.area || 'General'}`
      },
      urgency: draft.urgency || 'medium',
      status: 'reported',
      reportedBy: {
        id: currentUser.id,
        name: draft.isAnonymous ? 'Anonymous Member' : currentUser.name,
        initials: draft.isAnonymous ? '??' : currentUser.initials,
        isAnonymous: Boolean(draft.isAnonymous)
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      affectedCount: 1,
      confirmedUserIds: [currentUser.id],
      photoUrl: draft.photoUrl || null,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'reported',
          actor: draft.isAnonymous ? 'Anonymous Member' : currentUser.name,
          note: 'Issue submitted.'
        }
      ]
    };

    setRawIssues(prev => [newIssue, ...prev]);

    // Sync to Supabase in background
    if (backendStatus === 'connected') {
      supabaseClient.createIssue(newIssue);
    }

    return newIssue;
  };

  // Confirm existing issue ("I'm facing this too")
  const toggleConfirmIssue = (issueId) => {
    let wasConfirmed = false;
    setRawIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const isAlreadyConfirmed = issue.confirmedUserIds?.includes(currentUser.id);
      wasConfirmed = isAlreadyConfirmed;
      let updatedUserIds;
      let newCount = issue.affectedCount || 1;

      if (isAlreadyConfirmed) {
        updatedUserIds = (issue.confirmedUserIds || []).filter(id => id !== currentUser.id);
        newCount = Math.max(1, newCount - 1);
      } else {
        updatedUserIds = [...(issue.confirmedUserIds || []), currentUser.id];
        newCount = newCount + 1;
      }

      return {
        ...issue,
        affectedCount: newCount,
        confirmedUserIds: updatedUserIds,
        updatedAt: new Date().toISOString()
      };
    }));

    // Sync confirmation to Supabase in background
    if (backendStatus === 'connected') {
      supabaseClient.toggleConfirmation(issueId, currentUser.id, wasConfirmed);
    }
  };

  // Update status (e.g. Under Review, Assigned, In Progress, Resolved, Reopened)
  const updateIssueStatus = (issueId, newStatus, note, actorName) => {
    const actor = actorName || currentUser.name;
    const historyNote = note || `Status updated to ${newStatus.replace('_', ' ')}`;

    setRawIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const historyEntry = {
        id: `h-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: newStatus,
        actor: actor,
        note: historyNote
      };

      return {
        ...issue,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        history: [...(issue.history || []), historyEntry]
      };
    }));

    // Sync to Supabase in background
    if (backendStatus === 'connected') {
      supabaseClient.updateStatus(issueId, newStatus, historyNote, actor);
    }
  };

  // Assign issue to handler
  const assignIssue = (issueId, handlerUser, note = '') => {
    setRawIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const historyEntry = {
        id: `h-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'assigned',
        actor: currentUser.name,
        note: note || `Assigned to ${handlerUser.name} (${handlerUser.roleLabel || 'Handler'})`
      };

      return {
        ...issue,
        status: 'assigned',
        assignedTo: {
          id: handlerUser.id,
          name: handlerUser.name,
          role: handlerUser.roleLabel || 'Operations Specialist'
        },
        updatedAt: new Date().toISOString(),
        history: [...(issue.history || []), historyEntry]
      };
    }));
  };

  // Mark issue resolved with proof & note
  const resolveIssue = (issueId, { note, afterPhotoUrl }) => {
    setRawIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const historyEntry = {
        id: `h-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'resolved',
        actor: currentUser.name,
        note: `Resolved: ${note}`
      };

      return {
        ...issue,
        status: 'resolved',
        updatedAt: new Date().toISOString(),
        resolutionEvidence: {
          resolvedAt: new Date().toISOString(),
          resolvedBy: currentUser.name,
          note: note,
          afterPhotoUrl: afterPhotoUrl || null,
          verifiedCount: 0,
          reopenCount: 0
        },
        history: [...(issue.history || []), historyEntry]
      };
    }));

    // Sync to Supabase in background
    if (backendStatus === 'connected') {
      supabaseClient.resolveIssue(issueId, {
        note,
        afterPhotoUrl,
        resolvedBy: currentUser.name
      });
    }
  };

  // Member verification feedback ("Fixed" vs "Still broken -> Reopen")
  const verifyResolution = (issueId, isFixed, feedbackText = '') => {
    setRawIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const resolution = issue.resolutionEvidence || {
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'Staff',
        note: 'Issue marked resolved',
        verifiedCount: 0,
        reopenCount: 0
      };

      if (isFixed) {
        return {
          ...issue,
          resolutionEvidence: {
            ...resolution,
            verifiedCount: (resolution.verifiedCount || 0) + 1
          }
        };
      } else {
        // Reopen ticket
        const historyEntry = {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'reopened',
          actor: currentUser.name,
          note: feedbackText ? `Member flagged issue persists: "${feedbackText}"` : 'Member reported issue has not been resolved.'
        };

        return {
          ...issue,
          status: 'reopened',
          urgency: 'high',
          updatedAt: new Date().toISOString(),
          resolutionEvidence: {
            ...resolution,
            reopenCount: (resolution.reopenCount || 0) + 1
          },
          history: [...(issue.history || []), historyEntry]
        };
      }
    }));

    if (backendStatus === 'connected' && !isFixed) {
      supabaseClient.updateStatus(issueId, 'reopened', feedbackText || 'Reopened by member', currentUser.name);
    }
  };

  const getIssueById = (id) => issues.find(i => i.id === id);

  return (
    <IssueContext.Provider value={{
      issues,
      rawIssues,
      backendStatus,
      createIssue,
      toggleConfirmIssue,
      updateIssueStatus,
      assignIssue,
      resolveIssue,
      verifyResolution,
      getIssueById,
      resetData: () => {
        storageService.resetToDefaults();
        setRawIssues(storageService.loadIssues());
      }
    }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}
