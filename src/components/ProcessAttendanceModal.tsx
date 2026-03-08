// ProcessAttendanceModal.tsx
// Modal for processing attendance for a specific date

import React, { useState, useEffect } from 'react';
import {
  processAttendance,
  processBatchAttendance
} from '../services/attendanceService';
import { getAllStaff } from '../services/staffManagementService';
import {
  Calendar, Users, CheckCircle, AlertCircle, RefreshCw, X
} from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  department?: string;
}

interface ProcessAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ProcessingMode = 'single' | 'all' | 'batch';

const ProcessAttendanceModal: React.FC<ProcessAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('all');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingResult, setProcessingResult] = useState<{
    processed: number;
    failed: number;
    failures?: any[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load staff members
  useEffect(() => {
    if (isOpen) {
      loadStaff();
    }
  }, [isOpen]);

  const loadStaff = async () => {
    try {
      const response = await getAllStaff(1, 1000);
      if (response.success && response.staff) {
        const mapped = response.staff.map((s: any) => ({
          id: s.id,
          name: [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ') || s.email,
          email: s.work_email || s.email,
          department: s.department,
        }));
        setStaffMembers(mapped);
      }
    } catch (err: any) {
      console.error('Failed to load staff:', err);
    }
  };

  // Filter staff for batch selection
  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle select all for batch mode
  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredStaff.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredStaff.map(s => s.id));
    }
  };

  // Handle individual selection
  const handleToggleUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle processing
  const handleProcess = async () => {
    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      if (processingMode === 'all') {
        // Process for all users
        response = await processAttendance(date);
      } else if (processingMode === 'single') {
        // Process for single user
        if (!selectedUserId) {
          setError('Please select a user');
          setLoading(false);
          return;
        }
        response = await processAttendance(date, selectedUserId as number);
      } else {
        // Batch process for selected users
        if (selectedUserIds.length === 0) {
          setError('Please select at least one user');
          setLoading(false);
          return;
        }
        response = await processBatchAttendance(date, selectedUserIds);
      }

      if (response.success) {
        setProcessingResult(response.data || { processed: 0, failed: 0 });
        setShowResults(true);
      } else {
        setError(response.message || 'Failed to process attendance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process attendance');
    } finally {
      setLoading(false);
    }
  };

  // Handle close and reset
  const handleClose = () => {
    setProcessingMode('all');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedUserId('');
    setSelectedUserIds([]);
    setProcessingResult(null);
    setShowResults(false);
    setError(null);
    onClose();
  };

  // Handle finish after viewing results
  const handleFinish = () => {
    onSuccess();
    handleClose();
  };

  if (!isOpen) return null;

  // Show results view
  if (showResults && processingResult) {
    return (
      <>
        <div className="modal-overlay" onClick={handleClose}></div>
        <div className="modal" style={{ maxWidth: '28rem' }}>
          <div className="modal-header">
            <h3>Processing Complete</h3>
            <button className="btn btn-ghost btn-icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="modal-content space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <div>
                <p className="text-lg font-semibold text-green-900">Success!</p>
                <p className="text-sm text-green-700">Attendance processed successfully</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Processed</p>
                </div>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {processingResult.processed}
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-medium text-red-900">Failed</p>
                </div>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {processingResult.failed}
                </p>
              </div>
            </div>

            {processingResult.failures && processingResult.failures.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                <p className="text-sm font-medium text-red-900">Failed Records:</p>
                {processingResult.failures.map((failure: any, idx: number) => (
                  <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    {failure.user_id || failure.email || `User ${idx + 1}`}: {failure.error || 'Unknown error'}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinish}
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show processing view
  return (
    <>
      <div className="modal-overlay" onClick={handleClose}></div>
      <div className="modal" style={{ maxWidth: '36rem' }}>
        <div className="modal-header">
          <h3>Process Attendance</h3>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              className="input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Processing Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Processing Mode</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  processingMode === 'all'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setProcessingMode('all')}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                All Users
              </button>
              <button
                type="button"
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  processingMode === 'single'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setProcessingMode('single')}
              >
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                Single User
              </button>
              <button
                type="button"
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  processingMode === 'batch'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setProcessingMode('batch')}
              >
                <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                Selected Users
              </button>
            </div>
          </div>

          {/* Single User Selection */}
          {processingMode === 'single' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select User *</label>
              <select
                className="input w-full"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Choose a user...</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Batch User Selection */}
          {processingMode === 'batch' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Select Users *</label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={handleSelectAll}
                >
                  {selectedUserIds.length === filteredStaff.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="p-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
                  {selectedUserIds.length} of {filteredStaff.length} users selected
                </div>
                {filteredStaff.map(staff => (
                  <label
                    key={staff.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedUserIds.includes(staff.id)}
                      onChange={() => handleToggleUser(staff.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{staff.name}</p>
                      {staff.department && (
                        <p className="text-xs text-gray-500">{staff.department}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{staff.email}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">What does processing do?</p>
                <p>
                  This will analyze attendance records for the selected date and:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Mark employees as present/absent based on check-in/out</li>
                  <li>Calculate late arrivals</li>
                  <li>Apply shift timing rules</li>
                  <li>Update attendance status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleProcess}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Process Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProcessAttendanceModal;
