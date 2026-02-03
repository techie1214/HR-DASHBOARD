// src/AuthContext.tsx

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { isAuthenticated, getUserInfo, login as authServiceLogin, logout as authServiceLogout } from './services/authService';

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

// Mock permissions for different user roles
const mockPermissions: Record<string, string[]> = {
  admin: [
    'leave:read', 'leave:create', 'leave:update', 'leave:delete',
    'payroll:read', 'payroll:create', 'payroll:update', 'payroll:delete',
    'job_posting:read', 'job_posting:create', 'job_posting:update', 'job_posting:delete',
    'appraisal:read', 'appraisal:create', 'appraisal:update', 'appraisal:delete',
    'kpi:read', 'kpi:create', 'kpi:update', 'kpi:delete',
    'report:read',
    'holiday:read', 'holiday:create', 'holiday:update', 'holiday:delete',
    'shift:read', 'shift:create', 'shift:update', 'shift:delete'
  ],
  manager: [
    'leave:read', 'leave:update',
    'appraisal:read', 'appraisal:update',
    'report:read'
  ],
  employee: [
    'leave:read', 'leave:create',
    'appraisal:read',
    'report:read'
  ]
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize user info if authenticated
    if (isAuthenticated()) {
      const userInfo = getUserInfo();
      setUser(userInfo);
    }
    setIsLoading(false);
  }, []);

  const hasPermission = (permission: string): boolean => {
    // In a real app, this would check the user's actual permissions
    // For now, we'll return true for demo purposes
    if (!user) return false;

    // Determine user role and check permissions
    const userRole = user.role || 'employee'; // Default to employee
    const permissions = mockPermissions[userRole] || mockPermissions.employee;

    // Check if the user has the specific permission or if they're an admin
    return permissions.includes(permission) || userRole === 'admin';
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Call the actual login service
      const result = await authServiceLogin(credentials);

      if (result.success) {
        const userInfo = getUserInfo();
        setUser(userInfo);
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