import React from 'react';
import { Home, ListChecks, User, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function BottomNav({ activePage, setActivePage }) {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return (
      <nav className="bottom-navbar">
        <button
          className={`bottom-nav-item ${activePage === 'admin_portal' ? 'active' : ''}`}
          onClick={() => setActivePage('admin_portal')}
        >
          <div className="nav-icon-box">
            <Shield size={19} />
          </div>
          <span>Domain Command</span>
        </button>

        <button
          className={`bottom-nav-item ${activePage === 'analytics' ? 'active' : ''}`}
          onClick={() => setActivePage('analytics')}
        >
          <div className="nav-icon-box">
            <BarChart3 size={19} />
          </div>
          <span>Analytics</span>
        </button>

        <button
          className={`bottom-nav-item ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => setActivePage('settings')}
        >
          <div className="nav-icon-box">
            <User size={19} />
          </div>
          <span>Settings</span>
        </button>
      </nav>
    );
  }

  return (
    <nav className="bottom-navbar">
      <button
        className={`bottom-nav-item ${activePage === 'home' ? 'active' : ''}`}
        onClick={() => setActivePage('home')}
      >
        <div className="nav-icon-box">
          <Home size={19} />
        </div>
        <span>Home</span>
      </button>

      <button
        className={`bottom-nav-item ${activePage === 'my_reports' || activePage === 'browse' ? 'active' : ''}`}
        onClick={() => setActivePage('my_reports')}
      >
        <div className="nav-icon-box">
          <ListChecks size={19} />
        </div>
        <span>My Issues</span>
      </button>

      <button
        className={`bottom-nav-item ${activePage === 'settings' ? 'active' : ''}`}
        onClick={() => setActivePage('settings')}
      >
        <div className="nav-icon-box">
          <User size={19} />
        </div>
        <span>Profile</span>
      </button>
    </nav>
  );
}
