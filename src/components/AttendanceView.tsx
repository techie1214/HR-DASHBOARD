// This component provides a comprehensive attendance tracking and reporting interface
// It displays attendance statistics, charts, and detailed records with filtering capabilities

// Import Lucide React icons for UI elements
import { Calendar, Clock, TrendingUp, TrendingDown, UserCheck, Download, Building, Filter, Search } from "lucide-react";
// Import AttendanceChart component for visualization
import { AttendanceChart } from "./AttendanceChart";
// Import React useState hook for state management
import { useState } from 'react';
// Import branch data constants
import { BRANCHES } from '../data/branchData';
// Import attendance service hook
import { useAttendanceService } from '../services/useAttendanceService';

// Interface defining the structure of staff attendance records
interface StaffAttendanceRecord {
  id: string; // Unique staff identifier
  fullName: string; // Full name of the staff member
  department: string; // Department the staff belongs to
  branch?: string; // Branch location (optional)
  present: number; // Number of days present
  early: number; // Number of early arrivals
  late: number; // Number of late arrivals
  permitted: number; // Number of permitted absences
  absent: number; // Number of unexcused absences
  offDays: number; // Number of off days
  leaveDays: number; // Number of leave days
  averageTime: string; // Average working time
}

// Main component function for attendance view
export function AttendanceView() {
  // State for search term input
  const [searchTerm, setSearchTerm] = useState('');
  // State for selected branch filter
  const [selectedBranch, setSelectedBranch] = useState('all');
  // State for date range filter
  const [dateRange, setDateRange] = useState('month');
  // State for status filter (all, early, late, absent)
  const [filterStatus, setFilterStatus] = useState<'all' | 'early' | 'late' | 'absent'>('all');
  // State for showing/hiding filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Use attendance service hook to get data from backend
  const {
    attendanceRecords: todayAttendanceRecords,
    staffAttendanceData,
    monthlyStats,
    attendanceMetrics: metrics,
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
    updateAttendanceMode
  } = useAttendanceService();

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading attendance data...</span>
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="alert alert-error">
        <p>Error loading attendance data: {error}</p>
        <button className="btn btn-sm" onClick={refreshData}>Retry</button>
      </div>
    );
  }

  // Calculate active branches from attendance records or fall back to branch list
  const attendanceBranchSet = new Set<string>(staffAttendanceData.map(r => (r.branch ? r.branch : '')).filter(Boolean));
  const computedActiveBranches = attendanceBranchSet.size > 0 ? attendanceBranchSet.size : BRANCHES.length;

  // Filter attendance data based on search, status, and branch filters
  const filteredData = staffAttendanceData.filter(record => {
    // Check if record matches search term (name, department, or ID)
    const matchesSearch = searchTerm === '' ||
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if record matches status filter
    const matchesFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'early' ? record.early > record.late :
      filterStatus === 'late' ? record.late > 0 :
      record.absent > 0;
    const matchesBranch = selectedBranch === 'all' ? true : (record.branch === selectedBranch);

    return matchesSearch && matchesFilter && matchesBranch;
  });

  // Calculate totals from filtered data
  const totalPresent = filteredData.reduce((sum, r) => sum + r.present, 0);
  const totalEarly = filteredData.reduce((sum, r) => sum + r.early, 0);
  const totalLate = filteredData.reduce((sum, r) => sum + r.late, 0);
  const totalAbsent = filteredData.reduce((sum, r) => sum + r.absent, 0);

  // Main render return
  return (
    <div className="space-y-6">
      {/* Action buttons section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Attendance Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Attendance Mode:</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={attendanceMode === 'automatic'}
                onChange={(e) => updateAttendanceMode(e.target.checked ? 'automatic' : 'manual')}
                disabled={modeLoading}
              />
              <span className="slider round"></span>
            </label>
            <span className="text-sm">
              {modeLoading ? 'Updating...' : attendanceMode === 'automatic' ? 'Automatic' : 'Manual'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Present Today Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-green">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Present Today</p>
            <h3 className="mt-1">234 / 248</h3>
            <p className="text-muted mt-1">94.4% attendance rate</p>
          </div>
        </div>

        {/* Late Arrivals Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-orange">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Late Arrivals</p>
            <h3 className="mt-1">14</h3>
            <p className="text-muted mt-1">5.6% of total employees</p>
          </div>
        </div>

        {/* Average Working Hours Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-blue">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Avg. Working Hours</p>
            <h3 className="mt-1">8.4 hrs</h3>
            <p className="text-muted mt-1">+0.3 hrs from last month</p>
          </div>
        </div>

        {/* On Leave Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-purple">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">On Leave</p>
            <h3 className="mt-1">8</h3>
            <p className="text-muted mt-1">5 approved, 3 pending</p>
          </div>
        </div>
      </div>

      {/* Attendance Chart Component */}
      <AttendanceChart />

      {/* Today's Attendance Table */}
      <div className="card">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3>Today's Attendance</h3>
              <p className="text-muted">Wednesday, November 5, 2025</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-secondary">{todayAttendanceRecords.length} Total</span>
              <span className="badge badge-default">{todayAttendanceRecords.filter(r => r.status === 'Present').length} Present</span>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {recordsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span>Loading today's attendance records...</span>
            </div>
          ) : recordsError ? (
            <div className="alert alert-warning p-4 m-4">
              <p>{recordsError}</p>
              <button className="btn btn-sm" onClick={refreshData}>Retry</button>
            </div>
          ) : (
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Employee</th>
                  <th className="table-header-cell">Check In</th>
                  <th className="table-header-cell">Check Out</th>
                  <th className="table-header-cell">Hours</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendanceRecords.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">
                      <div className="employee-info">
                        <div className="avatar">{record.name.split(' ').map(n => n[0]).join('')}</div>
                        <div className="employee-details">
                          <span className="employee-name">{record.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{record.checkIn}</td>
                    <td className="table-cell">{record.checkOut}</td>
                    <td className="table-cell">{record.hours}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        record.status === 'Present' ? 'badge-default' :
                        record.status === 'Late' ? 'badge-secondary' :
                        'badge-secondary'
                      }`} style={{
                        backgroundColor: record.status === 'Present' ? '#16a34a' :
                                       record.status === 'Late' ? '#f59e0b' :
                                       record.status === 'Absent' ? '#dc2626' :
                                       '#94a3b8',
                        color: '#ffffff'
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td className="table-cell right">
                      <button className="btn btn-sm btn-ghost">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Monthly Summary Section */}
      <div className="card">
        <div className="p-6 border-b">
          <h3>Monthly Summary</h3>
          <p className="text-muted">Attendance statistics for recent months</p>
        </div>
        <div className="p-6">
          {monthlyStatsLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span>Loading monthly statistics...</span>
            </div>
          ) : monthlyStatsError ? (
            <div className="py-8 text-center text-red-500">
              Error loading monthly statistics: {monthlyStatsError}
              <button className="btn btn-sm ml-3" onClick={refreshData}>Retry</button>
            </div>
          ) : monthlyStats.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p style={{ fontWeight: 500 }}>{stat.month}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-muted">Present</p>
                      <p style={{ fontWeight: 500 }}>{stat.present} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted">Absent</p>
                      <p style={{ fontWeight: 500 }}>{stat.absent} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted">Late</p>
                      <p style={{ fontWeight: 500 }}>{stat.late} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted">Leaves</p>
                      <p style={{ fontWeight: 500 }}>{stat.leaves} days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted">
              No monthly statistics available
            </div>
          )}
        </div>
      </div>
      {/* Second Stats Overview Section */}
      <div className="space-y-6">
        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
          {/* Active Branches Card */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                <Building className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Active Branches</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{computedActiveBranches}</p>
              </div>
            </div>
          </div>
          {/* Attendance Rate Card */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Attendance Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{metrics.avgAttendanceRate}%</p>
              </div>
            </div>
          </div>
          {/* Total Present Card */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
                <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Present</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{metrics.totalPresent}</p>
              </div>
            </div>
          </div>
          {/* Total Absences Card */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef2f2' }}>
                <TrendingDown className="w-5 h-5" style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Absences</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{metrics.totalAbsent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="card p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Search Input */}
              <div className="input-wrapper" style={{ width: 'auto', flex: 1, minWidth: '250px' }}>
                <div className="input-icon">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, department, or ID..."
                  className="input input-with-icon"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Filter and Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
                <button className="btn btn-sm btn-outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb' }}>
                {/* Branch Filter */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    Branch
                  </label>
                  <select
                    className="input"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="all">All Branches</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                {/* Date Range Filter */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    Date Range
                  </label>
                  <select
                    className="input"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                {/* Status Filter */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    Filter By
                  </label>
                  <select
                    className="input"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">All Staff</option>
                    <option value="early">Early Arrivals</option>
                    <option value="late">Late Arrivals</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                {/* Sort By Filter */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    Sort By
                  </label>
                  <select className="input">
                    <option value="name">Name</option>
                    <option value="department">Department</option>
                    <option value="present">Present Days</option>
                    <option value="late">Late Days</option>
                    <option value="absent">Absent Days</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Report Table */}
        <div className="card">
          <div className="p-4 border-b">
            <h3>Attendance Report</h3>
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              Showing {filteredData.length} staff members for {dateRange === 'month' ? 'November 2024' : dateRange}
            </p>
          </div>
          {staffDataLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span>Loading staff attendance data...</span>
            </div>
          ) : staffDataError ? (
            <div className="p-8 text-center text-red-500">
              Error loading staff attendance data: {staffDataError}
              <button className="btn btn-sm ml-3" onClick={refreshData}>Retry</button>
            </div>
          ) : (
            <div className="table-container">
              {filteredData.length > 0 ? (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">S/N</th>
                      <th className="table-header-cell">Full Name</th>
                      <th className="table-header-cell">Department</th>
                      <th className="table-header-cell">Present</th>
                      <th className="table-header-cell">Early</th>
                      <th className="table-header-cell">Late</th>
                      <th className="table-header-cell">Permitted</th>
                      <th className="table-header-cell">Absent</th>
                      <th className="table-header-cell">Off</th>
                      <th className="table-header-cell">Leave</th>
                      <th className="table-header-cell">Avg. Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((record, index) => (
                      <tr key={record.id} className="table-row">
                        <td className="table-cell">{index + 1}</td>
                        <td className="table-cell">
                          <div>
                            <p style={{ fontWeight: 500 }}>{record.fullName}</p>
                            <p className="text-xs text-muted">{record.id}</p>
                          </div>
                        </td>
                        <td className="table-cell">{record.department}</td>
                        <td className="table-cell">
                          <span className="badge badge-success">{record.present}</span>
                        </td>
                        <td className="table-cell">
                          <span style={{ color: '#16a34a', fontWeight: 500 }}>{record.early}</span>
                        </td>
                        <td className="table-cell">
                          <span style={{ color: record.late > 3 ? '#dc2626' : '#f59e0b', fontWeight: 500 }}>
                            {record.late}
                          </span>
                        </td>
                        <td className="table-cell">{record.permitted}</td>
                        <td className="table-cell">
                          <span style={{ color: record.absent > 0 ? '#dc2626' : '#64748b', fontWeight: 500 }}>
                            {record.absent}
                          </span>
                        </td>
                        <td className="table-cell">{record.offDays}</td>
                        <td className="table-cell">{record.leaveDays}</td>
                        <td className="table-cell">
                          <span style={{ fontWeight: 500 }}>{record.averageTime}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center">
                  <Clock className="w-12 h-12" style={{ color: '#e5e7eb' }} />
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>No attendance records found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats Section */}
        <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
          {/* Monthly Summary Card */}
          <div className="card p-4">
            <h3 style={{ marginBottom: '1rem' }}>Monthly Summary</h3>
            {metricsLoading ? (
              <div className="py-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                <span>Loading metrics...</span>
              </div>
            ) : metricsError ? (
              <div className="py-4 text-center text-red-500">
                Error loading metrics: {metricsError}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total Working Days</span>
                  <span style={{ fontWeight: 600 }}>{metrics.totalWorkingDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total Present</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>{metrics.totalPresent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total Early</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>{metrics.totalEarly}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total Late</span>
                  <span style={{ fontWeight: 600, color: '#f59e0b' }}>{metrics.totalLate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total Absent</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{metrics.totalAbsent}</span>
                </div>
              </div>
            )}
          </div>
          {/* Performance Metrics Card */}
          <div className="card p-4">
            <h3 style={{ marginBottom: '1rem' }}>Performance Metrics</h3>
            {metricsLoading ? (
              <div className="py-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                <span>Loading metrics...</span>
              </div>
            ) : metricsError ? (
              <div className="py-4 text-center text-red-500">
                Error loading metrics: {metricsError}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Punctuality Rate */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted">Punctuality Rate</span>
                    <span style={{ fontWeight: 600 }}>
                      {metrics.totalPresent > 0 ? ((metrics.totalEarly / metrics.totalPresent) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${metrics.totalPresent > 0 ? (metrics.totalEarly / metrics.totalPresent) * 100 : 0}%`, backgroundColor: '#16a34a' }}
                    ></div>
                  </div>
                </div>
                {/* Late Arrival Rate */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted">Late Arrival Rate</span>
                    <span style={{ fontWeight: 600 }}>
                      {metrics.totalPresent > 0 ? ((metrics.totalLate / metrics.totalPresent) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${metrics.totalPresent > 0 ? (metrics.totalLate / metrics.totalPresent) * 100 : 0}%`, backgroundColor: '#f59e0b' }}
                    ></div>
                  </div>
                </div>
                {/* Absence Rate */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted">Absence Rate</span>
                    <span style={{ fontWeight: 600 }}>
                      {staffAttendanceData.length > 0 ? ((metrics.totalAbsent / (staffAttendanceData.length * metrics.totalWorkingDays)) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${staffAttendanceData.length > 0 ? (metrics.totalAbsent / (staffAttendanceData.length * metrics.totalWorkingDays)) * 100 : 0}%`, backgroundColor: '#dc2626' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add CSS for the toggle switch
const toggleStyles = `
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  .slider.round {
    border-radius: 24px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
`;

// Add the styles to the document
if (!document.querySelector('#toggle-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'toggle-styles';
  styleElement.textContent = toggleStyles;
  document.head.appendChild(styleElement);
}