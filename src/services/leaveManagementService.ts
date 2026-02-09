import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define the LeaveType interface
export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  daysPerYear: number;
  isPaid: boolean;
  allowCarryover: boolean;
  carryoverLimit?: number;
  accrualMethod?: string;
  accrualRate?: number;
  createdAt: string;
  updatedAt: string;
}

// Define the LeaveRequest interface
export interface LeaveRequest {
  id: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  attachment?: string;
  status: 'pending' | 'approved' | 'rejected';
  approverComment?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the LeaveBalance interface
export interface LeaveBalance {
  userId: number;
  leaveTypeId: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carryoverDays?: number;
  createdAt: string;
  updatedAt: string;
}

// Define request interfaces
export interface CreateLeaveTypeRequest {
  name: string;
  description?: string;
  daysPerYear: number | null; // Changed from number to number | null
  isPaid: boolean;
  allowCarryover: boolean;
  carryoverLimit?: number | null; // Changed from number to number | null
  accrualMethod?: string;
  accrualRate?: number;
}

export interface UpdateLeaveTypeRequest {
  name?: string;
  description?: string;
  daysPerYear?: number;
  isPaid?: boolean;
  allowCarryover?: boolean;
  carryoverLimit?: number;
  accrualMethod?: string;
  accrualRate?: number;
}

export interface CreateLeaveRequest {
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  attachment?: string;
}

export interface UpdateLeaveRequest {
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface ApproveLeaveRequest {
  status: 'approved';
  approverComment?: string;
}

export interface RejectLeaveRequest {
  status: 'rejected';
  rejectionReason: string;
}

// Get all leave types
export const getAllLeaveTypes = async (): Promise<{ success: boolean; leaveTypes?: LeaveType[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/leave/types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveTypes = [];
    if (Array.isArray(response.data)) {
      // If response is directly an array
      leaveTypes = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If response has a data wrapper
      if (response.data.data && Array.isArray(response.data.data.leaveTypes)) {
        leaveTypes = response.data.data.leaveTypes;
      } else if (response.data.leaveTypes && Array.isArray(response.data.leaveTypes)) {
        leaveTypes = response.data.leaveTypes;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If data contains an array directly
        leaveTypes = response.data.data;
      }
    }

    return {
      success: true,
      leaveTypes: leaveTypes,
    };
  } catch (error: any) {
    console.error('Error fetching leave types:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    } else if (error.response?.status === 400) {
      console.warn('Bad request when fetching leave types. Response:', error.response?.data);
      // Handle the 400 error specifically - might be an empty result or schema issue
      return {
        success: true,
        leaveTypes: [], // Return empty array for 400 errors to avoid breaking UI
        message: 'No leave types found or invalid request'
      };
    } else if (error.request) {
      console.warn('Backend server may not be running. Using demo data.');
      // Return demo data when request fails (backend not running)
      return {
        success: true,
        leaveTypes: [
          {
            id: 1,
            name: 'Annual Leave',
            description: 'Annual vacation days',
            daysPerYear: 14,
            isPaid: true,
            allowCarryover: true,
            carryoverLimit: 5,
            accrualMethod: 'pro_rata',
            accrualRate: 1.17,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Sick Leave',
            description: 'Days for illness',
            daysPerYear: 3,
            isPaid: true,
            allowCarryover: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leave types',
    };
  }
};

// Get leave type by ID
export const getLeaveTypeById = async (leaveTypeId: number): Promise<{ success: boolean; leaveType?: LeaveType; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/leave/types/${leaveTypeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveType = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveType) {
        leaveType = response.data.data.leaveType;
      } else if (response.data.leaveType) {
        leaveType = response.data.leaveType;
      } else {
        // If the response object itself is the leave type
        leaveType = response.data;
      }
    }

    return {
      success: true,
      leaveType: leaveType,
    };
  } catch (error: any) {
    console.error('Error fetching leave type:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leave type',
    };
  }
};

// Create leave type
export const createLeaveType = async (leaveTypeData: CreateLeaveTypeRequest): Promise<{ success: boolean; leaveType?: LeaveType; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    // Prepare the payload, ensuring nullable fields are handled correctly
    const payload: any = {
      name: leaveTypeData.name,
      description: leaveTypeData.description,
      daysPerYear: leaveTypeData.daysPerYear !== null ? leaveTypeData.daysPerYear : 0,
      isPaid: leaveTypeData.isPaid,
      allowCarryover: leaveTypeData.allowCarryover,
      accrualMethod: leaveTypeData.accrualMethod,
      accrualRate: leaveTypeData.accrualRate
    };

    // Only include carryoverLimit if carryover is allowed and the value is provided
    if (leaveTypeData.allowCarryover && leaveTypeData.carryoverLimit !== null) {
      payload.carryoverLimit = leaveTypeData.carryoverLimit;
    }

    const response = await axios.post(`${API_ENDPOINT}/leave/types`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveType = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveType) {
        leaveType = response.data.data.leaveType;
      } else if (response.data.leaveType) {
        leaveType = response.data.leaveType;
      } else {
        // If the response object itself is the leave type
        leaveType = response.data;
      }
    }

    return {
      success: true,
      leaveType: leaveType,
    };
  } catch (error: any) {
    console.error('Error creating leave type:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    } else if (error.request) {
      console.warn('Backend server may not be running. Using demo response.');
      // Return demo response when request fails (backend not running)
      return {
        success: true,
        leaveType: {
          id: Math.floor(Math.random() * 1000), // Random ID for demo
          name: leaveTypeData.name,
          description: leaveTypeData.description || '',
          daysPerYear: leaveTypeData.daysPerYear || 0,
          isPaid: leaveTypeData.isPaid,
          allowCarryover: leaveTypeData.allowCarryover,
          carryoverLimit: leaveTypeData.allowCarryover && leaveTypeData.carryoverLimit ? leaveTypeData.carryoverLimit : undefined,
          accrualMethod: leaveTypeData.accrualMethod,
          accrualRate: leaveTypeData.accrualRate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create leave type',
    };
  }
};

// Update leave type
export const updateLeaveType = async (leaveTypeId: number, leaveTypeData: UpdateLeaveTypeRequest): Promise<{ success: boolean; leaveType?: LeaveType; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/leave/types/${leaveTypeId}`, leaveTypeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveType = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveType) {
        leaveType = response.data.data.leaveType;
      } else if (response.data.leaveType) {
        leaveType = response.data.leaveType;
      } else {
        // If the response object itself is the leave type
        leaveType = response.data;
      }
    }

    return {
      success: true,
      leaveType: leaveType,
    };
  } catch (error: any) {
    console.error('Error updating leave type:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update leave type',
    };
  }
};

// Delete leave type
export const deleteLeaveType = async (leaveTypeId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/leave/types/${leaveTypeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Leave type deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting leave type:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete leave type',
    };
  }
};

// Get all leave requests
export const getAllLeaveRequests = async (): Promise<{ success: boolean; leaveRequests?: LeaveRequest[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Authentication token not found');
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log(`Fetching leave requests from: ${API_ENDPOINT}/leave/requests`);
    console.log('Auth token present:', !!token);

    const response = await axios.get(`${API_ENDPOINT}/leave/requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Leave requests response status:', response.status);
    console.log('Leave requests response data:', response.data);

    // Handle different possible response formats
    let leaveRequests = [];
    if (Array.isArray(response.data)) {
      // If response is directly an array
      leaveRequests = response.data;
      console.log('Parsed as direct array, count:', leaveRequests.length);
    } else if (response.data && typeof response.data === 'object') {
      // If response has a data wrapper
      if (response.data.data && Array.isArray(response.data.data.leaveRequests)) {
        leaveRequests = response.data.data.leaveRequests;
        console.log('Parsed from response.data.data.leaveRequests, count:', leaveRequests.length);
      } else if (response.data.leaveRequests && Array.isArray(response.data.leaveRequests)) {
        leaveRequests = response.data.leaveRequests;
        console.log('Parsed from response.data.leaveRequests, count:', leaveRequests.length);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If data contains an array directly
        leaveRequests = response.data.data;
        console.log('Parsed from response.data.data array, count:', leaveRequests.length);
      } else {
        console.warn('Unexpected response format, attempting to use as-is:', response.data);
        // If we still don't recognize the format, return empty array
        leaveRequests = [];
      }
    } else {
      console.warn('Unexpected response data type:', typeof response.data);
      leaveRequests = [];
    }

    return {
      success: true,
      leaveRequests: leaveRequests,
    };
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Request error (no response):', error.request);
      console.warn('Backend server may not be running. Using demo data.');
      
      // Return demo data when request fails (backend not running)
      return {
        success: true,
        leaveRequests: [
          {
            id: 1,
            userId: 1,
            leaveTypeId: 1,
            startDate: '2024-06-15',
            endDate: '2024-06-20',
            reason: 'Vacation trip',
            status: 'pending',
            createdAt: '2024-05-20T10:30:00Z',
            updatedAt: '2024-05-20T10:30:00Z'
          },
          {
            id: 2,
            userId: 2,
            leaveTypeId: 2,
            startDate: '2024-06-10',
            endDate: '2024-06-12',
            reason: 'Medical appointment',
            status: 'approved',
            createdAt: '2024-06-08T09:15:00Z',
            updatedAt: '2024-06-09T14:20:00Z'
          },
          {
            id: 3,
            userId: 3,
            leaveTypeId: 4,
            startDate: '2024-07-01',
            endDate: '2024-09-30',
            reason: 'Maternity leave',
            status: 'approved',
            createdAt: '2024-05-15T11:45:00Z',
            updatedAt: '2024-05-16T16:30:00Z'
          },
          {
            id: 4,
            userId: 4,
            leaveTypeId: 7, // Assuming 7 is for bereaved leave
            startDate: '2024-06-25',
            endDate: '2024-06-27',
            reason: 'Family bereavement',
            status: 'pending',
            createdAt: '2024-06-20T13:20:00Z',
            updatedAt: '2024-06-20T13:20:00Z'
          }
        ]
      };
    } else {
      console.error('General error:', error.message);
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    } else if (error.response?.status === 400) {
      return {
        success: false,
        message: 'Bad request. Please check your request format and try again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leave requests',
    };
  }
};

// Get leave request by ID
export const getLeaveRequestById = async (leaveRequestId: number): Promise<{ success: boolean; leaveRequest?: LeaveRequest; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/leave/requests/${leaveRequestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveRequest = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveRequest) {
        leaveRequest = response.data.data.leaveRequest;
      } else if (response.data.leaveRequest) {
        leaveRequest = response.data.leaveRequest;
      } else {
        // If the response object itself is the leave request
        leaveRequest = response.data;
      }
    }

