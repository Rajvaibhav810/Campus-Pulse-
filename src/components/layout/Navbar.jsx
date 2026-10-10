import React, { useState } from 'react';
import { Megaphone, Bell, Shield, ChevronDown, PlusCircle, LayoutDashboard, ListFilter, ClipboardCheck, Settings, Zap, Database, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { RoleSwitcherModal } from './RoleSwitcherModal';

export function Navbar({ activePage, setActivePage }) {
  const { currentUser, organization, isMember, isHandler, isAdmin, logout } = useAuth();
  const { backendStatus } = useIssues();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nav-brand" onClick={() => setActivePage('home')}>
            <Megaphone size={22} strokeWidth={2.4} />
            <span>Campus Pulse</span>
          </div>

          <nav className="desktop-nav-links">
            {/* General User Navigation (Reporters & Members) */}
            {!isAdmin && (
              <>
                <button
                  className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
                  onClick={() => setActivePage('home')}
                >
                  Home
                </button>
                <button
                  className={`nav-link ${activePage === 'browse' ? 'active' : ''}`}
                  onClick={() => setActivePage('browse')}
                >
                  Browse Issues
                </button>
                <button
                  className={`nav-link ${activePage === 'report' ? 'active' : ''}`}
                  onClick={() => setActivePage('report')}
                >
                  Report an Issue
                </button>
                <button
                  className={`nav-link ${activePage === 'my_reports' ? 'active' : ''}`}
                  onClick={() => setActivePage('my_reports')}
                >
                  My Reports
                </button>
              </>
            )}

            {/* Domain Administrator Navigation (Operational Command Center) */}
            {isAdmin && (
              <>
                <button
                  className={`nav-link ${activePage === 'admin_portal' ? 'active' : ''}`}
                  onClick={() => setActivePage('admin_portal')}
                >
                  Domain Command Center
                </button>
                <button
                  className={`nav-link ${activePage === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActivePage('analytics')}
                >
                  Domain Analytics & Hotspots
                </button>
              </>
            )}

            <button
              className={`nav-link ${activePage === 'settings' ? 'active' : ''}`}
              onClick={() => setActivePage('settings')}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className="nav-actions">
          {/* Supabase Backend status indicator */}
          {backendStatus === 'connected' && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#15803d',
                background: '#dcfce7',
                border: '1px solid #86efac',
                padding: '3px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Connected to Supabase PostgreSQL database"
            >
              <Zap size={11} strokeWidth={2.5} />
              <span>Supabase Live</span>
            </span>
          )}

          {backendStatus === 'need_schema' && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#b45309',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '3px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setActivePage('settings')}
              title="Supabase connected! Please run supabase/schema.sql in Supabase SQL Editor"
            >
              <Database size={11} strokeWidth={2.5} />
              <span>Run SQL Schema</span>
            </span>
          )}

          {/* Role badge switcher */}
          <button
            className="role-badge-btn"
            onClick={() => setShowRoleModal(true)}
            title="Click to switch between Member, Staff, or Admin view"
          >
            <Shield size={13} />
            <span>Role: {currentUser.role.toUpperCase()}</span>
            <ChevronDown size={12} />
          </button>

          {/* Notification bell */}
          <button 
            className="icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            <span className="badge-dot"></span>
          </button>

          {/* User Avatar Initial */}
          <button
            className="user-avatar-bubble"
            onClick={() => setShowRoleModal(true)}
            title={`Active: ${currentUser.name} (${currentUser.roleLabel}). Click to switch.`}
          >
            {currentUser.initials}
          </button>

          {/* Sign Out Button */}
          <button
            className="icon-btn"
            onClick={logout}
            title="Sign Out"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Quick notification drop if clicked */}
      {showNotifications && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: '24px',
            width: '320px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 60,
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</h4>
            <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 600 }}>Mark all read</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>Water cooler in Block B updated</p>
              <p style={{ color: '#64748b', fontSize: '0.72rem' }}>Alex Martinez began work 25m ago</p>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>Wi-Fi drop in Lab 3 acknowledged</p>
              <p style={{ color: '#64748b', fontSize: '0.72rem' }}>23 people have confirmed this issue</p>
            </div>
          </div>
          <button
            onClick={() => setShowNotifications(false)}
            style={{ width: '100%', marginTop: '10px', padding: '6px', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Close
          </button>
        </div>
      )}

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </>
  );
}
