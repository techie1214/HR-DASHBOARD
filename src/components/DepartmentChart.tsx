// This component renders a pie chart displaying the distribution of employees across different departments
// It uses Recharts library for visualization and shows percentage breakdowns

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getAllStaff } from "../services/staffManagementService";

interface DepartmentData {
  name: string;
  value: number;
}

const COLORS = ["#2563eb", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#f97316", "#0ea5e9", "#8b5cf6", "#84cc16", "#ef4444"];

export function DepartmentChart() {
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const response = await getAllStaff(1, 1000);
        
        if (response.success && response.staff) {
          // Group by department
          const departmentMap = new Map<string, number>();
          
          response.staff.forEach((staff: any) => {
            const dept = staff.department || 'Unassigned';
            departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
          });

          // Convert to chart data
          const chartData = Array.from(departmentMap.entries()).map(([name, value]) => ({
            name,
            value
          })).sort((a, b) => b.value - a.value);

          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>Employees by Department</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>Employees by Department</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
