import { useState, useEffect, useCallback } from "react";
import AttendanceCalendar, { CalendarDayData, CalendarMonthData } from "./AttendanceCalendar";
import { getAttendanceForMonth, CalendarDayAttendance, getAllAttendanceRecords } from "../services/attendanceService";
import { holidayService } from "../services/holidayService";
import { getAllStaff } from "../services/staffManagementService";

interface AttendanceCalendarWrapperProps {
  initialYear?: number;
  initialMonth?: number;
  onBackToList?: () => void;
}

export default function AttendanceCalendarWrapper({
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth(),
  onBackToList
}: AttendanceCalendarWrapperProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [monthData, setMonthData] = useState<CalendarMonthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [totalStaffCount, setTotalStaffCount] = useState(48);

  // Fetch total staff count for the organization
  const fetchTotalStaff = useCallback(async () => {
    try {
      const response = await getAllStaff(1, 1000);
      if (response.success && response.staff) {
        // Count only active staff (exclude terminated/inactive)
        const activeStaff = response.staff.filter((s: any) => 
          s.status === 'active' && !s.termination_date
        ).length;
        if (activeStaff > 0) {
          setTotalStaffCount(activeStaff);
        }
      }
    } catch (err) {
      console.error('Failed to fetch staff count:', err);
    }
  }, []);

  // Fetch holidays for the month
  const fetchHolidays = useCallback(async (y: number, m: number) => {
    try {
      const startDate = new Date(y, m, 1).toISOString().split('T')[0];
      const endDate = new Date(y, m + 1, 0).toISOString().split('T')[0];

      const response = await holidayService.getHolidays({ startDate, endDate });
      if (response.success && response.data?.holidays) {
        setHolidays(response.data.holidays);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    }
  }, []);

  // Fetch attendance data for the month
  const fetchAttendanceData = useCallback(async (y: number, m: number) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await getAttendanceForMonth(y, m);

      if (response.success && response.data) {
        const attendanceData = response.data;

        // Build calendar days
        const date = new Date(y, m, 1);
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const totalDays = new Date(y, m + 1, 0).getDate();
        const startingDay = date.getDay();
        const today = new Date();

        // Create a map for quick lookup of attendance data
        const attendanceMap = new Map<string, CalendarDayAttendance>();
        attendanceData.forEach(d => attendanceMap.set(d.date, d));

        const days: CalendarDayData[] = Array.from({ length: totalDays }, (_, i) => {
          const d = i + 1;
          const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayOfWeek = new Date(y, m, d).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          // Check if it's a holiday
          const holiday = holidays.find(h => h.date === iso);
          const isHoliday = !!holiday;
          const holidayName = holiday?.holiday_name;

          const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

          // Get attendance data for this day
          const attData = attendanceMap.get(iso);

          let present = 0, late = 0, absent = 0, onLeave = 0, attendanceRate = 0, totalStaffForDay = totalStaffCount;

          if (attData) {
            // We have attendance data for this day - staff were scheduled
            present = attData.present;
            late = attData.late;
            onLeave = attData.onLeave;
            // Use the scheduled staff count from API
            totalStaffForDay = attData.scheduledStaff || attData.totalStaff;
            // Absent = scheduled staff - those who showed up
            absent = Math.max(0, totalStaffForDay - (present + late + onLeave));
            attendanceRate = attData.attendanceRate;
          } else {
            // No attendance records for this day
            // Could be: weekend, holiday, or simply no one scheduled
            // Don't assume absent - just show 0 for all
            present = 0;
            late = 0;
            onLeave = 0;
            absent = 0;
            attendanceRate = 0;
            totalStaffForDay = totalStaffCount;
          }

          const status = attendanceRate >= 95 ? "excellent" : attendanceRate >= 85 ? "good" : attendanceRate >= 70 ? "average" : "poor";

          return {
            date: iso,
            dayOfMonth: d,
            dayOfWeek,
            isToday,
            isWeekend,
            isHoliday,
            holidayName,
            totalStaff: totalStaffForDay,
            present,
            late,
            absent,
            onLeave,
            attendanceRate,
            status,
            records: []
          };
        });

        // Calculate summary - include ALL days with data, not just weekdays
        const daysWithData = days.filter(d => d.present > 0 || d.late > 0 || d.absent > 0 || d.onLeave > 0);
        const avgRate = daysWithData.length
          ? Math.round(daysWithData.reduce((sum, d) => sum + d.attendanceRate, 0) / daysWithData.length)
          : 0;

        const sorted = [...daysWithData].sort((a, b) => b.attendanceRate - a.attendanceRate);
        const totalAbsentDays = days.reduce((sum, d) => sum + d.absent, 0);

        setMonthData({
          month: m,
          year: y,
          monthName: monthNames[m],
          totalDays,
          startingDay,
          days,
          summary: {
            totalWorkingDays: daysWithData.length,
            averageAttendanceRate: avgRate,
            bestDay: sorted[0] || days[0],
            worstDay: sorted[sorted.length - 1] || days[0],
            totalHolidays: days.filter(d => d.isHoliday).length,
            totalAbsentDays
          }
        });
      } else {
        setError(response.message || 'Failed to fetch attendance data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [holidays, totalStaffCount]);

  // Initial load - fetch staff count first
  useEffect(() => {
    fetchTotalStaff();
  }, [fetchTotalStaff]);

  // Fetch holidays when month/year changes
  useEffect(() => {
    fetchHolidays(year, month);
  }, [year, month, fetchHolidays]);

  // Fetch attendance after holidays and staff count are loaded
  useEffect(() => {
    if (totalStaffCount > 0) {
      fetchAttendanceData(year, month);
    }
  }, [year, month, holidays, totalStaffCount, fetchAttendanceData]);

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleExport = (m: number, y: number) => {
    if (!monthData) return;
    
    const rows = [["Date", "Day", "Present", "Late", "Absent", "On Leave", "Rate%", "Holiday", "Weekend"]];
    monthData.days.forEach(d => {
      rows.push([
        d.date,
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.dayOfWeek],
        d.present.toString(),
        d.late.toString(),
        d.absent.toString(),
        d.onLeave.toString(),
        d.attendanceRate.toString(),
        d.isHoliday ? (d.holidayName || "Yes") : "",
        d.isWeekend ? "Yes" : "No"
      ]);
    });
    
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,
      download: `attendance-${y}-${monthData.monthName}.csv`
    });
    a.click();
  };

  const handleDayClick = (day: CalendarDayData) => {
    console.log('Day clicked:', day);
    // You can add custom day click handling here
  };

  // Check if there's no attendance data at all
  const hasNoData = monthData && monthData.days.every(
    d => d.present === 0 && d.late === 0 && d.absent === 0 && d.onLeave === 0
  );

  return (
    <>
      {/* No Data Message */}
      {!isLoading && hasNoData && (
        <div style={{
          padding: 40,
          textAlign: 'center',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          maxWidth: 600,
          margin: '40px auto'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#111827',
            marginBottom: 8
          }}>
            No Attendance Data Found
          </h3>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 20,
            lineHeight: 1.5
          }}>
            Attendance records haven't been created for {monthData?.monthName} {year} yet.
          </p>
          
          <div style={{
            background: '#f9fafb',
            padding: 16,
            borderRadius: 8,
            textAlign: 'left',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8
            }}>
              To populate attendance data:
            </p>
            <ol style={{
              fontSize: 13,
              color: '#4b5563',
              paddingLeft: 20,
              margin: 0,
              lineHeight: 1.8
            }}>
              <li>Staff can check in/out using the attendance feature</li>
              <li>
                Run the attendance processor worker:
                <code style={{
                  display: 'block',
                  background: '#e5e7eb',
                  padding: '4px 8px',
                  borderRadius: 4,
                  marginTop: 4,
                  fontFamily: 'monospace',
                  fontSize: 12
                }}>
                  cd Backend && npm run start-workers
                </code>
              </li>
              <li>
                Or manually process past dates via API:
                <code style={{
                  display: 'block',
                  background: '#e5e7eb',
                  padding: '4px 8px',
                  borderRadius: 4,
                  marginTop: 4,
                  fontFamily: 'monospace',
                  fontSize: 12
                }}>
                  POST /api/attendance/process-range
                </code>
              </li>
            </ol>
          </div>
        </div>
      )}

      <AttendanceCalendar
        monthData={monthData}
        isLoading={isLoading}
        error={error}
        onMonthChange={handleMonthChange}
        onExport={handleExport}
        onDayClick={handleDayClick}
        onBackToList={onBackToList}
        showWeekends={true}
        showAttendanceRate={true}
      />
    </>
  );
}
