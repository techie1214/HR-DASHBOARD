import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define interfaces for attendance data
export interface AttendanceLocation {
  id: string;
  name: string;
  location_coordinates: string; // e.g., "POINT(3.3869 6.4458)"
  location_radius_meters: number;
  branch_id: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define the structure for staff attendance records used in the UI
export interface StaffAttendanceRecord {
  id: string;
  fullName: string;
  department: string;
  branch?: string;
  present: number;
  early: number;
  late: number;
  permitted: number;
  absent: number;
  offDays: number;
  leaveDays: number;
  averageTime: string;
}

// Define the structure for monthly statistics
export interface MonthlyStat {
  month: string;
  present: number;
  absent: number;
  late: number;
  leaves: number;
}

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'late' | 'absent' | 'half_day' | 'on_leave';
  location_coordinates?: {
    longitude: number;
    latitude: number;
  };
  location_address?: string;
  location_verified?: boolean;
  hours_worked?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  total_present: number;
  total_late: number;
  total_absent: number;
  total_half_day: number;
  total_on_leave: number;
  attendance_rate: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface DailyAttendanceRecord {
  id: string;
  name: string;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';
  date: string;
}

// Get all attendance records
export const getAllAttendanceRecords = async (): Promise<{ success: boolean; records?: AttendanceRecord[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data) {
      responseData = response.data.data;
    }

    // Extract records array from different possible field names
    let recordsArray: AttendanceRecord[] = [];
    if (Array.isArray(responseData)) {
      recordsArray = responseData;
    } else if (responseData.attendance && Array.isArray(responseData.attendance)) {
      recordsArray = responseData.attendance;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      recordsArray = responseData.data;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      recordsArray = responseData.results;
    }

    return {
      success: true,
      records: recordsArray,
    };
  } catch (error: any) {
    console.error('Error fetching attendance records:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch attendance records',
    };
  }
};

// Get attendance record by ID
export const getAttendanceRecordById = async (recordId: string): Promise<{ success: boolean; record?: AttendanceRecord; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      record: response.data.data?.attendance || response.data.attendance,
    };
  } catch (error: any) {
    console.error('Error fetching attendance record:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch attendance record',
    };
  }
};

// Mark attendance check-in
export const markAttendanceCheckIn = async (checkInData: {
  date: string;
  check_in_time: string;
  location_coordinates: {
    longitude: number;
    latitude: number;
  };
  location_address: string;
  status: string;
}): Promise<{ success: boolean; record?: AttendanceRecord; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/attendance/check-in`, checkInData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      record: response.data.data?.attendance || response.data.attendance,
    };
  } catch (error: any) {
    console.error('Error marking attendance check-in:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to mark attendance check-in',
    };
  }
};

// Mark attendance check-out
export const markAttendanceCheckOut = async (checkOutData: {
  date: string;
  check_out_time: string;
  location_coordinates: {
    longitude: number;
    latitude: number;
  };
  location_address: string;
}): Promise<{ success: boolean; record?: AttendanceRecord; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/attendance/check-out`, checkOutData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      record: response.data.data?.attendance || response.data.attendance,
    };
  } catch (error: any) {
    console.error('Error marking attendance check-out:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to mark attendance check-out',
    };
  }
};

// Create manual attendance record
export const createManualAttendance = async (manualData: {
  date: string;
  check_in_time: string;
  check_out_time: string;
  status: string;
  location_coordinates: {
    longitude: number;
    latitude: number;
  };
  location_address: string;
}): Promise<{ success: boolean; record?: AttendanceRecord; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/attendance/manual`, manualData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      record: response.data.data?.attendance || response.data.attendance,
    };
  } catch (error: any) {
    console.error('Error creating manual attendance:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create manual attendance',
    };
  }
};

// Update attendance record
export const updateAttendanceRecord = async (
  recordId: string,
  updateData: {
    status?: string;
    check_in_time?: string;
    check_out_time?: string;
    location_verified?: boolean;
  }
): Promise<{ success: boolean; record?: AttendanceRecord; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/attendance/${recordId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      record: response.data.data?.attendance || response.data.attendance,
    };
  } catch (error: any) {
    console.error('Error updating attendance record:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update attendance record',
    };
  }
};

// Get attendance summary
export const getAttendanceSummary = async (
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; summary?: AttendanceSummary; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    let url = `${API_ENDPOINT}/attendance/summary`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data) {
      responseData = response.data.data;
    }

    return {
      success: true,
      summary: responseData.summary || responseData,
    };
  } catch (error: any) {
    console.error('Error fetching attendance summary:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch attendance summary',
    };
  }
};

// Get all attendance locations
export const getAllAttendanceLocations = async (): Promise<{ success: boolean; locations?: AttendanceLocation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/attendance-locations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      locations: response.data.data?.locations || response.data.locations || [],
    };
  } catch (error: any) {
    console.error('Error fetching attendance locations:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch attendance locations',
    };
  }
};

// Get attendance location by ID
export const getAttendanceLocationById = async (locationId: string): Promise<{ success: boolean; location?: AttendanceLocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/attendance-locations/${locationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      location: response.data.data?.location || response.data.location,
    };
  } catch (error: any) {
    console.error('Error fetching attendance location:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch attendance location',
    };
  }
};

// Create attendance location
export const createAttendanceLocation = async (locationData: {
  name: string;
  location_coordinates: string;
  location_radius_meters: number;
  branch_id: number;
  is_active: boolean;
}): Promise<{ success: boolean; location?: AttendanceLocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/attendance/attendance-locations`, locationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      location: response.data.data?.location || response.data.location,
    };
  } catch (error: any) {
    console.error('Error creating attendance location:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create attendance location',
    };
  }
};

// Update attendance location
export const updateAttendanceLocation = async (
  locationId: string,
  updateData: {
    name?: string;
    location_radius_meters?: number;
  }
): Promise<{ success: boolean; location?: AttendanceLocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/attendance/attendance-locations/${locationId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      location: response.data.data?.location || response.data.location,
    };
  } catch (error: any) {
    console.error('Error updating attendance location:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update attendance location',
    };
  }
};

// Delete attendance location
export const deleteAttendanceLocation = async (locationId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/attendance/attendance-locations/${locationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Attendance location deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting attendance location:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete attendance location',
    };
  }
};

// Update global attendance mode
export const updateGlobalAttendanceMode = async (mode: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.post(`${API_ENDPOINT}/branches/global-attendance-mode`, { attendance_mode: mode }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Global attendance mode updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating global attendance mode:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update global attendance mode',
    };
  }
};

// Get global attendance mode status
export const getGlobalAttendanceModeStatus = async (): Promise<{ success: boolean; mode?: string; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/branches/global-attendance-mode`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      mode: response.data.mode || response.data.data?.mode,
    };
  } catch (error: any) {
    console.error('Error fetching global attendance mode status:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch global attendance mode status',
    };
  }
};

// Get staff attendance data
export const getStaffAttendanceData = async (): Promise<{ success: boolean; data?: StaffAttendanceRecord[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/staff-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data.data?.staffAttendanceData || response.data.staffAttendanceData || [],
    };
  } catch (error: any) {
    console.error('Error fetching staff attendance data:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff attendance data',
    };
  }
};

// Get monthly attendance statistics
export const getMonthlyStats = async (): Promise<{ success: boolean; stats?: MonthlyStat[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance/monthly-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      stats: response.data.data?.monthlyStats || response.data.monthlyStats || [],
    };
  } catch (error: any) {
    console.error('Error fetching monthly attendance statistics:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch monthly attendance statistics',
    };
  }
};