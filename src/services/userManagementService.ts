import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define the User interface
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  branchId: number;
  departmentId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define request interfaces
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  branchId: number;
  departmentId: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
  branchId?: number;
  departmentId?: number;
}

// Get all users
export const getAllUsers = async (): Promise<{ success: boolean; users?: User[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      users: response.data.data?.users || response.data.users || [],
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch users',
    };
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      user: response.data.data?.user || response.data.user,
    };
  } catch (error: any) {
    console.error('Error fetching user:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch user',
    };
  }
};

// Create user
export const createUser = async (userData: CreateUserRequest): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/api/users`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      user: response.data.data?.user || response.data.user,
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create user',
    };
  }
};

// Update user
export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/api/users/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      user: response.data.data?.user || response.data.user,
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update user',
    };
  }
};

// Delete user
export const deleteUser = async (userId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete user',
    };
  }
};

// Get user profile
export const getUserProfile = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/api/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      user: response.data.data?.user || response.data.user,
    };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch user profile',
    };
  }
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/api/users/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      user: response.data.data?.user || response.data.user,
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update user profile',
    };
  }
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/api/users/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: response.data.message || 'Password changed successfully',
    };
  } catch (error: any) {
    console.error('Error changing password:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to change password',
    };
  }
};

// Forgot password
export const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/api/users/forgot-password`, {
      email
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: response.data.message || 'Password reset link sent to your email',
    };
  } catch (error: any) {
    console.error('Error sending password reset link:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to send password reset link',
    };
  }
};

// Reset password
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/api/users/reset-password`, {
      token,
      newPassword
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: response.data.message || 'Password reset successfully',
    };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to reset password',
    };
  }
};