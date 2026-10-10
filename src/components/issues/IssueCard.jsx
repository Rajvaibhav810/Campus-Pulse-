import React from 'react';
import { MapPin, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { CategoryPill } from '../common/CategoryPill';
import { ConfirmationButton } from '../common/ConfirmationButton';
import { PriorityScoreBadge } from '../common/PriorityScoreBadge';

function formatRelativeTime(dateString, status) {
  if (status === 'resolved') {
    const d = new Date(dateString);
    return `Resolved at ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  const date = new Date(dateString);
  const diffHours = (Date.now() - date.getTime()) / (1000 * 3600);
  if (diffHours < 1) {
    const mins = Math.max(1, Math.round(diffHours * 60));
    return `Updated ${mins}m ago`;
  }
  if (diffHours < 24) {
    const hours = Math.round(diffHours);
    return `Updated ${hours}h ago`;
  }
  if (diffHours < 48) {
    return 'Created Yesterday';
  }
  return `Reported ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function IssueCard({ issue, onSelect, showPriority = true }) {
  const timeText = formatRelativeTime(issue.updatedAt || issue.createdAt, issue.status);

  return (
    <div className="issue-card" onClick={() => onSelect && onSelect(issue.id)} style={{ cursor: 'pointer' }}>
      <div className="issue-card-header">
        <div className="tag-cluster">
          <CategoryPill categoryId={issue.category} />
          <UrgencyBadge urgency={issue.urgency} />
          {showPriority && <PriorityScoreBadge score={issue.priorityScore} showScore={false} />}
        </div>
        <StatusBadge status={issue.status} />
      </div>

      <h3 className="issue-card-title">{issue.title}</h3>

      <div className="issue-card-location">
        <MapPin size={15} color="#64748b" />
        <span>{issue.location?.fullText || issue.location?.area || 'Location specified'}</span>
      </div>

      <div className="issue-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="issue-card-time">
            {issue.status === 'resolved' ? (
              <CheckCircle2 size={13} color="#16a34a" />
            ) : (
              <Clock size={13} color="#94a3b8" />
            )}
            <span>{timeText}</span>
          </div>
          <ConfirmationButton issue={issue} size="small" showLabel={false} />
        </div>

        <button 
          className="details-link"
          style={{ background: 'none', border: 'none', fontSize: '0.8rem' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(issue.id);
          }}
        >
          <span>Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
