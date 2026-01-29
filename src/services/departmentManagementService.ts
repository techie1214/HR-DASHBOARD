import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define interfaces for department management
export interface Department {
  id: string;
  name: string;
  description: string;
  branch_id: string;
  head_id?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
  branch_id: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  branch_id?: string;
  head_id?: string;
  status?: string;
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

    const response = await axios.get(`${API_ENDPOINT}/departments`, {
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
export const getDepartmentById = async (departmentId: string): Promise<{ success: boolean; department?: Department; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/departments/${departmentId}`, {
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

// Create a new department
export const createDepartment = async (departmentData: CreateDepartmentRequest): Promise<{ success: boolean; department?: Department; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/departments`, departmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      department: response.data.department || response.data,
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

// Update an existing department
export const updateDepartment = async (departmentId: string, departmentData: UpdateDepartmentRequest): Promise<{ success: boolean; department?: Department; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/departments/${departmentId}`, departmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      department: response.data.department || response.data,
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

// Delete a department
export const deleteDepartment = async (departmentId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/departments/${departmentId}`, {
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