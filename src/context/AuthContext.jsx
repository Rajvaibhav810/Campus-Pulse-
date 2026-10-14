import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { supabaseClient } from '../services/supabaseClient';

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
    role: 'member',
    roleLabel: 'Campus Member',
    email: 'member@campus.internal',
    password: 'password123',
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
    password: 'password123',
    department: 'Operations & Facilities'
  }
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = storageService.loadUsers();
    if (saved && saved.length > 0) {
      // Ensure all users have password field populated from prior demo runs
      return saved.map(u => {
        if (!u.password) {
          return { ...u, password: 'password123' };
        }
        return u;
      });
    }
    return SEED_USERS;
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

  // Sync organization and profiles from Supabase on mount
  useEffect(() => {
    async function loadBackendData() {
      if (supabaseClient.isConfigured) {
        // Sync organization
        const remoteOrg = await supabaseClient.getOrganization();
        if (remoteOrg) {
          setOrganization(prev => ({
            ...prev,
            ...remoteOrg,
            emergencyHotline: remoteOrg.emergencyHotline || prev.emergencyHotline
          }));
        }

        // Sync profiles from Supabase if any exist
        const remoteProfiles = await supabaseClient.getProfiles();
        if (remoteProfiles && remoteProfiles.length > 0) {
          setUsers(prevUsers => {
            const merged = [...prevUsers];
            remoteProfiles.forEach(p => {
              const exists = merged.some(u => u.id === p.id || (u.email && u.email === p.id));
              if (!exists) {
                merged.push({
                  id: p.id,
                  name: p.full_name || 'Member',
                  initials: p.initials || extractInitials(p.full_name),
                  role: p.role || 'member',
                  roleLabel: p.role_label || 'Campus Member',
                  email: `${p.id}@campus.internal`,
                  password: 'password123',
                  department: p.department || 'General Campus',
                  createdAt: p.created_at || new Date().toISOString()
                });
              }
            });
            return merged;
          });
        }
      }
    }
    loadBackendData();
  }, []);

  // Secure Sign In function: enforces valid user, verified password, and role authorization
  const login = (email, password = '', chosenRole = null) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    
    if (!normalizedEmail) {
      return {
        success: false,
        error: 'Please enter your email address.'
      };
    }

    if (!password || !password.trim()) {
      return {
        success: false,
        error: 'Please enter your password.'
      };
    }

    // Look for matching user by email
    const found = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    if (!found) {
      return {
        success: false,
        error: 'No account found with this email. Please check your spelling or create an account.'
      };
    }

    // Verify password
    const enteredPassword = password.trim();
    const storedPassword = found.password || 'password123';

    if (enteredPassword !== storedPassword) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.'
      };
    }

    // Verify role authorization
    if (chosenRole === 'admin' && found.role !== 'admin') {
      return {
        success: false,
        error: 'Access denied: This account is registered as a Campus Member and does not possess Administrator privileges. Please sign in as a Member.'
      };
    }

    // User authenticated successfully
    setCurrentUser(found);
    setIsAuthenticated(true);
    storageService.saveCurrentUser(found);
    return { success: true, user: found };
  };

  // Sign Up with chosen role: Member or Admin
  const signup = ({ name, email, password, role = 'member', department, organizationName }) => {
    if (!name || !name.trim()) {
      return {
        success: false,
        error: 'Please enter your full name.'
      };
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return {
        success: false,
        error: 'Please provide a valid email address.'
      };
    }

    if (!password || password.trim().length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.'
      };
    }

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
      password: password.trim(),
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
    storageService.saveUsers(updatedUsers);

    // Sync profile to Supabase if available
    if (supabaseClient.isConfigured) {
      supabaseClient.saveProfile(newUser);
    }

    if (organizationName?.trim() && organizationName !== organization.name) {
      const updatedOrg = { ...organization, name: organizationName.trim() };
      setOrganization(updatedOrg);
      storageService.saveOrganization(updatedOrg);
      if (supabaseClient.isConfigured) {
        supabaseClient.updateOrganization(updatedOrg);
      }
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
    if (supabaseClient.isConfigured) {
      supabaseClient.updateOrganization(newOrg);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isMember = currentUser?.role === 'member' || currentUser?.role === 'user';
  const isUser = isMember;
  const adminDomain = currentUser?.adminDomain || 'all';

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      organization,
      isAuthenticated,
      login,
      signup,
      logout,
      updateOrganization,
      isAdmin,
      isMember,
      isUser,
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
