// Dashboard service - Fetch real dashboard data from API
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  attendanceRate: number;
  pendingLeaves: number;
  departments: Array<{ department: string; count: number }>;
  recentLeaves: Array<{
    id: number;
    full_name: string;
    leave_type_name: string;
    start_date: string;
    end_date: string;
    status: string;
  }>;
}

export const getDashboardStats = async (): Promise<{ success: boolean; stats?: DashboardStats; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        stats: response.data.data
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to fetch dashboard stats'
    };
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch dashboard stats'
    };
  }
};
