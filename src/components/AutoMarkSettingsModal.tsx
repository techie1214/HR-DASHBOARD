// AutoMarkSettingsModal.tsx
// Admin Dashboard - Auto-Mark Absent Settings Modal
// Uses shadcn/ui design system components

import React, { useState, useEffect } from 'react';
import { Clock, Lock, AlertTriangle, Save, History, Calendar, CheckCircle2, X } from 'lucide-react';
import {
  updateAutoMarkSettings,
  getLockStatus,
  lockAttendanceDate
} from '../services/attendanceSettingsService';

interface AutoMarkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  branchName: string;
  onSuccess: () => void;
}

interface LockStatus {
  attendance_lock_date: string | null;
  auto_mark_absent_enabled: boolean;
  auto_mark_absent_time: string;
  auto_mark_absent_timezone: string;
  recent_locks: Array<{
    id: number;
    lock_date: string;
    locked_by_name: string;
    locked_at: string;
    reason: string | null;
    attendance_count: number;
    absent_count: number;
  }>;
}

export const AutoMarkSettingsModal: React.FC<AutoMarkSettingsModalProps> = ({
  isOpen,
  onClose,
  branchId,
  branchName,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('AutoMarkSettingsModal - isOpen:', isOpen, 'branchId:', branchId, 'branchName:', branchName);
  }, [isOpen, branchId, branchName]);

  // Form state
  const [autoMarkEnabled, setAutoMarkEnabled] = useState(true);
  const [autoMarkTime, setAutoMarkTime] = useState('12:00');
  const [lockDate, setLockDate] = useState('');
  const [lockReason, setLockReason] = useState('');
  const [locking, setLocking] = useState(false);

  // Fetch current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLockStatus();
    }
  }, [isOpen, branchId]);

  const fetchLockStatus = async () => {
    setLoading(true);
    try {
      const response = await getLockStatus(branchId);
      if (response.success && response.data) {
        setLockStatus(response.data);
        setAutoMarkEnabled(response.data.auto_mark_absent_enabled);
        setAutoMarkTime(response.data.auto_mark_absent_time || '12:00');
      }
    } catch (error) {
      console.error('Failed to fetch lock status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await updateAutoMarkSettings({
        branchId,
        auto_mark_absent_enabled: autoMarkEnabled,
        auto_mark_absent_time: autoMarkTime,
        auto_mark_absent_timezone: 'Africa/Nairobi'
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        alert(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save auto-mark settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLockDate = async () => {
    if (!lockDate) {
      alert('Please select a date to lock');
      return;
    }

    setLocking(true);
    try {
      const response = await lockAttendanceDate({
        date: lockDate,
        branchId,
        reason: lockReason || 'Manual lock'
      });

      if (response.success) {
        alert(`Successfully locked ${response.data?.locked_count} attendance records for ${lockDate}`);
        setLockDate('');
        setLockReason('');
        await fetchLockStatus();
        onSuccess();
      } else {
        alert(response.message || 'Failed to lock attendance');
      }
    } catch (error) {
      console.error('Failed to lock attendance:', error);
      alert('Failed to lock attendance');
    } finally {
      setLocking(false);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Auto-Mark Absent Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status Card */}
          {lockStatus && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Current Status</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Auto-Mark Time</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(lockStatus.auto_mark_absent_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lock Status</p>
                  {lockStatus.attendance_lock_date ? (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        Locked until {new Date(lockStatus.attendance_lock_date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Not locked</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-Mark Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Auto-Mark Configuration</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure when attendance is automatically marked absent and locked
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Auto-Mark
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically mark absent and lock at scheduled time
                  </p>
                </div>
                <button
                  onClick={() => setAutoMarkEnabled(!autoMarkEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoMarkEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={autoMarkEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      autoMarkEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Time Input */}
              {autoMarkEnabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    Auto-Mark Time (24-hour format)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={autoMarkTime}
                      onChange={(e) => setAutoMarkTime(e.target.value)}
                      className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatTime(autoMarkTime)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    At {formatTime(autoMarkTime)}, anyone not marked present will be automatically marked absent and attendance will be locked.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Manual Lock */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Manual Lock</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lock attendance for a specific date immediately
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Date to Lock
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={lockDate}
                    onChange={(e) => setLockDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Reason (optional)
                </label>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="e.g., End of day processing"
                  rows={2}
                  className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">Warning</p>
                    <p>
                      Once locked, attendance cannot be changed without admin override. All staff not
                      marked present will be marked absent.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLockDate}
                disabled={locking || !lockDate}
                className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {locking ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Locking...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock Attendance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lock History */}
          {lockStatus && lockStatus.recent_locks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <History className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Lock History</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Audit trail of attendance locks
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {lockStatus.recent_locks.slice(0, 5).map((lock) => (
                  <div
                    key={lock.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(lock.lock_date).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {lock.locked_by_name || 'System'} • {lock.attendance_count} records •{' '}
                        {lock.absent_count} absent
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      <p>{new Date(lock.locked_at).toLocaleString('en-GB', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}</p>
                      {lock.reason && (
                        <p className="italic">"{lock.reason}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
