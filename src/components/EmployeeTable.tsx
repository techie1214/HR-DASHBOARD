// This component renders a table displaying employee information
// It shows employee details including name, department, position, status, and actions

import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { getAllStaff } from "../services/staffManagementService";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'Active' | 'Inactive';
  avatar: string;
}

export function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await getAllStaff(1, 100);
        
        if (response.success && response.staff) {
          const staffList = response.staff.map((s: any) => ({
            id: s.user_id || s.id,
            name: s.full_name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || `User ${s.user_id}`,
            email: s.email || s.work_email || '', 
            department: s.department || 'Unassigned',
            position: s.designation || s.departmentRole || 'Staff',
            status: s.status === 'active' ? 'Active' : 'Inactive',
            avatar: (s.full_name || s.firstName || 'U').substring(0, 2).toUpperCase()
          }));
          
          setEmployees(staffList);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-muted mt-2">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Employee</th>
            <th className="table-header-cell">Department</th>
            <th className="table-header-cell">Position</th>
            <th className="table-header-cell">Status</th>
            {/* <th className="table-header-cell right">  Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee.id} className="table-row">
                <td className="table-cell">
                  <div className="employee-info">
                    <div className="avatar">{employee.avatar}</div>
                    <div className="employee-details">
                      <div className="employee-name">{employee.name}</div>
                      <div className="employee-email">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">{employee.department}</td>
                <td className="table-cell">{employee.position}</td>
                <td className="table-cell">
                  <span className={employee.status === "Active" ? "badge badge-default" : "badge badge-secondary"}>
                    {employee.status}
                  </span>
                </td>
                <td className="table-cell right">
                  <button className="btn btn-ghost btn-sm">
                    {/* <MoreHorizontal className="w-4 h-4" /> */}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-8 text-muted">
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
