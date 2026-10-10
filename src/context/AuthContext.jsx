import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

function extractInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Initial seed users tailored for General Users and Domain Administrators
export const SEED_USERS = [
  {
    id: 'user-viraj',
    name: 'Viraj K.',
    initials: 'VK',
    role: 'user', // 'user' | 'admin'
    roleLabel: 'General User',
    email: 'viraj.k@acmecorp.internal',
    department: 'Engineering & Product'
  },
  {
    id: 'admin-water',
    name: 'David Ortiz',
    initials: 'DO',
    role: 'admin',
    adminDomain: 'water',
    roleLabel: 'Water & Plumbing Administrator',
    email: 'plumbing.admin@acmecorp.internal',
    department: 'Water & Utilities'
  },
  {
    id: 'admin-wifi',
    name: 'Elena Rostova',
    initials: 'ER',
    role: 'admin',
    adminDomain: 'wifi',
    roleLabel: 'IT & Network Administrator',
    email: 'network.admin@acmecorp.internal',
    department: 'IT Network Infrastructure'
  },
  {
    id: 'admin-facilities',
    name: 'Alex Martinez',
    initials: 'AM',
    role: 'admin',
    adminDomain: 'facilities',
    roleLabel: 'Facilities & HVAC Administrator',
    email: 'facilities.admin@acmecorp.internal',
    department: 'Building Operations'
  },
  {
    id: 'admin-super',
    name: 'Sarah Patel',
    initials: 'SP',
    role: 'admin',
    adminDomain: 'all',
    roleLabel: 'Super Administrator / Operations Director',
    email: 'sarah.p@acmecorp.internal',
    department: 'Executive Operations'
  }
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = storageService.loadUsers();
    return saved && saved.length > 0 ? saved : SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = storageService.loadCurrentUser();
    return saved || SEED_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(currentUser));
  const [organization, setOrganization] = useState(() => storageService.loadOrganization());

  useEffect(() => {
    if (currentUser) {
      storageService.saveCurrentUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  useEffect(() => {
    storageService.saveUsers(users);
  }, [users]);

  // Sign In function
  const login = (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      return { success: true, user: found };
    }

    const matchByName = users.find(u => u.name.toLowerCase().includes(normalizedEmail.split('@')[0]));
    if (matchByName) {
      setCurrentUser(matchByName);
      setIsAuthenticated(true);
      return { success: true, user: matchByName };
    }

    return {
      success: false,
      error: 'Account not found. Please verify your email or sign up below.'
    };
  };

  // Sign Up with Role-Based Access (User vs Domain Administrator)
  const signup = ({ name, email, role = 'user', adminDomain = 'all', department, organizationName }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      };
    }

    let roleLabel = 'General User';
    if (role === 'admin') {
      const domainTitles = {
        water: 'Water & Plumbing Administrator',
        wifi: 'IT & Network Administrator',
        cleanliness: 'Cleanliness & Sanitation Administrator',
        facilities: 'Facilities & HVAC Administrator',
        safety: 'Safety & Security Administrator',
        all: 'Super Administrator / Operations Director'
      };
      roleLabel = domainTitles[adminDomain] || 'Domain Administrator';
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      initials: extractInitials(name),
      email: normalizedEmail,
      role: role, // 'user' | 'admin'
      adminDomain: role === 'admin' ? adminDomain : null,
      roleLabel: roleLabel,
      department: department?.trim() || (role === 'admin' ? 'Operations Department' : 'General Department'),
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    if (organizationName?.trim() && organizationName !== organization.name) {
      const updatedOrg = { ...organization, name: organizationName.trim() };
      setOrganization(updatedOrg);
      storageService.saveOrganization(updatedOrg);
    }

    return { success: true, user: newUser };
  };

  // Sign Out function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cp_current_user_v1');
  };

  const switchUser = (userId) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      storageService.saveCurrentUser(found);
    }
  };

  const updateOrganization = (newOrg) => {
    setOrganization(newOrg);
    storageService.saveOrganization(newOrg);
  };

  const isUser = currentUser?.role === 'user';
  const isAdmin = currentUser?.role === 'admin';
  const adminDomain = currentUser?.adminDomain || 'all';

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      isAuthenticated,
      login,
      signup,
      logout,
      organization,
      switchUser,
      updateOrganization,
      isUser,
      isAdmin,
      adminDomain
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
