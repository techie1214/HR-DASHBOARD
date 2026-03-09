// src/components/AttendanceView.tsx
// Admin-focused Attendance Management with Calendar, List View, and Check-in Tracking

import React, { useState, useEffect } from 'react';
import {
  getAllAttendanceRecords,
  markAttendanceCheckIn,
  markAttendanceCheckOut,
  createManualAttendance,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  AttendanceRecord,
  AttendanceRecordsResponse
} from '../services/attendanceService';
import { getAllStaff } from '../services/staffManagementService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import ProcessAttendanceModal from './ProcessAttendanceModal';
import { holidayService } from '../services/holidayService';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Download,
  Plus, Edit3, Trash2, Users, Building, TrendingUp, TrendingDown, RefreshCw,
  ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  department?: string;
  branch_id?: number;
}

interface AttendanceWithStaff extends AttendanceRecord {
  staff_name?: string;
  staff_email?: string;
  department?: string;
  branch_name?: string;
}

const AttendanceView = () => {
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithStaff[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filter state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bulk action state
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // View details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<AttendanceWithStaff | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<AttendanceRecordsResponse['pagination'] | undefined>();

  // Modal state
  const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceWithStaff | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Manual attendance form
  const [manualForm, setManualForm] = useState({
    user_id: 0,
    date: new Date().toISOString().split('T')[0],
    check_in_time: '09:00:00',
    check_out_time: '17:00:00',
    status: 'present' as 'present' | 'late' | 'half_day',
    notes: '',
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    status: 'present',
    check_in_time: '',
    check_out_time: '',
    notes: '',
  });

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Load data
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadData();
    }
  }, [dateRange.start, dateRange.end, selectedBranch, selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).toISOString().split('T')[0];

      const [attendanceRes, staffRes, branchesRes, holidaysRes] = await Promise.all([
        getAllAttendanceRecords(currentPage, pageSize, undefined, dateRange.start, dateRange.end),
        getAllStaff(1, 1000),
        getAllBranches(),
        holidayService.getHolidays({ startDate, endDate })
      ]);

      if (staffRes.success && staffRes.staff) {
        const mappedStaff = staffRes.staff.map((s: any) => ({
          id: s.id,
          name: [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ') || s.email,
          email: s.work_email || s.email,
          department: s.department,
          branch_id: s.branch_id
        }));
        setStaffMembers(mappedStaff);
      }

      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches);
      }

      if (holidaysRes.success && holidaysRes.data && holidaysRes.data.holidays) {
        setHolidays(holidaysRes.data.holidays);
      }

      if (attendanceRes.success && attendanceRes.records) {
        // Update pagination info
        if (attendanceRes.pagination) {
          setPagination(attendanceRes.pagination);
          setTotalRecords(attendanceRes.pagination.totalItems);
          setTotalPages(attendanceRes.pagination.totalPages);
        }

        // Enrich attendance records with staff info
        const enriched = attendanceRes.records.map((record: AttendanceRecord) => {
          const staff = staffRes.staff?.find((s: any) => s.id === record.user_id);
          const branch = branchesRes.branches?.find((b: Branch) => b.id === staff?.branch_id);
          return {
            ...record,
            staff_name: staff ? [staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(' ') : `User ${record.user_id}`,
            staff_email: staff?.email,
            department: staff?.department,
            branch_name: branch?.name
          };
        });
        setAttendanceRecords(enriched);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual attendance
  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createManualAttendance({
        date: manualForm.date,
        check_in_time: manualForm.check_in_time,
        check_out_time: manualForm.check_out_time,
        status: manualForm.status,
        location_coordinates: { longitude: 0, latitude: 0 },
        location_address: 'Manual entry',
      });

      if (response.success) {
        setSuccessMessage('Manual attendance recorded successfully');
        setShowManualAttendanceModal(false);
        resetManualForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to record attendance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setLoading(true);
    try {
      const response = await updateAttendanceRecord(selectedRecord.id, editForm);
      if (response.success) {
        setSuccessMessage('Attendance record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to update attendance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const resetManualForm = () => {
    setManualForm({
      user_id: 0,
      date: new Date().toISOString().split('T')[0],
      check_in_time: '09:00:00',
      check_out_time: '17:00:00',
      status: 'present',
      notes: '',
    });
  };

  const openEditModal = (record: AttendanceWithStaff) => {
    setSelectedRecord(record);
    setEditForm({
      status: record.status,
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
      notes: record.notes || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (record: AttendanceWithStaff) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  // Export to CSV
  const exportToCSV = (selectedOnly = false) => {
    const dataToExport = selectedOnly 
      ? filteredRecords.filter(r => selectedRecords.includes(r.id))
      : filteredRecords;

    const headers = ['Employee', 'Email', 'Date', 'Check-in', 'Check-out', 'Hours Worked', 'Status', 'Branch'];
    const rows = dataToExport.map(r => [
      r.staff_name || `User ${r.user_id}`,
      r.staff_email || '',
      new Date(r.date).toLocaleDateString(),
      r.check_in_time || '-',
      r.check_out_time || '-',
      r.actual_working_hours ? r.actual_working_hours.toFixed(2) : '-',
      r.status,
      r.branch_name || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View record details
  const openDetailsModal = (record: AttendanceWithStaff) => {
    setViewingRecord(record);
    setShowDetailsModal(true);
  };

  const handleDeleteAttendance = async () => {
    if (!selectedRecord) return;

    setDeleteLoading(true);
    try {
      const response = await deleteAttendanceRecord(selectedRecord.id);
      if (response.success) {
        setSuccessMessage('Attendance record deleted successfully');
        setShowDeleteModal(false);
        setSelectedRecord(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete attendance');
        setShowDeleteModal(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete attendance');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = searchTerm === '' ||
      record.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.staff_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedBranch || record.branch_name === branches.find(b => b.id === selectedBranch)?.name;

    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;

    const recordDate = new Date(record.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDateRange = recordDate >= startDate && recordDate <= endDate;

    return matchesSearch && matchesBranch && matchesStatus && matchesDateRange;
  });

  // Calculate statistics (using filteredRecords for client-side filtering)
  const displayedRecordsCount = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'present').length;
  const lateCount = filteredRecords.filter(r => r.status === 'late').length;
  const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
  const attendanceRate = displayedRecordsCount > 0 ? Math.round((presentCount / displayedRecordsCount) * 100) : 0;

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay, year, month };
  };

  const getAttendanceForDate = (day: number) => {
    const dateStr = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toISOString().split('T')[0];
    return filteredRecords.filter(r => r.date === dateStr);
  };

  const isHoliday = (day: number) => {
    const dateStr = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr);
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('list')}
          >
            <Filter className="w-4 h-4 mr-2" />
            List
          </button>
          <button
            className={`btn ${activeView === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowProcessModal(true)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Process Attendance
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowManualAttendanceModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </button>
          <button
            className="btn btn-outline"
            onClick={loadData}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedRecords.length > 0 && (
        <div className="card p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="checkbox"
                checked={selectedRecords.length === filteredRecords.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRecords(filteredRecords.map(r => r.id));
                  } else {
                    setSelectedRecords([]);
                  }
                }}
              />
              <span className="text-sm font-medium text-blue-900">
                {selectedRecords.length} record(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  // Export selected
                  exportToCSV(true);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setSelectedRecords([])}
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="card p-4">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Name, email, department..."
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
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="input w-full"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
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
                {Array.from(new Set(staffMembers.map(s => s.department).filter(Boolean))).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          {isMobile && (
            <div className="mt-4 flex gap-2">
              <button
                className="btn btn-sm btn-outline flex-1"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBranch('');
                  setSelectedStatus('all');
                  setSelectedDepartment('');
                }}
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Records</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalRecords}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Present</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{presentCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <Clock className="w-5 h-5" style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Late</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{lateCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <XCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Absent</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{absentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Rate Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Attendance Rate</h3>
            <p className="text-muted text-sm">Based on filtered records</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: attendanceRate >= 90 ? '#16a34a' : attendanceRate >= 70 ? '#ca8a04' : '#dc2626' }}>
                {attendanceRate}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                {attendanceRate >= 90 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : attendanceRate >= 70 ? (
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {attendanceRate >= 90 ? 'Excellent' : attendanceRate >= 70 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${attendanceRate}%`,
                backgroundColor: attendanceRate >= 90 ? '#16a34a' : attendanceRate >= 70 ? '#ca8a04' : '#dc2626'
              }}
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table min-w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell" style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecords(filteredRecords.map(r => r.id));
                      } else {
                        setSelectedRecords([]);
                      }
                    }}
                  />
                </th>
                <th className="table-header-cell whitespace-nowrap">Employee</th>
                <th className="table-header-cell whitespace-nowrap">Date</th>
                <th className="table-header-cell whitespace-nowrap">Check-in</th>
                <th className="table-header-cell whitespace-nowrap">Check-out</th>
                <th className="table-header-cell whitespace-nowrap">Hours Worked</th>
                <th className="table-header-cell whitespace-nowrap">Status</th>
                <th className="table-header-cell whitespace-nowrap">Branch</th>
                <th className="table-header-cell right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No attendance records found</p>
                    <p className="text-gray-400 text-sm">Adjust filters or add manual attendance</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecords([...selectedRecords, record.id]);
                          } else {
                            setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                          }
                        }}
                      />
                    </td>
                    <td className="table-cell">
                      <div>
                        <p style={{ fontWeight: 500 }}>{record.staff_name || `User ${record.user_id}`}</p>
                        <p className="text-xs text-muted">{record.staff_email}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm">{new Date(record.date).toLocaleDateString()}</span>
                    </td>
                    <td className="table-cell">
                      {record.check_in_time ? (
                        <span className="badge badge-secondary">{record.check_in_time.substring(0, 5)}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {record.check_out_time ? (
                        <span className="badge badge-secondary">{record.check_out_time.substring(0, 5)}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {record.actual_working_hours ? (
                        <span style={{ fontWeight: 500 }}>{record.actual_working_hours.toFixed(2)}h</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        record.status === 'present' ? 'badge-success' :
                        record.status === 'late' ? 'badge-warning' :
                        record.status === 'absent' ? 'badge-error' :
                        'badge-secondary'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm">{record.branch_name || '-'}</span>
                    </td>
                    <td className="table-cell right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailsModal(record)}
                          className="btn btn-sm btn-outline"
                          title="View details"
                        >
                          <Search className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => openEditModal(record)}
                          className="btn btn-sm btn-outline green"
                          title="Edit record"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(record)}
                          className="btn btn-sm btn-outline red"
                          title="Delete record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalRecords)}</span> of{' '}
                  <span className="font-medium">{totalRecords}</span> records
                </p>
                <select
                  className="input input-sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: 'auto', padding: '0.375rem 0.5rem' }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{ minWidth: '2.5rem' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendarView = () => {
    const { daysInMonth, startingDay, year, month } = getDaysInMonth(calendarDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-outline"
              onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
            >
              ← Previous
            </button>
            <h2 className="text-xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <button
              className="btn btn-outline"
              onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
            >
              Next →
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowManualAttendanceModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-medium text-sm bg-gray-50 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 min-h-[100px] bg-gray-50 border-r border-b last:border-r-0" />
            ))}
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAttendance = getAttendanceForDate(day);
              const holiday = isHoliday(day);
              const presentCount = dayAttendance.filter(a => a.status === 'present').length;
              const lateCount = dayAttendance.filter(a => a.status === 'late').length;
              const absentCount = dayAttendance.filter(a => a.status === 'absent').length;
              const isWeekend = [0, 6].includes(new Date(year, month, day).getDay());

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[100px] border-r border-b last:border-r-0 relative ${
                    holiday ? 'bg-red-50' : isWeekend ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{day}</div>
                    {holiday && (
                      <span className="text-xs text-red-600 font-medium" title={holiday.name}>
                        🎉 {holiday.name}
                      </span>
                    )}
                  </div>
                  {dayAttendance.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {presentCount > 0 && (
                        <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          ✓ {presentCount} present
                        </div>
                      )}
                      {lateCount > 0 && (
                        <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          ⚠ {lateCount} late
                        </div>
                      )}
                      {absentCount > 0 && (
                        <div className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                          ✗ {absentCount} absent
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="card p-4">
          <h4 className="font-medium mb-3">Legend</h4>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-sm">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded"></div>
              <span className="text-sm">Weekend</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Track and manage employee attendance records</p>
      </div> */}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* View Toggle and Filters */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveView('list')}
            >
              <Filter className="w-4 h-4 mr-2" />
              List View
            </button>
            <button
              className={`btn ${activeView === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveView('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </button>
          </div>
          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'list' ? renderListView() : renderCalendarView()}

      {/* Manual Attendance Modal */}
      {showManualAttendanceModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowManualAttendanceModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Manual Attendance Entry</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowManualAttendanceModal(false)}>×</button>
            </div>
            <form onSubmit={handleManualAttendance}>
              <div className="modal-content space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee *</label>
                  <select
                    className="input w-full"
                    value={manualForm.user_id || ''}
                    onChange={(e) => setManualForm({ ...manualForm, user_id: Number(e.target.value) })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={manualForm.check_in_time}
                      onChange={(e) => setManualForm({ ...manualForm, check_in_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={manualForm.check_out_time}
                      onChange={(e) => setManualForm({ ...manualForm, check_out_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    className="input w-full"
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={manualForm.notes}
                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    placeholder="Reason for manual entry..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowManualAttendanceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Attendance Modal */}
      {showEditModal && selectedRecord && (
        <>
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Edit Attendance Record</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateAttendance}>
              <div className="modal-content space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">{selectedRecord.staff_name}</p>
                  <p className="text-xs text-muted">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    className="input w-full"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={editForm.check_in_time}
                      onChange={(e) => setEditForm({ ...editForm, check_in_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={editForm.check_out_time}
                      onChange={(e) => setEditForm({ ...editForm, check_out_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Add notes..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecord && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal" style={{ maxWidth: '28rem' }}>
            <div className="modal-header">
              <h3>Delete Attendance Record</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Warning: This action cannot be undone</p>
                  <p className="text-xs text-red-700 mt-1">Are you sure you want to delete this attendance record?</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedRecord.staff_name}</p>
                <p className="text-xs text-muted">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted mt-1">Status: <span className="font-medium">{selectedRecord.status}</span></p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDeleteAttendance}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Record
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Process Attendance Modal */}
      <ProcessAttendanceModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onSuccess={loadData}
      />

      {/* View Record Details Modal */}
      {showDetailsModal && viewingRecord && (
        <>
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}></div>
          <div className="modal" style={{ maxWidth: '36rem' }}>
            <div className="modal-header">
              <h3>Attendance Record Details</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              {/* Employee Info Card */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    {viewingRecord.staff_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">{viewingRecord.staff_name || `User ${viewingRecord.user_id}`}</p>
                    <p className="text-sm text-blue-700">{viewingRecord.staff_email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-blue-600">Department:</span>
                    <span className="ml-2 font-medium">{viewingRecord.department || '-'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Branch:</span>
                    <span className="ml-2 font-medium">{viewingRecord.branch_name || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Date</p>
                  <p className="font-semibold">{new Date(viewingRecord.date).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <span className={`badge ${
                    viewingRecord.status === 'present' ? 'badge-success' :
                    viewingRecord.status === 'late' ? 'badge-warning' :
                    viewingRecord.status === 'absent' ? 'badge-error' :
                    'badge-secondary'
                  }`}>
                    {viewingRecord.status}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Check-in Time</p>
                  <p className="font-semibold">{viewingRecord.check_in_time ? viewingRecord.check_in_time.substring(0, 5) : '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Check-out Time</p>
                  <p className="font-semibold">{viewingRecord.check_out_time ? viewingRecord.check_out_time.substring(0, 5) : '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Hours Worked</p>
                  <p className="font-semibold">{viewingRecord.actual_working_hours ? `${viewingRecord.actual_working_hours.toFixed(2)}h` : '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Location Verified</p>
                  <p className="font-semibold">{viewingRecord.location_verified ? '✓ Yes' : '✗ No'}</p>
                </div>
              </div>

              {/* Location Info */}
              {(viewingRecord.location_coordinates || viewingRecord.location_address) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Location</p>
                  {viewingRecord.location_address && (
                    <p className="font-medium text-sm">{viewingRecord.location_address}</p>
                  )}
                  {viewingRecord.location_coordinates && (
                    <p className="text-xs text-gray-500 font-mono mt-1">{viewingRecord.location_coordinates}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              {viewingRecord.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Notes</p>
                  <p className="text-sm">{viewingRecord.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>Created: {new Date(viewingRecord.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(viewingRecord.updated_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(viewingRecord);
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Record
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceView;
