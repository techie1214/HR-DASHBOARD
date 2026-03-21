import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Interfaces for attendance settings
export interface BranchAttendanceSettings {
  id?: number;
  branch_id: number;
  branch_name?: string;
  attendance_mode: 'branch_based' | 'multiple_locations' | 'flexible';
  require_check_in: boolean;
  require_check_out: boolean;
  grace_period_minutes: number;
  auto_checkout_enabled: boolean;
  auto_checkout_minutes_after_close: number;
  enable_location_verification: boolean;
  allow_manual_attendance_entry: boolean;
  enable_weekend_attendance: boolean;
  notify_absent_employees: boolean;
  notify_supervisors_daily_summary?: boolean;
  enable_face_recognition?: boolean;
  enable_biometric_verification?: boolean;
  enable_holiday_attendance?: boolean;
  strict_location_mode?: boolean; // NEW: Strict vs Legacy mode
  location_coordinates?: string | null;
  location_radius_meters?: number;
  // Auto-mark absent settings
  auto_mark_absent_enabled: boolean;
  auto_mark_absent_time: string;
  auto_mark_absent_timezone: string;
  attendance_lock_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GlobalAttendanceSettings {
  id?: number;
  auto_checkout_enabled: boolean;
  auto_checkout_minutes_after_close: number;
  grace_period_minutes: number;
  notify_absent_employees: boolean;
  notify_supervisors_daily_summary: boolean;
  enable_weekend_attendance: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateBranchSettingsRequest {
  branchId: number;
  settings: {
    require_check_in?: boolean;
    require_check_out?: boolean;
    grace_period_minutes?: number;
    auto_checkout_enabled?: boolean;
    auto_checkout_minutes_after_close?: number;
    enable_location_verification?: boolean;
    allow_manual_attendance_entry?: boolean;
    enable_weekend_attendance?: boolean;
    notify_absent_employees?: boolean;
    notify_supervisors_daily_summary?: boolean;
    enable_face_recognition?: boolean;
    enable_biometric_verification?: boolean;
    enable_holiday_attendance?: boolean;
    strict_location_mode?: boolean; // NEW
    attendance_mode?: 'branch_based' | 'multiple_locations' | 'flexible';
    location_coordinates?: string | null;
    location_radius_meters?: number;
  };
}

export interface UpdateGlobalSettingsRequest {
  settings: {
    auto_checkout_enabled?: boolean;
    auto_checkout_minutes_after_close?: number;
    grace_period_minutes?: number;
    notify_absent_employees?: boolean;
    notify_supervisors_daily_summary?: boolean;
    enable_weekend_attendance?: boolean;
  };
}

// Get branch attendance settings
export const getBranchAttendanceSettings = async (
  branchId: number
): Promise<{ success: boolean; settings?: BranchAttendanceSettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: { branchId }
    });

    return {
      success: true,
      settings: response.data.data?.settings || response.data.settings,
    };
  } catch (error: any) {
    console.error('Error fetching branch attendance settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch branch attendance settings',
    };
  }
};

// Update branch attendance settings
export const updateBranchAttendanceSettings = async (
  request: UpdateBranchSettingsRequest
): Promise<{ success: boolean; settings?: BranchAttendanceSettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.patch(`${API_ENDPOINT}/attendance/settings`, request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      settings: response.data.data?.settings || response.data.settings,
      message: response.data.message || 'Attendance settings updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating branch attendance settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update branch attendance settings',
    };
  }
};

// Get global attendance settings
export const getGlobalAttendanceSettings = async (): Promise<{ success: boolean; settings?: GlobalAttendanceSettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/settings/global`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      settings: response.data.data?.settings || response.data.settings,
    };
  } catch (error: any) {
    console.error('Error fetching global attendance settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch global attendance settings',
    };
  }
};

// Update global attendance settings
export const updateGlobalAttendanceSettings = async (
  request: UpdateGlobalSettingsRequest
): Promise<{ success: boolean; settings?: GlobalAttendanceSettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.patch(`${API_ENDPOINT}/attendance/settings/global`, request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      settings: response.data.data?.settings || response.data.settings,
      message: response.data.message || 'Global attendance settings updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating global attendance settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update global attendance settings',
    };
  }
};

// ============================================
// NEW FUNCTIONS FOR AUTO-MARK SETTINGS
// ============================================

export interface UpdateAutoMarkSettingsRequest {
  branchId?: number;
  auto_mark_absent_enabled?: boolean;
  auto_mark_absent_time?: string; // Format: "HH:MM"
  auto_mark_absent_timezone?: string;
}

export interface LockDateRequest {
  date: string;
  branchId?: number;
  reason?: string;
}

export interface LockStatusResponse {
  branch_id: number;
  branch_name: string;
  attendance_lock_date: string | null;
  auto_mark_absent_enabled: boolean;
  auto_mark_absent_time: string;
  auto_mark_absent_timezone: string;
  recent_locks: Array<{
    id: number;
    branch_id: number;
    lock_date: string;
    locked_by: number;
    locked_by_name: string;
    locked_at: string;
    reason: string | null;
    attendance_count: number;
  }>;
}

// Update auto-mark absent settings
export const updateAutoMarkSettings = async (
  request: UpdateAutoMarkSettingsRequest
): Promise<{ success: boolean; settings?: BranchAttendanceSettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.patch(`${API_ENDPOINT}/attendance/settings/auto-mark`, request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      settings: response.data.data?.settings,
      message: response.data.message || 'Auto-mark settings updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating auto-mark settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update auto-mark settings',
    };
  }
};

// Lock attendance for a specific date
export const lockAttendanceDate = async (
  request: LockDateRequest
): Promise<{ success: boolean; data?: { branch_id: number; lock_date: string; locked_count: number }; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/attendance/settings/lock-date`, request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Attendance locked successfully',
    };
  } catch (error: any) {
    console.error('Error locking attendance date:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to lock attendance date',
    };
  }
};

// Get lock status for a branch
export const getLockStatus = async (
  branchId?: number
): Promise<{ success: boolean; data?: LockStatusResponse; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/settings/lock-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: branchId ? { branchId } : undefined,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('Error getting lock status:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get lock status',
    };
  }
};

// Unlock a specific attendance record
export const unlockAttendance = async (
  attendanceId: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.patch(
      `${API_ENDPOINT}/attendance/${attendanceId}/unlock`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      message: response.data.message || 'Attendance unlocked successfully',
    };
  } catch (error: any) {
    console.error('Error unlocking attendance:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to unlock attendance',
    };
  }
};
