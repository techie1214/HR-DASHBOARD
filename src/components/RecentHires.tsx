// This component displays a list of recently hired employees
// It shows their names, positions, departments, and hire dates

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { getAllStaff } from "../services/staffManagementService";

interface RecentHire {
  id: number;
  name: string;
  avatar: string;
  position: string;
  department: string;
  date: string;
}

export function RecentHires() {
  const [recentHires, setRecentHires] = useState<RecentHire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentHires = async () => {
      try {
        setLoading(true);
        const response = await getAllStaff(1, 100);
        
        if (response.success && response.staff) {
          // Sort by joining date (most recent first) and take top 5
          const sorted = response.staff
            .filter((s: any) => s.joining_date)
            .sort((a: any, b: any) => new Date(b.joining_date).getTime() - new Date(a.joining_date).getTime())
            .slice(0, 5)
            .map((staff: any) => ({
              id: staff.user_id || staff.id,
              name: staff.full_name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || `User ${staff.user_id}`,
              avatar: (staff.full_name || staff.firstName || 'U').substring(0, 2).toUpperCase(),
              position: staff.designation || staff.departmentRole || 'Staff',
              department: staff.department || 'Unassigned',
              date: new Date(staff.joining_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }));
          
          setRecentHires(sorted);
        }
      } catch (error) {
        console.error('Error fetching recent hires:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentHires();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="mb-4">Recent Hires</h3>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4">Recent Hires</h3>
      <div className="space-y-4">
        {recentHires.length > 0 ? (
          recentHires.map((hire) => (
            <div key={hire.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar">{hire.avatar}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{hire.name}</div>
                  <div className="text-sm text-muted">{hire.position}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="badge badge-secondary">{hire.department}</span>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted" style={{ justifyContent: "flex-end" }}>
                  <Calendar className="w-3 h-3" />
                  {hire.date}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Recent Hires</h3>
            <p className="text-gray-500">No new staff members have been added recently</p>
          </div>
        )}
      </div>
    </div>
  );
}
