import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

/**
 * Leave Cleanup Service
 * Handles manual triggering of leave cleanup operations
 */

export interface LeaveCleanupResult {
  success: boolean;
  message: string;
  data: {
    declinedCount: number;
    errorCount: number;
  };
}

export interface LeaveCleanupStatus {
  success: boolean;
  data: {
    expiredPendingLeaves: number;
    totalPendingLeaves: number;
    workerRunning: boolean;
    lastRunTime?: string | null;
    nextRunTime?: string | null;
  };
}

/**
 * Manually trigger leave cleanup
 * Declines all pending leave requests with dates that have passed
 */
export const triggerLeaveCleanup = async (): Promise<LeaveCleanupResult> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.',
        data: {
          declinedCount: 0,
          errorCount: 0
        }
      };
    }

    const response = await axios.post(
      `${API_ENDPOINT}/leave-cleanup/trigger`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error triggering leave cleanup:', error);
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Authentication failed. Please log in again.',
        data: {
          declinedCount: 0,
          errorCount: 0
        }
      };
    }
    
    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'You do not have permission to perform this action.',
        data: {
          declinedCount: 0,
          errorCount: 0
        }
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Failed to trigger leave cleanup',
      data: {
        declinedCount: 0,
        errorCount: 0
      }
    };
  }
};

/**
 * Get leave cleanup status
 * Returns information about pending leaves and worker status
 */
export const getLeaveCleanupStatus = async (): Promise<LeaveCleanupStatus> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        data: {
          expiredPendingLeaves: 0,
          totalPendingLeaves: 0,
          workerRunning: false
        }
      };
    }

    const response = await axios.get(
      `${API_ENDPOINT}/leave-cleanup/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching leave cleanup status:', error);
    
    return {
      success: false,
      data: {
        expiredPendingLeaves: 0,
        totalPendingLeaves: 0,
        workerRunning: false
      }
    };
  }
};
