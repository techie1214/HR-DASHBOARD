// Import React hooks for managing component state and side effects
import { useState, useEffect } from 'react';
// Import shift timing service functions and types
import {
  getAllShiftTimings,
  getShiftTimingById,
  createShiftTiming,
  updateShiftTiming,
  deleteShiftTiming,
  ShiftTiming
} from '../services/attendanceService';
// Import staff management service
import { getAllStaff } from '../services/staffManagementService';
// Import attendance metrics and mock staff data from staffData module
import { getAttendanceMetrics, mockStaffData } from '../data/staffData';
// Import icons from lucide-react library for UI elements like buttons and indicators
import { Clock, Building, User, Save, Plus, Edit2, Trash2 } from 'lucide-react';

// Main component for the Time Management View in the HR dashboard
// This component allows administrators to manage working hours for branches and individual staff members
export function TimeManagementView() {
  // State to track which tab is currently active: 'shifts' for shift settings or 'individuals' for individual settings
  const [activeTab, setActiveTab] = useState<'shifts' | 'individuals'>('shifts');
  // State to track which shift is currently being edited (null if none)
  const [editingShift, setEditingShift] = useState<number | null>(null);
  // State to control the visibility of the modal for adding new individual time settings
  const [showAddIndividualModal, setShowAddIndividualModal] = useState(false);

  // Temporary state for storing editing values for shifts, keyed by shift ID
  // This holds unsaved changes during editing
  const [editingValues, setEditingValues] = useState<Record<number, Partial<ShiftTiming>>>({});
  // State for the form data when adding a new individual time setting
  // Excludes the 'id' field as it will be generated
  const [newIndividual, setNewIndividual] = useState<Omit<ShiftTiming, 'id'>>({
    start_time: '09:00:00', // Default start time
    end_time: '17:00:00', // Default end time
    shift_name: '', // Name of the shift
    effective_from: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    user_id: undefined, // ID of the user (optional)
    override_branch_id: undefined, // ID of the branch (optional)
    effective_to: undefined, // End date (optional)
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  // State for the branch assigned to the new individual being added
  const [newIndividualBranch, setNewIndividualBranch] = useState<string>('');
  // State to control whether staff name suggestions are shown in the autocomplete input
  const [showStaffSuggestions, setShowStaffSuggestions] = useState(false);
  // State for the list of staff suggestions based on user input
  const [staffSuggestions, setStaffSuggestions] = useState<any[]>([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for error
  const [error, setError] = useState<string | null>(null);

  // State for the list of shift settings, initialized with data from API
  const [shiftTimings, setShiftTimings] = useState<ShiftTiming[]>([]);
  // State for the list of individual shift settings, initialized with data from API
  const [individualShifts, setIndividualShifts] = useState<ShiftTiming[]>([]);
  // State for staff members
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  // Retrieve attendance metrics for display in the stats cards
  const metrics = getAttendanceMetrics();

  // Helper function to refresh shift timings data from the API
  const refreshShiftTimings = async () => {
    try {
      setLoading(true);
      const response = await getAllShiftTimings();
      if (response.success && response.shiftTimings) {
        setShiftTimings(response.shiftTimings);
      } else {
        setError(response.message || 'Failed to load shift timings');
      }
    } catch (err) {
      setError('An error occurred while loading shift timings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to refresh individual shifts data from the API
  const refreshIndividualShifts = async () => {
    try {
      setLoading(true);
      const response = await getAllShiftTimings();
      if (response.success && response.shiftTimings) {
        // Filter for individual shifts (those with user_id)
        setIndividualShifts(response.shiftTimings.filter(shift => shift.user_id));
      } else {
        setError(response.message || 'Failed to load individual shifts');
      }
    } catch (err) {
      setError('An error occurred while loading individual shifts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler function to start editing a shift timing
  // Sets the editing state and copies current values for editing
  const handleStartEdit = (shift: ShiftTiming) => {
    setEditingShift(shift.id);
    setEditingValues(prev => ({ ...prev, [shift.id]: { ...shift } }));
  };

  // Handler function for changes in shift editing fields
  // Updates the temporary editing values for the specified shift and field
  const handleEditChange = (shiftId: number, field: keyof ShiftTiming, value: any) => {
    // Ignore unknown fields and update the editing state
    setEditingValues(prev => ({ ...prev, [shiftId]: { ...(prev[shiftId] || {}), [field]: value } }));
  };

  // Handler function to save changes to a shift timing
  // Applies updates, refreshes data, and exits edit mode
  const handleSaveShift = async (shiftId: number) => {
    const updates = editingValues[shiftId];
    if (!updates) return; // No updates to save
    
    try {
      const response = await updateShiftTiming(shiftId, updates as any);
      if (response.success) {
        refreshShiftTimings(); // Refresh the local state
        setEditingShift(null); // Exit edit mode
      } else {
        setError(response.message || 'Failed to update shift timing');
      }
    } catch (err) {
      setError('An error occurred while updating shift timing');
      console.error(err);
    }
  };

  // Handler function to cancel editing a shift
  // Resets editing state and removes temporary values
  const handleCancelEdit = (shiftId: number) => {
    setEditingShift(null);
    setEditingValues(prev => {
      const copy = { ...prev };
      delete copy[shiftId]; // Remove the temporary edits
      return copy;
    });
  };

  // Handler function to remove an individual shift setting
  // Deletes the setting and refreshes the data
  const handleRemoveIndividual = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shift timing?')) {
      try {
        const response = await deleteShiftTiming(id);
        if (response.success) {
          refreshIndividualShifts();
        } else {
          setError(response.message || 'Failed to delete shift timing');
        }
      } catch (err) {
        setError('An error occurred while deleting shift timing');
        console.error(err);
      }
    }
  };

  // State for tracking which individual shift setting is being edited
  const [editingIndividualId, setEditingIndividualId] = useState<number | null>(null);
  // State for temporary editing values for individual shift settings
  const [editingIndividualValues, setEditingIndividualValues] = useState<Record<number, Partial<ShiftTiming>>>({});

  // Handler function to start editing an individual shift setting
  // Sets the editing state and copies current values
  const handleStartEditIndividual = (time: ShiftTiming) => {
    setEditingIndividualId(time.id);
    setEditingIndividualValues(prev => ({ ...prev, [time.id]: { ...time } }));
  };

  // Handler function for changes in individual editing fields
  // Updates the temporary editing values
  const handleIndividualChange = (id: number, field: keyof ShiftTiming, value: any) => {
    setEditingIndividualValues(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  // Handler function to save changes to an individual shift setting
  // Applies updates, refreshes, and exits edit mode
  const handleSaveIndividual = async (id: number) => {
    const edits = editingIndividualValues[id];
    if (!edits) return; // No edits to save
    
    try {
      const response = await updateShiftTiming(id, edits as any);
      if (response.success) {
        refreshIndividualShifts(); // Refresh data
        setEditingIndividualId(null); // Exit edit mode
      } else {
        setError(response.message || 'Failed to update individual shift');
      }
    } catch (err) {
      setError('An error occurred while updating individual shift');
      console.error(err);
    }
  };

  // Handler function to cancel editing an individual shift setting
  // Resets editing state and removes temporary values
  const handleCancelIndividual = (id: number) => {
    setEditingIndividualId(null);
    setEditingIndividualValues(prev => {
      const copy = { ...prev };
      delete copy[id]; // Remove temporary edits
      return copy;
    });
  };

  // Handler function to add a new individual shift setting
  // Adds the time and refreshes the data
  const handleAddIndividual = async (time: Omit<ShiftTiming, 'id'>) => {
    try {
      const response = await createShiftTiming(time as any);
      if (response.success) {
        refreshIndividualShifts();
        setShowAddIndividualModal(false);
      } else {
        setError(response.message || 'Failed to add individual shift');
      }
    } catch (err) {
      setError('An error occurred while adding individual shift');
      console.error(err);
    }
  };

  // Function to submit the new individual shift setting form
  // Validates required fields, adds the setting, resets form, and closes modal
  const submitNewIndividual = () => {
    if (!newIndividual.user_id || !newIndividual.shift_name) return; // Validation
    handleAddIndividual(newIndividual);
    // Reset form to default values
    setNewIndividual({ 
      start_time: '09:00:00', 
      end_time: '17:00:00', 
      shift_name: '', 
      effective_from: new Date().toISOString().split('T')[0], 
      user_id: undefined, 
      override_branch_id: undefined, 
      effective_to: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  // Load staff members on component mount
  const loadStaffMembers = async () => {
    try {
      const response = await getAllStaff();
      if (response.success && response.staff) {
        setStaffMembers(response.staff);
      } else {
        setError(response.message || 'Failed to load staff members');
      }
    } catch (err) {
      setError('An error occurred while loading staff members');
      console.error(err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    refreshShiftTimings();
    refreshIndividualShifts();
    loadStaffMembers();
  }, []);

  // Main render return
  return (
    // Main container with vertical spacing between sections
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          <div className="flex items-center">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Header section displaying key statistics in a grid of cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Card showing standard resumption time */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
              <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Standard Resumption</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>8:00 AM</p>
            </div>
          </div>
        </div>
        {/* Card showing total number of shifts */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
              <Building className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Shifts</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{shiftTimings.length}</p>
            </div>
          </div>
        </div>
        {/* Card showing number of individual shifts */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <User className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Individual Shifts</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{individualShifts.length}</p>
            </div>
          </div>
        </div>
        {/* Card showing average attendance rate as a proxy for working hours */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff' }}>
              <Clock className="w-5 h-5" style={{ color: '#a855f7' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Working Hours/Day</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{metrics.avgAttendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section for switching between shift and individual settings */}
      <div className="card">
        <div className="tabs-list" style={{ padding: '0 1.5rem' }}>
          {/* Tab button for shift settings */}
          <button
            className={`tabs-trigger ${activeTab === 'shifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shifts')}
          >
            <Building className="w-4 h-4 mr-2" />
            Shift Settings
          </button>
          {/* Tab button for individual settings */}
          <button
            className={`tabs-trigger ${activeTab === 'individuals' ? 'active' : ''}`}
            onClick={() => setActiveTab('individuals')}
          >
            <User className="w-4 h-4 mr-2" />
            Individual Settings
          </button>
        </div>
      </div>

      {/* Conditional rendering for Shift Settings tab */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          {/* Map over each shift to display its settings card */}
          {shiftTimings.filter(shift => !shift.user_id).map((shift) => (
            <div key={shift.id} className="card">
              {/* Shift header with name, ID, and edit button */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                      <Building className="w-5 h-5" style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.125rem' }}>{shift.shift_name}</h3>
                      <p className="text-xs text-muted">Shift ID: {shift.id}</p>
                    </div>
                  </div>
                  {/* Button to toggle edit mode for this shift */}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => editingShift === shift.id ? handleCancelEdit(shift.id) : handleStartEdit(shift)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {editingShift === shift.id ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>
              {/* Shift settings form */}
              <div className="p-4">
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  {/* Input for shift name */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Shift Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editingShift === shift.id ? (editingValues[shift.id]?.shift_name ?? shift.shift_name) : shift.shift_name}
                      onChange={(e) => handleEditChange(shift.id, 'shift_name', e.target.value)}
                      disabled={editingShift !== shift.id} // Disabled unless editing
                    />
                  </div>
                  {/* Input for start time */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={editingShift === shift.id ? (editingValues[shift.id]?.start_time ?? shift.start_time) : shift.start_time}
                      onChange={(e) => handleEditChange(shift.id, 'start_time', e.target.value)}
                      disabled={editingShift !== shift.id} // Disabled unless editing
                    />
                  </div>
                  {/* Input for end time */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={editingShift === shift.id ? (editingValues[shift.id]?.end_time ?? shift.end_time) : shift.end_time}
                      onChange={(e) => handleEditChange(shift.id, 'end_time', e.target.value)}
                      disabled={editingShift !== shift.id}
                    />
                  </div>
                  {/* Input for effective from date */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Effective From
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={editingShift === shift.id ? (editingValues[shift.id]?.effective_from ?? shift.effective_from) : shift.effective_from}
                      onChange={(e) => handleEditChange(shift.id, 'effective_from', e.target.value)}
                      disabled={editingShift !== shift.id}
                    />
                  </div>
                  {/* Input for effective to date */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Effective To
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={editingShift === shift.id ? (editingValues[shift.id]?.effective_to ?? shift.effective_to) : shift.effective_to || ''}
                      onChange={(e) => handleEditChange(shift.id, 'effective_to', e.target.value)}
                      disabled={editingShift !== shift.id}
                      placeholder="Optional"
                    />
                  </div>
                  {/* Input for branch override */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Override Branch ID
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={editingShift === shift.id ? (editingValues[shift.id]?.override_branch_id ?? shift.override_branch_id) : shift.override_branch_id || ''}
                      onChange={(e) => handleEditChange(shift.id, 'override_branch_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      disabled={editingShift !== shift.id}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                {/* Save/Cancel buttons, only shown when editing */}
                {editingShift === shift.id && (
                  <div className="flex justify-end gap-2" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <button className="btn btn-outline" onClick={() => handleCancelEdit(shift.id)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSaveShift(shift.id)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {shiftTimings.filter(shift => !shift.user_id).length === 0 && (
            <div className="card p-8 flex flex-col items-center justify-center">
              <Building className="w-12 h-12" style={{ color: '#e5e7eb' }} />
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>No shift settings found</p>
            </div>
          )}
        </div>
      )}

      {/* Conditional rendering for Individual Settings tab */}
      {activeTab === 'individuals' && (
        <div className="space-y-6">
          {/* Header for individual settings with add button */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Individual Shifts</h3>
                <p className="text-muted">Set individual shift times for specific staff members</p>
              </div>
              {/* Button to open add individual modal */}
              <button
                className="btn btn-primary"
                onClick={() => setShowAddIndividualModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Individual Shift
              </button>
            </div>
          </div>

          {/* Modal for adding new individual shift setting */}
          {showAddIndividualModal && (
            <div className="card p-4">
              <h4 style={{ marginBottom: '0.5rem' }}>Add Individual Shift</h4>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-3">
                {/* Autocomplete input for staff name */}
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    placeholder="Staff Name"
                    value={newIndividual.shift_name}
                    onChange={(e) => {
                      const q = e.target.value;
                      setNewIndividual({ ...newIndividual, shift_name: q });
                    }}
                  />
                </div>
                {/* Select for staff member */}
                <select
                  className="input"
                  value={newIndividual.user_id || ''}
                  onChange={(e) => setNewIndividual({ ...newIndividual, user_id: parseInt(e.target.value) || undefined })}
                >
                  <option value="">Select Staff Member</option>
                  {staffMembers.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} ({staff.department})
                    </option>
                  ))}
                </select>
                {/* Time inputs for start and end times */}
                <div className="flex gap-2">
                  <input
                    type="time"
                    className="input"
                    value={newIndividual.start_time.split(':')[0] + ':' + newIndividual.start_time.split(':')[1]}
                    onChange={(e) => setNewIndividual({ ...newIndividual, start_time: e.target.value + ':00' })}
                  />
                  <input
                    type="time"
                    className="input"
                    value={newIndividual.end_time.split(':')[0] + ':' + newIndividual.end_time.split(':')[1]}
                    onChange={(e) => setNewIndividual({ ...newIndividual, end_time: e.target.value + ':00' })}
                  />
                </div>
                {/* Date input for effective from */}
                <input
                  type="date"
                  className="input"
                  value={newIndividual.effective_from}
                  onChange={(e) => setNewIndividual({ ...newIndividual, effective_from: e.target.value })}
                />
              </div>
              {/* Buttons to cancel or add */}
              <div className="flex justify-end gap-2" style={{ marginTop: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setShowAddIndividualModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitNewIndividual}>Add</button>
              </div>
            </div>
          )}

          {/* Conditional rendering: empty state or table */}
          {individualShifts.length === 0 ? (
            <div className="card p-8 flex flex-col items-center justify-center">
              <User className="w-12 h-12" style={{ color: '#e5e7eb' }} />
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>No individual shifts set</p>
            </div>
          ) : (
            <div className="card">
              {/* Table for displaying individual shift settings */}
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Shift Name</th>
                    <th className="table-header-cell">Staff Name</th>
                    <th className="table-header-cell">Start Time</th>
                    <th className="table-header-cell">End Time</th>
                    <th className="table-header-cell">Effective From</th>
                    <th className="table-header-cell">Effective To</th>
                    <th className="table-header-cell right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map over individual shifts to display rows */}
                  {individualShifts.map((shift) => {
                    const staff = staffMembers.find(s => s.id === shift.user_id);
                    return (
                      <tr key={shift.id} className="table-row">
                        {/* Shift Name column */}
                        <td className="table-cell">
                          <span className="badge badge-secondary">{shift.shift_name}</span>
                        </td>
                        {/* Staff Name column with avatar */}
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
                              {(staff?.firstName || shift.shift_name).split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ fontWeight: 500 }}>
                              {staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff'}
                            </span>
                          </div>
                        </td>
                        {/* Start Time column with edit input if editing */}
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted" />
                            {editingIndividualId === shift.id ? (
                              <input 
                                type="time" 
                                className="input" 
                                value={editingIndividualValues[shift.id]?.start_time?.substring(0, 5) || shift.start_time.substring(0, 5)} 
                                onChange={(e) => handleIndividualChange(shift.id, 'start_time', e.target.value + ':00')} 
                              />
                            ) : (
                              <span style={{ fontWeight: 500 }}>{shift.start_time.substring(0, 5)}</span>
                            )}
                          </div>
                        </td>
                        {/* End Time column with edit input if editing */}
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted" />
                            {editingIndividualId === shift.id ? (
                              <input 
                                type="time" 
                                className="input" 
                                value={editingIndividualValues[shift.id]?.end_time?.substring(0, 5) || shift.end_time.substring(0, 5)} 
                                onChange={(e) => handleIndividualChange(shift.id, 'end_time', e.target.value + ':00')} 
                              />
                            ) : (
                              <span style={{ fontWeight: 500 }}>{shift.end_time.substring(0, 5)}</span>
                            )}
                          </div>
                        </td>
                        {/* Effective From column */}
                        <td className="table-cell">{shift.effective_from}</td>
                        {/* Effective To column */}
                        <td className="table-cell">{shift.effective_to || 'N/A'}</td>
                        {/* Actions column with edit/save/cancel/remove buttons */}
                        <td className="table-cell right">
                          <div className="flex items-center justify-end gap-2">
                            {editingIndividualId === shift.id ? (
                              <>
                                <button className="btn btn-sm btn-primary" onClick={() => handleSaveIndividual(shift.id)}>
                                  Save
                                </button>
                                <button className="btn btn-sm btn-outline" onClick={() => handleCancelIndividual(shift.id)}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-sm btn-outline" onClick={() => handleStartEditIndividual(shift)}>
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </button>
                                <button className="btn btn-sm btn-outline red" onClick={() => handleRemoveIndividual(shift.id)}>
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}