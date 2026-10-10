import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { BrowseIssuesPage } from './pages/BrowseIssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { ManagementAnalyticsPage } from './pages/ManagementAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, currentUser, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState(() => currentUser?.role === 'admin' ? 'admin_portal' : 'home');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Sync default landing page when role changes
  useEffect(() => {
    if (currentUser?.role === 'admin' && (activePage === 'home' || activePage === 'my_reports' || activePage === 'report')) {
      setActivePage('admin_portal');
    } else if (currentUser?.role === 'user' && activePage === 'admin_portal') {
      setActivePage('home');
    }
  }, [currentUser?.id, currentUser?.role]);

  // If user is logged out, present the Sign In / Sign Up screen
  if (!isAuthenticated || !currentUser) {
    return <AuthPage onAuthSuccess={(user) => setActivePage(user.role === 'admin' ? 'admin_portal' : 'home')} />;
  }

  const navigateTo = (page, issueId = null) => {
    if (issueId) {
      setSelectedIssueId(issueId);
      setActivePage('detail');
    } else {
      setActivePage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIssue = (issueId) => {
    setSelectedIssueId(issueId);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
          />
        );

      case 'report':
        return (
          <ReportIssuePage
            onBack={() => setActivePage('home')}
            onSuccess={(newId) => handleSelectIssue(newId)}
            onSelectIssue={handleSelectIssue}
          />
        );

      case 'browse':
        return (
          <BrowseIssuesPage
            onSelectIssue={handleSelectIssue}
            onNavigate={navigateTo}
          />
        );

      case 'detail':
        return (
          <IssueDetailPage
            issueId={selectedIssueId}
            onBack={() => setActivePage('browse')}
            onNavigate={navigateTo}
          />
        );

      case 'my_reports':
        return (
          <MyReportsPage
            onSelectIssue={handleSelectIssue}
            onNavigate={navigateTo}
          />
        );

      case 'admin_portal':
        return (
          <AdminPortalPage
            onSelectIssue={handleSelectIssue}
          />
        );

      case 'analytics':
        return (
          <ManagementAnalyticsPage
            onSelectIssue={handleSelectIssue}
          />
        );

      case 'settings':
        return <SettingsPage />;

      default:
        return (
          <HomePage
            onNavigate={navigateTo}
            onSelectIssue={handleSelectIssue}
          />
        );
    }
  };

  return (
    <div className="app-wrapper">
      <div className="main-content">
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        {renderCurrentPage()}
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <AppContent />
      </IssueProvider>
    </AuthProvider>
  );
}
