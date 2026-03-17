// src/AuthContext.tsx
// Enhanced authentication context with token refresh, stale data prevention, and graceful logout

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getUserInfo, login as authServiceLogin, logout as authServiceLogout, secureGetItem, setAuthFailedCallback, getAuthToken, isTokenExpired } from './services/authService';

interface AuthContextType {
  user: any;
  hasPermission: (permission: string) => boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUserData: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock permissions for different user roles (fallback if backend doesn't provide permissions)
const mockPermissions: Record<string, string[]> = {
  admin: [
    'leave:read', 'leave:create', 'leave:update', 'leave:delete',
    'payroll:read', 'payroll:create', 'payroll:update', 'payroll:delete',
    'job_posting:read', 'job_posting:create', 'job_posting:update', 'job_posting:delete',
    'appraisal:read', 'appraisal:create', 'appraisal:update', 'appraisal:delete',
    'kpi:read', 'kpi:create', 'kpi:update', 'kpi:delete',
    'report:read',
    'holiday:read', 'holiday:create', 'holiday:update', 'holiday:delete',
    'holiday-duty-roster:read', 'holiday-duty-roster:create', 'holiday-duty-roster:update', 'holiday-duty-roster:delete',
    'shift:read', 'shift:create', 'shift:update', 'shift:delete',
    'dashboard:access' // Admin always has dashboard access
  ],
  manager: [
    'leave:read', 'leave:update',
    'appraisal:read', 'appraisal:update',
    'report:read',
    'holiday:read',
    'holiday-duty-roster:read', 'holiday-duty-roster:create', 'holiday-duty-roster:update',
    'dashboard:access' // Manager has dashboard access
  ],
  employee: [
    'leave:read', 'leave:create',
    'appraisal:read',
    'report:read',
    'holiday:read',
    'holiday-duty-roster:read'
    // Note: Regular employees don't have dashboard:access by default
  ]
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  // Handle authentication failure (token expired, invalid, etc.)
  const handleAuthFailed = useCallback(() => {
    console.log('Auth failed - logging out user');
    authServiceLogout();
    setUser(null);
    setUserPermissions({});
    setIsAuthenticatedState(false);
    // Redirect to login
    window.location.href = '/';
  }, []);

  // Set up auth failed callback
  useEffect(() => {
    setAuthFailedCallback(handleAuthFailed);
  }, [handleAuthFailed]);

  // Load user data from storage
  const loadUserData = useCallback(() => {
    if (isAuthenticated()) {
      const userInfo = getUserInfo();
      const token = getAuthToken();
      
      // Check if token is expired
      if (token && isTokenExpired(token)) {
        console.log('Token expired on load - triggering logout');
        handleAuthFailed();
        return;
      }

      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticatedState(true);

        // Load permissions from storage
        const permissionsStr = secureGetItem('userPermissions');
        if (permissionsStr) {
          try {
            const permissions = JSON.parse(permissionsStr);
            setUserPermissions(permissions);
          } catch (error) {
            console.error('Error parsing permissions:', error);
          }
        }
      }
    } else {
      setUser(null);
      setIsAuthenticatedState(false);
    }
    setIsLoading(false);
  }, [handleAuthFailed]);

  // Initial load
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Periodic token refresh check (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticatedState) return;

    const checkTokenInterval = setInterval(() => {
      const token = getAuthToken();
      if (token) {
        // Check if token expires in next 10 minutes
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decodedToken = JSON.parse(jsonPayload);
          const currentTime = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = decodedToken.exp - currentTime;

          // If token expires in less than 10 minutes, refresh it
          if (timeUntilExpiry < 600) {
            console.log('Token expiring soon, will be refreshed on next API call');
          }
        } catch (error) {
          console.error('Error checking token expiry:', error);
        }
      }
    }, 300000); // 5 minutes

    return () => clearInterval(checkTokenInterval);
  }, [isAuthenticatedState]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Check for dashboard access permission specifically
    if (permission === 'dashboard:access') {
      // If we have permissions from backend, use those
      if (Object.keys(userPermissions).length > 0) {
        return !!userPermissions[permission] || userPermissions['*'];
      }
      // Fallback to mock permissions
      const userRole = user.role || user.roleId || 'admin';
      const roleKey = typeof userRole === 'number'
        ? userRole === 1 ? 'admin' : userRole === 2 ? 'manager' : 'employee'
        : userRole.toLowerCase();
      return mockPermissions[roleKey]?.includes(permission) || roleKey === 'admin';
    }

    // If we have permissions from backend, use those
    if (Object.keys(userPermissions).length > 0) {
      // Check for wildcard (admin has all permissions)
      if (userPermissions['*']) {
        return true;
      }
      return !!userPermissions[permission];
    }

    // Fallback to mock permissions
    const userRole = user.role || user.roleId || 'admin';
    const roleKey = typeof userRole === 'number'
      ? userRole === 1 ? 'admin' : userRole === 2 ? 'manager' : 'employee'
      : userRole.toLowerCase();

    const permissions = mockPermissions[roleKey] || mockPermissions.admin;
    return permissions.includes(permission) || roleKey === 'admin';
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await authServiceLogin(credentials);

      if (result.success) {
        // Wait a moment for tokens to be stored
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Reload user data after login
        loadUserData();
        
        return result;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authServiceLogout();
    setUser(null);
    setUserPermissions({});
    setIsAuthenticatedState(false);
  };

  // Function to refresh user data (call after profile updates, etc.)
  const refreshUserData = useCallback(() => {
    loadUserData();
    setLastRefreshTime(Date.now());
  }, [loadUserData]);

  const value = {
    user,
    hasPermission,
    login,
    logout,
    isLoading,
    refreshUserData,
    isAuthenticated: isAuthenticatedState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
