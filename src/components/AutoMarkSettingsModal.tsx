// AutoMarkSettingsModal.tsx
// Modal for configuring auto-mark absent settings

import React, { useState, useEffect } from 'react';
import { Clock, Lock, AlertTriangle, Save, X } from 'lucide-react';
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
  
  // Form state
  const [autoMarkEnabled, setAutoMarkEnabled] = useState(true);
  const [autoMarkTime, setAutoMarkTime] = useState('12:00');
  const [lockDate, setLockDate] = useState('');
  const [lockReason, setLockReason] = useState('');
  const [showLockSection, setShowLockSection] = useState(false);

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

    setSaving(true);
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
        setShowLockSection(false);
        await fetchLockStatus();
        onSuccess();
      } else {
        alert(response.message || 'Failed to lock attendance');
      }
    } catch (error) {
      console.error('Failed to lock attendance:', error);
      alert('Failed to lock attendance');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Auto-Mark Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          {lockStatus && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Current Auto-Mark Time
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {lockStatus.auto_mark_absent_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Lock Status
                  </p>
                  {lockStatus.attendance_lock_date ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                      <Lock className="w-4 h-4" />
                      <p className="text-sm font-medium">
                        Locked until {new Date(lockStatus.attendance_lock_date).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Not locked
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-Mark Time Settings */}
          <div className="card p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Auto-Mark Absent Time
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When to automatically mark absent and lock
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Auto-Mark
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Automatically mark absent and lock at scheduled time
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoMarkEnabled}
                    onChange={(e) => setAutoMarkEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Time Input */}
              {autoMarkEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Auto-Mark Time (24-hour format)
                  </label>
                  <input
                    type="time"
                    value={autoMarkTime}
                    onChange={(e) => setAutoMarkTime(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    At {autoMarkTime}, anyone not marked present will be automatically marked absent and locked.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Manual Lock Section */}
          <div className="card p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Manual Lock
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lock attendance for a specific date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLockSection(!showLockSection)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showLockSection ? 'Cancel' : 'Open'}
              </button>
            </div>

            {showLockSection && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Date to Lock
                  </label>
                  <input
                    type="date"
                    value={lockDate}
                    onChange={(e) => setLockDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    placeholder="e.g., End of day processing"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium mb-1">Warning</p>
                      <p>
                        Once locked, attendance cannot be changed without admin override. 
                        All staff not marked present will be marked absent.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLockDate}
                  disabled={saving || !lockDate}
                  className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {saving ? 'Locking...' : 'Lock Attendance'}
                </button>
              </div>
            )}
          </div>

          {/* Recent Lock History */}
          {lockStatus && lockStatus.recent_locks.length > 0 && (
            <div className="card p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Recent Lock History
              </h3>
              <div className="space-y-2">
                {lockStatus.recent_locks.slice(0, 5).map((lock) => (
                  <div
                    key={lock.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(lock.lock_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {lock.locked_by_name || 'System'} • {lock.attendance_count} records
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(lock.locked_at).toLocaleString()}
                      </p>
                      {lock.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          "{lock.reason}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
