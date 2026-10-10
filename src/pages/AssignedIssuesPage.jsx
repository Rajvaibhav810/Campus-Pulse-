import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, AlertTriangle, PlayCircle, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { IssueCard } from '../components/issues/IssueCard';

export function AssignedIssuesPage({ onSelectIssue }) {
  const { currentUser } = useAuth();
  const { issues, updateIssueStatus } = useIssues();
  const [filter, setFilter] = useState('active'); // 'active' | 'in_progress' | 'all' | 'resolved'

  // Filter issues assigned to current user (or all open issues if general handler queue)
  const assignedIssues = issues.filter(issue => {
    const isAssignedToMe = issue.assignedTo?.id === currentUser.id;
    if (!isAssignedToMe && issue.status === 'reported') return false; // Hide untriaged reports unless assigned

    if (filter === 'active') return isAssignedToMe && issue.status !== 'resolved';
    if (filter === 'in_progress') return isAssignedToMe && issue.status === 'in_progress';
    if (filter === 'resolved') return isAssignedToMe && issue.status === 'resolved';
    return isAssignedToMe;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="org-chip" style={{ background: '#fef3c7', color: '#b45309' }}>
              Staff & Technician Portal
            </span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            Assigned Work Queue
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Issues assigned to {currentUser.name} ({currentUser.roleLabel})
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          onClick={() => setFilter('active')}
          className={`btn-secondary ${filter === 'active' ? 'active' : ''}`}
          style={{
            borderColor: filter === 'active' ? '#1d4ed8' : '#e2e8f0',
            background: filter === 'active' ? '#eff6ff' : '#ffffff',
            color: filter === 'active' ? '#1d4ed8' : '#475569'
          }}
        >
          Active Tasks ({issues.filter(i => i.assignedTo?.id === currentUser.id && i.status !== 'resolved').length})
        </button>

        <button
          onClick={() => setFilter('in_progress')}
          className={`btn-secondary ${filter === 'in_progress' ? 'active' : ''}`}
          style={{
            borderColor: filter === 'in_progress' ? '#d97706' : '#e2e8f0',
            background: filter === 'in_progress' ? '#fef3c7' : '#ffffff',
            color: filter === 'in_progress' ? '#b45309' : '#475569'
          }}
        >
          In Progress ({issues.filter(i => i.assignedTo?.id === currentUser.id && i.status === 'in_progress').length})
        </button>

        <button
          onClick={() => setFilter('resolved')}
          className={`btn-secondary ${filter === 'resolved' ? 'active' : ''}`}
          style={{
            borderColor: filter === 'resolved' ? '#16a34a' : '#e2e8f0',
            background: filter === 'resolved' ? '#dcfce7' : '#ffffff',
            color: filter === 'resolved' ? '#15803d' : '#475569'
          }}
        >
          Completed ({issues.filter(i => i.assignedTo?.id === currentUser.id && i.status === 'resolved').length})
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
          style={{
            borderColor: filter === 'all' ? '#1d4ed8' : '#e2e8f0',
            background: filter === 'all' ? '#eff6ff' : '#ffffff',
            color: filter === 'all' ? '#1d4ed8' : '#475569'
          }}
        >
          All History
        </button>
      </div>

      {/* List */}
      {assignedIssues.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
            <CheckCircle2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Your queue is all clear</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
            There are currently no active unresolved tasks assigned to you. Check back later or browse open issues.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignedIssues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onSelect={onSelectIssue}
              showPriority={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
