import React, { useState, useEffect } from 'react';
import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest
} from '../services/branchManagementService';
import { Building, MapPin, Phone, Mail, Plus, Edit3, Trash2, X, Check, AlertCircle, Clock } from 'lucide-react';

const BranchManagementView = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form data
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchCountry, setBranchCountry] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchEmail, setBranchEmail] = useState('');
  const [branchLocationCoordinates, setBranchLocationCoordinates] = useState('');
  const [branchLocationRadius, setBranchLocationRadius] = useState<number>(100);
  const [branchAttendanceMode, setBranchAttendanceMode] = useState('branch_based');
  const [branchStatus, setBranchStatus] = useState('active');

  // Location state
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const branchesResponse = await getAllBranches();
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches || []);
      } else {
        setError(branchesResponse.message || 'Failed to load branches');
      }
    } catch (err) {
      setError('An error occurred while loading branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordinateString = `${longitude},${latitude}`;
        setBranchLocationCoordinates(coordinateString);
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location services and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('The request to get location timed out.');
            break;
          default:
            setError('An unknown error occurred while getting location.');
            break;
        }
      }
    );
  };

  const handleCreateBranch = async () => {
    if (!branchName.trim() || !branchCode.trim()) {
      setError('Branch name and code are required');
      return;
    }

    const branchData: CreateBranchRequest = {
      name: branchName,
      code: branchCode,
      address: branchAddress,
      city: branchCity,
      state: branchState,
      country: branchCountry,
      phone: branchPhone,
      email: branchEmail,
      location_coordinates: branchLocationCoordinates,
      location_radius_meters: branchLocationRadius,
      attendance_mode: branchAttendanceMode
    };

    try {
      const response = await createBranch(branchData);
      if (response.success) {
        setSuccessMessage('Branch created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadBranches();
      } else {
        setError(response.message || 'Failed to create branch');
      }
    } catch (err) {
      setError('An error occurred while creating the branch');
      console.error(err);
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !branchName.trim() || !branchCode.trim()) {
      setError('Branch name and code are required');
      return;
    }

    const branchData: UpdateBranchRequest = {
      name: branchName,
      code: branchCode,
      address: branchAddress,
      city: branchCity,
      state: branchState,
      country: branchCountry,
      phone: branchPhone,
      email: branchEmail,
      location_coordinates: branchLocationCoordinates,
      location_radius_meters: branchLocationRadius,
      attendance_mode: branchAttendanceMode,
      status: branchStatus
    };

    try {
      const response = await updateBranch(editingBranch.id, branchData);
      if (response.success) {
        setSuccessMessage('Branch updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadBranches();
      } else {
        setError(response.message || 'Failed to update branch');
      }
    } catch (err) {
      setError('An error occurred while updating the branch');
      console.error(err);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteBranch(branchId);
      if (response.success) {
        setSuccessMessage('Branch deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadBranches();
      } else {
        setError(response.message || 'Failed to delete branch');
      }
    } catch (err) {
      setError('An error occurred while deleting the branch');
      console.error(err);
    }
  };

  const resetForm = () => {
    setBranchName('');
    setBranchCode('');
    setBranchAddress('');
    setBranchCity('');
    setBranchState('');
    setBranchCountry('');
    setBranchPhone('');
    setBranchEmail('');
    setBranchLocationCoordinates('');
    setBranchLocationRadius(100);
    setBranchAttendanceMode('branch_based');
    setBranchStatus('active');
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingBranch(null);
    setError(null);
    setLoadingLocation(false);
  };

  const handleEditClick = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchCode(branch.code);
    setBranchAddress(branch.address);
    setBranchCity(branch.city);
    setBranchState(branch.state);
    setBranchCountry(branch.country);
    setBranchPhone(branch.phone);
    setBranchEmail(branch.email);
    setBranchLocationCoordinates(branch.location_coordinates);
    setBranchLocationRadius(branch.location_radius_meters);
    setBranchAttendanceMode(branch.attendance_mode);
    setBranchStatus(branch.status);
    setShowEditForm(true);
    setError(null);
    setLoadingLocation(false);
  };

  // Calculate statistics
  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === 'active').length;
  const inactiveBranches = branches.filter(b => b.status === 'inactive').length;
  const closedBranches = branches.filter(b => b.status === 'closed').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Compact design to fit all 4 on one line */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Building className="w-3 h-3" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Total Branches</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{totalBranches}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Check className="w-3 h-3" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Active</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{activeBranches}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef9c3', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Clock className="w-3 h-3" style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Inactive</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{inactiveBranches}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <X className="w-3 h-3" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Closed</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{closedBranches}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Branch
        </button>
      </div>

      {/* Create Branch Form Modal */}
      {showCreateForm && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Branch</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchName" className="block text-sm font-medium mb-1">Branch Name *</label>
                    <input
                      type="text"
                      id="branchName"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch name"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchCode" className="block text-sm font-medium mb-1">Branch Code *</label>
                    <input
                      type="text"
                      id="branchCode"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="branchAddress" className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    id="branchAddress"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    className="input w-full"
                    placeholder="Enter branch address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="branchCity" className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      id="branchCity"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="input w-full"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchState" className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      id="branchState"
                      value={branchState}
                      onChange={(e) => setBranchState(e.target.value)}
                      className="input w-full"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchCountry" className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      id="branchCountry"
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      className="input w-full"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchPhone" className="block text-sm font-medium mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="branchPhone"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="input w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="branchEmail" className="block text-sm font-medium mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        id="branchEmail"
                        value={branchEmail}
                        onChange={(e) => setBranchEmail(e.target.value)}
                        className="input w-full"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchLocationCoordinates" className="block text-sm font-medium mb-1">Location Coordinates</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="branchLocationCoordinates"
                        value={branchLocationCoordinates}
                        onChange={(e) => setBranchLocationCoordinates(e.target.value)}
                        className="input w-full"
                        placeholder="e.g., POINT(3.3869 6.4458)"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="btn btn-secondary whitespace-nowrap"
                        disabled={loadingLocation}
                      >
                        {loadingLocation ? 'Getting...' : 'Get Location'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="branchLocationRadius" className="block text-sm font-medium mb-1">Location Radius (meters)</label>
                    <input
                      type="number"
                      id="branchLocationRadius"
                      value={branchLocationRadius}
                      onChange={(e) => setBranchLocationRadius(Number(e.target.value))}
                      className="input w-full"
                      placeholder="Enter radius in meters"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchAttendanceMode" className="block text-sm font-medium mb-1">Attendance Mode</label>
                    <select
                      id="branchAttendanceMode"
                      value={branchAttendanceMode}
                      onChange={(e) => setBranchAttendanceMode(e.target.value)}
                      className="input w-full"
                    >
                      <option value="branch_based">Branch Based</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="branchStatus" className="block text-sm font-medium mb-1">Status</label>
                    <select
                      id="branchStatus"
                      value={branchStatus}
                      onChange={(e) => setBranchStatus(e.target.value)}
                      className="input w-full"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBranch}>
                <Check className="w-4 h-4 mr-2" />
                Create Branch
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Branch Form Modal */}
      {showEditForm && editingBranch && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Branch: {editingBranch.name}</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchName" className="block text-sm font-medium mb-1">Branch Name *</label>
                    <input
                      type="text"
                      id="editBranchName"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch name"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchCode" className="block text-sm font-medium mb-1">Branch Code *</label>
                    <input
                      type="text"
                      id="editBranchCode"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="editBranchAddress" className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    id="editBranchAddress"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    className="input w-full"
                    placeholder="Enter branch address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="editBranchCity" className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      id="editBranchCity"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="input w-full"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchState" className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      id="editBranchState"
                      value={branchState}
                      onChange={(e) => setBranchState(e.target.value)}
                      className="input w-full"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchCountry" className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      id="editBranchCountry"
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      className="input w-full"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchPhone" className="block text-sm font-medium mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="editBranchPhone"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="input w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="editBranchEmail" className="block text-sm font-medium mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        id="editBranchEmail"
                        value={branchEmail}
                        onChange={(e) => setBranchEmail(e.target.value)}
                        className="input w-full"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchLocationCoordinates" className="block text-sm font-medium mb-1">Location Coordinates</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="editBranchLocationCoordinates"
                        value={branchLocationCoordinates}
                        onChange={(e) => setBranchLocationCoordinates(e.target.value)}
                        className="input w-full"
                        placeholder="e.g., POINT(3.3869 6.4458)"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="btn btn-secondary whitespace-nowrap"
                        disabled={loadingLocation}
                      >
                        {loadingLocation ? 'Getting...' : 'Get Location'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="editBranchLocationRadius" className="block text-sm font-medium mb-1">Location Radius (meters)</label>
                    <input
                      type="number"
                      id="editBranchLocationRadius"
                      value={branchLocationRadius}
                      onChange={(e) => setBranchLocationRadius(Number(e.target.value))}
                      className="input w-full"
                      placeholder="Enter radius in meters"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchAttendanceMode" className="block text-sm font-medium mb-1">Attendance Mode</label>
                    <select
                      id="editBranchAttendanceMode"
                      value={branchAttendanceMode}
                      onChange={(e) => setBranchAttendanceMode(e.target.value)}
                      className="input w-full"
                    >
                      <option value="branch_based">Branch Based</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="editBranchStatus" className="block text-sm font-medium mb-1">Status</label>
                    <select
                      id="editBranchStatus"
                      value={branchStatus}
                      onChange={(e) => setBranchStatus(e.target.value)}
                      className="input w-full"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateBranch}>
                <Check className="w-4 h-4 mr-2" />
                Update Branch
              </button>
            </div>
          </div>
        </>
      )}

      {/* Branches Table */}
      <div className="card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Existing Branches</h3>
          <p className="text-muted text-sm">Showing {branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Branch</th>
                <th className="table-header-cell">Code</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem' }}>
                        {branch.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{branch.name}</p>
                        <p className="text-xs text-muted">{branch.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell font-medium">{branch.code}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{`${branch.city}, ${branch.state}`}</span>
                    </div>
                    <p className="text-xs text-muted">{branch.country}</p>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-xs">{branch.email}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      branch.status === 'active' ? 'badge-success' :
                      branch.status === 'inactive' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="table-cell right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(branch)}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="btn btn-sm btn-outline red"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {branches.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Branches Yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first branch</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Branch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { BranchManagementView };