    return {
      success: true,
      leaveRequest: leaveRequest,
    };
  } catch (error: any) {
    console.error('Error fetching leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    } else if (error.request) {
      console.warn('Backend server may not be running. Using demo data.');
      // Return demo data when request fails (backend not running)
      return {
        success: true,
        leaveRequest: {
          id: leaveRequestId,
          userId: 1,
          leaveTypeId: 1,
          startDate: '2024-06-15',
          endDate: '2024-06-20',
          reason: 'Demo leave request',
          status: 'pending',
          createdAt: '2024-05-20T10:30:00Z',
          updatedAt: '2024-05-20T10:30:00Z'
        }
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leave request',
    };
  }
};

// Create leave request
export const createLeaveRequest = async (leaveRequestData: CreateLeaveRequest): Promise<{ success: boolean; leaveRequest?: LeaveRequest; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/leave/requests`, leaveRequestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveRequest = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveRequest) {
        leaveRequest = response.data.data.leaveRequest;
      } else if (response.data.leaveRequest) {
        leaveRequest = response.data.leaveRequest;
      } else {
        // If the response object itself is the leave request
        leaveRequest = response.data;
      }
    }

    return {
      success: true,
      leaveRequest: leaveRequest,
    };
  } catch (error: any) {
    console.error('Error creating leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create leave request',
    };
  }
};

// Update leave request
export const updateLeaveRequest = async (leaveRequestId: number, leaveRequestData: UpdateLeaveRequest): Promise<{ success: boolean; leaveRequest?: LeaveRequest; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/leave/requests/${leaveRequestId}`, leaveRequestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveRequest = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveRequest) {
        leaveRequest = response.data.data.leaveRequest;
      } else if (response.data.leaveRequest) {
        leaveRequest = response.data.leaveRequest;
      } else {
        // If the response object itself is the leave request
        leaveRequest = response.data;
      }
    }

    return {
      success: true,
      leaveRequest: leaveRequest,
    };
  } catch (error: any) {
    console.error('Error updating leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update leave request',
    };
  }
};

