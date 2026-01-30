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

const BranchManagementView = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

      // Load branches
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
        // Format coordinates as expected by the backend (assuming it expects a specific format)
        const coordinateString = `${longitude},${latitude}`; // Adjust format as needed
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
        setBranches([...branches, response.branch!]);
        resetForm();
        loadBranches(); // Refresh the list
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
        setBranches(branches.map(b => b.id === editingBranch.id ? {...response.branch!, location_radius_meters: response.branch!.location_radius_meters} : b));
        resetForm();
        loadBranches(); // Refresh the list
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
        setBranches(branches.filter(b => b.id !== branchId));
        loadBranches(); // Refresh the list
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end items-center">
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
        >
          Create New Branch
        </button>
      </div>

      {/* Create Branch Form */}
      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Create New Branch</h3>
          
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
                <input
                  type="text"
                  id="branchPhone"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="input w-full"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label htmlFor="branchEmail" className="block text-sm font-medium mb-1">Email</label>
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
                    placeholder="Enter coordinates (e.g., POINT(3.3869 6.4458))"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="btn btn-secondary whitespace-nowrap"
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? 'Getting...' : 'Get My Location'}
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
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleCreateBranch}
                className="btn btn-primary"
              >
                Create Branch
              </button>
              <button
                onClick={resetForm}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Form */}
      {showEditForm && editingBranch && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Edit Branch: {editingBranch.name}</h3>
          
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
                <input
                  type="text"
                  id="editBranchPhone"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="input w-full"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label htmlFor="editBranchEmail" className="block text-sm font-medium mb-1">Email</label>
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
                    placeholder="Enter coordinates (e.g., POINT(3.3869 6.4458))"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="btn btn-secondary whitespace-nowrap"
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? 'Getting...' : 'Get My Location'}
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
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleUpdateBranch}
                className="btn btn-primary"
              >
                Update Branch
              </button>
              <button
                onClick={resetForm}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branches List */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Existing Branches</h3>
        
        {branches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Code</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Contact</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id} className="table-row">
                    <td className="table-cell font-medium">{branch.name}</td>
                    <td className="table-cell">{branch.code}</td>
                    <td className="table-cell">{`${branch.city}, ${branch.state}, ${branch.country}`}</td>
                    <td className="table-cell">{branch.phone}<br/>{branch.email}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        branch.status === 'active' ? 'badge-success' : 
                        branch.status === 'inactive' ? 'badge-warning' : 
                        'badge-danger'
                      }`}>
                        {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell">{branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(branch)}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="btn btn-sm btn-outline btn-error"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No branches found. Create your first branch to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { BranchManagementView };