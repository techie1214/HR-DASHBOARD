// src/components/ShiftSchedulingView.tsx

import React, { useState, useEffect } from 'react';
import ShiftScheduleList from './ShiftScheduleList';
import {
  shiftSchedulingService,
  ShiftSchedule
} from '../services/shiftSchedulingService';
import {
  getAllShiftTimings,
  createShiftTiming,
  updateShiftTiming,
  deleteShiftTiming,
  ShiftTiming
} from '../services/attendanceService';
import { Calendar, Clock, User, Edit3, Trash2, Plus, Users, RotateCcw, Settings } from 'lucide-react';

const ShiftSchedulingView = () => {
  const [activeTab, setActiveTab] = useState<'scheduling' | 'templates'>('scheduling');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftSchedule | null>(null);

  // Form states for shift scheduling
  const [employeeId, setEmployeeId] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [department, setDepartment] = useState('hr');
  const [status, setStatus] = useState('confirmed');

  // Form states for shift templates
  const [shiftTemplateName, setShiftTemplateName] = useState('');
  const [shiftTemplateStartTime, setShiftTemplateStartTime] = useState('09:00:00');
  const [shiftTemplateEndTime, setShiftTemplateEndTime] = useState('17:00:00');
  const [shiftTemplateEffectiveFrom, setShiftTemplateEffectiveFrom] = useState('');
  const [shiftTemplateEffectiveTo, setShiftTemplateEffectiveTo] = useState('');
  const [shiftTemplateUserId, setShiftTemplateUserId] = useState<number | undefined>(undefined);
  const [shiftTemplateBranchId, setShiftTemplateBranchId] = useState<number | undefined>(undefined);
  const [editingShiftTemplate, setEditingShiftTemplate] = useState<ShiftTiming | null>(null);
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false);
  const [showEditTemplateForm, setShowEditTemplateForm] = useState(false);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTiming[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [errorTemplates, setErrorTemplates] = useState<string | null>(null);

  const resetForm = () => {
    setEmployeeId('');
    setShiftType('morning');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDepartment('hr');
    setStatus('confirmed');
  };

  // Load shift templates when component mounts and when active tab changes to templates
  useEffect(() => {
    if (activeTab === 'templates') {
      loadShiftTemplates();
    }
  }, [activeTab]);

  // // Function to load shift templates from the backend
  // const loadShiftTemplates = async () => {
  //   setLoadingTemplates(true);
  //   setErrorTemplates(null);

  //   try {
  //     const response = await getAllShiftTimings();
  //     if (response.success && response.shiftTimings) {
  //       setShiftTemplates(response.shiftTimings);
  //     } else {
  //       setErrorTemplates(response.message || 'Failed to load shift templates');
  //     }
  //   } catch (err) {
  //     setErrorTemplates('An error occurred while loading shift templates');
  //     console.error(err);
  //   } finally {
  //     setLoadingTemplates(false);
  //   }
  // };

  const resetTemplateForm = () => {
    setShiftTemplateName('');
    setShiftTemplateStartTime('09:00:00');
    setShiftTemplateEndTime('17:00:00');
    setShiftTemplateEffectiveFrom('');
    setShiftTemplateEffectiveTo('');
    setShiftTemplateUserId(undefined);
    setShiftTemplateBranchId(undefined);
  };

  // Function to load shift templates from the backend
  const loadShiftTemplates = async () => {
    setLoadingTemplates(true);
    setErrorTemplates(null);

    try {
      const response = await getAllShiftTimings();
      if (response.success && response.shiftTimings) {
        setShiftTemplates(response.shiftTimings);
      } else {
        setErrorTemplates(response.message || 'Failed to load shift templates');
      }
    } catch (err) {
      setErrorTemplates('An error occurred while loading shift templates');
      console.error(err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Function to handle creating a new shift template
  const handleCreateShiftTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTemplate = {
        name: shiftTemplateName,
        start_time: shiftTemplateStartTime,
        end_time: shiftTemplateEndTime,
        effective_from: shiftTemplateEffectiveFrom,
        effective_to: shiftTemplateEffectiveTo || null,
        user_id: shiftTemplateUserId,
        override_branch_id: shiftTemplateBranchId,
      };

      const response = await createShiftTiming(newTemplate);

      if (response.success) {
        setShowCreateTemplateForm(false);
        resetTemplateForm();
        loadShiftTemplates(); // Refresh the list
      } else {
        setErrorTemplates(response.message || 'Failed to create shift template');
      }
    } catch (err) {
      setErrorTemplates('An error occurred while creating shift template');
      console.error(err);
    }
  };

  // Function to handle updating an existing shift template
  const handleUpdateShiftTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingShiftTemplate) return;

    try {
      const updatedTemplate = {
        name: shiftTemplateName,
        start_time: shiftTemplateStartTime,
        end_time: shiftTemplateEndTime,
        effective_from: shiftTemplateEffectiveFrom,
        effective_to: shiftTemplateEffectiveTo || null,
        user_id: shiftTemplateUserId,
        override_branch_id: shiftTemplateBranchId,
      };

      const response = await updateShiftTiming(editingShiftTemplate.id, updatedTemplate);

      if (response.success) {
        setShowEditTemplateForm(false);
        setEditingShiftTemplate(null);
        resetTemplateForm();
        loadShiftTemplates(); // Refresh the list
      } else {
        setErrorTemplates(response.message || 'Failed to update shift template');
      }
    } catch (err) {
      setErrorTemplates('An error occurred while updating shift template');
      console.error(err);
    }
  };


  // Function to update an existing shift template
  const handleUpdateShiftTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingShiftTemplate) return;

    try {
      const updatedTemplate = {
        name: shiftTemplateName,
        start_time: shiftTemplateStartTime,
        end_time: shiftTemplateEndTime,
        effective_from: shiftTemplateEffectiveFrom,
        effective_to: shiftTemplateEffectiveTo || null,
        user_id: shiftTemplateUserId,
        override_branch_id: shiftTemplateBranchId,
      };

      const response = await updateShiftTiming(editingShiftTemplate.id, updatedTemplate);

      if (response.success) {
        setShowEditTemplateForm(false);
        setEditingShiftTemplate(null);
        resetTemplateForm();
        loadShiftTemplates(); // Refresh the list
      } else {
        setErrorTemplates(response.message || 'Failed to update shift template');
      }
    } catch (err) {
      setErrorTemplates('An error occurred while updating shift template');
      console.error(err);
    }
  };

  // Function to delete a shift template
  const handleDeleteShiftTemplate = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shift template?')) {
      try {
        const response = await deleteShiftTiming(id);

        if (response.success) {
          loadShiftTemplates(); // Refresh the list
        } else {
          setErrorTemplates(response.message || 'Failed to delete shift template');
        }
      } catch (err) {
        setErrorTemplates('An error occurred while deleting shift template');
        console.error(err);
      }
    }
  };

  // Function to delete a shift template
  const handleDeleteShiftTemplate = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shift template?')) {
      try {
        const response = await deleteShiftTiming(id);

        if (response.success) {
          loadShiftTemplates(); // Refresh the list
        } else {
          setErrorTemplates(response.message || 'Failed to delete shift template');
        }
      } catch (err) {
        setErrorTemplates('An error occurred while deleting shift template');
        console.error(err);
      }
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newShift = {
        employee_id: parseInt(employeeId),
        shift_type: shiftType,
        date,
        start_time: startTime,
        end_time: endTime,
        department,
        status
      };

      const response = await shiftSchedulingService.createShiftSchedule({employee_id: newShift.employee_id, shift_type: newShift.shift_type, date: newShift.date, start_time: newShift.start_time, end_time: newShift.end_time, department: newShift.department, status: newShift.status});

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error creating shift:', err);
    }
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingShift) return;

    try {
      const updatedShift = {
        ...editingShift,
        employee_id: parseInt(employeeId),
        shift_type: shiftType,
        date,
        start_time: startTime,
        end_time: endTime,
        department,
        status
      };

      const response = await shiftSchedulingService.updateShiftSchedule(editingShift.id, {employee_id: updatedShift.employee_id, shift_type: updatedShift.shift_type, date: updatedShift.date, start_time: updatedShift.start_time, end_time: updatedShift.end_time, department: updatedShift.department, status: updatedShift.status});

      if (response.success) {
        setShowEditForm(false);
        setEditingShift(null);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error updating shift:', err);
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        const response = await shiftSchedulingService.deleteShiftSchedule(id);

        if (response.success) {
          // In a real app, we would refresh the list
        }
      } catch (err) {
        console.error('Error deleting shift:', err);
      }
    }
  };

  const startEditing = (shift: ShiftSchedule) => {
    setEditingShift(shift);
    setEmployeeId(shift.employee_id.toString());
    setShiftType(shift.shift_type);
    setDate(shift.date);
    setStartTime(shift.start_time);
    setEndTime(shift.end_time);
    setDepartment(shift.department);
    setStatus(shift.status);
    setShowEditForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="card">
        <div className="tabs-list" style={{ padding: '0 1.5rem' }}>
          <button
            className={`tabs-trigger ${activeTab === 'scheduling' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduling')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Shift Scheduling
          </button>
          <button
            className={`tabs-trigger ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Shift Templates
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'scheduling' && (
        <div>
          {/* Action buttons section */}
          <div className="flex items-center justify-end gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Shift
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {activeTab === 'scheduling' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted">Total Shifts</p>
                <h3 className="text-2xl font-bold">142</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted">Today's Shifts</p>
                <h3 className="text-2xl font-bold">24</h3>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted">Employees Scheduled</p>
                <h3 className="text-2xl font-bold">89</h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted">Pending Changes</p>
                <h3 className="text-2xl font-bold">5</h3>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <RotateCcw className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shift Templates Section */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Action buttons section for templates */}
          <div className="flex items-center justify-end gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                resetTemplateForm();
                setShowCreateTemplateForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Shift Template
            </button>
          </div>

          {/* Stats Cards for Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted">Total Templates</p>
                  <h3 className="text-2xl font-bold">{shiftTemplates.length}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted">Active Templates</p>
                  <h3 className="text-2xl font-bold">{shiftTemplates.filter(t => !t.effective_to || new Date(t.effective_to) > new Date()).length}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted">Individual Shifts</p>
                  <h3 className="text-2xl font-bold">{shiftTemplates.filter(t => t.user_id).length}</h3>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted">Branch Shifts</p>
                  <h3 className="text-2xl font-bold">{shiftTemplates.filter(t => t.override_branch_id).length}</h3>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <Building className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Shift Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Shift</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shift Type</label>
                  <select
                    className="input input-bordered w-full"
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    required
                  >
                    <option value="morning">Morning (8AM - 4PM)</option>
                    <option value="afternoon">Afternoon (12PM - 8PM)</option>
                    <option value="night">Night (8PM - 4AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    className="input input-bordered w-full"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="sales">Sales</option>
                    <option value="technical">Technical</option>
                    <option value="solar">Solar</option>
                    <option value="logistics">Logistics</option>
                    <option value="audit">Audit</option>
                    <option value="hr">HR</option>
                    <option value="rms">RMS</option>
                    <option value="digital_media">Digital Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input input-bordered w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {showEditForm && editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Shift: {editingShift.shift_type} - {new Date(editingShift.date).toLocaleDateString()}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingShift(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateShift} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shift Type</label>
                  <select
                    className="input input-bordered w-full"
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    required
                  >
                    <option value="morning">Morning (8AM - 4PM)</option>
                    <option value="afternoon">Afternoon (12PM - 8PM)</option>
                    <option value="night">Night (8PM - 4AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    className="input input-bordered w-full"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="sales">Sales</option>
                    <option value="technical">Technical</option>
                    <option value="solar">Solar</option>
                    <option value="logistics">Logistics</option>
                    <option value="audit">Audit</option>
                    <option value="hr">HR</option>
                    <option value="rms">RMS</option>
                    <option value="digital_media">Digital Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input input-bordered w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingShift(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shifts List */}
      {activeTab === 'scheduling' && (
        <div>
          <ShiftScheduleList
            onEdit={startEditing}
            onDelete={handleDeleteShift}
          />
        </div>
      )}

      {/* Shift Templates List */}
      {activeTab === 'templates' && (
        <div className="card">
          <div className="p-6 border-b">
            <h3>Shift Templates</h3>
            <p className="text-muted">Standard shift templates for recurring schedules</p>
          </div>
          <div className="p-6">
            {shiftTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-muted" />
                <p className="mt-4 text-muted">No shift templates found</p>
                <p className="text-sm text-muted">Create your first shift template to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shiftTemplates.map((template) => (
                  <div key={template.id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{template.shift_name}</h4>
                        <p className="text-sm text-muted">{template.start_time} - {template.end_time}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingShiftTemplate(template);
                            setShiftTemplateName(template.shift_name);
                            setShiftTemplateStartTime(template.start_time);
                            setShiftTemplateEndTime(template.end_time);
                            setShiftTemplateEffectiveFrom(template.effective_from);
                            setShiftTemplateEffectiveTo(template.effective_to || '');
                            setShiftTemplateUserId(template.user_id);
                            setShiftTemplateBranchId(template.override_branch_id);
                            setShowEditTemplateForm(true);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline btn-error"
                          onClick={() => handleDeleteShiftTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Effective From</span>
                        <span className="text-sm font-medium">{template.effective_from}</span>
                      </div>
                      {template.effective_to && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted">Effective To</span>
                          <span className="text-sm font-medium">{template.effective_to}</span>
                        </div>
                      )}
                      {template.user_id && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted">Assigned to User</span>
                          <span className="text-sm font-medium">User #{template.user_id}</span>
                        </div>
                      )}
                      {template.override_branch_id && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted">Branch Override</span>
                          <span className="text-sm font-medium">Branch #{template.override_branch_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Shift Template Modal */}
      {activeTab === 'templates' && showCreateTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Shift Template</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowCreateTemplateForm(false);
                  resetTemplateForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateShiftTemplate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={shiftTemplateName}
                    onChange={(e) => setShiftTemplateName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      className="input input-bordered w-full"
                      value={shiftTemplateStartTime}
                      onChange={(e) => setShiftTemplateStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      className="input input-bordered w-full"
                      value={shiftTemplateEndTime}
                      onChange={(e) => setShiftTemplateEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Effective From</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={shiftTemplateEffectiveFrom}
                    onChange={(e) => setShiftTemplateEffectiveFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Effective To (Optional)</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={shiftTemplateEffectiveTo}
                    onChange={(e) => setShiftTemplateEffectiveTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign to User (Optional)</label>
                  <select
                    className="input input-bordered w-full"
                    value={shiftTemplateUserId || ''}
                    onChange={(e) => setShiftTemplateUserId(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">All Users</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Override Branch (Optional)</label>
                  <select
                    className="input input-bordered w-full"
                    value={shiftTemplateBranchId || ''}
                    onChange={(e) => setShiftTemplateBranchId(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateTemplateForm(false);
                    resetTemplateForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shift Template Modal */}
      {activeTab === 'templates' && showEditTemplateForm && editingShiftTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Shift Template: {editingShiftTemplate.name}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowEditTemplateForm(false);
                  setEditingShiftTemplate(null);
                  resetTemplateForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateShiftTemplate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={shiftTemplateName}
                    onChange={(e) => setShiftTemplateName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      className="input input-bordered w-full"
                      value={shiftTemplateStartTime}
                      onChange={(e) => setShiftTemplateStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      className="input input-bordered w-full"
                      value={shiftTemplateEndTime}
                      onChange={(e) => setShiftTemplateEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Effective From</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={shiftTemplateEffectiveFrom}
                    onChange={(e) => setShiftTemplateEffectiveFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Effective To (Optional)</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={shiftTemplateEffectiveTo}
                    onChange={(e) => setShiftTemplateEffectiveTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign to User (Optional)</label>
                  <select
                    className="input input-bordered w-full"
                    value={shiftTemplateUserId || ''}
                    onChange={(e) => setShiftTemplateUserId(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">All Users</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.firstName} {staff.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Override Branch (Optional)</label>
                  <select
                    className="input input-bordered w-full"
                    value={shiftTemplateBranchId || ''}
                    onChange={(e) => setShiftTemplateBranchId(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditTemplateForm(false);
                    setEditingShiftTemplate(null);
                    resetTemplateForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSchedulingView;