import React, { useState } from 'react';
import { 
  Megaphone, Lock, Mail, User, Building, Shield, 
  Users, Check, ArrowRight, Eye, EyeOff, AlertCircle, 
  Droplets, Wifi, Sparkles, Building2, ShieldAlert, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DOMAIN_OPTIONS = [
  { id: 'water', label: 'Water & Plumbing', icon: Droplets, color: '#0284c7', desc: 'Water coolers, leaks, restrooms, faucets, drainage' },
  { id: 'wifi', label: 'IT & Wi-Fi Networks', icon: Wifi, color: '#2563eb', desc: 'Network access points, conference AV, server connectivity' },
  { id: 'cleanliness', label: 'Cleanliness & Sanitation', icon: Sparkles, color: '#059669', desc: 'Waste management, restrooms, cafeteria hygiene, spills' },
  { id: 'facilities', label: 'Facilities & HVAC', icon: Building2, color: '#d97706', desc: 'Air conditioning, lighting, elevators, power, furniture' },
  { id: 'safety', label: 'Safety & Security', icon: ShieldAlert, color: '#dc2626', desc: 'Emergency exits, fire safety, access barriers, surveillance' },
  { id: 'all', label: 'Super Administrator (All Domains)', icon: Globe, color: '#7c3aed', desc: 'Full authority across all organizational departments' }
];

export function AuthPage({ onAuthSuccess }) {
  const { login, signup, users, organization } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOrg, setSignupOrg] = useState(organization.name);
  const [signupDept, setSignupDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'admin'
  const [selectedDomain, setSelectedDomain] = useState('water'); // for domain admins

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (res.success) {
      onAuthSuccess && onAuthSuccess(res.user);
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (signupPassword.length < 4) {
      setError('Password should be at least 4 characters for this demo.');
      return;
    }

    const res = signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: selectedRole,
      adminDomain: selectedRole === 'admin' ? selectedDomain : null,
      department: signupDept,
      organizationName: signupOrg
    });

    if (res.success) {
      onAuthSuccess && onAuthSuccess(res.user);
    } else {
      setError(res.error || 'Could not create account.');
    }
  };

  const handleQuickDemoLogin = (user) => {
    login(user.email);
    onAuthSuccess && onAuthSuccess(user);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
    >
      {/* Brand Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: '#1d4ed8',
            fontSize: '1.65rem',
            fontWeight: 800,
            marginBottom: '6px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#1d4ed8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Megaphone size={24} />
          </div>
          <span>Campus Pulse</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '440px', margin: '0 auto' }}>
          Domain-Specific Organizational Problem Intelligence & Resolution Platform
        </p>
      </div>

      {/* Main Auth Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: mode === 'signup' ? '560px' : '460px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Tab Toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              padding: '9px 16px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#1d4ed8' : '#64748b',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              padding: '9px 16px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#1d4ed8' : '#64748b',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#b91c1c',
              fontSize: '0.82rem'
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* SIGN IN FORM                                                  */}
        {/* ============================================================== */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label-row">
                <span>Email Address</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  className="input-text"
                  placeholder="e.g. viraj.k@acmecorp.internal"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <div className="form-label-row">
                <span>Password</span>
                <span style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>Demo mode: any password</span>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-text"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-large"
              style={{ padding: '12px', fontSize: '0.95rem', marginBottom: '20px' }}
            >
              <span>Sign In</span>
              <ArrowRight size={17} />
            </button>

            {/* Quick Demo Logins by Role & Domain */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginBottom: '10px', fontWeight: 600 }}>
                ⚡ Test with preset personas & domain admins:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {users.map(u => {
                  const isUser = u.role === 'user';
                  const badgeColor = isUser ? '#1d4ed8' : '#7c3aed';
                  const badgeBg = isUser ? '#eff6ff' : '#f5f3ff';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: '#0f172a',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: badgeBg,
                            color: badgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}
                        >
                          {u.initials}
                        </span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{u.name}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.roleLabel}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: badgeColor
                        }}
                      >
                        {u.role === 'user' ? 'User' : u.adminDomain ? `${u.adminDomain} Admin` : 'Admin'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        ) : (
          /* ============================================================== */
          /* SIGN UP FORM (USER vs DOMAIN-SPECIFIC ADMINISTRATOR)           */
          /* ============================================================== */
          <form onSubmit={handleSignupSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label className="form-label-row">
                  <span>Full Name *</span>
                </label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label-row">
                  <span>Email Address *</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    className="input-text"
                    placeholder="e.g. john@organization.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label className="form-label-row">
                  <span>Organization / Campus</span>
                </label>
                <div className="input-with-icon">
                  <Building size={16} />
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. Acme Corp"
                    value={signupOrg}
                    onChange={(e) => setSignupOrg(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label-row">
                  <span>Department / Unit</span>
                </label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Operations, IT, Engineering"
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label-row">
                <span>Password *</span>
              </label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  className="input-text"
                  placeholder="Create a password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ROLE SELECTION: USER vs DOMAIN ADMINISTRATOR */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label-row" style={{ marginBottom: '8px' }}>
                <span>Select Account Type *</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {/* Choice 1: General User */}
                <div
                  onClick={() => setSelectedRole('user')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: selectedRole === 'user' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: selectedRole === 'user' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: selectedRole === 'user' ? '#2563eb' : '#f1f5f9', color: selectedRole === 'user' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                    {selectedRole === 'user' && <Check size={16} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>General User</h4>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Report problems, confirm existing issues, and verify resolution fixes.
                  </p>
                </div>

                {/* Choice 2: Domain Administrator */}
                <div
                  onClick={() => setSelectedRole('admin')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: selectedRole === 'admin' ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: selectedRole === 'admin' ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: selectedRole === 'admin' ? '#7c3aed' : '#f1f5f9', color: selectedRole === 'admin' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={16} />
                    </div>
                    {selectedRole === 'admin' && <Check size={16} color="#7c3aed" strokeWidth={2.5} />}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Domain Administrator</h4>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Authority over a specific domain: triage, update progress, resolve with proof.
                  </p>
                </div>
              </div>

              {/* IF DOMAIN ADMINISTRATOR: SELECT ASSIGNED CATEGORY / DOMAIN */}
              {selectedRole === 'admin' && (
                <div
                  style={{
                    background: '#fbfbfe',
                    border: '1.5px solid #ddd6fe',
                    borderRadius: '12px',
                    padding: '14px',
                    animation: 'fadeIn 0.2s ease'
                  }}
                >
                  <label className="form-label-row" style={{ marginBottom: '6px', color: '#5b21b6' }}>
                    <span>Assigned Operational Domain *</span>
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '10px' }}>
                    Choose the category this administrator is responsible for resolving:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {DOMAIN_OPTIONS.map(dom => {
                      const Icon = dom.icon;
                      const isSelected = selectedDomain === dom.id;

                      return (
                        <div
                          key={dom.id}
                          onClick={() => setSelectedDomain(dom.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: isSelected ? `2px solid ${dom.color}` : '1px solid #e5e7eb',
                            background: isSelected ? '#ffffff' : '#f9fafb',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${dom.color}15`, color: dom.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={15} />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>{dom.label}</span>
                              <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block' }}>{dom.desc}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={16} color={dom.color} strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary-large"
              style={{
                padding: '12px',
                fontSize: '0.95rem',
                backgroundColor: selectedRole === 'admin' ? '#7c3aed' : '#1d4ed8'
              }}
            >
              <span>Create Account as {selectedRole === 'admin' ? `${selectedDomain.toUpperCase()} Admin` : 'General User'}</span>
              <ArrowRight size={17} />
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        <span>Campus Pulse • Domain-Specific Operational Authority</span>
      </div>
    </div>
  );
}
