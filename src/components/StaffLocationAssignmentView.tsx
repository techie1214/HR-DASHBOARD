// StaffLocationAssignmentView.tsx
// Admin interface for managing staff location assignments
// Redesigned to match app design system with enhanced visuals

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Building,
  Search,
  Filter,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Map
} from 'lucide-react';
import { getAllStaff } from '../services/staffManagementService';
import { getAllAttendanceLocations, AttendanceLocation } from '../services/attendanceService';

interface StaffMember {
  user_id: number;
  employee_id?: string;
  full_name: string;
  email: string;
  branch_id?: number;
  department?: string;
  assigned_location_id?: number;
  location_name?: string;
  location_notes?: string;
  status: string;
}

const StaffLocationAssignmentView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [filterHasLocation, setFilterHasLocation] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Selection state
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [bulkLocationId, setBulkLocationId] = useState<number | ''>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Edit state
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    assigned_location_id: 0,
    location_notes: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [staffRes, locationsRes] = await Promise.all([
        getAllStaff(1, 1000),
        getAllAttendanceLocations()
      ]);

      if (staffRes.success && staffRes.staff) {
        setStaffMembers(staffRes.staff.map((s: any) => ({
          user_id: s.user_id,
          employee_id: s.employee_id,
          full_name: s.full_name,
          email: s.email,
          branch_id: s.branch_id,
          department: s.department,
          assigned_location_id: s.assigned_location_id,
          location_name: s.location_name,
          location_notes: s.location_notes,
          status: s.status
        })));
      }

      if (locationsRes.success && locationsRes.locations) {
        setLocations(locationsRes.locations);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter staff
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = searchTerm === '' ||
      staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedBranch || staff.branch_id === selectedBranch;

    const matchesLocationFilter = filterHasLocation === 'all' ||
      (filterHasLocation === 'assigned' && staff.assigned_location_id) ||
      (filterHasLocation === 'unassigned' && !staff.assigned_location_id);

    return matchesSearch && matchesBranch && matchesLocationFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / pageSize);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, filterHasLocation]);

  // Calculate statistics
  const totalStaff = staffMembers.length;
  const assignedCount = staffMembers.filter(s => s.assigned_location_id).length;
  const unassignedCount = totalStaff - assignedCount;
  const assignmentRate = totalStaff > 0 ? Math.round((assignedCount / totalStaff) * 100) : 0;

  // Handle individual assignment update
  const handleUpdateAssignment = async (userId: number) => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/staff-location-assignments/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Location assignment updated successfully');
        setEditingStaffId(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(result.message || 'Failed to update assignment');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (!bulkLocationId || selectedStaff.length === 0) {
      setError('Please select a location and staff members');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const assignments = selectedStaff.map(userId => ({
        user_id: userId,
        assigned_location_id: Number(bulkLocationId)
      }));

      const response = await fetch('/api/staff-location-assignments/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`Updated ${selectedStaff.length} staff member(s)`);
        setSelectedStaff([]);
        setBulkLocationId('');
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(result.message || 'Failed to update assignments');
      }
    } catch (err: any) {
      console.error('Bulk update error:', err);
      setError(err.message || 'Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  // Toggle staff selection
  const toggleStaffSelection = (userId: number) => {
    setSelectedStaff(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all visible staff
  const toggleSelectAll = () => {
    if (selectedStaff.length === paginatedStaff.length && paginatedStaff.length > 0) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(paginatedStaff.map(s => s.user_id));
    }
  };

  // Open edit modal
  const openEditModal = (staff: StaffMember) => {
    setEditingStaffId(staff.user_id);
    setEditForm({
      assigned_location_id: staff.assigned_location_id || 0,
      location_notes: staff.location_notes || ''
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingStaffId(null);
    setEditForm({ assigned_location_id: 0, location_notes: '' });
  };

  const rateColor = assignmentRate >= 80 ? '#10b981' : assignmentRate >= 50 ? '#f59e0b' : '#ef4444';
  const rateBg = assignmentRate >= 80 ? '#ecfdf5' : assignmentRate >= 50 ? '#fffbeb' : '#fef2f2';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .sla-wrap * {
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        .sla-wrap {
          --brand: #1e40af;
          --brand-light: #eff6ff;
          --brand-mid: #bfdbfe;
          --success: #10b981;
          --success-bg: #ecfdf5;
          --warn: #f59e0b;
          --warn-bg: #fffbeb;
          --danger: #ef4444;
          --danger-bg: #fef2f2;
          --surface: #ffffff;
          --surface-2: #f8fafc;
          --border: #e2e8f0;
          --border-strong: #cbd5e1;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --radius: 10px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
          --shadow: 0 4px 12px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04);
          background: var(--surface-2);
          padding: 2rem;
          min-height: 100vh;
        }

        /* ── Header ── */
        .sla-header {
          margin-bottom: 2rem;
        }
        .sla-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0 0 0.25rem;
        }
        .sla-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        /* ── Alerts ── */
        .sla-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius);
          border: 1px solid;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .sla-alert.success { background: var(--success-bg); border-color: #6ee7b7; color: #065f46; }
        .sla-alert.error   { background: var(--danger-bg);  border-color: #fca5a5; color: #7f1d1d; }
        .sla-alert svg { flex-shrink: 0; margin-top: 1px; }
        .sla-alert-close {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          opacity: 0.6;
          color: inherit;
          padding: 0;
        }
        .sla-alert-close:hover { opacity: 1; }

        /* ── Stat Cards ── */
        .sla-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 900px) { .sla-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .sla-stats { grid-template-columns: 1fr; } }

        .sla-stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.1rem 1.25rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .sla-stat-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-1px);
        }
        .sla-stat-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sla-stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.15rem;
        }
        .sla-stat-value {
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          font-family: 'DM Mono', monospace;
        }

        /* ── Toolbar ── */
        .sla-toolbar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        /* ── Buttons ── */
        .sla-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.9rem;
          border-radius: 7px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.15s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
        }
        .sla-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sla-btn-outline {
          background: var(--surface);
          border-color: var(--border-strong);
          color: var(--text-secondary);
        }
        .sla-btn-outline:hover:not(:disabled) {
          background: var(--surface-2);
          border-color: #94a3b8;
          color: var(--text-primary);
        }
        .sla-btn-primary {
          background: var(--brand);
          border-color: var(--brand);
          color: #fff;
        }
        .sla-btn-primary:hover:not(:disabled) {
          background: #1e3a8a;
          border-color: #1e3a8a;
        }
        .sla-btn-sm { padding: 0.35rem 0.7rem; font-size: 0.775rem; }
        .sla-btn-icon { padding: 0.35rem 0.45rem; }

        /* ── Panel (card) ── */
        .sla-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }

        /* ── Filter panel ── */
        .sla-filters {
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .sla-filters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 700px) { .sla-filters-grid { grid-template-columns: 1fr; } }

        .sla-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .sla-input-wrap { position: relative; }
        .sla-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .sla-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-strong);
          border-radius: 7px;
          font-size: 0.8125rem;
          color: var(--text-primary);
          background: var(--surface);
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
        }
        .sla-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(30,64,175,0.1);
        }
        .sla-input-has-icon { padding-left: 2.1rem; }
        .sla-input-sm { padding: 0.3rem 0.6rem; font-size: 0.775rem; }

        /* ── Bulk banner ── */
        .sla-bulk-banner {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          background: var(--brand-light);
          border: 1px solid var(--brand-mid);
          border-radius: var(--radius);
          margin-bottom: 1rem;
        }
        .sla-bulk-info { display: flex; align-items: center; gap: 0.75rem; }
        .sla-bulk-info-text strong {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--brand);
        }
        .sla-bulk-info-text span {
          font-size: 0.75rem;
          color: #3b5bdb;
          opacity: 0.8;
        }
        .sla-bulk-actions { display: flex; align-items: center; gap: 0.5rem; }

        /* ── Table ── */
        .sla-table-wrap { overflow-x: auto; }
        table.sla-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .sla-table thead th {
          padding: 0.65rem 1rem;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-muted);
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .sla-table thead th:first-child { border-radius: 10px 0 0 0; }
        .sla-table thead th:last-child  { border-radius: 0 10px 0 0; text-align: right; }

        .sla-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.1s;
        }
        .sla-table tbody tr:last-child { border-bottom: none; }
        .sla-table tbody tr:hover { background: #f8fafc; }
        .sla-table tbody tr.editing { background: var(--brand-light); }

        .sla-table td {
          padding: 0.8rem 1rem;
          color: var(--text-primary);
          vertical-align: middle;
        }
        .sla-table td:last-child { text-align: right; }

        /* Employee cell */
        .sla-emp-name { font-weight: 500; color: var(--text-primary); margin-bottom: 0.1rem; }
        .sla-emp-meta { font-size: 0.72rem; color: var(--text-muted); }

        /* Branch badge */
        .sla-branch-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /* Location badge */
        .sla-loc-assigned {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.28rem 0.65rem;
          background: var(--success-bg);
          border: 1px solid #a7f3d0;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 500;
          color: #065f46;
        }
        .sla-loc-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--success);
          flex-shrink: 0;
        }
        .sla-loc-unassigned {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Notes */
        .sla-notes-text { font-size: 0.75rem; color: var(--text-secondary); }
        .sla-notes-empty { font-size: 0.75rem; color: var(--text-muted); }

        /* Action buttons in table */
        .sla-row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.4rem; }

        /* Checkbox */
        .sla-checkbox {
          width: 1rem; height: 1rem;
          border-radius: 4px;
          border: 1.5px solid var(--border-strong);
          cursor: pointer;
          accent-color: var(--brand);
        }

        /* Empty state */
        .sla-empty {
          padding: 3rem 1rem;
          text-align: center;
          color: var(--text-muted);
        }
        .sla-empty-icon {
          width: 3rem; height: 3rem;
          margin: 0 auto 0.75rem;
          opacity: 0.35;
        }
        .sla-empty p:first-of-type { font-weight: 500; color: var(--text-secondary); margin: 0 0 0.25rem; }
        .sla-empty p:last-of-type  { font-size: 0.8125rem; margin: 0; }

        /* ── Pagination ── */
        .sla-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .sla-pagination-info { font-size: 0.8rem; color: var(--text-muted); }
        .sla-pagination-controls { display: flex; align-items: center; gap: 0.4rem; }
        .sla-page-btn {
          width: 2rem; height: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid var(--border-strong);
          background: var(--surface);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.13s;
          font-family: 'DM Mono', monospace;
        }
        .sla-page-btn:hover:not(:disabled) { background: var(--surface-2); color: var(--text-primary); border-color: #94a3b8; }
        .sla-page-btn.active { background: var(--brand); border-color: var(--brand); color: #fff; }
        .sla-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sla-page-text { padding: 0 0.3rem; font-size: 0.8rem; }

        /* ── Info box ── */
        .sla-info-box {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          padding: 1rem 1.25rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: var(--radius);
          margin-top: 1rem;
        }
        .sla-info-box h4 {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #92400e;
          margin: 0 0 0.5rem;
        }
        .sla-info-box ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .sla-info-box li {
          font-size: 0.78rem;
          color: #92400e;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          opacity: 0.9;
        }
        .sla-info-dot { color: #d97706; flex-shrink: 0; margin-top: 1px; }

        /* ── Spin ── */
        @keyframes sla-spin { to { transform: rotate(360deg); } }
        .sla-spin { animation: sla-spin 0.8s linear infinite; }

        /* ── Select arrow fix ── */
        .sla-select-wrap { position: relative; }
        .sla-select-wrap::after {
          content: '';
          position: absolute;
          right: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--text-muted);
          pointer-events: none;
        }
        .sla-input.sla-select { padding-right: 2rem; cursor: pointer; }
      `}</style>

      <div className="sla-wrap">
        {/* ── Header ── */}
        <div className="sla-header">
          <h1>Staff Location Assignments</h1>
          <p>Assign specific attendance locations to staff members for controlled check-in</p>
        </div>

        {/* ── Alerts ── */}
        {successMessage && (
          <div className="sla-alert success">
            <CheckCircle size={16} color="#10b981" />
            <span>{successMessage}</span>
            <button className="sla-alert-close" onClick={() => setSuccessMessage(null)}>×</button>
          </div>
        )}
        {error && (
          <div className="sla-alert error">
            <AlertCircle size={16} color="#ef4444" />
            <span>{error}</span>
            <button className="sla-alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="sla-stats">
          <div className="sla-stat-card">
            <div className="sla-stat-icon" style={{ background: '#eff6ff' }}>
              <Users size={18} color="#2563eb" />
            </div>
            <div>
              <div className="sla-stat-label">Total Staff</div>
              <div className="sla-stat-value">{totalStaff}</div>
            </div>
          </div>
          <div className="sla-stat-card">
            <div className="sla-stat-icon" style={{ background: '#ecfdf5' }}>
              <UserCheck size={18} color="#10b981" />
            </div>
            <div>
              <div className="sla-stat-label">Assigned</div>
              <div className="sla-stat-value">{assignedCount}</div>
            </div>
          </div>
          <div className="sla-stat-card">
            <div className="sla-stat-icon" style={{ background: '#fffbeb' }}>
              <MapPin size={18} color="#f59e0b" />
            </div>
            <div>
              <div className="sla-stat-label">Unassigned</div>
              <div className="sla-stat-value">{unassignedCount}</div>
            </div>
          </div>
          <div className="sla-stat-card">
            <div className="sla-stat-icon" style={{ background: rateBg }}>
              <Map size={18} color={rateColor} />
            </div>
            <div>
              <div className="sla-stat-label">Assignment Rate</div>
              <div className="sla-stat-value" style={{ color: rateColor }}>{assignmentRate}%</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="sla-toolbar">
          <button className="sla-btn sla-btn-outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button className="sla-btn sla-btn-outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'sla-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Filters ── */}
        {showFilters && (
          <div className="sla-panel sla-filters" style={{ marginBottom: '1rem' }}>
            <div className="sla-filters-grid">
              <div className="sla-field">
                <label>Search</label>
                <div className="sla-input-wrap">
                  <span className="sla-input-icon"><Search size={13} /></span>
                  <input
                    type="text"
                    className="sla-input sla-input-has-icon"
                    placeholder="Name, email, employee ID…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="sla-field">
                <label>Branch</label>
                <div className="sla-select-wrap">
                  <select
                    className="sla-input sla-select"
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">All Branches</option>
                    {Array.from(new Set(staffMembers.map(s => s.branch_id))).map(branchId => (
                      <option key={branchId} value={branchId}>Branch {branchId}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sla-field">
                <label>Location Status</label>
                <div className="sla-select-wrap">
                  <select
                    className="sla-input sla-select"
                    value={filterHasLocation}
                    onChange={e => setFilterHasLocation(e.target.value as any)}
                  >
                    <option value="all">All Staff</option>
                    <option value="assigned">Has Location Assigned</option>
                    <option value="unassigned">No Location Assigned</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk Banner ── */}
        {selectedStaff.length > 0 && (
          <div className="sla-bulk-banner">
            <div className="sla-bulk-info">
              <Users size={18} color="#1e40af" />
              <div className="sla-bulk-info-text">
                <strong>{selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} selected</strong>
                <span>Choose a location below and click "Assign to All"</span>
              </div>
            </div>
            <div className="sla-bulk-actions">
              <div className="sla-select-wrap">
                <select
                  className="sla-input sla-select sla-input-sm"
                  style={{ minWidth: '12rem' }}
                  value={bulkLocationId}
                  onChange={e => setBulkLocationId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <button
                className="sla-btn sla-btn-sm sla-btn-primary"
                onClick={handleBulkUpdate}
                disabled={saving || !bulkLocationId}
              >
                <Save size={13} />
                {saving ? 'Saving…' : 'Assign to All'}
              </button>
              <button className="sla-btn sla-btn-sm sla-btn-outline sla-btn-icon" onClick={() => setSelectedStaff([])}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="sla-panel">
          <div className="sla-table-wrap">
            <table className="sla-table">
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }}>
                    <input
                      type="checkbox"
                      className="sla-checkbox"
                      checked={selectedStaff.length === paginatedStaff.length && paginatedStaff.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Employee</th>
                  <th>Branch</th>
                  <th>Assigned Location</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.map(staff => (
                  <tr key={staff.user_id} className={editingStaffId === staff.user_id ? 'editing' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="sla-checkbox"
                        checked={selectedStaff.includes(staff.user_id)}
                        onChange={() => toggleStaffSelection(staff.user_id)}
                      />
                    </td>
                    <td>
                      <div className="sla-emp-name">{staff.full_name}</div>
                      <div className="sla-emp-meta">{staff.email}</div>
                      {staff.employee_id && <div className="sla-emp-meta">#{staff.employee_id}</div>}
                    </td>
                    <td>
                      <span className="sla-branch-badge">
                        <Building size={11} />
                        Branch {staff.branch_id}
                      </span>
                    </td>
                    <td>
                      {editingStaffId === staff.user_id ? (
                        <div className="sla-select-wrap">
                          <select
                            className="sla-input sla-select sla-input-sm"
                            style={{ minWidth: '11rem' }}
                            value={editForm.assigned_location_id}
                            onChange={e => setEditForm({ ...editForm, assigned_location_id: Number(e.target.value) })}
                          >
                            <option value="">No Location</option>
                            {locations.map(loc => (
                              <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : staff.assigned_location_id ? (
                        <span className="sla-loc-assigned">
                          <span className="sla-loc-dot" />
                          {staff.location_name || `Location ${staff.assigned_location_id}`}
                        </span>
                      ) : (
                        <span className="sla-loc-unassigned">Not assigned</span>
                      )}
                    </td>
                    <td>
                      {editingStaffId === staff.user_id ? (
                        <input
                          type="text"
                          className="sla-input sla-input-sm"
                          style={{ minWidth: '10rem' }}
                          value={editForm.location_notes}
                          onChange={e => setEditForm({ ...editForm, location_notes: e.target.value })}
                          placeholder="Add a note…"
                        />
                      ) : staff.location_notes ? (
                        <span className="sla-notes-text">{staff.location_notes}</span>
                      ) : (
                        <span className="sla-notes-empty">—</span>
                      )}
                    </td>
                    <td>
                      {editingStaffId === staff.user_id ? (
                        <div className="sla-row-actions">
                          <button
                            className="sla-btn sla-btn-sm sla-btn-primary"
                            onClick={() => handleUpdateAssignment(staff.user_id)}
                            disabled={saving}
                          >
                            <Save size={13} />
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button className="sla-btn sla-btn-sm sla-btn-outline sla-btn-icon" onClick={cancelEdit}>
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button className="sla-btn sla-btn-sm sla-btn-outline" onClick={() => openEditModal(staff)}>
                          <MapPin size={13} />
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedStaff.length === 0 && (
              <div className="sla-empty">
                <Users className="sla-empty-icon" />
                <p>No staff members found</p>
                <p>Adjust your filters or search criteria</p>
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="sla-pagination">
              <span className="sla-pagination-info">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length}
              </span>
              <div className="sla-pagination-controls">
                <div className="sla-select-wrap">
                  <select
                    className="sla-input sla-select sla-input-sm"
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ width: '7rem' }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>
                <button
                  className="sla-btn sla-btn-sm sla-btn-outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      className={`sla-page-btn${currentPage === pageNum ? ' active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="sla-btn sla-btn-sm sla-btn-outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Info Box ── */}
        <div className="sla-info-box">
          <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <h4>How Location Assignments Work</h4>
            <ul>
              <li>
                <span className="sla-info-dot">•</span>
                <span>Assigned staff can <strong>only</strong> check in at their assigned location when <strong>Strict Mode</strong> is enabled in Settings</span>
              </li>
              <li>
                <span className="sla-info-dot">•</span>
                <span>Staff without assignments use the branch-based legacy mode</span>
              </li>
              <li>
                <span className="sla-info-dot">•</span>
                <span>Use the bulk assign feature to quickly assign the same location to multiple staff</span>
              </li>
              <li>
                <span className="sla-info-dot">•</span>
                <span>Add notes to document why a staff member is assigned to a specific location</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffLocationAssignmentView;
