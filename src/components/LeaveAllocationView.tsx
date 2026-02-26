import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import {
  getAllAllocations,
  getMyAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  bulkAllocateSelected,
  bulkAllocateAll,
  LeaveAllocation,
  CreateAllocationRequest,
  BulkAllocationRequest,
  UpdateAllocationRequest,
  PaginationParams
} from '../services/leaveAllocationService';
import { getAllLeaveTypes, LeaveType } from '../services/leaveManagementService';
import { getAllStaff } from '../services/staffManagementService';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  staff_id?: string;
  department?: string;
}

const LeaveAllocationView = () => {
  // State management
  const [allocations, setAllocations] = useState<LeaveAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<{
    currentPage: number;
    perPage: number;
    totalRecords: number;
    totalPages: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkAllModal, setShowBulkAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<LeaveAllocation | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateAllocationRequest>({
    user_id: 0,
    leave_type_id: 0,
    allocated_days: 21,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    carried_over_days: 0,
  });
  
  const [bulkForm, setBulkForm] = useState<Partial<BulkAllocationRequest>>({
    leave_type_id: 0,
    allocated_days: 21,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    carried_over_days: 0,
    user_ids: [],
  });
  
  const [bulkAllForm, setBulkAllForm] = useState<Omit<BulkAllocationRequest, 'user_ids'>>({
    leave_type_id: 0,
    allocated_days: 21,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    carried_over_days: 0,
  });
  
  const [editForm, setEditForm] = useState<UpdateAllocationRequest>({
    allocated_days: 0,
    used_days: 0,
    carried_over_days: 0,
  });

  // Load data
  useEffect(() => {
    fetchData();
    loadLeaveTypes();
    loadStaffMembers();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: PaginationParams = {
        page: currentPage,
        limit,
      };

      if (selectedUserId) params.userId = Number(selectedUserId);
      if (selectedLeaveTypeId) params.leaveTypeId = Number(selectedLeaveTypeId);

      console.log('Fetching allocations with params:', params);
      const result = await getAllAllocations(params);
      console.log('Allocations result:', result);

      if (result.success && result.allocations) {
        console.log('Setting allocations:', result.allocations.length, 'items');
        setAllocations(result.allocations);
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.currentPage,
            perPage: result.pagination.itemsPerPage,
            totalRecords: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
          });
        }
      } else {
        console.warn('Failed to fetch allocations:', result.message);
        setError(result.message || 'Failed to fetch allocations');
      }
    } catch (err: any) {
      console.error('Error fetching allocations:', err);
      setError(err.message || 'An error occurred while fetching allocations');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const result = await getAllLeaveTypes();
      if (result.success && result.leaveTypes) {
        setLeaveTypes(result.leaveTypes);
      }
    } catch (err) {
      console.error('Error loading leave types:', err);
    }
  };

  const loadStaffMembers = async () => {
    try {
      const result = await getAllStaff();
      if (result.success && result.staff) {
        setStaffMembers(result.staff);
      }
    } catch (err) {
      console.error('Error loading staff members:', err);
    }
  };

  // Handlers
  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Creating allocation with form data:', createForm);

    try {
      const result = await createAllocation(createForm);
      console.log('Create allocation result:', result);

      if (result.success) {
        setSuccessMessage(result.message || 'Allocation created successfully');
        setShowCreateModal(false);
        resetCreateForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to create allocation');
      }
    } catch (err: any) {
      console.error('Error creating allocation:', err);
      setError(err.message || 'An error occurred while creating allocation');
    }
  };

  const handleBulkAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!bulkForm.user_ids || bulkForm.user_ids.length === 0) {
        setError('Please select at least one user');
        return;
      }
      
      const result = await bulkAllocateSelected({
        leave_type_id: Number(bulkForm.leave_type_id),
        allocated_days: Number(bulkForm.allocated_days),
        cycle_start_date: bulkForm.cycle_start_date!,
        cycle_end_date: bulkForm.cycle_end_date!,
        carried_over_days: Number(bulkForm.carried_over_days || 0),
        user_ids: bulkForm.user_ids,
      });
      
      if (result.success) {
        setSuccessMessage(result.message || 'Bulk allocation successful');
        setShowBulkModal(false);
        resetBulkForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to bulk allocate');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during bulk allocation');
    }
  };

  const handleBulkAllocateAll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await bulkAllocateAll({
        leave_type_id: Number(bulkAllForm.leave_type_id),
        allocated_days: Number(bulkAllForm.allocated_days),
        cycle_start_date: bulkAllForm.cycle_start_date!,
        cycle_end_date: bulkAllForm.cycle_end_date!,
        carried_over_days: Number(bulkAllForm.carried_over_days || 0),
      });
      
      if (result.success) {
        setSuccessMessage(result.message || 'Allocation to all users successful');
        setShowBulkAllModal(false);
        resetBulkAllForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to allocate to all users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during allocation');
    }
  };

  const handleDeleteAllocation = async () => {
    if (!selectedAllocation) return;
    
    try {
      const result = await deleteAllocation(selectedAllocation.id);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Allocation deleted successfully');
        setShowDeleteModal(false);
        setSelectedAllocation(null);
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to delete allocation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting allocation');
    }
  };

  const openEditModal = (allocation: LeaveAllocation) => {
    setSelectedAllocation(allocation);
    setEditForm({
      allocated_days: Number(allocation.allocated_days) || 0,
      used_days: Number(allocation.used_days) || 0,
      carried_over_days: Number(allocation.carried_over_days) || 0,
    });
    setShowEditModal(true);
  };

  const handleEditAllocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAllocation) return;

    console.log('Updating allocation:', selectedAllocation.id, editForm);

    try {
      const result = await updateAllocation(selectedAllocation.id, editForm);
      console.log('Update allocation result:', result);

      if (result.success) {
        setSuccessMessage(result.message || 'Allocation updated successfully');
        setShowEditModal(false);
        setSelectedAllocation(null);
        resetEditForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to update allocation');
      }
    } catch (err: any) {
      console.error('Error updating allocation:', err);
      setError(err.message || 'An error occurred while updating allocation');
    }
  };

  const openDeleteModal = (allocation: LeaveAllocation) => {
    setSelectedAllocation(allocation);
    setShowDeleteModal(true);
  };

  // Reset forms
  const resetCreateForm = () => {
    setCreateForm({
      user_id: 0,
      leave_type_id: 0,
      allocated_days: 21,
      cycle_start_date: new Date().toISOString().split('T')[0],
      cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      carried_over_days: 0,
    });
  };

  const resetBulkForm = () => {
    setBulkForm({
      leave_type_id: 0,
      allocated_days: 21,
      cycle_start_date: new Date().toISOString().split('T')[0],
      cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      carried_over_days: 0,
      user_ids: [],
    });
  };

  const resetBulkAllForm = () => {
    setBulkAllForm({
      leave_type_id: 0,
      allocated_days: 21,
      cycle_start_date: new Date().toISOString().split('T')[0],
      cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      carried_over_days: 0,
    });
  };

  const resetEditForm = () => {
    setEditForm({
      allocated_days: 0,
      used_days: 0,
      carried_over_days: 0,
    });
  };

  // Filter allocations
  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = searchTerm === '' || 
                         allocation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = !selectedUserId || allocation.user_id === Number(selectedUserId);
    const matchesLeaveType = !selectedLeaveTypeId || allocation.leave_type_id === Number(selectedLeaveTypeId);

    return matchesSearch && matchesUser && matchesLeaveType;
  });

  // Calculate remaining days
  const calculateRemaining = (allocated: number, used: number) => allocated - used;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Allocations</h1>
        <p className="text-gray-600 mt-1">Manage employee leave allocations and balances</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards - Compact design to fit all 4 on one line */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Allocations Card */}
        <div
          className="card p-3 transition-all hover-lift"
        >
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Users className="w-3 h-3" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Total Allocations</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{allocations.length}</p>
            </div>
          </div>
        </div>

        {/* Total Days Allocated Card */}
        <div
          className="card p-3 transition-all hover-lift"
        >
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <CheckCircle className="w-3 h-3" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Days Allocated</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>
                {allocations.reduce((sum, a) => sum + (Number(a.allocated_days) || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Days Used Card */}
        <div
          className="card p-3 transition-all hover-lift"
        >
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef9c3', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Calendar className="w-3 h-3" style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Days Used</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>
                {allocations.reduce((sum, a) => sum + (Number(a.used_days) || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Days Remaining Card */}
        <div
          className="card p-3 transition-all hover-lift"
        >
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#d1fae5', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <TrendingUp className="w-3 h-3" style={{ color: '#10b981' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Days Remaining</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>
                {allocations.reduce((sum, a) => sum + ((Number(a.allocated_days) || 0) - (Number(a.used_days) || 0)), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons and Search - Similar to Leave Management */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => {
              loadStaffMembers();
              setShowCreateModal(true);
            }}
            className="btn btn-sm btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Allocation
          </button>
          <button
            onClick={() => {
              loadStaffMembers();
              setShowBulkModal(true);
            }}
            className="btn btn-sm"
            style={{ backgroundColor: '#7c3aed', color: 'white' }}
          >
            <Users className="w-4 h-4 mr-2" />
            Bulk Allocate
          </button>
          <button
            onClick={() => setShowBulkAllModal(true)}
            className="btn btn-sm"
            style={{ backgroundColor: '#4f46e5', color: 'white' }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Allocate to All
          </button>

          <div className="flex-1"></div>

          <div className="input-wrapper" style={{ minWidth: '250px' }}>
            <div className="input-icon">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by staff name, email, or leave type..."
              className="input input-with-icon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Filters'}
          </button>

          <button
            onClick={fetchData}
            className="btn btn-sm btn-outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block', color: '#374151' }}>
                Filter by Staff
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                className="input"
                style={{ backgroundColor: 'white', color: '#1f2937' }}
              >
                <option value="">All Staff</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} {staff.staff_id ? `(${staff.staff_id})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block', color: '#374151' }}>
                Filter by Leave Type
              </label>
              <select
                value={selectedLeaveTypeId}
                onChange={(e) => setSelectedLeaveTypeId(e.target.value ? Number(e.target.value) : '')}
                className="input"
                style={{ backgroundColor: 'white', color: '#1f2937' }}
              >
                <option value="">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Allocations Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Staff Member</th>
                <th className="table-header-cell">Leave Type</th>
                <th className="table-header-cell">Allocated</th>
                <th className="table-header-cell">Used</th>
                <th className="table-header-cell">Remaining</th>
                <th className="table-header-cell">Carried Over</th>
                <th className="table-header-cell">Cycle Period</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading allocations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No allocations found</p>
                    <p className="text-gray-400 text-sm">Create a new allocation to get started</p>
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((allocation) => {
                  const allocated = Number(allocation.allocated_days) || 0;
                  const used = Number(allocation.used_days) || 0;
                  const remaining = allocated - used;
                  const percentage = allocated > 0 ? (used / allocated) * 100 : 0;

                  return (
                    <tr key={allocation.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {allocation.user_name || `User ${allocation.user_id}`}
                          </p>
                          <p className="text-xs text-muted">ID: {allocation.user_id}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {allocation.leave_type_name || `Type ${allocation.leave_type_id}`}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#dcfce7' }}>
                          <CheckCircle className="w-3 h-3" style={{ color: '#16a34a' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#16a34a' }}>
                            {allocated}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#fef3c7' }}>
                          <Calendar className="w-3 h-3" style={{ color: '#f59e0b' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f59e0b' }}>
                            {used}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              remaining < 5 ? 'text-red-600' :
                              remaining < 10 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {remaining} days
                            </span>
                          </div>
                          <div className="mt-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentage > 90 ? 'bg-red-500' :
                                percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {Number(allocation.carried_over_days) || 0}
                        </span>
                        <span className="text-xs text-muted ml-1">days</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            <Calendar className="inline w-3 h-3 mr-1" />
                            {new Date(allocation.cycle_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-muted">
                            to {new Date(allocation.cycle_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(allocation)}
                            className="btn btn-sm btn-outline green"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(allocation)}
                            className="btn btn-sm btn-outline red"
                            title="Delete"
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
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted">
              Showing <span style={{ fontWeight: 600, color: '#1f2937' }}>{((currentPage - 1) * limit) + 1}</span> to <span style={{ fontWeight: 600, color: '#1f2937' }}>{Math.min(currentPage * limit, pagination.totalRecords)}</span> of <span style={{ fontWeight: 600, color: '#1f2937' }}>{pagination.totalRecords}</span> allocations
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 hover:border-gray-400"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 3) {
                  pageNum = pagination.totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-1.5 border rounded-lg transition-all text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 hover:border-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Allocation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Leave Allocation</h2>
            </div>
            <form onSubmit={handleCreateAllocation} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Member *
                  </label>
                  <select
                    value={createForm.user_id || ''}
                    onChange={(e) => setCreateForm({ ...createForm, user_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} {staff.staff_id ? `(${staff.staff_id})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    value={createForm.leave_type_id || ''}
                    onChange={(e) => setCreateForm({ ...createForm, leave_type_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.daysPerYear} days/year)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated Days *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.allocated_days || ''}
                    onChange={(e) => setCreateForm({ ...createForm, allocated_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle Start Date *
                  </label>
                  <input
                    type="date"
                    value={createForm.cycle_start_date}
                    onChange={(e) => setCreateForm({ ...createForm, cycle_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle End Date *
                  </label>
                  <input
                    type="date"
                    value={createForm.cycle_end_date}
                    onChange={(e) => setCreateForm({ ...createForm, cycle_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.carried_over_days || ''}
                    onChange={(e) => setCreateForm({ ...createForm, carried_over_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Allocation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Bulk Allocate to Selected Users</h2>
            </div>
            <form onSubmit={handleBulkAllocate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    value={bulkForm.leave_type_id || ''}
                    onChange={(e) => setBulkForm({ ...bulkForm, leave_type_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.daysPerYear} days/year)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated Days *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkForm.allocated_days || ''}
                    onChange={(e) => setBulkForm({ ...bulkForm, allocated_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Users *
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white">
                    {staffMembers.map(staff => (
                      <label key={staff.id} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                        <input
                          type="checkbox"
                          checked={bulkForm.user_ids?.includes(staff.id)}
                          onChange={(e) => {
                            const current = bulkForm.user_ids || [];
                            if (e.target.checked) {
                              setBulkForm({ ...bulkForm, user_ids: [...current, staff.id] });
                            } else {
                              setBulkForm({ ...bulkForm, user_ids: current.filter(id => id !== staff.id) });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{staff.name}</span>
                          {staff.staff_id && (
                            <span className="text-xs text-gray-500 ml-2">({staff.staff_id})</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle Start Date *
                  </label>
                  <input
                    type="date"
                    value={bulkForm.cycle_start_date}
                    onChange={(e) => setBulkForm({ ...bulkForm, cycle_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle End Date *
                  </label>
                  <input
                    type="date"
                    value={bulkForm.cycle_end_date}
                    onChange={(e) => setBulkForm({ ...bulkForm, cycle_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkForm.carried_over_days || ''}
                    onChange={(e) => setBulkForm({ ...bulkForm, carried_over_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    resetBulkForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Allocate to Selected
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Allocate All Modal */}
      {showBulkAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Allocate to All Active Users</h2>
              <p className="text-sm text-gray-600 mt-1">This will create allocations for all active staff members</p>
            </div>
            <form onSubmit={handleBulkAllocateAll} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    value={bulkAllForm.leave_type_id || ''}
                    onChange={(e) => setBulkAllForm({ ...bulkAllForm, leave_type_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.daysPerYear} days/year)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated Days *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkAllForm.allocated_days || ''}
                    onChange={(e) => setBulkAllForm({ ...bulkAllForm, allocated_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle Start Date *
                  </label>
                  <input
                    type="date"
                    value={bulkAllForm.cycle_start_date}
                    onChange={(e) => setBulkAllForm({ ...bulkAllForm, cycle_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle End Date *
                  </label>
                  <input
                    type="date"
                    value={bulkAllForm.cycle_end_date}
                    onChange={(e) => setBulkAllForm({ ...bulkAllForm, cycle_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkAllForm.carried_over_days || ''}
                    onChange={(e) => setBulkAllForm({ ...bulkAllForm, carried_over_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkAllModal(false);
                    resetBulkAllForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Allocate to All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Allocation Modal */}
      {showEditModal && selectedAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Leave Allocation</h2>
            </div>
            <form onSubmit={handleEditAllocation} className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Staff:</strong> {selectedAllocation.user_name || `User ${selectedAllocation.user_id}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Leave Type:</strong> {selectedAllocation.leave_type_name || `Type ${selectedAllocation.leave_type_id}`}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated Days *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.allocated_days || ''}
                    onChange={(e) => setEditForm({ ...editForm, allocated_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Used Days *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.used_days || ''}
                    onChange={(e) => setEditForm({ ...editForm, used_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {editForm.used_days > (editForm.allocated_days + editForm.carried_over_days) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Used days cannot exceed allocated + carried over days ({editForm.allocated_days + editForm.carried_over_days})
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.carried_over_days || ''}
                    onChange={(e) => setEditForm({ ...editForm, carried_over_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Remaining Days:</strong>{' '}
                    <span className={editForm.allocated_days + editForm.carried_over_days - editForm.used_days < 0 ? 'text-red-600 font-semibold' : 'text-blue-600 font-semibold'}>
                      {editForm.allocated_days + editForm.carried_over_days - editForm.used_days}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAllocation(null);
                    resetEditForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.used_days > (editForm.allocated_days + editForm.carried_over_days)}
                  className="flex-1 px-4 py-2 bg-black text-dark rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Delete Allocation</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this allocation for{' '}
                <strong>{selectedAllocation.user?.name || `User ${selectedAllocation.userId}`}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedAllocation(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllocation}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAllocationView;
