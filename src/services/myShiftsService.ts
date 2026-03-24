// src/services/myShiftsService.ts

import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface ShiftAssignment {
  id: number;
  templateName: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  assignmentType: 'permanent' | 'temporary' | 'rotating';
  status: 'active' | 'inactive' | 'expired';
  recurrencePattern: string | null;
  recurrenceDays: string[];
  shiftType: string;
  department?: string;
  branchId?: number;
}

export interface ShiftException {
  id: number;
  exception_date: string;
  exception_type: string;
  new_start_time: string;
  new_end_time: string;
  reason: string;
  exception_status: string;
}

export interface UpcomingShift {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  templateName: string;
  isException: boolean;
  exceptionType?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class MyShiftsService {
  /**
   * Get my shift assignments
   */
  async getMyShifts(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(
        `${API_ENDPOINT}/my-shifts?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        message: "Shift assignments retrieved successfully",
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching my shifts:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch shift assignments',
        data: null
      };
    }
  }

  /**
   * Get my upcoming shifts
   */
  async getMyUpcomingShifts(days: number = 30) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(
        `${API_ENDPOINT}/my-shifts/upcoming?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        message: "Upcoming shifts retrieved successfully",
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching upcoming shifts:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch upcoming shifts',
        data: null
      };
    }
  }

  /**
   * Get team shifts (for managers)
   */
  async getTeamShifts(params?: {
    department?: string;
    branchId?: number;
  }) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const queryParams = new URLSearchParams();
      if (params?.department) queryParams.append('department', params.department);
      if (params?.branchId) queryParams.append('branchId', params.branchId.toString());

      const response = await axios.get(
        `${API_ENDPOINT}/team-shifts?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        message: "Team shifts retrieved successfully",
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching team shifts:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch team shifts',
        data: null
      };
    }
  }
}

// Create a singleton instance
export const myShiftsService = new MyShiftsService();

export default MyShiftsService;
