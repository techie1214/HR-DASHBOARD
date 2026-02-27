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
  isActive?: boolean;
}

// Get all users
// GET {{baseUrl}}/users
export const getAllUsers = async (page?: number, limit?: number): Promise<{ success: boolean; users?: User[]; total?: number; page?: number; limit?: number; totalPages?: number; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    // Build query params for pagination
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `${API_ENDPOINT}/users${queryString ? '?' + queryString : ''}`;

    console.log('Fetching users from:', url);
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Users response:', response.data);

    // Handle the actual API response structure:
    // { success: true, data: { users: [...], pagination: {...} } }
    let usersData = [];
    let total = 0;
    let totalPages = 1;
    let currentPage = page || 1;

    if (response.data?.data) {
      const data = response.data.data;
      
      // Extract users array
      if (data.users && Array.isArray(data.users)) {
        usersData = data.users;
      }
      
      // Extract pagination info
      if (data.pagination) {
        total = data.pagination.totalItems || data.pagination.total || 0;
        totalPages = data.pagination.totalPages || 1;
        currentPage = data.pagination.currentPage || page || 1;
      } else if (data.total !== undefined) {
        total = data.total;
      }
    } else if (Array.isArray(response.data)) {
      usersData = response.data;
      total = response.data.length;
    }

    // Map API response to User interface (handle snake_case to camelCase)
    const users = usersData.map((u: any) => ({
      id: u.id,
      firstName: u.first_name || u.firstName || 'N/A',
      lastName: u.last_name || u.lastName || 'N/A',
      email: u.email || 'N/A',
      roleId: u.role_id || u.roleId || 0,
      branchId: u.branch_id || u.branchId || 0,
      departmentId: u.department_id || u.departmentId || 0,
      isActive: u.status === 'active', // Use status field
      createdAt: u.created_at || u.createdAt || '',
      updatedAt: u.updated_at || u.updatedAt || ''
    }));

    return {
      success: true,
      users: users,
      total: total,
      totalPages: totalPages,
      page: currentPage,
      limit: limit || 20,
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
// GET {{baseUrl}}/users/:id
export const getUserById = async (userId: number): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different response formats
    let user = null;
    if (response.data?.data?.user) {
      user = response.data.data.user;
    } else if (response.data?.user) {
      user = response.data.user;
    } else if (response.data?.data) {
      user = response.data.data;
    } else {
      user = response.data;
    }

    return {
      success: true,
      user: user,
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
// POST {{baseUrl}}/users
export const createUser = async (userData: CreateUserRequest): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log('Creating user with data:', userData);
    
    // Convert camelCase to snake_case for API
    const apiPayload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      role_id: userData.roleId,
      branch_id: userData.branchId,
      department_id: userData.departmentId
    };
    
    const response = await axios.post(`${API_ENDPOINT}/users`, apiPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Create user response:', response.data);

    // Handle different response formats
    let user = null;
    if (response.data?.data?.user) {
      user = response.data.data.user;
    } else if (response.data?.user) {
      user = response.data.user;
    } else if (response.data?.data) {
      user = response.data.data;
    } else {
      user = response.data;
    }

    return {
      success: true,
      user: user,
      message: 'User created successfully'
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
// PUT {{baseUrl}}/users/:id
export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log(`Updating user ${userId} with data:`, userData);
    
    // Convert camelCase to snake_case for API
    const apiPayload: any = {};
    if (userData.firstName !== undefined) apiPayload.first_name = userData.firstName;
    if (userData.lastName !== undefined) apiPayload.last_name = userData.lastName;
    if (userData.email !== undefined) apiPayload.email = userData.email;
    if (userData.roleId !== undefined) apiPayload.role_id = userData.roleId;
    if (userData.branchId !== undefined) apiPayload.branch_id = userData.branchId;
    if (userData.departmentId !== undefined) apiPayload.department_id = userData.departmentId;
    if (userData.isActive !== undefined) apiPayload.is_active = userData.isActive;
    
    const response = await axios.put(`${API_ENDPOINT}/users/${userId}`, apiPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Update user response:', response.data);

    // Handle different response formats
    let user = null;
    if (response.data?.data?.user) {
      user = response.data.data.user;
    } else if (response.data?.user) {
      user = response.data.user;
    } else if (response.data?.data) {
      user = response.data.data;
    } else {
      user = response.data;
    }

    return {
      success: true,
      user: user,
      message: 'User updated successfully'
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
// DELETE {{baseUrl}}/users/:id
export const deleteUser = async (userId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log(`Deleting user ${userId}`);
    const response = await axios.delete(`${API_ENDPOINT}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Delete user response:', response.data);

    return {
      success: true,
      message: response.data?.message || 'User deleted successfully',
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
// GET {{baseUrl}}/users/profile
export const getUserProfile = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/users/profile`, {
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
// PUT {{baseUrl}}/users/profile
export const updateUserProfile = async (profileData: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/users/profile`, profileData, {
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
// PUT {{baseUrl}}/users/change-password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/users/change-password`, {
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
// POST {{baseUrl}}/users/forgot-password
export const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/users/forgot-password`, {
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
// POST {{baseUrl}}/users/reset-password
export const resetPassword = async (resetToken: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/users/reset-password`, {
      token: resetToken,
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

// Toggle user status (activate/deactivate)
// PUT {{baseUrl}}/users/:id/status
export const toggleUserStatus = async (userId: number, isActive: boolean): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log(`Toggling user ${userId} to ${isActive ? 'active' : 'inactive'}...`);
    const response = await axios.put(`${API_ENDPOINT}/users/${userId}/status`, {
      isActive: isActive  // Send as camelCase
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Toggle status response:', response.data);

    // Handle different response formats
    let user = null;
    if (response.data?.data?.user) {
      user = response.data.data.user;
    } else if (response.data?.user) {
      user = response.data.user;
    } else if (response.data?.data) {
      user = response.data.data;
    } else {
      user = response.data;
    }

    return {
      success: true,
      user: user,
      message: isActive ? 'User activated successfully' : 'User deactivated successfully'
    };
  } catch (error: any) {
    console.error('Error toggling user status:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update user status',
    };
  }
};
