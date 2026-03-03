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
