import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

function extractInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Exactly two roles supported across the platform: Member and Admin
export const SEED_USERS = [
  {
    id: 'user-vk',
    name: 'Viraj K.',
    initials: 'VK',
    role: 'member', // 'member' | 'admin'
    roleLabel: 'Campus Member',
    email: 'member@campus.internal',
    department: 'Engineering & Product'
  },
  {
    id: 'user-sarah',
    name: 'Sarah Patel',
    initials: 'SP',
    role: 'admin',
    adminDomain: 'all',
    roleLabel: 'Campus Administrator',
    email: 'admin@campus.internal',
    department: 'Operations & Facilities'
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

  // Sign In function: enforces chosen role (Member or Admin)
  const login = (email, password = '', chosenRole = null) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    
    // Look for matching user by email
    let found = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    if (!found && normalizedEmail) {
      found = users.find(u => u.name.toLowerCase().includes(normalizedEmail.split('@')[0]));
    }

    // If user specified role on sign in (member vs admin)
    if (chosenRole) {
      if (found) {
        // Update user to chosen role if different
        const updated = {
          ...found,
          role: chosenRole,
          roleLabel: chosenRole === 'admin' ? 'Campus Administrator' : 'Campus Member'
        };
        setCurrentUser(updated);
        setIsAuthenticated(true);
        storageService.saveCurrentUser(updated);
        return { success: true, user: updated };
      }

      // If user typed a new email with selected role, create session
      if (normalizedEmail) {
        const rawName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = rawName.replace(/\b\w/g, l => l.toUpperCase());
        const newUser = {
          id: `user-${Date.now()}`,
          name: formattedName || (chosenRole === 'admin' ? 'Admin User' : 'Campus Member'),
          initials: extractInitials(formattedName || 'User'),
          email: normalizedEmail,
          role: chosenRole,
          roleLabel: chosenRole === 'admin' ? 'Campus Administrator' : 'Campus Member',
          department: chosenRole === 'admin' ? 'Operations & Administration' : 'General Campus',
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        storageService.saveCurrentUser(newUser);
        return { success: true, user: newUser };
      }
    }

    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      storageService.saveCurrentUser(found);
      return { success: true, user: found };
    }

    return {
      success: false,
      error: 'Account not found. Please verify your email or create an account.'
    };
  };

  // Sign Up with chosen role: Member or Admin
  const signup = ({ name, email, role = 'member', department, organizationName }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      };
    }

    const assignedRole = role === 'admin' ? 'admin' : 'member';
    const roleLabel = assignedRole === 'admin' ? 'Campus Administrator' : 'Campus Member';

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      initials: extractInitials(name),
      email: normalizedEmail,
      role: assignedRole,
      adminDomain: 'all',
      roleLabel: roleLabel,
      department: department?.trim() || (assignedRole === 'admin' ? 'Operations Leadership' : 'General Campus'),
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    storageService.saveCurrentUser(newUser);

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

  const updateOrganization = (newOrg) => {
    setOrganization(newOrg);
    storageService.saveOrganization(newOrg);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isMember = currentUser?.role === 'member' || currentUser?.role === 'user';
  const isUser = isMember;
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
      updateOrganization,
      isUser,
      isMember,
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
