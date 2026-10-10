import React, { useState } from 'react';
import { 
  Building, User, Shield, Phone, RefreshCw, Check, 
  ExternalLink, Database, Key, Server, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { RoleSwitcherModal } from '../components/layout/RoleSwitcherModal';

export function SettingsPage() {
  const { currentUser, organization, updateOrganization, logout } = useAuth();
  const { resetData } = useIssues();

  const [orgName, setOrgName] = useState(organization.name);
  const [campusName, setCampusName] = useState(organization.campusName);
  const [hotlineNumber, setHotlineNumber] = useState(organization.emergencyHotline.number);
  const [hotlineLabel, setHotlineLabel] = useState(organization.emergencyHotline.label);
  const [isSaved, setIsSaved] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSaveOrg = (e) => {
    e.preventDefault();
    updateOrganization({
      ...organization,
      name: orgName,
      campusName: campusName,
      emergencyHotline: {
        number: hotlineNumber,
        label: hotlineLabel,
        note: `Dial ${hotlineNumber} for immediate medical or security support.`
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="page-container" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Platform Settings</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Configure organization parameters, test role simulations, and inspect backend architecture.
        </p>
      </div>

      {/* User Profile & Active Role Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#1d4ed8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Active User Profile</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowRoleModal(true)}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              <Shield size={13} />
              <span>Switch Role</span>
            </button>
            <button
              className="btn-secondary"
              onClick={logout}
              style={{ fontSize: '0.78rem', padding: '5px 12px', color: '#dc2626', borderColor: '#fca5a5' }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div className="user-avatar-bubble" style={{ width: '46px', height: '46px', fontSize: '1.1rem' }}>
            {currentUser.initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{currentUser.name}</h4>
              <span className="org-chip" style={{ fontSize: '0.72rem', padding: '2px 8px', textTransform: 'uppercase' }}>
                {currentUser.role}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {currentUser.roleLabel} • {currentUser.email} • {currentUser.department}
            </p>
          </div>
        </div>
      </div>

      {/* Organization Parameters Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Building size={18} color="#1d4ed8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Organization & Campus Configuration</h3>
        </div>

        <form onSubmit={handleSaveOrg}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label-row">Organization / Entity Name</label>
              <input
                type="text"
                className="input-text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label-row">Campus / Branch Name</label>
              <input
                type="text"
                className="input-text"
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label-row">Emergency Hotline Label</label>
              <input
                type="text"
                className="input-text"
                value={hotlineLabel}
                onChange={(e) => setHotlineLabel(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label-row">Hotline Phone / Extension</label>
              <input
                type="text"
                className="input-text"
                value={hotlineNumber}
                onChange={(e) => setHotlineNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="submit" className="btn-primary">
              Save Configuration
            </button>
            {isSaved && (
              <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Check size={16} /> Configuration updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Backend & Architecture Readiness */}
      <div className="card" style={{ marginBottom: '20px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Server size={18} color="#1d4ed8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Backend & Storage Architecture</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
          Currently executing on the <strong>LocalStorage Persistence Engine</strong> with structured mock data models.
          All client actions (reporting, upvoting, assigning, resolution verification) are persisted locally.
          The modular service interfaces in <code>/src/services/storageService.js</code> and documentation in <code>/docs/REQUIREMENTS.md</code> are designed for seamless integration with persistent database backends (Node/PostgreSQL, Firebase Firestore, or GraphQL).
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset all demo issues and organization settings to clean seed data?')) {
                resetData();
                window.location.reload();
              }
            }}
            className="btn-secondary"
            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
          >
            <RefreshCw size={14} />
            <span>Reset Database to Initial Seed</span>
          </button>
        </div>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </div>
  );
}
