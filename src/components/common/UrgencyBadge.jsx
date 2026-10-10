import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export function UrgencyBadge({ urgency }) {
  const getMeta = () => {
    switch (urgency) {
      case 'high':
      case 'urgent':
        return { label: 'High', className: 'high', icon: AlertCircle };
      case 'medium':
        return { label: 'Medium', className: 'medium', icon: AlertTriangle };
      case 'low':
      default:
        return { label: 'Low', className: 'low', icon: CheckCircle };
    }
  };

  const meta = getMeta();
  return (
    <span className={`urgency-badge ${meta.className}`}>
      <span>{meta.label}</span>
    </span>
  );
}