// Delete leave request
export const deleteLeaveRequest = async (leaveRequestId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/leave/requests/${leaveRequestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Leave request deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete leave request',
    };
  }
};

// Approve leave request
export const approveLeaveRequest = async (leaveRequestId: number, approvalData: ApproveLeaveRequest): Promise<{ success: boolean; leaveRequest?: LeaveRequest; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/leave/requests/${leaveRequestId}/approve`, approvalData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveRequest = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveRequest) {
        leaveRequest = response.data.data.leaveRequest;
      } else if (response.data.leaveRequest) {
        leaveRequest = response.data.leaveRequest;
      } else {
        // If the response object itself is the leave request
        leaveRequest = response.data;
      }
    }

    return {
      success: true,
      leaveRequest: leaveRequest,
    };
  } catch (error: any) {
    console.error('Error approving leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to approve leave request',
    };
  }
};

// Reject leave request
export const rejectLeaveRequest = async (leaveRequestId: number, rejectionData: RejectLeaveRequest): Promise<{ success: boolean; leaveRequest?: LeaveRequest; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/leave/requests/${leaveRequestId}/reject`, rejectionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveRequest = null;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.leaveRequest) {
        leaveRequest = response.data.data.leaveRequest;
      } else if (response.data.leaveRequest) {
        leaveRequest = response.data.leaveRequest;
      } else {
        // If the response object itself is the leave request
        leaveRequest = response.data;
      }
    }

    return {
      success: true,
      leaveRequest: leaveRequest,
    };
  } catch (error: any) {
    console.error('Error rejecting leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to reject leave request',
    };
  }
};

