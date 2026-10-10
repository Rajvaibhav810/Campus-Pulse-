import React, { useState } from 'react';
import { Plus, Asterisk, ChevronRight, Building, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { IssueCard } from '../components/issues/IssueCard';

export function HomePage({ onNavigate, onSelectIssue }) {
  const { currentUser, organization } = useAuth();
  const { issues } = useIssues();
  const [filterTab, setFilterTab] = useState('all');

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser.name.split(' ')[0];

  // Filtering recent issues
  const recentIssues = issues.filter(issue => {
    if (filterTab === 'in_progress') return issue.status === 'in_progress';
    if (filterTab === 'resolved') return issue.status === 'resolved';
    return true;
  });

  // Calculate quick metrics
  const activeCount = issues.filter(i => i.status !== 'resolved').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const criticalCount = issues.filter(i => i.priorityTier === 'critical').length;

  return (
    <div className="page-container">
      {/* Hero Greeting Card (Matching Screenshot 1) */}
      <section className="hero-greeting-card">
        <div className="hero-chip-row">
          <div className="org-chip">
            <Building size={14} />
            <span>{organization.name} / {organization.campusName}</span>
          </div>
          <div className="user-avatar-bubble">
            {currentUser.initials}
          </div>
        </div>

        <h1>{timeGreeting}, {firstName}</h1>
        <p>Everything running smoothly? Log any issues immediately.</p>
      </section>

      {/* Primary "+ Report an Issue" Button (Matching Screenshot 1) */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn-primary-large"
          onClick={() => onNavigate('report')}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Desktop / Tablet KPI Overview Bar */}
      <div className="metrics-summary-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number">{activeCount}</div>
            <div className="metric-stat-label">Active / Open Issues</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number">{inProgressCount}</div>
            <div className="metric-stat-label">Currently In Progress</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number">{resolvedCount}</div>
            <div className="metric-stat-label">Resolved This Week</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Recent Issues Section (Matching Screenshot 1 & 2) */}
      <section>
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Recent Issues</h2>
          <button
            onClick={() => onNavigate('browse')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>See all</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Quick filter pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setFilterTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterTab === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-subtle)',
              backgroundColor: filterTab === 'all' ? 'var(--primary-50)' : '#ffffff',
              color: filterTab === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)'
            }}
          >
            All Recent ({issues.length})
          </button>
          <button
            onClick={() => setFilterTab('in_progress')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterTab === 'in_progress' ? '1.5px solid #d97706' : '1px solid var(--border-subtle)',
              backgroundColor: filterTab === 'in_progress' ? '#fef3c7' : '#ffffff',
              color: filterTab === 'in_progress' ? '#b45309' : 'var(--text-secondary)'
            }}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: filterTab === 'resolved' ? '1.5px solid #16a34a' : '1px solid var(--border-subtle)',
              backgroundColor: filterTab === 'resolved' ? '#dcfce7' : '#ffffff',
              color: filterTab === 'resolved' ? '#15803d' : 'var(--text-secondary)'
            }}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Issues list */}
        <div>
          {recentIssues.slice(0, 5).map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onSelect={onSelectIssue}
            />
          ))}
        </div>
      </section>

      {/* Campus Emergency Hotline Banner (Matching Screenshot 2) */}
      <section className="hotline-card">
        <div className="hotline-icon">
          <Asterisk size={22} strokeWidth={2.5} />
        </div>
        <div className="hotline-info">
          <h4>{organization.emergencyHotline.label}</h4>
          <p>{organization.emergencyHotline.note}</p>
        </div>
      </section>
    </div>
  );
}
