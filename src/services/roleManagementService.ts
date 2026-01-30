import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define interfaces for role management
export interface Permission {
  key: string;
  category: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface AssignPermissionsRequest {
  permissions: string[];
}

// Get all available permissions
export const getAvailablePermissions = async (): Promise<{ success: boolean; permissions?: Permission[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/role-management/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      permissions: response.data.data?.permissions || response.data.permissions || [],
    };
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch permissions',
    };
  }
};

// Get all roles (using the primary endpoint)
export const getAllRoles = async (): Promise<{ success: boolean; roles?: Role[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/role-management`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      roles: response.data.data?.roles || response.data.roles || [],
    };
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch roles',
    };
  }
};

// Alternative endpoint for getting all roles
export const getAllRolesAlt = async (): Promise<{ success: boolean; roles?: Role[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      roles: response.data.data?.roles || response.data.roles || [],
    };
  } catch (error: any) {
    console.error('Error fetching roles (alt):', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch roles',
    };
  }
};

// Create a new role
export const createRole = async (roleData: CreateRoleRequest): Promise<{ success: boolean; role?: Role; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/role-management`, roleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      role: response.data.role || response.data,
    };
  } catch (error: any) {
    console.error('Error creating role:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create role',
    };
  }
};

// Update an existing role
export const updateRole = async (roleId: string, roleData: UpdateRoleRequest): Promise<{ success: boolean; role?: Role; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/role-management/${roleId}`, roleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      role: response.data.role || response.data,
    };
  } catch (error: any) {
    console.error('Error updating role:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update role',
    };
  }
};

// Delete a role
export const deleteRole = async (roleId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/role-management/${roleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting role:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete role',
    };
  }
};

// Get permissions for a specific role
export const getRolePermissions = async (roleId: string): Promise<{ success: boolean; permissions?: Permission[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/permissions/roles/${roleId}/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      permissions: response.data.data?.permissions || response.data.permissions || [],
    };
  } catch (error: any) {
    console.error('Error fetching role permissions:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch role permissions',
    };
  }
};

// Assign multiple permissions to a role
export const assignPermissionsToRole = async (roleId: string, permissions: string[]): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.post(`${API_ENDPOINT}/permissions/roles/${roleId}/permissions`, { permissions }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Permissions assigned successfully',
    };
  } catch (error: any) {
    console.error('Error assigning permissions to role:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to assign permissions to role',
    };
  }
};

// Remove multiple permissions from a role
export const removePermissionsFromRole = async (roleId: string, permissions: string[]): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/permissions/roles/${roleId}/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { permissions },
    });

    return {
      success: true,
      message: 'Permissions removed successfully',
    };
  } catch (error: any) {
    console.error('Error removing permissions from role:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to remove permissions from role',
    };
  }
};