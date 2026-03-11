// src/components/HolidayDutyRosterView.tsx

import React, { useState, useEffect } from 'react';
import {
  holidayDutyRosterService,
  HolidayDutyRoster,
  CreateHolidayDutyRosterRequest
} from '../services/holidayDutyRosterService';
import { holidayService, Holiday } from '../services/holidayService';
import { getAllStaff } from '../services/staffManagementService';
import { useAuth } from '../AuthContext';
import { Calendar, Users, Clock, Plus, Edit3, Trash2, X, Loader2, UserCheck } from 'lucide-react';

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  department?: string;
  role?: string;
}

const HolidayDutyRosterView = () => {
  const { hasPermission } = useAuth();
  const [rosters, setRosters] = useState<HolidayDutyRoster[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRoster, setEditingRoster] = useState<HolidayDutyRoster | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<string>('');

  // Form states
  const [holidayId, setHolidayId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'night' | 'full_day'>('full_day');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch rosters when holiday filter changes
  useEffect(() => {
    if (selectedHoliday) {
      fetchRosters({ holidayId: parseInt(selectedHoliday) });
    } else {
      fetchRosters();
    }
  }, [selectedHoliday]);

  const fetchData = async () => {
    await Promise.all([
      fetchHolidays(),
      fetchStaff(),
      fetchRosters()
    ]);
  };

  const fetchHolidays = async () => {
    try {
      setLoadingHolidays(true);
      const response = await holidayService.getHolidays({});
      if (response.success && response.data) {
        setHolidays(response.data.holidays || []);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const response = await getAllStaff(1, 100);
      if (response.success && response.staff) {
        setStaff(response.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const fetchRosters = async (params?: { holidayId?: number }) => {
    try {
      setLoading(true);
      const response = await holidayDutyRosterService.getHolidayDutyRosters(params);
      if (response.success && response.data) {
        setRosters(response.data.rosters || []);
      }
    } catch (error) {
      console.error('Error fetching rosters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHolidayId('');
    setUserId('');
    setShiftType('full_day');
    setNotes('');
  };

  const handleCreateRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newRoster: CreateHolidayDutyRosterRequest = {
        holiday_id: parseInt(holidayId),
        user_id: parseInt(userId),
        shift_type: shiftType,
        notes: notes || null
      };

      const response = await holidayDutyRosterService.createHolidayDutyRoster(newRoster);

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        fetchRosters(selectedHoliday ? { holidayId: parseInt(selectedHoliday) } : undefined);
      } else {
        alert(response.message || 'Failed to create roster');
      }
    } catch (err: any) {
      console.error('Error creating roster:', err);
      alert(err.response?.data?.message || 'Failed to create roster');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRoster) return;
    
    setSubmitting(true);

    try {
      const updateData = {
        holiday_id: holidayId ? parseInt(holidayId) : undefined,
        user_id: userId ? parseInt(userId) : undefined,
        shift_type: shiftType,
        notes: notes || null
      };

      const response = await holidayDutyRosterService.updateHolidayDutyRoster(editingRoster.id, updateData);

      if (response.success) {
        setShowEditForm(false);
        setEditingRoster(null);
        resetForm();
        fetchRosters(selectedHoliday ? { holidayId: parseInt(selectedHoliday) } : undefined);
      } else {
        alert(response.message || 'Failed to update roster');
      }
    } catch (err: any) {
      console.error('Error updating roster:', err);
      alert(err.response?.data?.message || 'Failed to update roster');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoster = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this staff member from the duty roster?')) {
      try {
        const response = await holidayDutyRosterService.deleteHolidayDutyRoster(id);

        if (response.success) {
          fetchRosters(selectedHoliday ? { holidayId: parseInt(selectedHoliday) } : undefined);
        } else {
          alert(response.message || 'Failed to delete roster');
        }
      } catch (err: any) {
        console.error('Error deleting roster:', err);
        alert(err.response?.data?.message || 'Failed to delete roster');
      }
    }
  };

  const startEditing = (roster: HolidayDutyRoster) => {
    setEditingRoster(roster);
    setHolidayId(roster.holiday_id.toString());
    setUserId(roster.user_id.toString());
    setShiftType(roster.shift_type);
    setNotes(roster.notes || '');
    setShowEditForm(true);
  };

  const getStaffName = (userId: number) => {
    const staffMember = staff.find(s => s.id === userId);
    if (staffMember) {
      return `${staffMember.firstName} ${staffMember.lastName}`;
    }
    return roster => roster.user_name || `User ${userId}`;
  };

  const getHolidayName = (holidayId: number) => {
    const holiday = holidays.find(h => h.id === holidayId);
    if (holiday) {
      return holiday.holiday_name;
    }
    return `Holiday ${holidayId}`;
  };

  const getShiftTypeBadge = (shiftType: string) => {
    const badges = {
      morning: { class: 'badge bg-blue-100 text-blue-700', label: '🌅 Morning' },
      afternoon: { class: 'badge bg-orange-100 text-orange-700', label: '☀️ Afternoon' },
      night: { class: 'badge bg-purple-100 text-purple-700', label: '🌙 Night' },
      full_day: { class: 'badge bg-green-100 text-green-700', label: '📅 Full Day' }
    };
    return badges[shiftType as keyof typeof badges] || badges.full_day;
  };

  if (!hasPermission('holiday-duty-roster:read')) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <UserCheck className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Access Denied</h3>
            <p className="text-muted">You don't have permission to view holiday duty rosters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Holiday Duty Roster</h1>
          <p className="text-secondary">Assign staff to work during holidays</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          disabled={loadingHolidays || loadingStaff}
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Assignments</p>
              <h3 className="text-2xl font-bold text-primary mt-1">{rosters.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Holidays with Roster</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {new Set(rosters.map(r => r.holiday_id)).size}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Staff on Duty</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {new Set(rosters.map(r => r.user_id)).size}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-secondary">Filter by Holiday:</label>
          <select
            className="input input-sm w-64"
            value={selectedHoliday}
            onChange={(e) => setSelectedHoliday(e.target.value)}
            disabled={loadingHolidays}
          >
            <option value="">All Holidays</option>
            {holidays.map(holiday => (
              <option key={holiday.id} value={holiday.id}>
                {holiday.holiday_name} ({new Date(holiday.date).toLocaleDateString()})
              </option>
            ))}
          </select>
          {selectedHoliday && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedHoliday('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="card">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-primary">Duty Assignments</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">Staff Member</th>
                <th className="table-header-cell">Holiday</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Shift Type</th>
                <th className="table-header-cell">Notes</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-muted">Loading rosters...</p>
                  </td>
                </tr>
              ) : rosters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">
                      {selectedHoliday 
                        ? 'No staff assigned to this holiday yet.'
                        : 'No duty rosters found. Assign staff to holidays to get started.'}
                    </p>
                  </td>
                </tr>
              ) : (
                rosters.map((roster) => {
                  const holiday = holidays.find(h => h.id === roster.holiday_id);
                  const staffMember = staff.find(s => s.id === roster.user_id);
                  const shiftBadge = getShiftTypeBadge(roster.shift_type);

                  return (
                    <tr key={roster.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                              <span className="text-xs font-medium">
                                {staffMember 
                                  ? `${staffMember.firstName[0]}${staffMember.lastName[0]}`
                                  : 'U'}
                            </span>
                          </div>
                          </div>
                          <div>
                            <div className="font-medium text-primary">
                              {staffMember 
                                ? `${staffMember.firstName} ${staffMember.lastName}`
                                : roster.user_name || `User ${roster.user_id}`}
                            </div>
                            <div className="text-xs text-muted">
                              {staffMember?.email || roster.user_email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="font-medium">
                          {holiday?.holiday_name || `Holiday ${roster.holiday_id}`}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-secondary">
                          {holiday 
                            ? new Date(holiday.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '—'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge badge-sm ${shiftBadge.class}`}>
                          {shiftBadge.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-secondary max-w-[200px] truncate block">
                          {roster.notes || '—'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-end gap-2">
                          {hasPermission('holiday-duty-roster:update') && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => startEditing(roster)}
                              title="Edit assignment"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('holiday-duty-roster:delete') && (
                            <button
                              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              onClick={() => handleDeleteRoster(roster.id)}
                              title="Remove assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-sm text-muted">
            Showing {rosters.length} assignment{rosters.length !== 1 ? 's' : ''}
            {selectedHoliday && ` for ${getHolidayName(parseInt(selectedHoliday))}`}
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Assign Staff to Holiday</h2>
              <button 
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoster} className="space-y-4">
              <div>
                <label className="label" htmlFor="create-holiday">
                  <span className="label-text">Holiday</span>
                  <span className="label-text text-error">*</span>
                </label>
                <select
                  id="create-holiday"
                  className="input"
                  value={holidayId}
                  onChange={(e) => setHolidayId(e.target.value)}
                  required
                  disabled={submitting || loadingHolidays}
                >
                  <option value="">Select Holiday</option>
                  {holidays.map(holiday => (
                    <option key={holiday.id} value={holiday.id}>
                      {holiday.holiday_name} ({new Date(holiday.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="create-staff">
                  <span className="label-text">Staff Member</span>
                  <span className="label-text text-error">*</span>
                </label>
                <select
                  id="create-staff"
                  className="input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  disabled={submitting || loadingStaff}
                >
                  <option value="">Select Staff</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} - {member.department || 'No department'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Shift Type</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="shiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'morning'}
                      onChange={() => setShiftType('morning')}
                      disabled={submitting}
                    />
                    <span className="text-sm">🌅 Morning</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="shiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'afternoon'}
                      onChange={() => setShiftType('afternoon')}
                      disabled={submitting}
                    />
                    <span className="text-sm">☀️ Afternoon</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="shiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'night'}
                      onChange={() => setShiftType('night')}
                      disabled={submitting}
                    />
                    <span className="text-sm">🌙 Night</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="shiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'full_day'}
                      onChange={() => setShiftType('full_day')}
                      disabled={submitting}
                    />
                    <span className="text-sm">📅 Full Day</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="create-notes">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  id="create-notes"
                  className="input min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this assignment"
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreateForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {submitting ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && editingRoster && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Duty Assignment</h2>
              <button 
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setShowEditForm(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoster} className="space-y-4">
              <div>
                <label className="label" htmlFor="edit-holiday">
                  <span className="label-text">Holiday</span>
                </label>
                <select
                  id="edit-holiday"
                  className="input"
                  value={holidayId}
                  onChange={(e) => setHolidayId(e.target.value)}
                  disabled={submitting || loadingHolidays}
                >
                  <option value="">Select Holiday</option>
                  {holidays.map(holiday => (
                    <option key={holiday.id} value={holiday.id}>
                      {holiday.holiday_name} ({new Date(holiday.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="edit-staff">
                  <span className="label-text">Staff Member</span>
                </label>
                <select
                  id="edit-staff"
                  className="input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={submitting || loadingStaff}
                >
                  <option value="">Select Staff</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} - {member.department || 'No department'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Shift Type</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="editShiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'morning'}
                      onChange={() => setShiftType('morning')}
                      disabled={submitting}
                    />
                    <span className="text-sm">🌅 Morning</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="editShiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'afternoon'}
                      onChange={() => setShiftType('afternoon')}
                      disabled={submitting}
                    />
                    <span className="text-sm">☀️ Afternoon</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="editShiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'night'}
                      onChange={() => setShiftType('night')}
                      disabled={submitting}
                    />
                    <span className="text-sm">🌙 Night</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="radio"
                      name="editShiftType"
                      className="radio radio-primary"
                      checked={shiftType === 'full_day'}
                      onChange={() => setShiftType('full_day')}
                      disabled={submitting}
                    />
                    <span className="text-sm">📅 Full Day</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="edit-notes">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  id="edit-notes"
                  className="input min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this assignment"
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowEditForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {submitting ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayDutyRosterView;
