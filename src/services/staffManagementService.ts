import axios from 'axios';
import { API_ENDPOINT } from '../config/config';
import { Role } from './roleManagementService';
import { Branch } from './branchManagementService';
import { Department } from './departmentManagementService';
import {
  StaffMember,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffInvitation,
  StaffInvitationRequest
} from './apiInterfaces';

// Define interfaces for staff invitation
export interface StaffInvitation {
  id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  status: 'pending' | 'accepted' | 'expired';
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffInvitationRequest {
  firstName: string;
  lastName: string;
  personalEmail: string;
  roleId: string;
  branchId: string;
  departmentId: string;
}

export interface StaffMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  position: string;
  startDate: string;
  salary: number;
}

export interface StaffMemberExtended {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  position: string;
  startDate: string;
  salary: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateStaffData = (staffData: CreateStaffRequest | StaffMemberRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!staffData.firstName || staffData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!staffData.lastName || staffData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  // Check for email depending on the type of object
  const email = 'work_email' in staffData ? staffData.work_email : staffData.email;
  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if ('phone' in staffData && staffData.phone && !validatePhone(staffData.phone)) {
    errors.push('Valid phone number is required');
  }

  if ('roleId' in staffData && !staffData.roleId) {
    errors.push('Role is required');
  }

  if ('branchId' in staffData && !staffData.branchId) {
    errors.push('Branch is required');
  }

  if ('departmentId' in staffData && !staffData.departmentId) {
    errors.push('Department is required');
  }

  if ('position' in staffData && !staffData.position) {
    errors.push('Position is required');
  }

  if ('startDate' in staffData && !staffData.startDate) {
    errors.push('Start date is required');
  }

  if ('base_salary' in staffData && staffData.base_salary <= 0) {
    errors.push('Salary must be greater than zero');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStaffInvitationData = (invitationData: StaffInvitationRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!invitationData.firstName || invitationData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!invitationData.lastName || invitationData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!invitationData.personalEmail || !validateEmail(invitationData.personalEmail)) {
    errors.push('Valid personal email is required');
  }

  if (!invitationData.roleId) {
    errors.push('Role is required');
  }

  if (!invitationData.branchId) {
    errors.push('Branch is required');
  }

  if (!invitationData.departmentId) {
    errors.push('Department is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Invite new staff member
export const inviteStaff = async (invitationData: StaffInvitationRequest): Promise<{ success: boolean; invitation?: StaffInvitation; message?: string }> => {
  try {
    // Validate input data
    const validation = validateStaffInvitationData(invitationData);
    if (!validation.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/staff-invitation`, invitationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      invitation: response.data.invitation || response.data,
    };
  } catch (error: any) {
    console.error('Error inviting staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to invite staff',
    };
  }
};

// Get all staff invitations
export const getAllStaffInvitations = async (): Promise<{ success: boolean; invitations?: StaffInvitation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff-invitation`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      invitations: response.data.data?.invitations || response.data.invitations || [],
    };
  } catch (error: any) {
    console.error('Error fetching staff invitations:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff invitations',
    };
  }
};

// Get available roles for staff invitation
export const getAvailableRolesForInvitation = async (): Promise<{ success: boolean; roles?: Role[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff-invitation/roles`, {
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
    console.error('Error fetching available roles for invitation:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch available roles',
    };
  }
};

// Get all staff members
export const getAllStaff = async (): Promise<{ success: boolean; staff?: StaffMember[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data) {
      staffData = response.data.data;
    }

    // Extract staff array from different possible field names
    let staffArray: StaffMember[] = [];
    if (Array.isArray(staffData)) {
      staffArray = staffData;
    } else if (staffData.staff && Array.isArray(staffData.staff)) {
      staffArray = staffData.staff;
    } else if (staffData.data && Array.isArray(staffData.data)) {
      staffArray = staffData.data;
    } else if (staffData.results && Array.isArray(staffData.results)) {
      staffArray = staffData.results;
    }

    return {
      success: true,
      staff: staffArray,
    };
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff',
    };
  }
};

// Get staff by ID
export const getStaffById = async (staffId: string): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff/${staffId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data && response.data.data.staff) {
      staffData = response.data.data.staff;
    } else if (response.data.data) {
      staffData = response.data.data;
    } else if (response.data.staff) {
      staffData = response.data.staff;
    }

    return {
      success: true,
      staff: staffData,
    };
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff',
    };
  }
};

// Create new staff member directly
export const createStaff = async (staffData: CreateStaffRequest): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    // Validate input data
    const validation = validateStaffData(staffData as any); // Casting to any to satisfy TypeScript
    if (!validation.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/staff`, staffData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data && response.data.data.staff) {
      responseData = response.data.data.staff;
    } else if (response.data.data) {
      responseData = response.data.data;
    } else if (response.data.staff) {
      responseData = response.data.staff;
    }

    return {
      success: true,
      staff: responseData,
    };
  } catch (error: any) {
    console.error('Error creating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    // Return error but don't crash the app
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create staff',
    };
  }
};


// Get staff by department
export const getStaffByDepartment = async (department: string): Promise<{ success: boolean; staff?: StaffMember[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff/department/${department}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data) {
      staffData = response.data.data;
    }

    // Extract staff array from different possible field names
    let staffArray: StaffMember[] = [];
    if (Array.isArray(staffData)) {
      staffArray = staffData;
    } else if (staffData.staff && Array.isArray(staffData.staff)) {
      staffArray = staffData.staff;
    } else if (staffData.data && Array.isArray(staffData.data)) {
      staffArray = staffData.data;
    } else if (staffData.results && Array.isArray(staffData.results)) {
      staffArray = staffData.results;
    }

    return {
      success: true,
      staff: staffArray,
    };
  } catch (error: any) {
    console.error('Error fetching staff by department:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff by department',
    };
  }
};

// Update existing staff member
export const updateStaff = async (staffId: string, staffData: Partial<UpdateStaffRequest>): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/staff/${staffId}`, staffData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data && response.data.data.staff) {
      responseData = response.data.data.staff;
    } else if (response.data.data) {
      responseData = response.data.data;
    } else if (response.data.staff) {
      responseData = response.data.staff;
    }

    return {
      success: true,
      staff: responseData,
    };
  } catch (error: any) {
    console.error('Error updating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    // Return error but don't crash the app
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update staff',
    };
  }
};

// Get own staff details
export const getOwnStaffDetails = async (): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data && response.data.data.staff) {
      staffData = response.data.data.staff;
    } else if (response.data.data) {
      staffData = response.data.data;
    } else if (response.data.staff) {
      staffData = response.data.staff;
    }

    return {
      success: true,
      staff: staffData,
    };
  } catch (error: any) {
    console.error('Error fetching own staff details:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch own staff details',
    };
  }
};

// Resend staff invitation
export const resendStaffInvitation = async (invitationId: string): Promise<{ success: boolean; invitation?: StaffInvitation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/staff-invitation/${invitationId}/resend`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      invitation: response.data.invitation || response.data,
    };
  } catch (error: any) {
    console.error('Error resending staff invitation:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to resend staff invitation',
    };
  }
};

// Revoke staff invitation
export const revokeStaffInvitation = async (invitationId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/staff-invitation/${invitationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Staff invitation revoked successfully',
    };
  } catch (error: any) {
    console.error('Error revoking staff invitation:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to revoke staff invitation',
    };
  }
};

// Activate staff member
export const activateStaff = async (staffId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.patch(`${API_ENDPOINT}/staff/${staffId}/activate`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Staff member activated successfully',
    };
  } catch (error: any) {
    console.error('Error activating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to activate staff',
    };
  }
};

// Deactivate staff member
export const deactivateStaff = async (staffId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.patch(`${API_ENDPOINT}/staff/${staffId}/deactivate`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Staff member deactivated successfully',
    };
  } catch (error: any) {
    console.error('Error deactivating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to deactivate staff',
    };
  }
};

// Delete staff member
export const deleteStaff = async (staffId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/staff/${staffId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Staff member deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete staff',
    };
  }
};

