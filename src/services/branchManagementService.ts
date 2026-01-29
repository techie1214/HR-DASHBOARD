import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define interfaces for branch management
export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  location_coordinates: string;
  location_radius_meters: number;
  attendance_mode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  location_coordinates: string;
  location_radius_meters: number;
  attendance_mode: string;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  location_coordinates?: string;
  location_radius_meters?: number;
  attendance_mode?: string;
  status?: string;
}

// Get all branches
export const getAllBranches = async (): Promise<{ success: boolean; branches?: Branch[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/branches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      branches: response.data.data?.branches || response.data.branches || [],
    };
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch branches',
    };
  }
};

// Get branch by ID
export const getBranchById = async (branchId: string): Promise<{ success: boolean; branch?: Branch; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/branches/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      branch: response.data.data?.branch || response.data.branch,
    };
  } catch (error: any) {
    console.error('Error fetching branch:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch branch',
    };
  }
};

// Create a new branch
export const createBranch = async (branchData: CreateBranchRequest): Promise<{ success: boolean; branch?: Branch; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/branches`, branchData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      branch: response.data.branch || response.data,
    };
  } catch (error: any) {
    console.error('Error creating branch:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create branch',
    };
  }
};

// Update an existing branch
export const updateBranch = async (branchId: string, branchData: UpdateBranchRequest): Promise<{ success: boolean; branch?: Branch; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/branches/${branchId}`, branchData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      branch: response.data.branch || response.data,
    };
  } catch (error: any) {
    console.error('Error updating branch:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update branch',
    };
  }
};

// Delete a branch
export const deleteBranch = async (branchId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/branches/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Branch deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting branch:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete branch',
    };
  }
};