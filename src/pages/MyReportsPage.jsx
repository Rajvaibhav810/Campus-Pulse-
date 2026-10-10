import React, { useState } from 'react';
import { FileText, CheckCircle2, Plus, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { IssueCard } from '../components/issues/IssueCard';

export function MyReportsPage({ onSelectIssue, onNavigate }) {
  const { currentUser } = useAuth();
  const { issues } = useIssues();
  const [tab, setTab] = useState('reported'); // 'reported' | 'confirmed'

  // Issues reported by current user
  const reportedByMe = issues.filter(i => i.reportedBy.id === currentUser.id);

  // Issues confirmed by current user
  const confirmedByMe = issues.filter(i => 
    i.confirmedUserIds?.includes(currentUser.id) && i.reportedBy.id !== currentUser.id
  );

  const displayedList = tab === 'reported' ? reportedByMe : confirmedByMe;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>My Issues & Tracking</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Track the status, progress updates, and resolution proofs for issues you are involved in.
          </p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('report')}>
          <Plus size={16} />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setTab('reported')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: tab === 'reported' ? 700 : 500,
            color: tab === 'reported' ? '#1d4ed8' : '#64748b',
            borderBottom: tab === 'reported' ? '2.5px solid #1d4ed8' : '2.5px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={16} />
          <span>Reported by Me ({reportedByMe.length})</span>
        </button>

        <button
          onClick={() => setTab('confirmed')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: tab === 'confirmed' ? 700 : 500,
            color: tab === 'confirmed' ? '#1d4ed8' : '#64748b',
            borderBottom: tab === 'confirmed' ? '2.5px solid #1d4ed8' : '2.5px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Users size={16} />
          <span>Confirmed by Me ({confirmedByMe.length})</span>
        </button>
      </div>

      {/* List */}
      {displayedList.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
            <FileText size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
            {tab === 'reported' ? 'You have not submitted any reports yet' : 'You have not confirmed any existing issues yet'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 16px auto' }}>
            {tab === 'reported'
              ? 'Notice an everyday problem or broken facility? Report it now to bring it to management attention.'
              : 'Browse active issues in your building and confirm ones you are experiencing to amplify their priority.'}
          </p>
          <button className="btn-primary" onClick={() => onNavigate(tab === 'reported' ? 'report' : 'browse')}>
            {tab === 'reported' ? 'Report an Issue' : 'Browse Issues'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedList.map(issue => (
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
