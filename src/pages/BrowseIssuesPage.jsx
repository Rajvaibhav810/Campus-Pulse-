import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, X, Plus, Layers, Flame, Clock } from 'lucide-react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { IssueCard } from '../components/issues/IssueCard';
import { CATEGORIES } from './ReportIssuePage';

export function BrowseIssuesPage({ onSelectIssue, onNavigate }) {
  const { issues } = useIssues();
  const { organization } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'affected' | 'newest' | 'oldest'

  // Filtered & Sorted issues
  const filteredIssues = useMemo(() => {
    return issues
      .filter(issue => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = issue.title.toLowerCase().includes(q);
          const matchDesc = (issue.description || '').toLowerCase().includes(q);
          const matchLoc = (issue.location?.fullText || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        // Category
        if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;

        // Status
        if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;

        // Urgency
        if (selectedUrgency !== 'all' && issue.urgency !== selectedUrgency) return false;

        // Zone
        if (selectedZone !== 'all' && !issue.location?.fullText.includes(selectedZone)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (b.priorityScore || 0) - (a.priorityScore || 0);
        }
        if (sortBy === 'affected') {
          return (b.affectedCount || 1) - (a.affectedCount || 1);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
  }, [issues, searchQuery, selectedCategory, selectedStatus, selectedUrgency, selectedZone, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedUrgency('all');
    setSelectedZone('all');
    setSortBy('priority');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedUrgency !== 'all' || selectedZone !== 'all';

  return (
    <div className="page-container">
      {/* Header & Controls */}
      <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Browse Issues</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {filteredIssues.length} of {issues.length} reported issues across {organization.name}
          </p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('report')}>
          <Plus size={16} />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          className="input-text"
          style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
          placeholder="Search problems by keywords, location (e.g. Block B), or equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Category Selector */}
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="under_review">Acknowledged</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="reopened">Reopened</option>
          </select>

          {/* Urgency Selector */}
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
          >
            <option value="all">All Urgencies</option>
            <option value="high">Urgent / High</option>
            <option value="medium">Needs Attention / Medium</option>
            <option value="low">Not Urgent / Low</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px'
              }}
            >
              <X size={13} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={14} color="#64748b" />
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Sort by:</span>
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priority">Priority Impact Score</option>
            <option value="affected">Most Affected People</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Issues List or Empty State */}
      {filteredIssues.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No matching issues found</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 18px auto' }}>
            We couldn't find any issues matching your search filters. Try adjusting your search query or clear all filters.
          </p>
          <button className="btn-secondary" onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredIssues.map(issue => (
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
