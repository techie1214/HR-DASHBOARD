import { useState, useEffect } from 'react';
import {
  getAllAttendanceRecords,
  getAttendanceSummary,
  getStaffAttendanceData,
  getMonthlyStats,
  getGlobalAttendanceModeStatus,
  updateGlobalAttendanceMode,
  AttendanceRecord,
  AttendanceSummary,
  DailyAttendanceRecord,
  StaffAttendanceRecord,
  MonthlyStat
} from './attendanceService';

// Define the structure for attendance metrics
interface AttendanceMetrics {
  avgAttendanceRate: number;
  totalPresent: number;
  totalEarly: number;
  totalLate: number;
  totalAbsent: number;
  totalWorkingDays: number;
}


// Custom hook for managing attendance data
export const useAttendanceService = () => {
  // State for attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>([]);
  // State for staff attendance data
  const [staffAttendanceData, setStaffAttendanceData] = useState<StaffAttendanceRecord[]>([]);
  // State for monthly statistics
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  // State for attendance metrics
  const [attendanceMetrics, setAttendanceMetrics] = useState<AttendanceMetrics>({
    avgAttendanceRate: 0,
    totalPresent: 0,
    totalEarly: 0,
    totalLate: 0,
    totalAbsent: 0,
    totalWorkingDays: 0
  });
  // Loading states
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [staffDataLoading, setStaffDataLoading] = useState(true);
  const [monthlyStatsLoading, setMonthlyStatsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  // State for attendance mode
  const [attendanceMode, setAttendanceMode] = useState<string>('manual'); // Default mode
  // Loading state for attendance mode
  const [modeLoading, setModeLoading] = useState(true);
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [staffDataError, setStaffDataError] = useState<string | null>(null);
  const [monthlyStatsError, setMonthlyStatsError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [modeError, setModeError] = useState<string | null>(null);

  // Fetch attendance records from the backend
  const fetchAttendanceRecords = async () => {
    setRecordsLoading(true);
    setRecordsError(null);

    try {
      const result = await getAllAttendanceRecords();

      if (result.success && result.records) {
        // Transform backend records to UI format
        const transformedRecords: DailyAttendanceRecord[] = result.records.map(record => ({
          id: record.id,
          name: record.staff_id, // In a real app, this would come from staff data
          checkIn: record.check_in_time || '---',
          checkOut: record.check_out_time || '---',
          hours: record.hours_worked ? `${record.hours_worked} hrs` : '---',
          status: mapBackendStatusToUI(record.status),
          date: record.date
        }));

        setAttendanceRecords(transformedRecords);
      } else {
        setRecordsError(result.message || 'Failed to fetch attendance records');
      }
    } catch (err: any) {
      setRecordsError(err.message || 'An error occurred while fetching attendance records');
    } finally {
      setRecordsLoading(false);
    }
  };

  // Fetch staff attendance data from the backend
  const fetchStaffAttendanceData = async () => {
    setStaffDataLoading(true);
    setStaffDataError(null);

    try {
      const result = await getStaffAttendanceData();

      if (result.success && result.data) {
        setStaffAttendanceData(result.data);
      } else {
        setStaffDataError(result.message || 'Failed to fetch staff attendance data');
      }
    } catch (err: any) {
      setStaffDataError(err.message || 'An error occurred while fetching staff attendance data');
    } finally {
      setStaffDataLoading(false);
    }
  };

  // Fetch monthly statistics from the backend
  const fetchMonthlyStats = async () => {
    setMonthlyStatsLoading(true);
    setMonthlyStatsError(null);

    try {
      const result = await getMonthlyStats();

      if (result.success && result.stats) {
        setMonthlyStats(result.stats);
      } else {
        setMonthlyStatsError(result.message || 'Failed to fetch monthly statistics');
      }
    } catch (err: any) {
      setMonthlyStatsError(err.message || 'An error occurred while fetching monthly statistics');
    } finally {
      setMonthlyStatsLoading(false);
    }
  };

  // Fetch attendance summary/metrics from the backend
  const fetchAttendanceMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const result = await getAttendanceSummary();

      if (result.success && result.summary) {
        // Transform backend summary to UI metrics format
        const metrics: AttendanceMetrics = {
          avgAttendanceRate: result.summary.attendance_rate || 0,
          totalPresent: result.summary.total_present || 0,
          totalEarly: 0, // Backend doesn't provide this directly, would need separate endpoint
          totalLate: result.summary.total_late || 0,
          totalAbsent: result.summary.total_absent || 0,
          totalWorkingDays: 22 // Assuming 22 working days in a month, would come from backend
        };

        setAttendanceMetrics(metrics);
      } else {
        setMetricsError(result.message || 'Failed to fetch attendance metrics');
      }
    } catch (err: any) {
      setMetricsError(err.message || 'An error occurred while fetching attendance metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  // Helper function to map backend status to UI status
  const mapBackendStatusToUI = (backendStatus: string): 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave' => {
    switch (backendStatus.toLowerCase()) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      case 'half_day':
        return 'Half Day';
      case 'on_leave':
        return 'On Leave';
      default:
        return 'Absent';
    }
  };

  // Fetch attendance mode from the backend
  const fetchAttendanceMode = async () => {
    setModeLoading(true);
    setModeError(null);

    try {
      const result = await getGlobalAttendanceModeStatus();

      if (result.success && result.mode) {
        setAttendanceMode(result.mode);
      } else {
        setModeError(result.message || 'Failed to fetch attendance mode');
      }
    } catch (err: any) {
      setModeError(err.message || 'An error occurred while fetching attendance mode');
    } finally {
      setModeLoading(false);
    }
  };

  // Update attendance mode
  const updateAttendanceMode = async (mode: string) => {
    setModeLoading(true);
    setModeError(null);

    try {
      const result = await updateGlobalAttendanceMode(mode);

      if (result.success) {
        setAttendanceMode(mode);
      } else {
        setModeError(result.message || 'Failed to update attendance mode');
      }
    } catch (err: any) {
      setModeError(err.message || 'An error occurred while updating attendance mode');
    } finally {
      setModeLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAttendanceRecords(),
      fetchStaffAttendanceData(),
      fetchMonthlyStats(),
      fetchAttendanceMetrics(),
      fetchAttendanceMode()
    ]);
    setLoading(false);
  };

  // Load data on initial mount
  useEffect(() => {
    refreshData();
  }, []);

  return {
    attendanceRecords,
    staffAttendanceData,
    monthlyStats,
    attendanceMetrics,
    attendanceMode,
    loading,
    recordsLoading,
    staffDataLoading,
    monthlyStatsLoading,
    metricsLoading,
    modeLoading,
    error,
    recordsError,
    staffDataError,
    monthlyStatsError,
    metricsError,
    modeError,
    refreshData,
    fetchAttendanceRecords,
    fetchStaffAttendanceData,
    fetchMonthlyStats,
    fetchAttendanceMetrics,
    fetchAttendanceMode,
    updateAttendanceMode
  };
};