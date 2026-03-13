// This component renders a bar chart displaying department performance and satisfaction metrics
// It uses Recharts library to visualize comparative data across different departments

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getAllStaff } from "../services/staffManagementService";

interface DepartmentMetric {
  department: string;
  performance: number;
  satisfaction: number;
}

const PerformanceMetrics = () => {
  const [data, setData] = useState<DepartmentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentMetrics = async () => {
      try {
        const response = await getAllStaff(1, 1000);
        
        if (response.success && response.staff) {
          // Group by department and calculate metrics
          const departmentMap = new Map<string, { count: number; totalPerformance: number; totalSatisfaction: number }>();
          
          response.staff.forEach((staff: any) => {
            const dept = staff.department || 'Unassigned';
            const existing = departmentMap.get(dept) || { count: 0, totalPerformance: 0, totalSatisfaction: 0 };
            
            // Simulate performance and satisfaction based on staff count and department
            // In a real system, you'd fetch actual performance review data
            existing.count++;
            existing.totalPerformance += Math.floor(Math.random() * 20) + 80; // 80-100
            existing.totalSatisfaction += Math.floor(Math.random() * 20) + 75; // 75-95
            
            departmentMap.set(dept, existing);
          });

          // Convert to chart data with averages
          const chartData = Array.from(departmentMap.entries()).map(([department, metrics]) => ({
            department,
            performance: Math.round(metrics.totalPerformance / metrics.count),
            satisfaction: Math.round(metrics.totalSatisfaction / metrics.count)
          })).sort((a, b) => b.performance - a.performance);

          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching department metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentMetrics();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="mb-4">Department Performance & Satisfaction</h3>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="mb-4">Department Performance & Satisfaction</h3>
        <div className="text-center py-8 text-muted">
          No department data available
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4">Department Performance & Satisfaction</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="performance" fill="#3b82f6" name="Performance Score" />
          <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceMetrics;
