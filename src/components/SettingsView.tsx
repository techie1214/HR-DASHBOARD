// src/components/SettingsView.tsx
// Simplified Settings - Only features with backend implementation

import React, { useState, useEffect } from 'react';
import {
  getBranchAttendanceSettings,
  updateBranchAttendanceSettings,
} from '../services/attendanceSettingsService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import {
  Settings, Clock, Save, AlertCircle, MapPin, Timer
} from 'lucide-react';

// Design tokens
const colors = {
  primary: '#1e40af',
  primaryPale: '#eff6ff',
  primaryBorder: '#bfdbfe',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  surfaceMuted: '#f1f5f9',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  success: '#059669',
  successPale: '#ecfdf5',
  successBorder: '#a7f3d0',
  danger: '#dc2626',
  dangerPale: '#fef2f2',
  dangerBorder: '#fecaca',
};

const card: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  background: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontFamily: 'inherit',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: `1.5px solid ${colors.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: colors.textPrimary,
  background: colors.surface,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: '0.4rem',
};

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'working-days' | 'auto-mark'>('attendance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branchSettingsLoading, setBranchSettingsLoading] = useState(false);

  // Branch settings
  const [branchForm, setBranchForm] = useState({
    attendance_mode: 'branch_based' as 'branch_based' | 'multiple_locations' | 'flexible',
    grace_period_minutes: 0,
    auto_checkout_enabled: false,
    auto_checkout_minutes_after_close: 30,
    enable_location_verification: false,
    allow_manual_attendance_entry: true,
    auto_mark_absent_enabled: true,
    auto_mark_absent_time: '12:00',
    auto_mark_absent_timezone: 'Africa/Nairobi',
  });

  // Working days state
  const [workingDaysLoading, setWorkingDaysLoading] = useState(false);
  const [workingDays, setWorkingDays] = useState<any[]>([
    { day_of_week: 'monday', is_working_day: true, start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'tuesday', is_working_day: true, start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'wednesday', is_working_day: true, start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'thursday', is_working_day: true, start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'friday', is_working_day: true, start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'saturday', is_working_day: false, start_time: '', end_time: '', break_duration_minutes: 0 },
    { day_of_week: 'sunday', is_working_day: false, start_time: '', end_time: '', break_duration_minutes: 0 },
  ]);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      loadBranchSettings(Number(selectedBranchId));
    }
  }, [selectedBranchId]);

  const loadBranches = async () => {
    try {
      const response = await getAllBranches();
      if (response.success && response.branches) {
        setBranches(response.branches);
        if (response.branches.length > 0 && !selectedBranchId) {
          setSelectedBranchId(String(response.branches[0].id));
        }
      }
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  const loadBranchSettings = async (branchId: number) => {
    setBranchSettingsLoading(true);
    try {
      if (!branchId) {
        console.warn('No branch ID provided');
        return;
      }
      const response = await getBranchAttendanceSettings(branchId);
      if (response.success && response.settings) {
        const s = response.settings;
        setBranchForm({
          attendance_mode: s.attendance_mode || 'branch_based',
          grace_period_minutes: s.grace_period_minutes || 0,
          auto_checkout_enabled: s.auto_checkout_enabled || false,
          auto_checkout_minutes_after_close: s.auto_checkout_minutes_after_close || 30,
          enable_location_verification: s.enable_location_verification || false,
          allow_manual_attendance_entry: s.allow_manual_attendance_entry || true,
          auto_mark_absent_enabled: s.auto_mark_absent_enabled ?? true,
          auto_mark_absent_time: s.auto_mark_absent_time || '12:00',
          auto_mark_absent_timezone: s.auto_mark_absent_timezone || 'Africa/Nairobi',
        });
      } else if (response.message && response.message.includes('Branch ID')) {
        console.warn('Invalid branch ID for attendance settings');
      }
    } catch (err) {
      console.error('Error loading branch settings:', err);
      // Don't show error for 400 - just use defaults
    } finally {
      setBranchSettingsLoading(false);
    }
  };

  const handleSaveBranchSettings = async () => {
    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await updateBranchAttendanceSettings({
        branchId: Number(selectedBranchId),
        settings: branchForm,
      });

      if (response.success) {
        setSuccessMessage('Settings saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: colors.surfaceMuted, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary }}>Settings</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: colors.textMuted }}>
          Configure attendance and auto-mark settings
        </p>
      </div>

      {/* Info Box */}
      <div style={{ ...card, padding: '1rem', marginBottom: '1.5rem', background: colors.primaryPale, border: `1px solid ${colors.primaryBorder}` }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={20} color={colors.primary} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textPrimary, fontWeight: 600 }}>Working Days Configuration</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.5 }}>
              Working days are determined by each branch's configuration. To set working days for a branch, the system uses the branch_working_days table.
              Weekends are NOT automatically non-working days - each day must be explicitly configured.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            ...btnPrimary,
            background: activeTab === 'attendance' ? colors.primary : colors.surface,
            color: activeTab === 'attendance' ? '#fff' : colors.textSecondary,
            border: `1px solid ${activeTab === 'attendance' ? colors.primary : colors.border}`,
          }}
        >
          <Settings size={16} />
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('working-days')}
          style={{
            ...btnPrimary,
            background: activeTab === 'working-days' ? colors.primary : colors.surface,
            color: activeTab === 'working-days' ? '#fff' : colors.textSecondary,
            border: `1px solid ${activeTab === 'working-days' ? colors.primary : colors.border}`,
          }}
        >
          <Clock size={16} />
          Working Days
        </button>
        <button
          onClick={() => setActiveTab('auto-mark')}
          style={{
            ...btnPrimary,
            background: activeTab === 'auto-mark' ? colors.primary : colors.surface,
            color: activeTab === 'auto-mark' ? '#fff' : colors.textSecondary,
            border: `1px solid ${activeTab === 'auto-mark' ? colors.primary : colors.border}`,
          }}
        >
          <Clock size={16} />
          Auto-Mark
        </button>
      </div>

      {/* Working Days Tab Content */}
      {activeTab === 'working-days' && (
        <WorkingDaysTab
          selectedBranchId={selectedBranchId}
          branches={branches}
          workingDays={workingDays}
          setWorkingDays={setWorkingDays}
          workingDaysLoading={workingDaysLoading}
          setWorkingDaysLoading={setWorkingDaysLoading}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {/* Content */}
      {activeTab === 'attendance' && (
        <div style={card}>
          <div style={{ padding: '1.25rem', borderBottom: `1px solid ${colors.border}` }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>Attendance Settings</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Configure attendance tracking for your branch</p>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {/* Branch Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Select Branch</label>
              <select
                style={inputStyle}
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={branchSettingsLoading}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Attendance Mode */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Attendance Mode</label>
              <select
                style={inputStyle}
                value={branchForm.attendance_mode}
                onChange={(e) => setBranchForm({ ...branchForm, attendance_mode: e.target.value as any })}
              >
                <option value="branch_based">Branch Based</option>
                <option value="multiple_locations">Multiple Locations</option>
                <option value="flexible">Flexible</option>
              </select>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
                Determines how attendance is tracked (location-based or flexible)
              </p>
            </div>

            {/* Grace Period */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Grace Period (minutes)</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={branchForm.grace_period_minutes}
                onChange={(e) => setBranchForm({ ...branchForm, grace_period_minutes: parseInt(e.target.value) || 0 })}
              />
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
                Minutes allowed for late clock-in before being marked late
              </p>
            </div>

            {/* Auto Checkout */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={branchForm.auto_checkout_enabled}
                  onChange={(e) => setBranchForm({ ...branchForm, auto_checkout_enabled: e.target.checked })}
                />
                Enable Auto Checkout
              </label>
              {branchForm.auto_checkout_enabled && (
                <div style={{ marginTop: '0.75rem', marginLeft: '1.5rem' }}>
                  <label style={labelStyle}>Auto checkout after (minutes)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={branchForm.auto_checkout_minutes_after_close}
                    onChange={(e) => setBranchForm({ ...branchForm, auto_checkout_minutes_after_close: parseInt(e.target.value) || 30 })}
                  />
                </div>
              )}
            </div>

            {/* Location Verification */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} />
                <input
                  type="checkbox"
                  checked={branchForm.enable_location_verification}
                  onChange={(e) => setBranchForm({ ...branchForm, enable_location_verification: e.target.checked })}
                />
                Enable Location Verification
              </label>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
                Require GPS location verification for attendance
              </p>
            </div>

            {/* Manual Attendance */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={branchForm.allow_manual_attendance_entry}
                  onChange={(e) => setBranchForm({ ...branchForm, allow_manual_attendance_entry: e.target.checked })}
                />
                Allow Manual Attendance Entry
              </label>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
                Allow HR to manually enter attendance records
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div style={{ padding: '0.75rem', background: colors.dangerPale, border: `1px solid ${colors.dangerBorder}`, borderRadius: '8px', color: colors.danger, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{ padding: '0.75rem', background: colors.successPale, border: `1px solid ${colors.successBorder}`, borderRadius: '8px', color: colors.success, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {successMessage}
              </div>
            )}

            {/* Save Button */}
            <button
              style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}
              onClick={handleSaveBranchSettings}
              disabled={loading || branchSettingsLoading}
            >
              {loading ? (
                <>
                  <Timer size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'auto-mark' && (
        <div style={card}>
          <div style={{ padding: '1.25rem', borderBottom: `1px solid ${colors.border}` }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>Auto-Mark Absent Settings</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Configure automatic absent marking</p>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {/* Branch Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Select Branch</label>
              <select
                style={inputStyle}
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={branchSettingsLoading}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Enable Auto-Mark */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={branchForm.auto_mark_absent_enabled}
                  onChange={(e) => setBranchForm({ ...branchForm, auto_mark_absent_enabled: e.target.checked })}
                />
                Enable Auto-Mark Absent
              </label>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
                Automatically mark employees as absent if they don't clock in by the specified time
              </p>
            </div>

            {/* Auto-Mark Time */}
            {branchForm.auto_mark_absent_enabled && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Auto-Mark Time</label>
                  <input
                    style={inputStyle}
                    type="time"
                    value={branchForm.auto_mark_absent_time}
                    onChange={(e) => setBranchForm({ ...branchForm, auto_mark_absent_time: e.target.value })}
                  />
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
                    Time at which employees will be marked absent (e.g., 12:00 = noon)
                  </p>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Timezone</label>
                  <select
                    style={inputStyle}
                    value={branchForm.auto_mark_absent_timezone}
                    onChange={(e) => setBranchForm({ ...branchForm, auto_mark_absent_timezone: e.target.value })}
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  </select>
                </div>
              </>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div style={{ padding: '0.75rem', background: colors.dangerPale, border: `1px solid ${colors.dangerBorder}`, borderRadius: '8px', color: colors.danger, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{ padding: '0.75rem', background: colors.successPale, border: `1px solid ${colors.successBorder}`, borderRadius: '8px', color: colors.success, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {successMessage}
              </div>
            )}

            {/* Save Button */}
            <button
              style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}
              onClick={handleSaveBranchSettings}
              disabled={loading || branchSettingsLoading}
            >
              {loading ? (
                <>
                  <Timer size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Working Days Tab Component
const WorkingDaysTab = ({
  selectedBranchId,
  branches,
  workingDays,
  setWorkingDays,
  workingDaysLoading,
  setWorkingDaysLoading,
  setError,
  setSuccessMessage,
}: any) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load working days when branch changes
  useEffect(() => {
    if (selectedBranchId) {
      loadWorkingDays();
    }
  }, [selectedBranchId]);

  const loadWorkingDays = async () => {
    setWorkingDaysLoading(true);
    setLocalError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }
      const response = await fetch(`http://localhost:3000/api/branches/${selectedBranchId}/working-days`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load working days');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.workingDays) {
        // Map API response to our state
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const loadedDays = days.map(day => {
          const apiDay = data.data.workingDays.find((d: any) => d.day_of_week === day);
          return apiDay || {
            day_of_week: day,
            is_working_day: day !== 'saturday' && day !== 'sunday',
            start_time: '08:00',
            end_time: '17:00',
            break_duration_minutes: 30,
          };
        });
        setWorkingDays(loadedDays);
      }
    } catch (err: any) {
      console.error('Error loading working days:', err);
      setLocalError(err.message || 'Failed to load working days');
      setError(err.message || 'Failed to load working days');
    } finally {
      setWorkingDaysLoading(false);
    }
  };

  const handleSaveWorkingDays = async () => {
    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/branches/${selectedBranchId}/working-days`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workingDays: workingDays.map((d: any) => ({
            day_of_week: d.day_of_week,
            is_working_day: d.is_working_day,
            start_time: d.is_working_day ? d.start_time : null,
            end_time: d.is_working_day ? d.end_time : null,
            break_duration_minutes: d.break_duration_minutes,
          }))
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Working days saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to save working days');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingDay = (index: number, field: string, value: any) => {
    const updated = [...workingDays];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingDays(updated);
  };

  return (
    <div style={card}>
      <div style={{ padding: '1.25rem', borderBottom: `1px solid ${colors.border}` }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>Branch Working Days</h3>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Configure which days your branch operates</p>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Branch Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Select Branch</label>
          <select
            style={inputStyle}
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            disabled={workingDaysLoading}
          >
            {branches.map((branch: any) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        {/* Working Days List */}
        {workingDaysLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {workingDays.map((day: any, idx: number) => (
              <div
                key={day.day_of_week}
                style={{
                  padding: '1rem',
                  background: day.is_working_day ? colors.surface : colors.surfaceMuted,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  opacity: day.is_working_day ? 1 : 0.7,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Day Name */}
                  <div style={{ minWidth: '100px', fontWeight: 600, color: colors.textPrimary, textTransform: 'capitalize' }}>
                    {day.day_of_week}
                  </div>

                  {/* Working Day Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={day.is_working_day}
                      onChange={(e) => updateWorkingDay(idx, 'is_working_day', e.target.checked)}
                    />
                    <span style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Working Day</span>
                  </label>

                  {/* Time Inputs (only if working day) */}
                  {day.is_working_day && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="time"
                          value={day.start_time || '08:00'}
                          onChange={(e) => updateWorkingDay(idx, 'start_time', e.target.value)}
                          style={{ ...inputStyle, width: '120px' }}
                        />
                        <span style={{ color: colors.textMuted }}>to</span>
                        <input
                          type="time"
                          value={day.end_time || '17:00'}
                          onChange={(e) => updateWorkingDay(idx, 'end_time', e.target.value)}
                          style={{ ...inputStyle, width: '120px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', color: colors.textMuted }}>Break:</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={day.break_duration_minutes || 30}
                          onChange={(e) => updateWorkingDay(idx, 'break_duration_minutes', parseInt(e.target.value) || 0)}
                          style={{ ...inputStyle, width: '60px' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>min</span>
                      </div>
                    </>
                  )}

                  {!day.is_working_day && (
                    <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontStyle: 'italic' }}>
                      Not a working day
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error/Success Messages */}
        {localError && (
          <div style={{ padding: '0.75rem', background: colors.dangerPale, border: `1px solid ${colors.dangerBorder}`, borderRadius: '8px', color: colors.danger, fontSize: '0.875rem', marginBottom: '1rem' }}>
            {localError}
          </div>
        )}
        {successMessage && (
          <div style={{ padding: '0.75rem', background: colors.successPale, border: `1px solid ${colors.successBorder}`, borderRadius: '8px', color: colors.success, fontSize: '0.875rem', marginBottom: '1rem' }}>
            {successMessage}
          </div>
        )}

        {/* Save Button */}
        <button
          style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}
          onClick={handleSaveWorkingDays}
          disabled={loading || workingDaysLoading}
        >
          {loading ? (
            <>
              <Timer size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Working Days
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
