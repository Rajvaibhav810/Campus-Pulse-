import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, Clock, Calendar, CheckCircle, RotateCcw, 
  Send, UserCheck, CheckCircle2, AlertCircle, Wrench, Shield, 
  ThumbsUp, ThumbsDown, MessageSquare, Image, ExternalLink
} from 'lucide-react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CategoryPill } from '../components/common/CategoryPill';
import { ConfirmationButton } from '../components/common/ConfirmationButton';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';

export function IssueDetailPage({ issueId, onBack, onNavigate }) {
  const { getIssueById, updateIssueStatus, assignIssue, resolveIssue, verifyResolution } = useIssues();
  const { currentUser, users, isHandler, isAdmin } = useAuth();

  const issue = getIssueById(issueId);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');

  // Reopen feedback modal state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Work note input
  const [workNote, setWorkNote] = useState('');

  if (!issue) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>Issue not found</h3>
        <p style={{ color: '#64748b', marginTop: '8px' }}>The requested issue could not be found or has been removed.</p>
        <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Issues</span>
        </button>
      </div>
    );
  }

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note describing how the problem was resolved.');
      return;
    }
    resolveIssue(issue.id, {
      note: resolutionNote,
      afterPhotoUrl: afterPhotoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    });
    setShowResolveModal(false);
    setResolutionNote('');
  };

  const handleReopenSubmit = (e) => {
    e.preventDefault();
    verifyResolution(issue.id, false, reopenReason);
    setShowReopenModal(false);
    setReopenReason('');
  };

  const handleAddWorkNote = (e) => {
    e.preventDefault();
    if (!workNote.trim()) return;
    updateIssueStatus(issue.id, issue.status, workNote, currentUser.name);
    setWorkNote('');
  };

  return (
    <div className="page-container" style={{ maxWidth: '840px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Ticket #{issue.id}</span>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Main Issue Card Header */}
      <div className="issue-detail-header">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
          <CategoryPill categoryId={issue.category} />
          <UrgencyBadge urgency={issue.urgency} />
          <PriorityScoreBadge score={issue.priorityScore} />
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          {issue.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#475569', fontSize: '0.85rem', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="#1d4ed8" />
            <span style={{ fontWeight: 600 }}>{issue.location?.fullText}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#64748b" />
            <span>Reported {new Date(issue.createdAt).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>By:</span>
            <span>{issue.reportedBy.name}</span>
          </div>
        </div>

        {/* Collective Confirmation Bar */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '12px'
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              Collective Impact: {issue.affectedCount} people affected
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Confirming this issue helps dispatchers prioritize resolution over isolated complaints.
            </p>
          </div>
          <ConfirmationButton issue={issue} size="large" />
        </div>

        {/* Detailed Description */}
        {issue.description && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Details & Observations
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, background: '#fafafa', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              {issue.description}
            </p>
          </div>
        )}

        {/* Before Photo if available */}
        {issue.photoUrl && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Reported Photo Evidence
            </h4>
            <img
              src={issue.photoUrl}
              alt="Reported problem"
              style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </div>
        )}
      </div>

      {/* RESOLUTION PROOF BOX (When issue is resolved) */}
      {issue.status === 'resolved' && issue.resolutionEvidence && (
        <div className="resolution-proof-box">
          <div className="resolution-proof-header">
            <CheckCircle2 size={20} />
            <span>Resolution Verified by Operations</span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#14532d', marginBottom: '10px' }}>
            <strong>Action Taken by {issue.resolutionEvidence.resolvedBy}:</strong> {issue.resolutionEvidence.note}
          </p>

          <p style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '14px' }}>
            Resolved on {new Date(issue.resolutionEvidence.resolvedAt).toLocaleString()}
          </p>

          {issue.resolutionEvidence.afterPhotoUrl && (
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '4px' }}>
                After Photo (Resolution Evidence):
              </span>
              <img
                src={issue.resolutionEvidence.afterPhotoUrl}
                alt="Resolution after proof"
                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #86efac' }}
              />
            </div>
          )}

          {/* Member Resolution Feedback Voting */}
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0', marginTop: '10px' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d', marginBottom: '4px' }}>
              Was this problem actually resolved?
            </h5>
            <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '10px' }}>
              Your feedback verifies the fix. If the problem continues, reopen it for priority escalation.
            </p>
            <div className="verification-actions">
              <button
                className="btn-verify-yes"
                onClick={() => {
                  verifyResolution(issue.id, true);
                  alert('Thank you! Your verification feedback was recorded.');
                }}
              >
                <ThumbsUp size={15} />
                <span>Yes, it is fixed ({issue.resolutionEvidence.verifiedCount || 0})</span>
              </button>
              <button
                className="btn-verify-reopen"
                onClick={() => setShowReopenModal(true)}
              >
                <RotateCcw size={15} />
                <span>No, problem persists (Reopen)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REOPENED ALERT (If issue was reopened) */}
      {issue.status === 'reopened' && (
        <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: 700, fontSize: '0.92rem' }}>
            <AlertCircle size={18} />
            <span>This issue was Reopened by members</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#9a3412', marginTop: '6px' }}>
            The reported resolution was disputed or the problem has recurred. Urgency has been automatically escalated.
          </p>
        </div>
      )}

      {/* DOMAIN ADMINISTRATOR OPERATIONS CONTROLS */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: '20px', border: '1.5px solid #bfdbfe', background: '#f8fbff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#1d4ed8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Domain Administrator Controls
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
              {currentUser.roleLabel}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {issue.status !== 'in_progress' && issue.status !== 'resolved' && (
              <button
                className="btn-primary"
                onClick={() => updateIssueStatus(issue.id, 'in_progress', 'Technician started physical inspection and repairs on-site.')}
              >
                Start Work (In Progress)
              </button>
            )}

            {issue.status !== 'resolved' && (
              <button
                className="btn-primary"
                style={{ backgroundColor: '#16a34a' }}
                onClick={() => setShowResolveModal(true)}
              >
                <CheckCircle2 size={16} />
                <span>Mark as Resolved</span>
              </button>
            )}

            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assign to:</span>
                <select
                  className="input-select"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                  onChange={(e) => {
                    const target = users.find(u => u.id === e.target.value);
                    if (target) assignIssue(issue.id, target);
                  }}
                  value={issue.assignedTo?.id || ''}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'admin' ? 'Admin' : 'Member'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Add quick work note */}
          <form onSubmit={handleAddWorkNote} style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <input
              type="text"
              className="input-text"
              placeholder="Add an internal operations note or dispatch update..."
              value={workNote}
              onChange={(e) => setWorkNote(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <button type="submit" className="btn-secondary" style={{ flexShrink: 0 }}>
              <Send size={14} />
              <span>Post Note</span>
            </button>
          </form>
        </div>
      )}

      {/* Status History & Audit Timeline */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#1d4ed8" />
          <span>Lifecycle Audit & Progress History</span>
        </h3>

        <div className="timeline-track">
          {(issue.history || []).map((event, idx) => (
            <div key={event.id || idx} className="timeline-event">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <h5>{event.status.replace('_', ' ').toUpperCase()}</h5>
                  <span className="timeline-time">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p><strong>{event.actor}:</strong> {event.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESOLUTION MODAL DIALOG */}
      {showResolveModal && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Complete Resolution for #{issue.id}</h3>
              <button className="icon-btn" onClick={() => setShowResolveModal(false)}>✕</button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label-row">
                    <span>Resolution Summary *</span>
                  </label>
                  <textarea
                    rows={3}
                    className="input-textarea"
                    placeholder="Describe the actions taken (e.g. replaced gasket, rebooted router AP, cleaned spillage)..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-row">
                    <span>After-Photo Evidence URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input-text"
                    placeholder="https://... or paste image link"
                    value={afterPhotoUrl}
                    onChange={(e) => setAfterPhotoUrl(e.target.value)}
                  />
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    Providing an after-photo lets members verify the problem was cleared.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowResolveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#16a34a' }}>
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REOPEN MODAL DIALOG */}
      {showReopenModal && (
        <div className="modal-overlay" onClick={() => setShowReopenModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>Reopen Issue #{issue.id}</h3>
              <button className="icon-btn" onClick={() => setShowReopenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReopenSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
                  Please describe what is still broken or how the problem continues so handlers can address it immediately:
                </p>
                <textarea
                  rows={3}
                  className="input-textarea"
                  placeholder="e.g. The leak resumed after 2 hours; water is still pooling on the stairs..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReopenModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#dc2626' }}>
                  Reopen Issue with High Urgency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