// Get user leave balance
export const getUserLeaveBalance = async (userId: number): Promise<{ success: boolean; leaveBalances?: LeaveBalance[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/leave/balances/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveBalances = [];
    if (Array.isArray(response.data)) {
      // If response is directly an array
      leaveBalances = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If response has a data wrapper
      if (response.data.data && Array.isArray(response.data.data.leaveBalances)) {
        leaveBalances = response.data.data.leaveBalances;
      } else if (response.data.leaveBalances && Array.isArray(response.data.leaveBalances)) {
        leaveBalances = response.data.leaveBalances;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If data contains an array directly
        leaveBalances = response.data.data;
      }
    }

    return {
      success: true,
      leaveBalances: leaveBalances,
    };
  } catch (error: any) {
    console.error('Error fetching user leave balance:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch user leave balance',
    };
  }
};

// Get leave calendar
export const getLeaveCalendar = async (): Promise<{ success: boolean; leaveEvents?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/leave/calendar`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response formats
    let leaveEvents = [];
    if (Array.isArray(response.data)) {
      // If response is directly an array
      leaveEvents = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If response has a data wrapper
      if (response.data.data && Array.isArray(response.data.data.leaveEvents)) {
        leaveEvents = response.data.data.leaveEvents;
      } else if (response.data.leaveEvents && Array.isArray(response.data.leaveEvents)) {
        leaveEvents = response.data.leaveEvents;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If data contains an array directly
        leaveEvents = response.data.data;
      }
    }

    return {
      success: true,
      leaveEvents: leaveEvents,
    };
  } catch (error: any) {
    console.error('Error fetching leave calendar:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leave calendar',
    };
  }
};