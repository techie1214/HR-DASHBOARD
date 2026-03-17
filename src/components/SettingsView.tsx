import React, { useState, useEffect } from 'react';
import {
  getBranchAttendanceSettings,
  updateBranchAttendanceSettings,
  getGlobalAttendanceSettings,
  updateGlobalAttendanceSettings
} from '../services/attendanceSettingsService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import {
  Settings, Bell, Clock, CheckCircle, Globe, Building, Save, RotateCcw,
  Shield, Users, AlertCircle, TrendingUp, Zap, MapPin, Timer
} from 'lucide-react';

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'notifications' | 'general'>('attendance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Branch settings state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | ''>('');
  const [branchSettingsLoading, setBranchSettingsLoading] = useState(false);

  // Global settings state
  const [globalSettingsLoading, setGlobalSettingsLoading] = useState(false);

  // Branch settings form state
  const [branchForm, setBranchForm] = useState({
    require_check_in: true,
    require_check_out: true,
    grace_period_minutes: 15,
    auto_checkout_enabled: true,
    auto_checkout_minutes_after_close: 30,
    enable_location_verification: true,
    allow_manual_attendance_entry: true,
    enable_weekend_attendance: false,
    notify_absent_employees: true,
    notify_supervisors_daily_summary: true,
    enable_face_recognition: false,
    enable_biometric_verification: false,
    enable_holiday_attendance: false,
    strict_location_mode: false, // NEW: Strict vs Legacy mode
    attendance_mode: 'branch_based' as 'branch_based' | 'multiple_locations' | 'flexible',
  });

  // Global settings form state
  const [globalForm, setGlobalForm] = useState({
    auto_checkout_enabled: false,
    auto_checkout_minutes_after_close: 30,
    grace_period_minutes: 0,
    notify_absent_employees: true,
    notify_supervisors_daily_summary: true,
    enable_weekend_attendance: false,
  });

  // Load branches on mount
  useEffect(() => {
    loadBranches();
  }, []);

  // Load branch settings when branch is selected
  useEffect(() => {
    if (selectedBranchId) {
      loadBranchSettings(Number(selectedBranchId));
    }
  }, [selectedBranchId]);

  // Load global settings on mount
  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await getAllBranches();
      if (response.success && response.branches) {
        setBranches(response.branches);
        if (response.branches.length > 0 && !selectedBranchId) {
          setSelectedBranchId(response.branches[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  const loadBranchSettings = async (branchId: number) => {
    setBranchSettingsLoading(true);
    try {
      const response = await getBranchAttendanceSettings(branchId);
      if (response.success && response.settings) {
        setBranchForm({
          require_check_in: response.settings.require_check_in ?? true,
          require_check_out: response.settings.require_check_out ?? true,
          grace_period_minutes: response.settings.grace_period_minutes ?? 15,
          auto_checkout_enabled: response.settings.auto_checkout_enabled ?? true,
          auto_checkout_minutes_after_close: response.settings.auto_checkout_minutes_after_close ?? 30,
          enable_location_verification: response.settings.enable_location_verification ?? true,
          allow_manual_attendance_entry: response.settings.allow_manual_attendance_entry ?? true,
          enable_weekend_attendance: response.settings.enable_weekend_attendance ?? false,
          notify_absent_employees: response.settings.notify_absent_employees ?? true,
          notify_supervisors_daily_summary: response.settings.notify_supervisors_daily_summary ?? true,
          enable_face_recognition: response.settings.enable_face_recognition ?? false,
          enable_biometric_verification: response.settings.enable_biometric_verification ?? false,
          enable_holiday_attendance: response.settings.enable_holiday_attendance ?? false,
          strict_location_mode: response.settings.strict_location_mode ?? false,
          attendance_mode: response.settings.attendance_mode ?? 'branch_based',
        });
      }
    } catch (err) {
      console.error('Error loading branch settings:', err);
    } finally {
      setBranchSettingsLoading(false);
    }
  };

  const loadGlobalSettings = async () => {
    setGlobalSettingsLoading(true);
    try {
      const response = await getGlobalAttendanceSettings();
      if (response.success && response.settings) {
        setGlobalForm({
          auto_checkout_enabled: response.settings.auto_checkout_enabled ?? false,
          auto_checkout_minutes_after_close: response.settings.auto_checkout_minutes_after_close ?? 30,
          grace_period_minutes: response.settings.grace_period_minutes ?? 0,
          notify_absent_employees: response.settings.notify_absent_employees ?? true,
          notify_supervisors_daily_summary: response.settings.notify_supervisors_daily_summary ?? true,
          enable_weekend_attendance: response.settings.enable_weekend_attendance ?? false,
        });
      }
    } catch (err) {
      console.error('Error loading global settings:', err);
    } finally {
      setGlobalSettingsLoading(false);
    }
  };

  const handleSaveBranchSettings = async () => {
    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    setLoading(true);
    try {
      const response = await updateBranchAttendanceSettings({
        branchId: Number(selectedBranchId),
        settings: branchForm,
      });

      if (response.success) {
        setSuccessMessage('Branch attendance settings saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to save branch settings');
      }
    } catch (err) {
      setError('An error occurred while saving branch settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setLoading(true);
    try {
      const response = await updateGlobalAttendanceSettings({
        settings: globalForm,
      });

      if (response.success) {
        setSuccessMessage('Global attendance settings saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to save global settings');
      }
    } catch (err) {
      setError('An error occurred while saving global settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors bg-white">
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${checked ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      {/* Branch Selector Card - Simplified */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Branch Settings</h3>
              <p className="text-sm text-gray-500">Configure attendance rules per branch</p>
            </div>
          </div>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value || '')}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500"
            style={{ minWidth: '250px' }}
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Branch Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in/Check-out */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Check-in Rules</h4>
              <p className="text-xs text-gray-500">Attendance requirements</p>
            </div>
          </div>
          <div className="space-y-3">
            <Toggle
              checked={branchForm.require_check_in}
              onChange={(v) => setBranchForm({ ...branchForm, require_check_in: v })}
              label="Require Check-in"
              description="Employees must check in"
            />
            <Toggle
              checked={branchForm.require_check_out}
              onChange={(v) => setBranchForm({ ...branchForm, require_check_out: v })}
              label="Require Check-out"
              description="Employees must check out"
            />
          </div>
        </div>

        {/* Grace Period */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Grace Period</h4>
              <p className="text-xs text-gray-500">Late arrival tolerance</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
              <input
                type="number"
                min="0"
                max="60"
                value={branchForm.grace_period_minutes}
                onChange={(e) => setBranchForm({ ...branchForm, grace_period_minutes: Number(e.target.value) })}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1.5">Allow late check-in without marking as late</p>
            </div>
          </div>
        </div>

        {/* Auto Checkout */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Auto Checkout</h4>
              <p className="text-xs text-gray-500">Automatic check-out</p>
            </div>
          </div>
          <div className="space-y-3">
            <Toggle
              checked={branchForm.auto_checkout_enabled}
              onChange={(v) => setBranchForm({ ...branchForm, auto_checkout_enabled: v })}
              label="Enable Auto Checkout"
              description="Automatically check out employees"
            />
            {branchForm.auto_checkout_enabled && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">After Shift End (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={branchForm.auto_checkout_minutes_after_close}
                  onChange={(e) => setBranchForm({ ...branchForm, auto_checkout_minutes_after_close: Number(e.target.value) })}
                  className="input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Location</h4>
              <p className="text-xs text-gray-500">GPS verification</p>
            </div>
          </div>
          <div className="space-y-3">
            <Toggle
              checked={branchForm.enable_location_verification}
              onChange={(v) => setBranchForm({ ...branchForm, enable_location_verification: v })}
              label="Location Verification"
              description="Verify GPS location on check-in"
            />
            <Toggle
              checked={branchForm.allow_manual_attendance_entry ?? false}
              onChange={(v) => setBranchForm({ ...branchForm, allow_manual_attendance_entry: v })}
              label="Manual Entry"
              description="Allow admin manual attendance"
            />
          </div>
        </div>

        {/* Verification Methods */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Advanced Verification</h4>
              <p className="text-xs text-gray-500">Biometrics & AI</p>
            </div>
          </div>
          <div className="space-y-3">
            <Toggle
              checked={branchForm.enable_face_recognition ?? false}
              onChange={(v) => setBranchForm({ ...branchForm, enable_face_recognition: v })}
              label="Face Recognition"
              description="Verify identity via camera"
            />
            <Toggle
              checked={branchForm.enable_biometric_verification ?? false}
              onChange={(v) => setBranchForm({ ...branchForm, enable_biometric_verification: v })}
              label="Biometric Verification"
              description="Fingerprint or FaceID"
            />
          </div>
        </div>

        {/* Attendance Mode */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Attendance Mode</h4>
              <p className="text-xs text-gray-500">Operation style</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={branchForm.attendance_mode}
                onChange={(e) => setBranchForm({ ...branchForm, attendance_mode: e.target.value as any })}
                className="input"
              >
                <option value="branch_based">Branch Based (Geofencing)</option>
                <option value="multiple_locations">Multiple Locations (Approved Hotspots)</option>
                <option value="flexible">Flexible (Anywhere)</option>
              </select>
            </div>
            
            {/* Strict vs Legacy Mode Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="strict-mode-toggle"
                  checked={branchForm.strict_location_mode ?? false}
                  onChange={(e) => setBranchForm({ ...branchForm, strict_location_mode: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="strict-mode-toggle" className="font-medium text-gray-900 cursor-pointer">
                    Strict Location Mode
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>ON (Strict):</strong> Staff can ONLY check in at their assigned locations. 
                    If no location is assigned, they cannot check in.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>OFF (Legacy):</strong> Staff can check in at branch location or any approved 
                    location based on attendance mode above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Notifications & Policy</h4>
            <p className="text-xs text-gray-500">Additional options</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Toggle
            checked={branchForm.enable_weekend_attendance ?? false}
            onChange={(v) => setBranchForm({ ...branchForm, enable_weekend_attendance: v })}
            label="Weekend Tracking"
            description="Track on Sat/Sun"
          />
          <Toggle
            checked={branchForm.enable_holiday_attendance ?? false}
            onChange={(v) => setBranchForm({ ...branchForm, enable_holiday_attendance: v })}
            label="Holiday Attendance"
            description="Allow check-in on holidays"
          />
          <Toggle
            checked={branchForm.notify_absent_employees ?? false}
            onChange={(v) => setBranchForm({ ...branchForm, notify_absent_employees: v })}
            label="Absent Alerts"
            description="Notify employees"
          />
          <Toggle
            checked={branchForm.notify_supervisors_daily_summary ?? true}
            onChange={(v) => setBranchForm({ ...branchForm, notify_supervisors_daily_summary: v })}
            label="Supervisor Summary"
            description="Notify daily summary"
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            className="btn btn-primary px-6"
            onClick={handleSaveBranchSettings}
            disabled={loading || branchSettingsLoading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Branch Settings
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className="card p-5" style={{ backgroundColor: '#2563eb' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Global Settings</h3>
            <p className="text-sm text-white/80">System-wide defaults for all branches</p>
          </div>
        </div>

        {globalSettingsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              checked={globalForm.auto_checkout_enabled}
              onChange={(v) => setGlobalForm({ ...globalForm, auto_checkout_enabled: v })}
              label="Auto Checkout (Global)"
              description="Default for all branches"
            />
            <Toggle
              checked={globalForm.notify_supervisors_daily_summary}
              onChange={(v) => setGlobalForm({ ...globalForm, notify_supervisors_daily_summary: v })}
              label="Supervisor Summaries"
              description="Daily attendance reports"
            />
            <Toggle
              checked={globalForm.notify_absent_employees}
              onChange={(v) => setGlobalForm({ ...globalForm, notify_absent_employees: v })}
              label="Absent Notifications (Global)"
              description="System-wide notifications"
            />
            <Toggle
              checked={globalForm.enable_weekend_attendance}
              onChange={(v) => setGlobalForm({ ...globalForm, enable_weekend_attendance: v })}
              label="Weekend Attendance (Global)"
              description="Default weekend setting"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">Global Grace Period (minutes)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={globalForm.grace_period_minutes}
                onChange={(e) => setGlobalForm({ ...globalForm, grace_period_minutes: Number(e.target.value) })}
                className="px-4 py-2.5 rounded-lg border-0 bg-white/95 text-gray-900 font-medium shadow-lg focus:ring-2 focus:ring-white/50"
                style={{ maxWidth: '200px' }}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                className="btn px-6"
                style={{ backgroundColor: 'white', color: '#c026d3', fontWeight: 600 }}
                onClick={handleSaveGlobalSettings}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Global Settings
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="card p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Configure email, SMS, and push notifications for attendance, shifts, and system alerts.
      </p>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="card p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Settings className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">General Settings</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        System-wide configuration including company info, working hours, holidays, and localization.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure attendance and system preferences</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="card p-2" style={{ backgroundColor: '#dbeafe' }}>
        <div className="flex gap-2">
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-black shadow-md'
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('attendance')}
          >
            <Clock className="w-4 h-4" />
            Attendance
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-black shadow-md'
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'general'
                ? 'bg-blue-600 text-black shadow-md'
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('general')}
          >
            <Settings className="w-4 h-4" />
            General
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'attendance' && renderAttendanceSettings()}
      {activeTab === 'notifications' && renderNotificationsSettings()}
      {activeTab === 'general' && renderGeneralSettings()}
    </div>
  );
};

export default SettingsView;
