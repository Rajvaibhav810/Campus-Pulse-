import React, { useState } from 'react';
import { X, Check, Building2, User, RefreshCw, Shield, Wrench, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';

const PRESET_ORGS = [
  {
    id: 'org-tech',
    name: 'Acme Corp',
    campusName: 'Tech Park Campus',
    type: 'Corporate Workplace',
    emergencyNumber: '4444'
  },
  {
    id: 'org-univ',
    name: 'State University',
    campusName: 'North Academic Campus',
    type: 'College / University',
    emergencyNumber: '9111'
  },
  {
    id: 'org-hub',
    name: 'Nexus Hub',
    campusName: 'Downtown Co-working',
    type: 'Shared Facility / Co-working',
    emergencyNumber: '3333'
  }
];

export function RoleSwitcherModal({ isOpen, onClose }) {
  const { currentUser, users, switchUser, organization, updateOrganization } = useAuth();
  const { resetData } = useIssues();
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'organization'

  if (!isOpen) return null;

  const handleSelectOrg = (preset) => {
    updateOrganization({
      ...organization,
      name: preset.name,
      campusName: preset.campusName,
      emergencyHotline: {
        ...organization.emergencyHotline,
        number: preset.emergencyNumber,
        note: `Dial ${preset.emergencyNumber} for immediate medical or security support.`
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
              <Shield size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Role & Environment Switcher</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Test all 3 personas and organization environments</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 16px' }}>
          <button
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'roles' ? 700 : 500,
              color: activeTab === 'roles' ? '#1d4ed8' : '#64748b',
              borderBottom: activeTab === 'roles' ? '2px solid #1d4ed8' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            User Persona & Role
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'organization' ? 700 : 500,
              color: activeTab === 'organization' ? '#1d4ed8' : '#64748b',
              borderBottom: activeTab === 'organization' ? '2px solid #1d4ed8' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Organization Preset
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'roles' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                Campus Pulse dynamically changes navigation and permitted actions according to role:
              </p>
              {users.map(u => {
                const isSelected = u.id === currentUser.id;
                let roleIcon = Users;
                let badgeColor = '#3b82f6';
                if (u.role === 'handler') {
                  roleIcon = Wrench;
                  badgeColor = '#d97706';
                } else if (u.role === 'admin') {
                  roleIcon = Shield;
                  badgeColor = '#7c3aed';
                }
                const RoleIcon = roleIcon;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                          color: '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{u.name}</h4>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: `${badgeColor}18`,
                              color: badgeColor
                            }}
                          >
                            {u.role === 'admin' && u.adminDomain ? `${u.adminDomain} admin` : u.role}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.roleLabel} • {u.department}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={18} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                Select an organization type to test cross-domain adaptability (corporate, university, or shared workspace):
              </p>
              {PRESET_ORGS.map(p => {
                const isSelected = organization.name === p.name;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectOrg(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1d4ed8'
                        }}
                      >
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                          {p.name} / {p.campusName}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {p.type} • Hotline: Dial {p.emergencyNumber}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check size={18} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset all issues and settings to original initial seed?')) {
                resetData();
                onClose();
              }
            }}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#dc2626' }}
          >
            <RefreshCw size={12} />
            <span>Reset Demo Data</span>
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
