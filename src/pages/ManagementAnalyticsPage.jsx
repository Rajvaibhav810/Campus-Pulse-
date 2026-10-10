import React from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, Users, CheckCircle2, 
  Clock, Flame, Building, ArrowUpRight, Zap, ShieldAlert 
} from 'lucide-react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { PriorityScoreBadge } from '../components/common/PriorityScoreBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryPill } from '../components/common/CategoryPill';

export function ManagementAnalyticsPage({ onSelectIssue }) {
  const { issues } = useIssues();
  const { organization, adminDomain } = useAuth();
  const [domainFilter, setDomainFilter] = useState(() => (adminDomain && adminDomain !== 'all') ? adminDomain : 'all');

  // Filter by domain if selected
  const activeIssues = issues.filter(i => domainFilter === 'all' || i.category === domainFilter);

  // Metrics calculation
  const total = activeIssues.length;
  const openCount = activeIssues.filter(i => i.status !== 'resolved').length;
  const inProgressCount = activeIssues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = activeIssues.filter(i => i.status === 'resolved').length;
  const criticalCount = activeIssues.filter(i => i.priorityTier === 'critical').length;
  const totalPeopleAffected = activeIssues.reduce((acc, curr) => acc + (curr.affectedCount || 1), 0);

  // Category counts
  const categoryCounts = {};
  activeIssues.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  // Top issues affecting most people
  const topImpactIssues = [...activeIssues]
    .sort((a, b) => (b.affectedCount || 1) - (a.affectedCount || 1))
    .slice(0, 4);

  // Recurrence analysis: multiple issues in same zone
  const zoneGroups = {};
  activeIssues.forEach(i => {
    const zoneKey = i.location?.fullText || 'General';
    if (!zoneGroups[zoneKey]) zoneGroups[zoneKey] = [];
    zoneGroups[zoneKey].push(i);
  });
  const recurringHotspots = Object.entries(zoneGroups)
    .filter(([_, list]) => list.length >= 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 4);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="org-chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              Management Intelligence & SLA Engine
            </span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            Organizational Problem Intelligence
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Holistic visibility, triage prioritization, and recurring failure analysis for {organization.name}.
          </p>
        </div>

        {/* Domain Scope Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Domain View:</span>
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600 }}
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="all">All Domains (Organization-wide)</option>
            <option value="water">💧 Water & Plumbing</option>
            <option value="wifi">📶 IT & Wi-Fi Networks</option>
            <option value="cleanliness">✨ Cleanliness & Sanitation</option>
            <option value="facilities">🏢 Facilities & HVAC</option>
            <option value="parking">🅿️ Parking & Transport</option>
            <option value="safety">🛡️ Safety & Security</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="metrics-summary-grid">
        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number">{total}</div>
            <div className="metric-stat-label">Total Reported</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={20} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number" style={{ color: '#b45309' }}>{openCount}</div>
            <div className="metric-stat-label">Open / Unresolved</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number" style={{ color: '#15803d' }}>{resolvedCount}</div>
            <div className="metric-stat-label">Verified Resolved</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number" style={{ color: '#1d4ed8' }}>{totalPeopleAffected}</div>
            <div className="metric-stat-label">Total Affected People</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div>
            <div className="metric-stat-number" style={{ color: '#0f172a' }}>~2.8h</div>
            <div className="metric-stat-label">Avg Mean Time (MTTR)</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Top Collective Impact Issues */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={17} color="#dc2626" />
              <span>Issues Affecting Most People</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>By Confirmations</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topImpactIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue.id)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{issue.title}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                    {issue.affectedCount} people
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>{issue.location?.fullText}</span>
                  <StatusBadge status={issue.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution Breakdown */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={17} color="#1d4ed8" />
              <span>Category Frequency Breakdown</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Volume</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedCategories.map(([catKey, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={catKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <CategoryPill categoryId={catKey} />
                    <span>{count} reports ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: '9999px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recurrence & Hotspots Analysis */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={17} color="#d97706" />
          <span>Location Hotspots & Recurrence Tracking</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
          Pinpoint spatial zones with repeating friction to identify root infrastructure failures.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {recurringHotspots.map(([zone, list]) => (
            <div
              key={zone}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{zone}</h4>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                  {list.length} incident{list.length > 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Latest: {list[0]?.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
