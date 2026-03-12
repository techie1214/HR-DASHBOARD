// src/components/HolidayManagementView.tsx

import React, { useState, useEffect } from 'react';
import HolidayList from './HolidayList';
import {
  holidayService,
  Holiday,
  CreateHolidayRequest
} from '../services/holidayService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import { Calendar, Plus, X, Loader2 } from 'lucide-react';

const HolidayManagementView = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Form states
  const [holidayName, setHolidayName] = useState('');
  const [date, setDate] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
    fetchHolidays();

    // Listen for refresh events
    const handleRefresh = () => fetchHolidays();
    window.addEventListener('holiday-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('holiday-refresh', handleRefresh);
    };
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoadingHolidays(true);
      const response = await holidayService.getHolidays();
      if (response.success && response.data) {
        setHolidays(response.data.holidays || []);
      }
    } catch (error) {
      console.error('Error fetching holidays for stats:', error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await getAllBranches();
      if (response.success && response.branches) {
        setBranches(response.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const resetForm = () => {
    setHolidayName('');
    setDate('');
    setBranchId('');
    setIsMandatory(true);
    setDescription('');
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newHoliday: CreateHolidayRequest = {
        holiday_name: holidayName,
        date: new Date(date).toISOString(),
        branch_id: branchId ? parseInt(branchId) : null,
        is_mandatory: isMandatory,
        description: description || null
      };

      const response = await holidayService.createHoliday(newHoliday);

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // Trigger refresh in parent component or HolidayList
        window.dispatchEvent(new CustomEvent('holiday-refresh'));
      } else {
        alert(response.message || 'Failed to create holiday');
      }
    } catch (err: any) {
      console.error('Error creating holiday:', err);
      alert(err.response?.data?.message || 'Failed to create holiday');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingHoliday) return;
    
    setSubmitting(true);

    try {
      const updateData = {
        holiday_name: holidayName,
        date: new Date(date).toISOString(),
        branch_id: branchId ? parseInt(branchId) : null,
        is_mandatory: isMandatory,
        description: description || null
      };

      const response = await holidayService.updateHoliday(editingHoliday.id, updateData);

      if (response.success) {
        setShowEditForm(false);
        setEditingHoliday(null);
        resetForm();
        window.dispatchEvent(new CustomEvent('holiday-refresh'));
      } else {
        alert(response.message || 'Failed to update holiday');
      }
    } catch (err: any) {
      console.error('Error updating holiday:', err);
      alert(err.response?.data?.message || 'Failed to update holiday');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await holidayService.deleteHoliday(id);

        if (response.success) {
          window.dispatchEvent(new CustomEvent('holiday-refresh'));
        } else {
          alert(response.message || 'Failed to delete holiday');
        }
      } catch (err: any) {
        console.error('Error deleting holiday:', err);
        alert(err.response?.data?.message || 'Failed to delete holiday');
      }
    }
  };

  const startEditing = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setHolidayName(holiday.holiday_name);
    setDate(holiday.date.split('T')[0]);
    setBranchId(holiday.branch_id?.toString() || '');
    setIsMandatory(holiday.is_mandatory);
    setDescription(holiday.description || '');
    setShowEditForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Holiday Management</h1>
          <p className="text-secondary">Manage company holidays and off-days</p>
        </div> */}
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Holiday
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Holidays</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {loadingHolidays ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  holidays.length
                )}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Company-Wide</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {loadingHolidays ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  holidays.filter(h => !h.branch_id).length
                )}
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
              <p className="text-muted text-sm">Branch-Specific</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {loadingHolidays ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  holidays.filter(h => h.branch_id).length
                )}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Upcoming</p>
              <h3 className="text-2xl font-bold text-primary mt-1">
                {loadingHolidays ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  holidays.filter(h => new Date(h.date) >= new Date()).length
                )}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Holiday Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Holiday</h2>
              <button 
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHoliday} className="space-y-4">
              <div>
                <label className="label" htmlFor="holiday-name">
                  <span className="label-text">Holiday Name</span>
                  <span className="label-text text-error">*</span>
                </label>
                <input
                  id="holiday-name"
                  type="text"
                  className="input"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g., Independence Day"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="label" htmlFor="holiday-date">
                  <span className="label-text">Date</span>
                  <span className="label-text text-error">*</span>
                </label>
                <input
                  id="holiday-date"
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="label" htmlFor="holiday-branch">
                  <span className="label-text">Branch (Optional)</span>
                  <span className="label-text-muted">Leave empty for company-wide</span>
                </label>
                <select
                  id="holiday-branch"
                  className="input"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={submitting || loadingBranches}
                >
                  <option value="">All Branches (Company-Wide)</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Mandatory Holiday</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="isMandatory"
                      className="radio radio-primary"
                      checked={isMandatory}
                      onChange={() => setIsMandatory(true)}
                      disabled={submitting}
                    />
                    <span className="text-sm">Yes - All employees get this off</span>
                  </label>
                  <label className="flex items-center cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="isMandatory"
                      className="radio radio-primary"
                      checked={!isMandatory}
                      onChange={() => setIsMandatory(false)}
                      disabled={submitting}
                    />
                    <span className="text-sm">No - Optional/Observance only</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="holiday-description">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  id="holiday-description"
                  className="input min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description or notes about this holiday"
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
                  {submitting ? 'Creating...' : 'Create Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditForm && editingHoliday && (
        <div className="modal-overlay " onClick={() => setShowEditForm(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Holiday</h2>
              <button 
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setShowEditForm(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateHoliday} className="space-y-4">
              <div>
                <label className="label" htmlFor="edit-holiday-name">
                  <span className="label-text">Holiday Name</span>
                  <span className="label-text text-error">*</span>
                </label>
                <input
                  id="edit-holiday-name"
                  type="text"
                  className="input"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="label" htmlFor="edit-holiday-date">
                  <span className="label-text">Date</span>
                  <span className="label-text text-error">*</span>
                </label>
                <input
                  id="edit-holiday-date"
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="label" htmlFor="edit-holiday-branch">
                  <span className="label-text">Branch (Optional)</span>
                  <span className="label-text-muted">Leave empty for company-wide</span>
                </label>
                <select
                  id="edit-holiday-branch"
                  className="input"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={submitting || loadingBranches}
                >
                  <option value="">All Branches (Company-Wide)</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Mandatory Holiday</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="editIsMandatory"
                      className="radio radio-primary"
                      checked={isMandatory}
                      onChange={() => setIsMandatory(true)}
                      disabled={submitting}
                    />
                    <span className="text-sm">Yes - All employees get this off</span>
                  </label>
                  <label className="flex items-center cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="editIsMandatory"
                      className="radio radio-primary"
                      checked={!isMandatory}
                      onChange={() => setIsMandatory(false)}
                      disabled={submitting}
                    />
                    <span className="text-sm">No - Optional/Observance only</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="edit-holiday-description">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  id="edit-holiday-description"
                  className="input min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description or notes about this holiday"
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
                  {submitting ? 'Updating...' : 'Update Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holidays List */}
      <div>
        <HolidayList
          onEdit={startEditing}
          onDelete={handleDeleteHoliday}
        />
      </div>
    </div>
  );
};

export default HolidayManagementView;
