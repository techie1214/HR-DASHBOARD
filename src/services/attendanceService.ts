import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// Define interfaces for attendance data (snake_case to match backend)
export interface AttendanceLocation {
  id: number;
  name: string;
  location_coordinates: string; // e.g., "POINT(3.3869 6.4458)"
  location_radius_meters: number;
  branch_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  id: number;
  user_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'late' | 'absent' | 'half_day' | 'leave' | 'holiday';
  location_coordinates?: string; // POINT format from backend
  location_address?: string;
  location_verified?: boolean;
  actual_working_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// For pagination support
export interface AttendanceRecordsResponse {
  records: AttendanceRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
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

// Get all attendance records (with pagination support)
export const getAllAttendanceRecords = async (
  page: number = 1,
  limit: number = 20,
  userId?: number,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; records?: AttendanceRecord[]; pagination?: AttendanceRecordsResponse['pagination']; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    // Build query params
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (userId) params.append('userId', userId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(`${API_ENDPOINT}/attendance/records?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseData = response.data;
    
    if (!responseData.success) {
      return {
        success: false,
        message: responseData.message || 'Failed to fetch attendance records',
      };
    }

    const data = responseData.data;
    const recordsArray: AttendanceRecord[] = data.attendance || data.attendanceRecords || data.records || data.data || [];
    const pagination = data.pagination;

    return {
      success: true,
      records: recordsArray,
      pagination: pagination,
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
  recordId: number,
  updateData: {
    status?: string;
    check_in_time?: string;
    check_out_time?: string;
    location_verified?: boolean;
    notes?: string;
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
      message: response.data.message || 'Attendance record updated successfully',
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

// Delete attendance record
// ⚠️ BACKEND REQUIRED: This endpoint needs to be implemented on the backend
// Expected endpoint: DELETE /api/attendance/:id
export const deleteAttendanceRecord = async (
  recordId: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/attendance/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Attendance record deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting attendance record:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Attendance record not found',
      };
    }
    if (error.response?.status === 405) {
      return {
        success: false,
        message: 'Delete endpoint not implemented on backend. Please contact backend team to implement DELETE /api/attendance/:id',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete attendance record',
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
export const getAllAttendanceLocations = async (branchId?: number, isActive?: boolean): Promise<{ success: boolean; locations?: AttendanceLocation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId.toString());
    if (isActive !== undefined) params.append('isActive', isActive.toString());

    const response = await axios.get(`${API_ENDPOINT}/attendance-locations${params.toString() ? '?' + params.toString() : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      locations: response.data.data?.attendanceLocations || response.data.data?.locations || response.data.locations || [],
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
export const getAttendanceLocationById = async (locationId: number): Promise<{ success: boolean; location?: AttendanceLocation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/attendance-locations/${locationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      location: response.data.data?.attendanceLocation || response.data.data?.location || response.data.location,
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

    const response = await axios.post(`${API_ENDPOINT}/attendance-locations`, locationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      location: response.data.data?.attendanceLocation || response.data.data?.location || response.data.location,
      message: response.data.message || 'Attendance location created successfully',
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
  locationId: number,
  updateData: {
    name?: string;
    location_coordinates?: string;
    location_radius_meters?: number;
    branch_id?: number;
    is_active?: boolean;
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

    const response = await axios.put(`${API_ENDPOINT}/attendance-locations/${locationId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      location: response.data.data?.attendanceLocation || response.data.data?.location || response.data.location,
      message: response.data.message || 'Attendance location updated successfully',
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
export const deleteAttendanceLocation = async (locationId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/attendance-locations/${locationId}`, {
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

// Get attendance data for calendar view (aggregated by date)
export interface CalendarDayAttendance {
  date: string;
  totalStaff: number;
  scheduledStaff: number;  // Staff scheduled to work that day
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
}

export const getAttendanceForMonth = async (
  year: number,
  month: number
): Promise<{ success: boolean; data?: CalendarDayAttendance[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    console.log('[AttendanceService] Fetching attendance for:', { year, month, startDate, endDate });

    // Fetch attendance records and staff count in parallel
    const [attendanceResponse, staffResponse] = await Promise.all([
      axios.get(`${API_ENDPOINT}/attendance/records`, {
        params: {
          startDate,
          endDate,
          limit: 5000,
          page: 1
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      axios.get(`${API_ENDPOINT}/staff`, {
        params: {
          page: 1,
          limit: 1000
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    console.log('[AttendanceService] API Response:', {
      attendanceCount: attendanceResponse.data.data?.attendance?.length || 0,
      staffCount: staffResponse.data.data?.staff?.length || 0
    });

    const attendanceRecords: AttendanceRecord[] = attendanceResponse.data.data?.attendance || [];
    const allStaff = staffResponse.data.data?.staff || staffResponse.data.staff || [];
    
    // Count active staff
    const totalActiveStaff = allStaff.filter((s: any) => 
      s.status === 'active' && !s.termination_date
    ).length;

    console.log('[AttendanceService] Total active staff:', totalActiveStaff);
    console.log('[AttendanceService] Attendance records:', attendanceRecords.length);

    // Aggregate attendance by date
    const aggregatedByDate = new Map<string, CalendarDayAttendance>();
    const staffWithRecordsByDate = new Map<string, Set<number>>();

    attendanceRecords.forEach(record => {
      // Track which staff have records for each date
      if (!staffWithRecordsByDate.has(record.date)) {
        staffWithRecordsByDate.set(record.date, new Set());
      }
      staffWithRecordsByDate.get(record.date)!.add(record.user_id);

      if (!aggregatedByDate.has(record.date)) {
        aggregatedByDate.set(record.date, {
          date: record.date,
          totalStaff: totalActiveStaff,
          scheduledStaff: 0,
          present: 0,
          late: 0,
          absent: 0,
          onLeave: 0,
          attendanceRate: 0
        });
      }

      const dayData = aggregatedByDate.get(record.date)!;
      
      // Count based on status
      if (record.status === 'present') dayData.present++;
      else if (record.status === 'late') dayData.late++;
      else if (record.status === 'absent') dayData.absent++;
      else if (record.status === 'leave' || record.status === 'half_day') dayData.onLeave++;
    });

    console.log('[AttendanceService] Aggregated days:', aggregatedByDate.size);
    console.log('[AttendanceService] Sample day data:', Array.from(aggregatedByDate.entries())[0]);

    // Calculate scheduled staff and attendance rates
    aggregatedByDate.forEach((dayData, date) => {
      // Staff scheduled = those who have any attendance record for that day
      const staffCount = staffWithRecordsByDate.get(date)?.size || 0;
      dayData.scheduledStaff = staffCount;
      dayData.totalStaff = totalActiveStaff;
      
      // Attendance rate = present / scheduled staff (not total staff)
      // This is more accurate for companies with rotating shifts
      if (dayData.scheduledStaff > 0) {
        dayData.attendanceRate = Math.round((dayData.present / dayData.scheduledStaff) * 100);
      }
    });

    return {
      success: true,
      data: Array.from(aggregatedByDate.values()),
    };
  } catch (error: any) {
    console.error('[AttendanceService] Error fetching attendance:', error);
    console.error('[AttendanceService] Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch monthly attendance data',
    };
  }
};

// ============ PROCESS ATTENDANCE ============

// Process attendance for a specific date (single user or all users)
export const processAttendance = async (
  date: string,
  userId?: number
): Promise<{ success: boolean; data?: { processed: number; failed: number }; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const body: { date: string; userId?: number } = { date };
    if (userId) {
      body.userId = userId;
    }

    const response = await axios.post(`${API_ENDPOINT}/attendance/process`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Attendance processed successfully',
    };
  } catch (error: any) {
    console.error('Error processing attendance:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to process attendance',
    };
  }
};

// Process attendance for multiple users in batch
export const processBatchAttendance = async (
  date: string,
  userIds: number[]
): Promise<{ success: boolean; data?: { processed: number; failed: number; failures?: any[] }; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(
      `${API_ENDPOINT}/attendance/process-batch`,
      { date, userIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Attendance batch processed successfully',
    };
  } catch (error: any) {
    console.error('Error processing batch attendance:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to process batch attendance',
    };
  }
};

// Get monthly attendance report
export const getMonthlyReport = async (
  year: number,
  month: number,
  userId?: number
): Promise<{ success: boolean; report?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('month', month.toString());
    if (userId) params.append('userId', userId.toString());

    const response = await axios.get(
      `${API_ENDPOINT}/attendance/reports/monthly?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      report: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching monthly report:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch monthly report',
    };
  }
};

// Get my attendance (current user)
export const getMyAttendance = async (
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<{ success: boolean; records?: AttendanceRecord[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);

    const response = await axios.get(
      `${API_ENDPOINT}/attendance/my${params.toString() ? '?' + params.toString() : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      records: response.data.data?.attendanceRecords || response.data.data?.records || response.data.data || [],
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching my attendance:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch my attendance',
    };
  }
};

// Get my attendance summary (current user)
export const getMyAttendanceSummary = async (
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; summary?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_ENDPOINT}/attendance/my/summary${params.toString() ? '?' + params.toString() : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      summary: response.data.data?.summary || response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching my attendance summary:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch my attendance summary',
    };
  }
};

// Define interfaces for shift timing
export interface ShiftTiming {
  id: number;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  shift_name: string;
  effective_from: string; // YYYY-MM-DD
  effective_to?: string; // YYYY-MM-DD (optional)
  override_branch_id?: number;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

// Get all shift timings
export const getAllShiftTimings = async (): Promise<{ success: boolean; shiftTimings?: ShiftTiming[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/shift-timings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      shiftTimings: response.data.data?.shiftTimings || response.data.shiftTimings || [],
    };
  } catch (error: any) {
    console.error('Error fetching shift timings:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch shift timings',
    };
  }
};

// Get shift timing by ID
export const getShiftTimingById = async (timingId: number): Promise<{ success: boolean; shiftTiming?: ShiftTiming; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/shift-timings/${timingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      shiftTiming: response.data.data?.shiftTiming || response.data.shiftTiming,
    };
  } catch (error: any) {
    console.error('Error fetching shift timing:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch shift timing',
    };
  }
};

// Create shift timing
export const createShiftTiming = async (timingData: {
  start_time: string;
  end_time: string;
  shift_name: string;
  effective_from: string;
  effective_to?: string;
  override_branch_id?: number;
  user_id?: number;
}): Promise<{ success: boolean; shiftTiming?: ShiftTiming; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/shift-timings`, timingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      shiftTiming: response.data.data?.shiftTiming || response.data.shiftTiming,
    };
  } catch (error: any) {
    console.error('Error creating shift timing:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create shift timing',
    };
  }
};

// Update shift timing
export const updateShiftTiming = async (
  timingId: number,
  updateData: {
    start_time?: string;
    end_time?: string;
    shift_name?: string;
    effective_from?: string;
    effective_to?: string;
    override_branch_id?: number;
    user_id?: number;
  }
): Promise<{ success: boolean; shiftTiming?: ShiftTiming; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/shift-timings/${timingId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      shiftTiming: response.data.data?.shiftTiming || response.data.shiftTiming,
    };
  } catch (error: any) {
    console.error('Error updating shift timing:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update shift timing',
    };
  }
};

// Delete shift timing
export const deleteShiftTiming = async (timingId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/shift-timings/${timingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Shift timing deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting shift timing:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete shift timing',
    };
  }
};