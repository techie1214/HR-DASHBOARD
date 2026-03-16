// src/AuthContext.tsx

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { isAuthenticated, getUserInfo, login as authServiceLogin, logout as authServiceLogout, secureGetItem } from './services/authService';

interface AuthContextType {
  user: any;
  hasPermission: (permission: string) => boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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
    'shift:read', 'shift:create', 'shift:update', 'shift:delete'
  ],
  manager: [
    'leave:read', 'leave:update',
    'appraisal:read', 'appraisal:update',
    'report:read',
    'holiday:read',
    'holiday-duty-roster:read', 'holiday-duty-roster:create', 'holiday-duty-roster:update'
  ],
  employee: [
    'leave:read', 'leave:create',
    'appraisal:read',
    'report:read',
    'holiday:read',
    'holiday-duty-roster:read'
  ]
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize user info if authenticated
    if (isAuthenticated()) {
      const userInfo = getUserInfo();
      setUser(userInfo);
      
      // Load permissions from storage (set by backend during login)
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
    setIsLoading(false);
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // If we have permissions from backend, use those
    if (Object.keys(userPermissions).length > 0) {
      // Check for wildcard (admin has all permissions)
      if (userPermissions['*']) {
        return true;
      }
      return !!userPermissions[permission];
    }

    // Fallback to mock permissions
    // Determine user role and check permissions
    // Handle both roleId (number) and role (string) formats
    const userRole = user.role || user.roleId || 'admin'; // Default to admin for development

    // Convert roleId number to string if needed
    const roleKey = typeof userRole === 'number'
      ? userRole === 1 ? 'admin' : userRole === 2 ? 'manager' : 'employee'
      : userRole.toLowerCase();

    const permissions = mockPermissions[roleKey] || mockPermissions.admin;

    // Check if the user has the specific permission or if they're an admin
    return permissions.includes(permission) || roleKey === 'admin';
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Call the actual login service
      const result = await authServiceLogin(credentials);

      if (result.success) {
        const userInfo = getUserInfo();
        setUser(userInfo);
        
        // Load permissions from storage after login
        const permissionsStr = secureGetItem('userPermissions');
        if (permissionsStr) {
          try {
            const permissions = JSON.parse(permissionsStr);
            setUserPermissions(permissions);
          } catch (error) {
            console.error('Error parsing permissions after login:', error);
          }
        }
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
  };

  const value = {
    user,
    hasPermission,
    login,
    logout,
    isLoading
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