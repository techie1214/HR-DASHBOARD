import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

interface AdminCredentials {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Service to check system readiness
export const checkSystemReadiness = async (): Promise<{ ready?: boolean; initialized?: boolean; }> => {
  try {
    console.log('Making API call to:', `${API_ENDPOINT}/system-complete/readiness`);
    const response = await axios.get(`${API_ENDPOINT}/system-complete/readiness`);
    console.log('API Response:', response.data);

    // Extract the systemInitialized value from the actual response format
    const systemInitialized = response.data.data?.systemInitialized || false;
    return { ready: systemInitialized, initialized: systemInitialized };
  } catch (error) {
    console.error('Error checking system readiness:', error);
    // If there's a network error, check localStorage as a fallback
    const systemInitialized = localStorage.getItem("systemInitialized") === "true";
    console.log('Using fallback, systemInitialized:', systemInitialized);
    return { ready: systemInitialized, initialized: systemInitialized };
  }
};

// Service to initialize the system
export const initializeSystem = async (credentials: AdminCredentials): Promise<ApiResponse> => {
  try {
    console.log('Making API call to:', `${API_ENDPOINT}/system-complete/setup-complete`, 'with data:', credentials);
    const response = await axios.post(`${API_ENDPOINT}/system-complete/setup-complete`, credentials);
    console.log('API Response:', response.data);

    // Update localStorage on success
    if (response.data.success) {
      localStorage.setItem("systemInitialized", "true");
      localStorage.setItem("adminEmail", credentials.email);
    }

    return response.data;
  } catch (error: any) {
    console.error('Error initializing system:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred during system initialization',
    };
  }
};

// Generic API service function for other endpoints
export const apiCall = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('API call error:', error);
    return { success: false, error: error.message || 'An error occurred' };
  }
};

