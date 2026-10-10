import React from 'react';
import { Users, Check, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';

export function ConfirmationButton({ issue, size = 'normal', showLabel = true }) {
  const { currentUser } = useAuth();
  const { toggleConfirmIssue } = useIssues();

  const isConfirmed = issue.confirmedUserIds?.includes(currentUser.id);
  const count = issue.affectedCount || 1;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleConfirmIssue(issue.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`affected-count-chip ${isConfirmed ? 'active' : ''}`}
      title={isConfirmed ? 'You have confirmed this issue' : 'Click to confirm you are also experiencing this'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'large' ? '8px 14px' : '4px 10px',
        fontSize: size === 'large' ? '0.88rem' : '0.75rem',
        cursor: 'pointer',
        border: isConfirmed ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
        background: isConfirmed ? '#eff6ff' : '#ffffff',
        color: isConfirmed ? '#1d4ed8' : '#475569',
        borderRadius: '9999px',
        transition: 'all 0.15s ease'
      }}
    >
      {isConfirmed ? (
        <Check size={size === 'large' ? 16 : 13} strokeWidth={2.5} color="#1d4ed8" />
      ) : (
        <Users size={size === 'large' ? 16 : 13} color="#64748b" />
      )}
      <span style={{ fontWeight: 700 }}>{count}</span>
      {showLabel && (
        <span style={{ fontWeight: 500 }}>
          {count === 1 ? 'person affected' : 'people affected'}
        </span>
      )}
      {isConfirmed && <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>(Confirmed by you)</span>}
    </button>
  );
}
