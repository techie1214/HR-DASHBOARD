// AttendanceReportView.tsx
// Comprehensive attendance reporting and analytics

import React, { useState, useEffect } from 'react';
import {
  getStaffAttendanceData,
  getAttendanceSummary,
  getMonthlyReport,
  AttendanceRecord
} from '../services/attendanceService';
import { getAllStaff } from '../services/staffManagementService';
import { getAllBranches } from '../services/branchManagementService';
import {
  Download, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle,
  Users, Building, TrendingUp, TrendingDown, Calendar, FileText
} from 'lucide-react';

interface StaffAttendance {
  id: number;
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

const AttendanceReportView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<'monthly' | 'range' | 'employee'>('monthly');

  // Data state
  const [staffData, setStaffData] = useState<StaffAttendance[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);

  // Filter state
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Monthly report state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Range report state
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Employee report state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [staffDataRes, branchesRes, staffRes] = await Promise.all([
        getStaffAttendanceData(),
        getAllBranches(),
        getAllStaff(1, 1000)
      ]);

      if (staffDataRes.success && staffDataRes.data) {
        setStaffData(staffDataRes.data);
      }

      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches);
      }

      if (staffRes.success && staffRes.staff) {
        setStaffMembers(staffRes.staff);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter staff data
  const filteredStaffData = staffData.filter((staff: StaffAttendance) => {
    const matchesSearch = searchTerm === '' ||
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedBranch || staff.branch === branches.find(b => b.id === selectedBranch)?.name;

    const matchesDepartment = !selectedDepartment ||
      staff.department.toLowerCase().includes(selectedDepartment.toLowerCase());

    return matchesSearch && matchesBranch && matchesDepartment;
  });

  // Calculate statistics
  const totalEmployees = filteredStaffData.length;
  const avgAttendanceRate = totalEmployees > 0
    ? Math.round(filteredStaffData.reduce((sum, s) => sum + s.present, 0) / totalEmployees)
    : 0;
  const totalLate = filteredStaffData.reduce((sum, s) => sum + s.late, 0);
  const totalAbsent = filteredStaffData.reduce((sum, s) => sum + s.absent, 0);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Employee', 'Department', 'Branch', 'Present', 'Late', 'Absent', 'Leave Days', 'Off Days', 'Avg Time'];
    const rows = filteredStaffData.map(s => [
      s.fullName,
      s.department,
      s.branch || '',
      s.present,
      s.late,
      s.absent,
      s.leaveDays,
      s.offDays,
      s.averageTime
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique departments
  const departments = Array.from(new Set(staffData.map(s => s.department)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive attendance analytics and reporting
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Report Type Tabs */}
      <div className="tabs-list">
        <button
          className={`tabs-trigger ${activeReport === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveReport('monthly')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Monthly Summary
        </button>
        <button
          className={`tabs-trigger ${activeReport === 'range' ? 'active' : ''}`}
          onClick={() => setActiveReport('range')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Date Range Report
        </button>
        <button
          className={`tabs-trigger ${activeReport === 'employee' ? 'active' : ''}`}
          onClick={() => setActiveReport('employee')}
        >
          <Users className="w-4 h-4 mr-2" />
          Employee Report
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-outline"
            onClick={loadData}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            className="btn btn-outline"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Employees</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Avg Attendance</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{avgAttendanceRate}%</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <Clock className="w-5 h-5" style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Late</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalLate}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Absent</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalAbsent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <select
              className="input w-full"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              className="input w-full"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Attendance Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Branch</th>
                <th className="table-header-cell right">Present</th>
                <th className="table-header-cell right">Late</th>
                <th className="table-header-cell right">Absent</th>
                <th className="table-header-cell right">Leave Days</th>
                <th className="table-header-cell right">Off Days</th>
                <th className="table-header-cell right">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading attendance data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStaffData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No attendance data found</p>
                    <p className="text-gray-400 text-sm">Adjust filters or refresh data</p>
                  </td>
                </tr>
              ) : (
                filteredStaffData.map((staff) => {
                  const attendanceRate = staff.present + staff.late > 0
                    ? Math.round((staff.present / (staff.present + staff.late + staff.absent)) * 100)
                    : 0;

                  return (
                    <tr key={staff.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <p style={{ fontWeight: 500 }}>{staff.fullName}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm">{staff.department}</span>
                      </td>
                      <td className="table-cell">
                        {staff.branch ? (
                          <span className="text-sm">{staff.branch}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <span style={{ fontWeight: 500 }}>{staff.present}</span>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </td>
                      <td className="table-cell right">
                        <span className="badge badge-warning">{staff.late}</span>
                      </td>
                      <td className="table-cell right">
                        <span className="badge badge-error">{staff.absent}</span>
                      </td>
                      <td className="table-cell right">
                        <span className="text-sm">{staff.leaveDays}</span>
                      </td>
                      <td className="table-cell right">
                        <span className="text-sm">{staff.offDays}</span>
                      </td>
                      <td className="table-cell right">
                        <span className="badge badge-secondary">{staff.averageTime}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Report Sections */}
      {activeReport === 'monthly' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Report Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                className="input w-full"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                className="input w-full"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((month, idx) => (
                  <option key={idx + 1} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'range' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Date Range Report Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="input w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="input w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'employee' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Employee Report Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Employee</label>
              <select
                className="input w-full"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Choose an employee...</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {[staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(' ')} ({staff.work_email || staff.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportView;
