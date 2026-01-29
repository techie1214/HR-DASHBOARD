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
  daysPerYear: number;
  isPaid: boolean;
  allowCarryover: boolean;
  carryoverLimit?: number;
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

    const response = await axios.get(`${API_ENDPOINT}/api/leave/types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveTypes: response.data.data?.leaveTypes || response.data.leaveTypes || [],
    };
  } catch (error: any) {
    console.error('Error fetching leave types:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
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

    const response = await axios.get(`${API_ENDPOINT}/api/leave/types/${leaveTypeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveType: response.data.data?.leaveType || response.data.leaveType,
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

    const response = await axios.post(`${API_ENDPOINT}/api/leave/types`, leaveTypeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveType: response.data.data?.leaveType || response.data.leaveType,
    };
  } catch (error: any) {
    console.error('Error creating leave type:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
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

    const response = await axios.put(`${API_ENDPOINT}/api/leave/types/${leaveTypeId}`, leaveTypeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveType: response.data.data?.leaveType || response.data.leaveType,
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

    await axios.delete(`${API_ENDPOINT}/api/leave/types/${leaveTypeId}`, {
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
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/api/leave/requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveRequests: response.data.data?.leaveRequests || response.data.leaveRequests || [],
    };
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
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

    const response = await axios.get(`${API_ENDPOINT}/api/leave/requests/${leaveRequestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveRequest: response.data.data?.leaveRequest || response.data.leaveRequest,
    };
  } catch (error: any) {
    console.error('Error fetching leave request:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
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

    const response = await axios.post(`${API_ENDPOINT}/api/leave/requests`, leaveRequestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveRequest: response.data.data?.leaveRequest || response.data.leaveRequest,
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

    const response = await axios.put(`${API_ENDPOINT}/api/leave/requests/${leaveRequestId}`, leaveRequestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveRequest: response.data.data?.leaveRequest || response.data.leaveRequest,
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

    await axios.delete(`${API_ENDPOINT}/api/leave/requests/${leaveRequestId}`, {
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

    const response = await axios.put(`${API_ENDPOINT}/api/leave/requests/${leaveRequestId}/approve`, approvalData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveRequest: response.data.data?.leaveRequest || response.data.leaveRequest,
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

    const response = await axios.put(`${API_ENDPOINT}/api/leave/requests/${leaveRequestId}/reject`, rejectionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveRequest: response.data.data?.leaveRequest || response.data.leaveRequest,
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

    const response = await axios.get(`${API_ENDPOINT}/api/leave/balances/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveBalances: response.data.data?.leaveBalances || response.data.leaveBalances || [],
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

    const response = await axios.get(`${API_ENDPOINT}/api/leave/calendar`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      leaveEvents: response.data.data?.leaveEvents || response.data.leaveEvents || [],
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