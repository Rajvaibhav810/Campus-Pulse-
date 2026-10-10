// Campus Pulse — LocalStorage Persistence & API Abstraction Adapter
import { INITIAL_ISSUES, INITIAL_ORGANIZATION, INITIAL_USERS } from './mockData';

const STORAGE_KEYS = {
  ISSUES: 'cp_issues_v1',
  ORG: 'cp_organization_v1',
  CURRENT_USER: 'cp_current_user_v1',
  USERS: 'cp_users_v1'
};

export const storageService = {
  // Issues
  loadIssues() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load issues from localStorage, using seed data', e);
    }
    this.saveIssues(INITIAL_ISSUES);
    return INITIAL_ISSUES;
  },

  saveIssues(issues) {
    try {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    } catch (e) {
      console.error('Failed to save issues to localStorage', e);
    }
  },

  // Organization config
  loadOrganization() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORG);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load org from localStorage', e);
    }
    this.saveOrganization(INITIAL_ORGANIZATION);
    return INITIAL_ORGANIZATION;
  },

  saveOrganization(org) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(org));
    } catch (e) {
      console.error('Failed to save org to localStorage', e);
    }
  },

  // Users
  loadUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load users from localStorage', e);
    }
    this.saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
  },

  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  },

  // Current active session user
  loadCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load current user', e);
    }
    const defaultUser = INITIAL_USERS[0]; // Viraj K. (Member)
    this.saveCurrentUser(defaultUser);
    return defaultUser;
  },

  saveCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save current user', e);
    }
  },

  // Reset to default seed
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.ORG);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};
