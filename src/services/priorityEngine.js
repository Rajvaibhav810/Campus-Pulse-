// Campus Pulse — Dynamic Priority Impact Calculation Engine

/**
 * Calculates a dynamic priority score from 0 to 100 based on collective impact,
 * urgency, age, and resolution lifecycle status.
 */
export function calculatePriorityScore(issue) {
  if (issue.status === 'resolved') {
    return 10;
  }

  // 1. Base Urgency Weight (Max 50)
  let score = 20;
  if (issue.urgency === 'low') score = 20;
  else if (issue.urgency === 'medium') score = 40;
  else if (issue.urgency === 'high') score = 60;

  // 2. Collective Impact Weight: Affected Person Count (Max 30)
  // Rewards issues affecting multiple members
  const affected = issue.affectedCount || 1;
  const impactBonus = Math.min(Math.floor(affected * 2.5), 30);
  score += impactBonus;

  // 3. Stagnation / Aging Penalty (Max 15)
  // Escalates issues that sit unresolved past SLA thresholds
  const createdTime = new Date(issue.createdAt).getTime();
  const now = Date.now();
  const hoursElapsed = (now - createdTime) / (1000 * 3600);

  if (hoursElapsed > 48) {
    score += 15;
  } else if (hoursElapsed > 24) {
    score += 10;
  } else if (hoursElapsed > 6 && issue.urgency === 'high') {
    score += 10;
  }

  // 4. Lifecycle Modifiers
  if (issue.status === 'reopened') {
    score += 20; // Reopened unresolved issues jump to immediate high priority
  } else if (issue.status === 'in_progress') {
    score -= 5; // Active work underway slightly stabilizes priority
  }

  return Math.min(Math.max(score, 5), 100);
}

/**
 * Returns human-readable priority tier and color badge
 */
export function getPriorityTier(score) {
  if (score >= 80) return { label: 'Critical', tier: 'critical', color: '#b91c1c', bg: '#fee2e2' };
  if (score >= 60) return { label: 'High', tier: 'high', color: '#c2410c', bg: '#ffedd5' };
  if (score >= 35) return { label: 'Medium', tier: 'medium', color: '#b45309', bg: '#fef3c7' };
  return { label: 'Low', tier: 'low', color: '#475569', bg: '#f1f5f9' };
}
