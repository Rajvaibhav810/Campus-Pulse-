import React from 'react';
import { Clock, Eye, UserCheck, PlayCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export function StatusBadge({ status }) {
  const getMeta = () => {
    switch (status) {
      case 'reported':
        return { label: 'Reported', className: 'reported', icon: Clock };
      case 'under_review':
        return { label: 'Acknowledged', className: 'under_review', icon: Eye };
      case 'assigned':
        return { label: 'Assigned', className: 'assigned', icon: UserCheck };
      case 'in_progress':
        return { label: 'In Progress', className: 'in_progress', icon: PlayCircle };
      case 'resolved':
        return { label: 'Resolved', className: 'resolved', icon: CheckCircle2 };
      case 'reopened':
        return { label: 'Reopened', className: 'reopened', icon: RotateCcw };
      default:
        return { label: status || 'Reported', className: 'reported', icon: Clock };
    }
  };

  const meta = getMeta();
  const Icon = meta.icon;

  return (
    <span className={`status-badge ${meta.className}`}>
      <Icon size={13} strokeWidth={2.4} />
      <span>{meta.label}</span>
    </span>
  );
}
