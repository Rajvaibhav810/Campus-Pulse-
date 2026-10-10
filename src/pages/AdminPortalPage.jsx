import React, { useState } from 'react';
import { 
  Shield, CheckCircle2, Clock, AlertTriangle, PlayCircle, 
  Filter, Wrench, ThumbsUp, RotateCcw, Droplets, Wifi, 
  Sparkles, Building2, ShieldAlert, Globe, ChevronRight, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { IssueCard } from '../components/issues/IssueCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';

const DOMAIN_ICONS = {
  water: { icon: Droplets, label: 'Water & Plumbing', color: '#0284c7', bg: '#f0f9ff' },
  wifi: { icon: Wifi, label: 'IT & Wi-Fi Networks', color: '#2563eb', bg: '#eff6ff' },
  cleanliness: { icon: Sparkles, label: 'Cleanliness & Sanitation', color: '#059669', bg: '#f0fdf4' },
  facilities: { icon: Building2, label: 'Facilities & HVAC', color: '#d97706', bg: '#fffbeb' },
  safety: { icon: ShieldAlert, label: 'Safety & Security', color: '#dc2626', bg: '#fef2f2' },
  all: { icon: Globe, label: 'All Campus Domains', color: '#7c3aed', bg: '#f5f3ff' }
};

export function AdminPortalPage({ onSelectIssue }) {
  const { currentUser, adminDomain } = useAuth();
  const { issues, updateIssueStatus, resolveIssue } = useIssues();

  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'in_progress' | 'resolved' | 'reopened'
  const [selectedIssueForAction, setSelectedIssueForAction] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolvePhoto, setResolvePhoto] = useState('');

  const domainMeta = DOMAIN_ICONS[adminDomain] || DOMAIN_ICONS.all;
  const DomainIcon = domainMeta.icon;

  // Filter issues for this administrator's domain
  const domainIssues = issues.filter(issue => {
    if (adminDomain !== 'all' && issue.category !== adminDomain) {
      return false;
    }
    return true;
  });

  // Categorize domain issues by operational status
  const openIssues = domainIssues.filter(i => i.status === 'reported' || i.status === 'under_review' || i.status === 'assigned');
  const inProgressIssues = domainIssues.filter(i => i.status === 'in_progress');
  const resolvedIssues = domainIssues.filter(i => i.status === 'resolved');
  const reopenedIssues = domainIssues.filter(i => i.status === 'reopened');

  const displayedIssues = 
    activeTab === 'triage' ? openIssues :
    activeTab === 'in_progress' ? inProgressIssues :
    activeTab === 'resolved' ? resolvedIssues :
    reopenedIssues;

  const handleQuickStatus = (issueId, newStatus, note) => {
    updateIssueStatus(issueId, newStatus, note, currentUser.name);
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolveNote.trim()) {
      alert('Please describe what action was taken to resolve the issue.');
      return;
    }
    resolveIssue(selectedIssueForAction.id, {
      note: resolveNote,
      afterPhotoUrl: resolvePhoto || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    });
    setSelectedIssueForAction(null);
    setResolveNote('');
    setResolvePhoto('');
  };

  return (
    <div className="page-container">
      {/* Domain Header Banner */}
      <div
        style={{
          background: domainMeta.bg,
          border: `1.5px solid ${domainMeta.color}33`,
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: domainMeta.color,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <DomainIcon size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: domainMeta.color,
                  letterSpacing: '0.05em'
                }}
              >
                Operational Command Center
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {domainMeta.label}
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#475569' }}>
              Authorized Lead: <strong>{currentUser.name}</strong> • Total Domain Tickets: <strong>{domainIssues.length}</strong>
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>{openIssues.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Needs Triage</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706' }}>{inProgressIssues.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>In Progress</div>
          </div>
          <div style={{ background: '#ffffff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>{resolvedIssues.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('triage')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'triage' ? 700 : 500,
            color: activeTab === 'triage' ? domainMeta.color : '#64748b',
            borderBottom: activeTab === 'triage' ? `2.5px solid ${domainMeta.color}` : '2.5px solid transparent',
            cursor: 'pointer'
          }}
        >
          Priority Triage ({openIssues.length})
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'in_progress' ? 700 : 500,
            color: activeTab === 'in_progress' ? '#d97706' : '#64748b',
            borderBottom: activeTab === 'in_progress' ? '2.5px solid #d97706' : '2.5px solid transparent',
            cursor: 'pointer'
          }}
        >
          Under Repair ({inProgressIssues.length})
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'resolved' ? 700 : 500,
            color: activeTab === 'resolved' ? '#16a34a' : '#64748b',
            borderBottom: activeTab === 'resolved' ? '2.5px solid #16a34a' : '2.5px solid transparent',
            cursor: 'pointer'
          }}
        >
          Verified Resolved ({resolvedIssues.length})
        </button>

        {reopenedIssues.length > 0 && (
          <button
            onClick={() => setActiveTab('reopened')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'reopened' ? 700 : 500,
              color: activeTab === 'reopened' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'reopened' ? '2.5px solid #dc2626' : '2.5px solid transparent',
              cursor: 'pointer'
            }}
          >
            ⚠️ Disputed / Reopened ({reopenedIssues.length})
          </button>
        )}
      </div>

      {/* Issues Queue */}
      {displayedIssues.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <CheckCircle2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Queue is clear</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
            No tickets currently require action under this filter in {domainMeta.label}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displayedIssues.map(issue => (
            <div
              key={issue.id}
              className="card"
              style={{ padding: '18px', border: '1.5px solid #e2e8f0', background: '#ffffff' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>#{issue.id}</span>
                  <UrgencyBadge urgency={issue.urgency} />
                  <PriorityScoreBadge score={issue.priorityScore} />
                </div>
                <StatusBadge status={issue.status} />
              </div>

              <h3
                style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px', cursor: 'pointer' }}
                onClick={() => onSelectIssue(issue.id)}
              >
                {issue.title}
              </h3>

              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
                📍 {issue.location?.fullText} • 👥 <strong>{issue.affectedCount} members confirmed affected</strong>
              </p>

              {issue.description && (
                <p style={{ fontSize: '0.84rem', color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px' }}>
                  {issue.description}
                </p>
              )}

              {/* Action Toolbar for Domain Admin */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  className="details-link"
                  style={{ background: 'none', border: 'none', fontSize: '0.8rem' }}
                  onClick={() => onSelectIssue(issue.id)}
                >
                  <span>Full Ticket History</span>
                  <ChevronRight size={14} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {issue.status !== 'in_progress' && issue.status !== 'resolved' && (
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      onClick={() => handleQuickStatus(issue.id, 'in_progress', `${currentUser.name} dispatched repair work.`)}
                    >
                      <PlayCircle size={14} />
                      <span>Start Work</span>
                    </button>
                  )}

                  {issue.status !== 'resolved' && (
                    <button
                      className="btn-primary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px', backgroundColor: '#16a34a' }}
                      onClick={() => setSelectedIssueForAction(issue)}
                    >
                      <CheckCircle2 size={14} />
                      <span>Resolve with Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedIssueForAction && (
        <div className="modal-overlay" onClick={() => setSelectedIssueForAction(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                Log Resolution Proof for #{selectedIssueForAction.id}
              </h3>
              <button className="icon-btn" onClick={() => setSelectedIssueForAction(null)}>✕</button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
                  Provide notes for the community. Affected members will be notified to verify the fix.
                </p>
                <div className="form-group">
                  <label className="form-label-row">Resolution Note *</label>
                  <textarea
                    rows={3}
                    className="input-textarea"
                    placeholder="e.g. Replaced faulty compressor switch and tested cooling cycle for 30 minutes..."
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-row">After-Photo Evidence URL (Optional)</label>
                  <input
                    type="url"
                    className="input-text"
                    placeholder="https://... photo link of completed work"
                    value={resolvePhoto}
                    onChange={(e) => setResolvePhoto(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setSelectedIssueForAction(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#16a34a' }}>
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
