// src/components/HolidayDutyRosterView.tsx
// Redesigned according to design system

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

  useEffect(() => {
    fetchData();
  }, []);

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
        fetchRosters();
      }
    } catch (error) {
      console.error('Error creating roster:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setHolidayId('');
    setUserId('');
    setShiftType('full_day');
    setNotes('');
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case 'morning': return 'Morning Shift';
      case 'afternoon': return 'Afternoon Shift';
      case 'night': return 'Night Shift';
      case 'full_day': return 'Full Day';
      default: return shift;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .hdr-wrap * {
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        .hdr-wrap {
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

        .hdr-header {
          margin-bottom: 2rem;
        }
        .hdr-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0 0 0.25rem;
        }
        .hdr-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .hdr-btn {
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
        }
        .hdr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .hdr-btn-outline {
          background: var(--surface);
          border-color: var(--border-strong);
          color: var(--text-secondary);
        }
        .hdr-btn-outline:hover:not(:disabled) {
          background: var(--surface-2);
          border-color: #94a3b8;
          color: var(--text-primary);
        }
        .hdr-btn-primary {
          background: var(--brand);
          border-color: var(--brand);
          color: #fff;
        }
        .hdr-btn-primary:hover:not(:disabled) {
          background: #1e3a8a;
          border-color: #1e3a8a;
        }
        .hdr-btn-sm { padding: 0.35rem 0.7rem; font-size: 0.775rem; }

        .hdr-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .hdr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        .hdr-modal {
          background: var(--surface);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 32rem;
          max-height: 90vh;
          overflow-y: auto;
        }
        .hdr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .hdr-modal-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .hdr-modal-body {
          padding: 1.5rem;
        }
        .hdr-modal-footer {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .hdr-field {
          margin-bottom: 1.25rem;
        }
        .hdr-field:last-child {
          margin-bottom: 0;
        }
        .hdr-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .hdr-input, .hdr-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-strong);
          border-radius: 7px;
          font-size: 0.8125rem;
          color: var(--text-primary);
          background: var(--surface);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
        }
        .hdr-input:focus, .hdr-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(30,64,175,0.1);
        }
        .hdr-select-wrap {
          position: relative;
        }
        .hdr-select-wrap::after {
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
        .hdr-textarea {
          min-height: 6rem;
          resize: vertical;
        }

        .hdr-table {
          width: 100%;
          border-collapse: collapse;
        }
        .hdr-table thead th {
          padding: 0.65rem 1rem;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-muted);
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
        }
        .hdr-table tbody tr {
          border-bottom: 1px solid var(--border);
        }
        .hdr-table tbody tr:hover {
          background: var(--surface-2);
        }
        .hdr-table td {
          padding: 0.8rem 1rem;
          color: var(--text-primary);
          vertical-align: middle;
        }

        .hdr-badge {
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

        .hdr-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
        }
        .hdr-empty-icon {
          width: 3rem;
          height: 3rem;
          margin: 0 auto 0.75rem;
          opacity: 0.35;
        }
      `}</style>

      <div className="hdr-wrap">
        <div className="hdr-header">
          <h1>Holiday Duty Roster</h1>
          <p>Assign staff to work during holidays</p>
        </div>

        {/* Filter Panel */}
        <div className="hdr-panel">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="hdr-select-wrap" style={{ minWidth: '200px' }}>
              <select
                className="hdr-select"
                value={selectedHoliday}
                onChange={e => setSelectedHoliday(e.target.value)}
              >
                <option value="">All Holidays</option>
                {holidays.map(holiday => (
                  <option key={holiday.id} value={holiday.id}>
                    {holiday.holiday_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="hdr-btn hdr-btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={16} />
              Assign Staff
            </button>
          </div>
        </div>

        {/* Rosters Table */}
        <div className="hdr-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ marginLeft: '0.5rem' }}>Loading...</span>
            </div>
          ) : rosters.length > 0 ? (
            <table className="hdr-table">
              <thead>
                <tr>
                  <th>Holiday</th>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Shift Type</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rosters.map(roster => {
                  const staffMember = staff.find(s => s.id === roster.user_id);
                  const holiday = holidays.find(h => h.id === roster.holiday_id);
                  return (
                    <tr key={roster.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{holiday?.holiday_name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {holiday ? new Date(holiday.date).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {staffMember?.email || ''}
                        </div>
                      </td>
                      <td>
                        <span className="hdr-badge">
                          {staffMember?.department || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span className="hdr-badge">
                          <Clock size={12} />
                          {getShiftLabel(roster.shift_type)}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {roster.notes || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="hdr-btn hdr-btn-outline hdr-btn-sm"
                          onClick={() => {
                            setEditingRoster(roster);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit3 size={13} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="hdr-empty">
              <Users className="hdr-empty-icon" />
              <p style={{ fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>
                No Duty Rosters Yet
              </p>
              <p style={{ fontSize: '0.8125rem', margin: 0 }}>
                Assign staff to work during holidays
              </p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateForm && (
          <div className="hdr-modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="hdr-modal" onClick={e => e.stopPropagation()}>
              <div className="hdr-modal-header">
                <h3>Assign Staff to Holiday</h3>
                <button
                  className="hdr-btn hdr-btn-outline hdr-btn-sm"
                  onClick={() => setShowCreateForm(false)}
                  style={{ width: '2rem', height: '2rem', padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreateRoster}>
                <div className="hdr-modal-body">
                  <div className="hdr-field">
                    <label htmlFor="holiday">Holiday *</label>
                    <div className="hdr-select-wrap">
                      <select
                        id="holiday"
                        className="hdr-select"
                        value={holidayId}
                        onChange={e => setHolidayId(e.target.value)}
                        required
                      >
                        <option value="">Select a holiday</option>
                        {holidays.map(holiday => (
                          <option key={holiday.id} value={holiday.id}>
                            {holiday.holiday_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="hdr-field">
                    <label htmlFor="staff">Staff Member *</label>
                    <div className="hdr-select-wrap">
                      <select
                        id="staff"
                        className="hdr-select"
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        required
                      >
                        <option value="">Select staff member</option>
                        {staff.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="hdr-field">
                    <label htmlFor="shift">Shift Type *</label>
                    <div className="hdr-select-wrap">
                      <select
                        id="shift"
                        className="hdr-select"
                        value={shiftType}
                        onChange={e => setShiftType(e.target.value as any)}
                        required
                      >
                        <option value="full_day">Full Day</option>
                        <option value="morning">Morning Shift</option>
                        <option value="afternoon">Afternoon Shift</option>
                        <option value="night">Night Shift</option>
                      </select>
                    </div>
                  </div>

                  <div className="hdr-field">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      className="hdr-input hdr-textarea"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
                <div className="hdr-modal-footer">
                  <button
                    type="button"
                    className="hdr-btn hdr-btn-outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="hdr-btn hdr-btn-primary"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Assign Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HolidayDutyRosterView;