// Real API Services for the HR modules
export const apiServices = {
  // Holiday methods
  async getHolidays(params?: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Holidays retrieved successfully",
        data: { holidays: response.data.data?.holidays || response.data.holidays || [] }
      };
    } catch (error: any) {
      console.error('Error fetching holidays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch holidays',
        data: { holidays: [] }
      };
    }
  },

  async getHolidayById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/holidays/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday retrieved successfully",
        data: { holiday: response.data.data?.holiday || response.data.holiday }
      };
    } catch (error: any) {
      console.error('Error fetching holiday:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch holiday',
        data: { holiday: null }
      };
    }
  },

  async createHoliday(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/holidays`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday created successfully",
        data: { holiday: response.data.data?.holiday || response.data.holiday }
      };
    } catch (error: any) {
      console.error('Error creating holiday:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create holiday',
        data: { holiday: null }
      };
    }
  },

  async updateHoliday(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/holidays/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday updated successfully",
        data: { holiday: response.data.data?.holiday || response.data.holiday }
      };
    } catch (error: any) {
      console.error('Error updating holiday:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update holiday',
        data: { holiday: null }
      };
    }
  },

  async deleteHoliday(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_ENDPOINT}/holidays/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        success: true,
        message: "Holiday deleted successfully"
      };
    } catch (error: any) {
      console.error('Error deleting holiday:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete holiday'
      };
    }
  },

  // Holiday Duty Roster methods
  async getHolidayDutyRosters(params?: {
    holidayId?: number;
    userId?: number;
  }) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/holiday-duty-roster`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Holiday duty rosters retrieved successfully",
        data: { rosters: response.data.data?.rosters || response.data.rosters || [] }
      };
    } catch (error: any) {
      console.error('Error fetching holiday duty rosters:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch holiday duty rosters',
        data: { rosters: [] }
      };
    }
  },

  async getHolidayDutyRosterById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/holiday-duty-roster/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday duty roster retrieved successfully",
        data: { roster: response.data.data?.roster || response.data.roster }
      };
    } catch (error: any) {
      console.error('Error fetching holiday duty roster:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch holiday duty roster',
        data: { roster: null }
      };
    }
  },

  async getHolidayDutyRosterByHolidayId(holidayId: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/holiday-duty-roster/${holidayId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday duty roster retrieved successfully",
        data: { rosters: response.data.data?.rosters || response.data.rosters || [] }
      };
    } catch (error: any) {
      console.error('Error fetching holiday duty roster by holiday ID:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch holiday duty roster',
        data: { rosters: [] }
      };
    }
  },

  async getHolidayDutyRosterByUserId(userId: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/holiday-duty-roster/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "User holiday duty rosters retrieved successfully",
        data: { rosters: response.data.data?.rosters || response.data.rosters || [] }
      };
    } catch (error: any) {
      console.error('Error fetching user holiday duty rosters:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch user holiday duty rosters',
        data: { rosters: [] }
      };
    }
  },

  async createHolidayDutyRoster(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/holiday-duty-roster`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday duty roster created successfully",
        data: { roster: response.data.data?.roster || response.data.roster }
      };
    } catch (error: any) {
      console.error('Error creating holiday duty roster:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create holiday duty roster',
        data: { roster: null }
      };
    }
  },

  async createBulkHolidayDutyRoster(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/holiday-duty-roster/bulk`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday duty rosters created successfully",
        data: { rosters: response.data.data?.rosters || response.data.rosters || [] }
      };
    } catch (error: any) {
      console.error('Error creating bulk holiday duty rosters:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create bulk holiday duty rosters',
        data: { rosters: [] }
      };
    }
  },

  async updateHolidayDutyRoster(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/holiday-duty-roster/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Holiday duty roster updated successfully",
        data: { roster: response.data.data?.roster || response.data.roster }
      };
    } catch (error: any) {
      console.error('Error updating holiday duty roster:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update holiday duty roster',
        data: { roster: null }
      };
    }
  },

  async deleteHolidayDutyRoster(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_ENDPOINT}/holiday-duty-roster/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        success: true,
        message: "Holiday duty roster deleted successfully"
      };
    } catch (error: any) {
      console.error('Error deleting holiday duty roster:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete holiday duty roster'
      };
    }
  },

  // Shift Template methods
  async getShiftTemplates() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/shift-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift templates retrieved successfully",
        data: { shiftTemplates: response.data.data?.shiftTemplates || response.data.shiftTemplates || [] }
      };
    } catch (error: any) {
      console.error('Error fetching shift templates:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift templates',
        data: { shiftTemplates: [] }
      };
    }
  },

  async getShiftTemplateById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/shift-templates/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift template retrieved successfully",
        data: { shiftTemplate: response.data.data?.shiftTemplate || response.data.shiftTemplate }
      };
    } catch (error: any) {
      console.error('Error fetching shift template:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift template',
        data: { shiftTemplate: null }
      };
    }
  },

  async createShiftTemplate(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/shift-templates`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift template created successfully",
        data: { shiftTemplate: response.data.data?.shiftTemplate || response.data.shiftTemplate }
      };
    } catch (error: any) {
      console.error('Error creating shift template:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create shift template',
        data: { shiftTemplate: null }
      };
    }
  },

  async updateShiftTemplate(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/shift-scheduling/shift-templates/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift template updated successfully",
        data: { shiftTemplate: response.data.data?.shiftTemplate || response.data.shiftTemplate }
      };
    } catch (error: any) {
      console.error('Error updating shift template:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update shift template',
        data: { shiftTemplate: null }
      };
    }
  },

  async deleteShiftTemplate(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_ENDPOINT}/shift-scheduling/shift-templates/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        success: true,
        message: "Shift template deleted successfully"
      };
    } catch (error: any) {
      console.error('Error deleting shift template:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete shift template'
      };
    }
  },

  // Employee Shift Assignment methods
  async getEmployeeShiftAssignments() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/employee-shift-assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Employee shift assignments retrieved successfully",
        data: { employeeShiftAssignments: response.data.data?.employeeShiftAssignments || response.data.employeeShiftAssignments || [] }
      };
    } catch (error: any) {
      console.error('Error fetching employee shift assignments:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch employee shift assignments',
        data: { employeeShiftAssignments: [] }
      };
    }
  },

  async getEmployeeShiftAssignmentById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/employee-shift-assignments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Employee shift assignment retrieved successfully",
        data: { employeeShiftAssignment: response.data.data?.employeeShiftAssignment || response.data.employeeShiftAssignment }
      };
    } catch (error: any) {
      console.error('Error fetching employee shift assignment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch employee shift assignment',
        data: { employeeShiftAssignment: null }
      };
    }
  },

  async assignShiftToEmployee(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/employee-shift-assignments`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift assigned to employee successfully",
        data: { employeeShiftAssignment: response.data.data?.employeeShiftAssignment || response.data.employeeShiftAssignment }
      };
    } catch (error: any) {
      console.error('Error assigning shift to employee:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to assign shift to employee',
        data: { employeeShiftAssignment: null }
      };
    }
  },

  async updateEmployeeShiftAssignment(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/shift-scheduling/employee-shift-assignments/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Employee shift assignment updated successfully",
        data: { employeeShiftAssignment: response.data.data?.employeeShiftAssignment || response.data.employeeShiftAssignment }
      };
    } catch (error: any) {
      console.error('Error updating employee shift assignment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update employee shift assignment',
        data: { employeeShiftAssignment: null }
      };
    }
  },

  async bulkAssignShifts(assignments: any[]) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/employee-shift-assignments/bulk`, { assignments }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shifts bulk assigned successfully",
        data: { assignments: response.data.data?.assignments || response.data.assignments }
      };
    } catch (error: any) {
      console.error('Error bulk assigning shifts:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to bulk assign shifts',
        data: { assignments: [] }
      };
    }
  },

  // Schedule Request methods
  async getScheduleRequests(params?: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/schedule-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Schedule requests retrieved successfully",
        data: { scheduleRequests: response.data.data?.scheduleRequests || response.data.scheduleRequests || [] }
      };
    } catch (error: any) {
      console.error('Error fetching schedule requests:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch schedule requests',
        data: { scheduleRequests: [] }
      };
    }
  },

  async getScheduleRequestById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/schedule-requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Schedule request retrieved successfully",
        data: { scheduleRequest: response.data.data?.scheduleRequest || response.data.scheduleRequest }
      };
    } catch (error: any) {
      console.error('Error fetching schedule request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch schedule request',
        data: { scheduleRequest: null }
      };
    }
  },

  async createScheduleRequest(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/schedule-requests`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Schedule request created successfully",
        data: { scheduleRequest: response.data.data?.scheduleRequest || response.data.scheduleRequest }
      };
    } catch (error: any) {
      console.error('Error creating schedule request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create schedule request',
        data: { scheduleRequest: null }
      };
    }
  },

  async updateScheduleRequest(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/shift-scheduling/schedule-requests/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Schedule request updated successfully",
        data: { scheduleRequest: response.data.data?.scheduleRequest || response.data.scheduleRequest }
      };
    } catch (error: any) {
      console.error('Error updating schedule request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update schedule request',
        data: { scheduleRequest: null }
      };
    }
  },

  async cancelScheduleRequest(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_ENDPOINT}/shift-scheduling/schedule-requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        success: true,
        message: "Schedule request cancelled successfully"
      };
    } catch (error: any) {
      console.error('Error cancelling schedule request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to cancel schedule request'
      };
    }
  },

  async approveScheduleRequest(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.patch(`${API_ENDPOINT}/shift-scheduling/schedule-requests/${id}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Schedule request approved successfully",
        data: { scheduleRequest: response.data.data?.scheduleRequest || response.data.scheduleRequest }
      };
    } catch (error: any) {
      console.error('Error approving schedule request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to approve schedule request',
        data: { scheduleRequest: null }
      };
    }
  },

  async rejectScheduleRequest(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.patch(`${API_ENDPOINT}/shift-scheduling/schedule-requests/${id}/reject`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Schedule request rejected successfully",
        data: { scheduleRequest: response.data.data?.scheduleRequest || response.data.scheduleRequest }
      };
    } catch (error: any) {
      console.error('Error rejecting schedule request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to reject schedule request',
        data: { scheduleRequest: null }
      };
    }
  },

  // Time Off Bank methods
  async getTimeOffBanks(params?: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/time-off-banks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Time off banks retrieved successfully",
        data: { timeOffBanks: response.data.data?.timeOffBanks || response.data.timeOffBanks || [] }
      };
    } catch (error: any) {
      console.error('Error fetching time off banks:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch time off banks',
        data: { timeOffBanks: [] }
      };
    }
  },

  async getMyTimeOffBankBalance() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/time-off-banks/my-balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Time off balance retrieved successfully",
        data: { balance: response.data.data?.balance || response.data.balance }
      };
    } catch (error: any) {
      console.error('Error fetching time off balance:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch time off balance',
        data: { balance: {} }
      };
    }
  },

  async createTimeOffBank(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/time-off-banks`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Time off bank created successfully",
        data: { timeOffBank: response.data.data?.timeOffBank || response.data.timeOffBank }
      };
    } catch (error: any) {
      console.error('Error creating time off bank:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create time off bank',
        data: { timeOffBank: null }
      };
    }
  },

  // Shift Schedule methods
  async getShiftSchedules(params?: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/shift-schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Shift schedules retrieved successfully",
        data: { shiftSchedules: response.data.data?.shiftSchedules || response.data.shiftSchedules || [] }
      };
    } catch (error: any) {
      console.error('Error fetching shift schedules:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift schedules',
        data: { shiftSchedules: [] }
      };
    }
  },

  async createShiftSchedule(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/shift-schedules`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift schedule created successfully",
        data: { shiftSchedule: response.data.data?.shiftSchedule || response.data.shiftSchedule }
      };
    } catch (error: any) {
      console.error('Error creating shift schedule:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create shift schedule',
        data: { shiftSchedule: null }
      };
    }
  },

  async updateShiftSchedule(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/shift-scheduling/shift-schedules/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift schedule updated successfully",
        data: { shiftSchedule: response.data.data?.shiftSchedule || response.data.shiftSchedule }
      };
    } catch (error: any) {
      console.error('Error updating shift schedule:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update shift schedule',
        data: { shiftSchedule: null }
      };
    }
  },

  async deleteShiftSchedule(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_ENDPOINT}/shift-scheduling/shift-schedules/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        success: true,
        message: "Shift schedule deleted successfully"
      };
    } catch (error: any) {
      console.error('Error deleting shift schedule:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete shift schedule'
      };
    }
  },

  // Shift Exception methods
  async getAllShiftExceptions(params?: { startDate?: string; endDate?: string; }) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/exceptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Shift exceptions retrieved successfully",
        data: { exceptions: response.data.data?.exceptions || [] }
      };
    } catch (error: any) {
      console.error('Error fetching all shift exceptions:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift exceptions',
        data: { exceptions: [] }
      };
    }
  },

  async getShiftExceptions(userId: number, params?: { startDate?: string; endDate?: string; }) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/exceptions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params
      });

      return {
        success: true,
        message: "Shift exceptions retrieved successfully",
        data: { exceptions: response.data.data?.exceptions || [] }
      };
    } catch (error: any) {
      console.error('Error fetching shift exceptions:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift exceptions',
        data: { exceptions: [] }
      };
    }
  },


  async getShiftExceptionById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_ENDPOINT}/shift-scheduling/exceptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift exception retrieved successfully",
        data: { exception: response.data.data?.exception }
      };
    } catch (error: any) {
      console.error('Error fetching shift exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift exception',
        data: { exception: null }
      };
    }
  },

  async createShiftException(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/exceptions`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift exception created successfully",
        data: { exception: response.data.data?.exception }
      };
    } catch (error: any) {
      console.error('Error creating shift exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create shift exception',
        data: { exception: null }
      };
    }
  },

  async updateShiftException(id: number, data: any) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_ENDPOINT}/shift-scheduling/exceptions/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift exception updated successfully",
        data: { exception: response.data.data?.exception }
      };
    } catch (error: any) {
      console.error('Error updating shift exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update shift exception',
        data: { exception: null }
      };
    }
  },

  async deleteShiftException(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_ENDPOINT}/shift-scheduling/exceptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return {
        success: true,
        message: "Shift exception deleted successfully"
      };
    } catch (error: any) {
      console.error('Error deleting shift exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete shift exception'
      };
    }
  },

  async approveShiftException(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/exceptions/${id}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift exception approved successfully",
        data: { exception: response.data.data?.exception }
      };
    } catch (error: any) {
      console.error('Error approving shift exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to approve shift exception',
        data: { exception: null }
      };
    }
  },

  async rejectShiftException(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_ENDPOINT}/shift-scheduling/exceptions/${id}/reject`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        success: true,
        message: "Shift exception rejected",
        data: { exception: response.data.data?.exception }
      };
    } catch (error: any) {
      console.error('Error rejecting shift exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to reject shift exception',
        data: { exception: null }
      };
    }
  },

  // Generic request method for services
  async request(endpoint: string, options?: { method?: string; body?: string }) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${API_ENDPOINT}${endpoint}`;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: options?.method || 'GET',
        ...(options?.body && { data: JSON.parse(options.body) })
      };

      const response = await axios(url, config);

      return {
        success: true,
        message: "Request processed successfully",
        data: response.data.data || response.data
      };
    } catch (error: any) {
      console.error('API request error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Request failed',
        data: {}
      };
    }
  }
};