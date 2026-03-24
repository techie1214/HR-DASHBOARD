import axios from 'axios';

const API_ENDPOINT = import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api';
const LEAVE_BASE = `${API_ENDPOINT}/leave/allocations`;

// ============================================================================
// INTERFACES
// ============================================================================

export interface LeaveAllocation {
  id: number;
  user_id: number;
  leave_type_id: number;
  allocated_days: number | string;
  used_days: number | string;
  carried_over_days: number | string;
  cycle_start_date: string;
  cycle_end_date: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  leave_type_name?: string;
  // Computed fields (not from API)
  remaining_days?: number;
}

export interface CreateAllocationRequest {
  user_id: number;
  leave_type_id: number;
  allocated_days: number;
  cycle_start_date: string;
  cycle_end_date: string;
  carried_over_days?: number;
}

export interface BulkAllocationRequest {
  leave_type_id: number;
  allocated_days: number;
  cycle_start_date: string;
  cycle_end_date: string;
  carried_over_days?: number;
  user_ids?: number[];
}

export interface UpdateAllocationRequest {
  allocated_days?: number;
  used_days?: number;
  carried_over_days?: number;
  cycle_start_date?: string;
  cycle_end_date?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  userId?: number;
  leaveTypeId?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get current user's own allocations
 */
export const getMyAllocations = async (): Promise<{ success: boolean; allocations?: LeaveAllocation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const response = await axios.get(`${LEAVE_BASE}/my-allocations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.success && response.data?.data?.allocations) {
      return {
        success: true,
        allocations: response.data.data.allocations,
      };
    }

    return {
      success: false,
      message: 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error fetching my allocations:', error);
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Authentication failed. Please log in again.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch allocations',
    };
  }
};

/**
 * Get all allocations (Admin/HR) with pagination and filters
 */
export const getAllAllocations = async (params?: PaginationParams): Promise<{ 
  success: boolean; 
  allocations?: LeaveAllocation[]; 
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string 
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.leaveTypeId) queryParams.append('leaveTypeId', params.leaveTypeId.toString());

    const url = `${LEAVE_BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response for allocations:', response.data);

    if (response.data?.success && response.data?.data?.leaveAllocations) {
      console.log('Allocations fetched:', response.data.data.leaveAllocations.length, 'items');
      return {
        success: true,
        allocations: response.data.data.leaveAllocations,
        pagination: response.data.data.pagination ? {
          currentPage: response.data.data.pagination.currentPage,
          totalPages: response.data.data.pagination.totalPages,
          totalItems: response.data.data.pagination.totalItems,
          itemsPerPage: response.data.data.pagination.itemsPerPage,
        } : undefined,
      };
    }

    console.warn('Unexpected response format:', response.data);
    return {
      success: false,
      message: 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error fetching all allocations:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to view allocations.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch allocations',
    };
  }
};

/**
 * Get allocation by ID
 */
export const getAllocationById = async (allocationId: number): Promise<{ success: boolean; allocation?: LeaveAllocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const response = await axios.get(`${LEAVE_BASE}/${allocationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.success && response.data?.data?.allocation) {
      return {
        success: true,
        allocation: response.data.data.allocation,
      };
    }

    return {
      success: false,
      message: 'Allocation not found',
    };
  } catch (error: any) {
    console.error('Error fetching allocation:', error);
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Allocation not found',
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to view this allocation.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch allocation',
    };
  }
};

/**
 * Create single allocation
 */
export const createAllocation = async (data: CreateAllocationRequest): Promise<{ success: boolean; allocation?: LeaveAllocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    console.log('Sending create allocation request:', data);

    const response = await axios.post(`${LEAVE_BASE}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Create allocation response:', response.data);

    // Backend returns: { success: true, message: '...', data: { leaveAllocation: {...} } }
    if (response.data?.success && (response.data?.data?.leaveAllocation || response.data?.data?.allocation)) {
      return {
        success: true,
        allocation: response.data.data.leaveAllocation || response.data.data.allocation,
        message: response.data.message || 'Leave allocation created successfully',
      };
    }

    console.warn('Unexpected response format:', response.data);
    return {
      success: false,
      message: response.data?.message || 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error creating allocation:', error);
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid request data',
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to create allocations.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create allocation',
    };
  }
};

/**
 * Bulk allocate to selected users
 */
export const bulkAllocateSelected = async (data: BulkAllocationRequest): Promise<{ success: boolean; allocations?: LeaveAllocation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const response = await axios.post(`${LEAVE_BASE}/bulk`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.success && response.data?.data?.allocations) {
      return {
        success: true,
        allocations: response.data.data.allocations,
        message: `Successfully allocated leave to ${response.data.data.allocations.length} users`,
      };
    }

    return {
      success: false,
      message: 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error bulk allocating:', error);
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid request data',
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to create allocations.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to bulk allocate',
    };
  }
};

/**
 * Bulk allocate to ALL active users
 */
export const bulkAllocateAll = async (data: Omit<BulkAllocationRequest, 'user_ids'>): Promise<{ success: boolean; allocations?: LeaveAllocation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const response = await axios.post(`${LEAVE_BASE}/allocate-all`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.success && response.data?.data?.allocations) {
      return {
        success: true,
        allocations: response.data.data.allocations,
        message: `Successfully allocated leave to all active users (${response.data.data.allocations.length} users)`,
      };
    }

    return {
      success: false,
      message: 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error allocating to all users:', error);
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid request data',
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to create allocations.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to allocate to all users',
    };
  }
};

/**
 * Update allocation
 */
export const updateAllocation = async (allocationId: number, data: UpdateAllocationRequest): Promise<{ success: boolean; allocation?: LeaveAllocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const response = await axios.put(`${LEAVE_BASE}/${allocationId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.success && (response.data?.data?.allocation || response.data?.data?.leaveAllocation)) {
      return {
        success: true,
        allocation: response.data.data.allocation || response.data.data.leaveAllocation,
        message: 'Allocation updated successfully',
      };
    }

    console.log('Response format:', response.data);
    return {
      success: false,
      message: 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error updating allocation:', error);
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid request data',
      };
    }
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Allocation not found',
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to update allocations.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update allocation',
    };
  }
};

/**
 * Delete allocation
 */
export const deleteAllocation = async (allocationId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
      };
    }

    const response = await axios.delete(`${LEAVE_BASE}/${allocationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.data?.success) {
      return {
        success: true,
        message: 'Allocation deleted successfully',
      };
    }

    return {
      success: false,
      message: 'Unexpected response format',
    };
  } catch (error: any) {
    console.error('Error deleting allocation:', error);
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Allocation not found',
      };
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. You need permission to delete allocations.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete allocation',
    };
  }
};
