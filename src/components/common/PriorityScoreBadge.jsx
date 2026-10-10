import React from 'react';
import { ShieldAlert, Zap } from 'lucide-react';
import { getPriorityTier } from '../../services/priorityEngine';

export function PriorityScoreBadge({ score = 20, showScore = true }) {
  const tier = getPriorityTier(score);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.7rem',
        fontWeight: 700,
        backgroundColor: tier.bg,
        color: tier.color,
        border: `1px solid ${tier.color}33`
      }}
      title={`Dynamic Impact Score: ${score}/100. Computed from urgency, affected members, and time elapsed.`}
    >
      <Zap size={11} strokeWidth={2.5} />
      <span>{tier.label}</span>
      {showScore && <span style={{ opacity: 0.8, fontSize: '0.65rem' }}>({score})</span>}
    </span>
  );
}
