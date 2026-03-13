// This component renders a line chart displaying weekly attendance trends
// It uses Recharts library for data visualization

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllAttendanceRecords } from "../services/attendanceService";

interface AttendanceData {
  day: string;
  attendance: number;
}

export function AttendanceChart() {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Get attendance records for the current week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];

        const response = await getAllAttendanceRecords(1, 100, undefined, startDate, endDate);
        
        if (response.success && response.records) {
          // Group by day and calculate attendance percentage
          const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const dailyStats: Record<string, { total: number; present: number }> = {};
          
          // Initialize all days
          dayNames.forEach(day => {
            dailyStats[day] = { total: 0, present: 0 };
          });

          // Count attendance per day
          response.records.forEach(record => {
            const date = new Date(record.date);
            const dayName = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];
            
            if (dailyStats[dayName]) {
              dailyStats[dayName].total++;
              if (record.status === 'present' || record.status === 'late') {
                dailyStats[dayName].present++;
              }
            }
          });

          // Convert to chart data with percentage
          const chartData = dayNames.map(day => ({
            day,
            attendance: dailyStats[day].total > 0 
              ? Math.round((dailyStats[day].present / dailyStats[day].total) * 100)
              : 0
          }));

          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>Weekly Attendance Trend</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>Weekly Attendance Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '0.875rem' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
            formatter={(value: number) => [`${value}%`, 'Attendance']}
          />
          <Line
            type="monotone"
            dataKey="attendance"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
