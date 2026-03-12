// AttendanceLocationsView.tsx
// Admin interface for managing attendance check-in locations

import React, { useState, useEffect } from 'react';
import {
  getAllAttendanceLocations,
  createAttendanceLocation,
  updateAttendanceLocation,
  deleteAttendanceLocation,
  AttendanceLocation
} from '../services/attendanceService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import {
  MapPin, Plus, Edit2, Trash2, Search, Filter, RefreshCw,
  CheckCircle, XCircle, Building, ChevronLeft, ChevronRight
} from 'lucide-react';

interface LocationWithBranch extends AttendanceLocation {
  branch_name?: string;
  branch_code?: string;
}

const AttendanceLocationsView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state
  const [locations, setLocations] = useState<LocationWithBranch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithBranch | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    location_coordinates: '',
    location_radius_meters: 100,
    branch_id: 0,
    is_active: true,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    location_coordinates: '',
    location_radius_meters: 100,
    branch_id: 0,
    is_active: true,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [locationsRes, branchesRes] = await Promise.all([
        getAllAttendanceLocations(),
        getAllBranches()
      ]);

      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches);
      }

      if (locationsRes.success && locationsRes.locations) {
        // Enrich locations with branch info
        const enriched = locationsRes.locations.map((loc: AttendanceLocation) => {
          const branch = branchesRes.branches?.find((b: Branch) => b.id === loc.branch_id);
          return {
            ...loc,
            branch_name: branch?.name,
            branch_code: branch?.code,
          };
        });
        setLocations(enriched);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter locations
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = searchTerm === '' ||
      loc.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedBranch || loc.branch_id === selectedBranch;

    const matchesActive = !showActiveOnly || loc.is_active;

    return matchesSearch && matchesBranch && matchesActive;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLocations.length / pageSize);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, showActiveOnly]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate coordinates format
    if (!createForm.location_coordinates || !createForm.location_coordinates.trim()) {
      setError('Coordinates are required');
      return;
    }
    
    // Validate coordinates format - should be "lng,lat" or "POINT(lng lat)"
    const coordPattern = /^-?\d+\.?\d*\s*[,]\s*-?\d+\.?\d*$|^POINT\s*\(\s*-?\d+\.?\d*\s+-?\d+\.?\d*\s*\)$/i;
    if (!coordPattern.test(createForm.location_coordinates)) {
      setError('Invalid coordinates format. Use: longitude,latitude (e.g., 36.8172,-1.2864)');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Creating location with:', createForm);
      const response = await createAttendanceLocation(createForm);
      console.log('📥 Response:', response);
      
      if (response.success) {
        setSuccessMessage('Location created successfully');
        setShowCreateModal(false);
        resetCreateForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to create location');
      }
    } catch (err: any) {
      console.error('❌ Create location error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create location');
    } finally {
      setLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const response = await updateAttendanceLocation(selectedLocation.id, editForm);
      if (response.success) {
        setSuccessMessage('Location updated successfully');
        setShowEditModal(false);
        setSelectedLocation(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to update location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const response = await deleteAttendanceLocation(selectedLocation.id);
      if (response.success) {
        setSuccessMessage('Location deleted successfully');
        setShowDeleteModal(false);
        setSelectedLocation(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      location_coordinates: '',
      location_radius_meters: 100,
      branch_id: 0,
      is_active: true,
    });
  };

  const openEditModal = (location: LocationWithBranch) => {
    setSelectedLocation(location);
    setEditForm({
      name: location.name,
      location_coordinates: location.location_coordinates,
      location_radius_meters: location.location_radius_meters,
      branch_id: location.branch_id,
      is_active: location.is_active,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (location: LocationWithBranch) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  // Parse coordinates for display
  const parseCoordinates = (coords: any) => {
    if (!coords) return null;
    
    // If it's already an object with x,y (from MySQL geometry)
    if (typeof coords === 'object' && coords.x && coords.y) {
      return { lng: coords.x, lat: coords.y };
    }
    
    // If it's a string in POINT format
    if (typeof coords === 'string') {
      const match = coords.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
      if (match) {
        return {
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2])
        };
      }
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Location
          </button>
          <button
            className="btn btn-outline"
            onClick={loadData}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input w-full pl-10"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <select
              className="input w-full"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="input w-full"
              value={showActiveOnly ? 'active' : 'all'}
              onChange={(e) => setShowActiveOnly(e.target.value === 'active')}
            >
              <option value="all">All Locations</option>
              <option value="active">Active Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <MapPin className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Locations</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{locations.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Active</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{locations.filter(l => l.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f1f5f9', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
              <Building className="w-5 h-5" style={{ color: '#475569' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Branches</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{branches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Location Name</th>
                <th className="table-header-cell">Branch</th>
                <th className="table-header-cell">Coordinates</th>
                <th className="table-header-cell">Radius</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading locations...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No locations found</p>
                    <p className="text-gray-400 text-sm">Adjust filters or create a new location</p>
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((location) => {
                  const coords = parseCoordinates(location.location_coordinates);
                  return (
                    <tr key={location.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p style={{ fontWeight: 500 }}>{location.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {location.branch_name ? (
                          <div>
                            <p style={{ fontWeight: 500 }}>{location.branch_name}</p>
                            {location.branch_code && (
                              <p className="text-xs text-muted">{location.branch_code}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">No branch</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {coords ? (
                          <div className="text-xs">
                            <p className="font-mono">Lat: {coords.lat.toFixed(4)}</p>
                            <p className="font-mono">Lng: {coords.lng.toFixed(4)}</p>
                          </div>
                        ) : (
                          <span className="text-muted">Invalid format</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-secondary">
                          {location.location_radius_meters}m
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${location.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(location)}
                            className="btn btn-sm btn-outline green"
                            title="Edit location"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(location)}
                            className="btn btn-sm btn-outline red"
                            title="Delete location"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, filteredLocations.length)}</span> of{' '}
                  <span className="font-medium">{filteredLocations.length}</span> locations
                </p>
                <select
                  className="input input-sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: 'auto', padding: '0.375rem 0.5rem' }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{ minWidth: '2.5rem' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Location Modal */}
      {showCreateModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Create Attendance Location</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-content space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Nairobi HQ - Main Entrance"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <select
                    className="input w-full"
                    value={createForm.branch_id || ''}
                    onChange={(e) => setCreateForm({ ...createForm, branch_id: Number(e.target.value) })}
                  >
                    <option value="">No branch (global location)</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Coordinates (POINT format) *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={createForm.location_coordinates}
                    onChange={(e) => setCreateForm({ ...createForm, location_coordinates: e.target.value })}
                    placeholder="POINT(longitude latitude)"
                    required
                  />
                  <p className="text-xs text-muted mt-1">
                    Format: POINT(lng lat) e.g., POINT(36.8172 -1.2864)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Radius (meters) *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={createForm.location_radius_meters}
                    onChange={(e) => setCreateForm({ ...createForm, location_radius_meters: Number(e.target.value) })}
                    min={50}
                    max={500}
                    step={10}
                    required
                  />
                  <p className="text-xs text-muted mt-1">
                    Geofence radius: 50-500 meters
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-is-active"
                    className="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="create-is-active" className="text-sm font-medium">Active</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Location Modal */}
      {showEditModal && selectedLocation && (
        <>
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Edit Attendance Location</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-content space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <select
                    className="input w-full"
                    value={editForm.branch_id || ''}
                    onChange={(e) => setEditForm({ ...editForm, branch_id: Number(e.target.value) })}
                  >
                    <option value="">No branch (global location)</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Coordinates (POINT format) *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={editForm.location_coordinates}
                    onChange={(e) => setEditForm({ ...editForm, location_coordinates: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Radius (meters) *</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={editForm.location_radius_meters}
                    onChange={(e) => setEditForm({ ...editForm, location_radius_meters: Number(e.target.value) })}
                    min={50}
                    max={500}
                    step={10}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-is-active"
                    className="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="edit-is-active" className="text-sm font-medium">Active</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Location'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLocation && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal" style={{ maxWidth: '28rem' }}>
            <div className="modal-header">
              <h3>Delete Location</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Warning: This action cannot be undone</p>
                  <p className="text-xs text-red-700 mt-1">Are you sure you want to delete this location?</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedLocation.name}</p>
                {selectedLocation.branch_name && (
                  <p className="text-xs text-muted mt-1">Branch: {selectedLocation.branch_name}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Location
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceLocationsView;
