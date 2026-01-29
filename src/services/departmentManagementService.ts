import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define the Department interface
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  headUserId?: number;
  parentId?: number;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define request interfaces
export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  headUserId?: number;
  parentId?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  headUserId?: number;
  parentId?: number;
  isActive?: boolean;
}

// Get all departments
export const getAllDepartments = async (): Promise<{ success: boolean; departments?: Department[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/api/departments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      departments: response.data.data?.departments || response.data.departments || [],
    };
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch departments',
    };
  }
};

// Get department by ID
export const getDepartmentById = async (departmentId: number): Promise<{ success: boolean; department?: Department; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/api/departments/${departmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      department: response.data.data?.department || response.data.department,
    };
  } catch (error: any) {
    console.error('Error fetching department:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch department',
    };
  }
};

// Create department
export const createDepartment = async (departmentData: CreateDepartmentRequest): Promise<{ success: boolean; department?: Department; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/api/departments`, departmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      department: response.data.data?.department || response.data.department,
    };
  } catch (error: any) {
    console.error('Error creating department:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create department',
    };
  }
};

// Update department
export const updateDepartment = async (departmentId: number, departmentData: UpdateDepartmentRequest): Promise<{ success: boolean; department?: Department; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/api/departments/${departmentId}`, departmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      department: response.data.data?.department || response.data.department,
    };
  } catch (error: any) {
    console.error('Error updating department:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update department',
    };
  }
};

// Delete department
export const deleteDepartment = async (departmentId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/api/departments/${departmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Department deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting department:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete department',
    };
  }
};