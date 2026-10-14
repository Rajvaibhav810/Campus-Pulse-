import React, { useState } from 'react';
import { 
  Megaphone, Lock, Mail, User, Building, Shield, 
  Users, Check, ArrowRight, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPage({ onAuthSuccess }) {
  const { login, signup, organization } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Selected role for Sign In: 'member' or 'admin'
  const [loginRole, setLoginRole] = useState('member');
  const [loginEmail, setLoginEmail] = useState('member@campus.internal');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOrg, setSignupOrg] = useState(organization?.name || 'Acme Corp');
  const [signupDept, setSignupDept] = useState('');
  const [signupRole, setSignupRole] = useState('member'); // 'member' | 'admin'

  const handleRoleToggle = (role) => {
    setLoginRole(role);
    if (role === 'member') {
      setLoginEmail('member@campus.internal');
    } else {
      setLoginEmail('admin@campus.internal');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const res = login(loginEmail, loginPassword, loginRole);
    if (res.success) {
      onAuthSuccess && onAuthSuccess(res.user);
    } else {
      setError(res.error || 'Invalid credentials.');
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
      role: signupRole,
      department: signupDept,
      organizationName: signupOrg
    });

    if (res.success) {
      onAuthSuccess && onAuthSuccess(res.user);
    } else {
      setError(res.error || 'Could not create account.');
    }
  };

  const handleQuickDemoLogin = (role) => {
    const email = role === 'admin' ? 'admin@campus.internal' : 'member@campus.internal';
    const res = login(email, 'password123', role);
    if (res.success) {
      onAuthSuccess && onAuthSuccess(res.user);
    }
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
          Organizational Problem Intelligence & Resolution Platform
        </p>
      </div>

      {/* Main Auth Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: mode === 'signup' ? '540px' : '460px',
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
        {/* SIGN IN FORM (SELECT ROLE WHILE SIGNING IN)                    */}
        {/* ============================================================== */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            {/* Role Selection right at sign-in */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label-row" style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>Select Role to Sign In *</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Option 1: Member */}
                <div
                  onClick={() => handleRoleToggle('member')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: loginRole === 'member' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: loginRole === 'member' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: loginRole === 'member' ? '#2563eb' : '#f1f5f9', color: loginRole === 'member' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={15} />
                    </div>
                    {loginRole === 'member' && <Check size={16} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Member</h4>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                    Report & confirm campus issues
                  </p>
                </div>

                {/* Option 2: Admin */}
                <div
                  onClick={() => handleRoleToggle('admin')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: loginRole === 'admin' ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: loginRole === 'admin' ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: loginRole === 'admin' ? '#7c3aed' : '#f1f5f9', color: loginRole === 'admin' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={15} />
                    </div>
                    {loginRole === 'admin' && <Check size={16} color="#7c3aed" strokeWidth={2.5} />}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Administrator</h4>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                    Manage, triage & resolve issues
                  </p>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label-row">
                <span>Email Address</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  className="input-text"
                  placeholder="e.g. member@campus.internal"
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
              style={{
                padding: '12px',
                fontSize: '0.95rem',
                marginBottom: '20px',
                backgroundColor: loginRole === 'admin' ? '#7c3aed' : '#1d4ed8'
              }}
            >
              <span>Sign In as {loginRole === 'admin' ? 'Administrator' : 'Member'}</span>
              <ArrowRight size={17} />
            </button>

            {/* Quick 1-Click Persona Sign-In */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginBottom: '10px', fontWeight: 600 }}>
                ⚡ 1-Click Fast Sign In:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('member')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    color: '#1d4ed8',
                    fontWeight: 600,
                    justifyContent: 'center'
                  }}
                >
                  <Users size={14} />
                  <span>Member (Viraj K.)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd6fe',
                    background: '#f5f3ff',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    color: '#7c3aed',
                    fontWeight: 600,
                    justifyContent: 'center'
                  }}
                >
                  <Shield size={14} />
                  <span>Admin (Sarah P.)</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ============================================================== */
          /* CREATE ACCOUNT FORM (MEMBER vs ADMINISTRATOR)                  */
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
                    placeholder="e.g. john@campus.internal"
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
                  placeholder="e.g. Engineering, Facilities"
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

            {/* ROLE SELECTION: Exactly 2 Roles (Member vs Administrator) */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label-row" style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 700 }}>Select Role for Account *</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Choice 1: Member */}
                <div
                  onClick={() => setSignupRole('member')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: signupRole === 'member' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: signupRole === 'member' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: signupRole === 'member' ? '#2563eb' : '#f1f5f9', color: signupRole === 'member' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                    {signupRole === 'member' && <Check size={16} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Member</h4>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                    Report problems, upvote/confirm existing issues, and track resolutions.
                  </p>
                </div>

                {/* Choice 2: Administrator */}
                <div
                  onClick={() => setSignupRole('admin')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: signupRole === 'admin' ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: signupRole === 'admin' ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: signupRole === 'admin' ? '#7c3aed' : '#f1f5f9', color: signupRole === 'admin' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={16} />
                    </div>
                    {signupRole === 'admin' && <Check size={16} color="#7c3aed" strokeWidth={2.5} />}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Administrator</h4>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                    Administrative authority: triage, assign, update progress, resolve with proof.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-large"
              style={{
                padding: '12px',
                fontSize: '0.95rem',
                backgroundColor: signupRole === 'admin' ? '#7c3aed' : '#1d4ed8'
              }}
            >
              <span>Create Account as {signupRole === 'admin' ? 'Administrator' : 'Member'}</span>
              <ArrowRight size={17} />
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        <span>Campus Pulse • Problem Intelligence & Resolution Platform</span>
      </div>
    </div>
  );
}
