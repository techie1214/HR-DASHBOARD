import { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
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
  TrendingUp,
  X,
  ChevronDown,
  Eye,
  FileText,
  CalendarDays,
  Clock,
  DollarSign
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

// Helper functions for avatar display
const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const avatarColor = (name: string) => {
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

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
  const [limit, setLimit] = useState(20);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Data
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkAllModal, setShowBulkAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<LeaveAllocation | null>(null);

  // Export filters
  const [exportFilters, setExportFilters] = useState<{
    userId: number | '';
    leaveTypeId: number | '';
    year: number | '';
    dateFrom: string;
    dateTo: string;
  }>({
    userId: '',
    leaveTypeId: '',
    year: '',
    dateFrom: '',
    dateTo: ''
  });

  // Bulk selection
  const [selectedAllocationIds, setSelectedAllocationIds] = useState<number[]>([]);
  const [selectAllMode, setSelectAllMode] = useState<'none' | 'current' | 'all'>('none');

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

  // Staff search for bulk modal
  const [bulkStaffSearch, setBulkStaffSearch] = useState('');

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
    extractAvailableYears();
  }, [currentPage, limit, selectedUserId, selectedLeaveTypeId, selectedYear]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, selectedLeaveTypeId, selectedYear]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const anyModalOpen = showCreateModal || showBulkModal || showBulkAllModal || 
                         showEditModal || showDeleteModal || showDetailsModal;
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showCreateModal, showBulkModal, showBulkAllModal, showEditModal, showDeleteModal, showDetailsModal]);

  const extractAvailableYears = () => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    years.add(currentYear + 1);
    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  };

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
      const result = await getAllStaff(1, 1000);
      if (result.success && result.staff) {
        console.log('Loaded staff members:', result.staff.length);
        console.log('Sample staff data:', result.staff[0]);
        const mappedStaff = result.staff.map((s: any) => {
          const firstName = s.first_name || s.firstName || s.firstname || '';
          const lastName = s.last_name || s.lastName || s.lastname || '';
          const middleName = s.middle_name || s.middleName || s.middlename || '';
          const fullName = [firstName, middleName, lastName].filter(n => n).join(' ').trim();

          return {
            id: s.id,
            name: fullName || s.name || s.full_name || s.staff_name || s.email || 'Unknown',
            email: s.work_email || s.email || s.personal_email || '',
            staff_id: s.staff_id || s.staffId || s.id?.toString(),
            department: s.department || s.department_name || ''
          };
        });
        console.log('Mapped staff members:', mappedStaff);
        setStaffMembers(mappedStaff);
      } else {
        console.warn('Failed to load staff:', result.message);
      }
    } catch (err) {
      console.error('Error loading staff members:', err);
    }
  };

  // Handlers
  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalError(null); // Clear previous errors

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
        // Show error in modal
        setCreateModalError(result.message || 'Failed to create allocation');
      }
    } catch (err: any) {
      console.error('Error creating allocation:', err);
      // Show error in modal
      setCreateModalError(err.message || 'An error occurred while creating allocation');
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

  const handleBulkDelete = async () => {
    if (selectedAllocationIds.length === 0) return;

    try {
      const deletePromises = selectedAllocationIds.map(id => deleteAllocation(id));
      await Promise.all(deletePromises);

      setSuccessMessage(`Successfully deleted ${selectedAllocationIds.length} allocations`);
      setSelectedAllocationIds([]);
      setSelectAllMode('none');
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during bulk delete');
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

  const openDetailsModal = (allocation: LeaveAllocation) => {
    setSelectedAllocation(allocation);
    setShowDetailsModal(true);
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
    setCreateModalError(null); // Clear errors when resetting
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

  // Toggle selection
  const toggleSelection = (id: number) => {
    setSelectedAllocationIds(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAllMode === 'all') {
      setSelectedAllocationIds([]);
      setSelectAllMode('none');
    } else if (selectAllMode === 'none') {
      setSelectedAllocationIds(allocations.map(a => a.id));
      setSelectAllMode('current');
    } else {
      setSelectedAllocationIds([]);
      setSelectAllMode('none');
    }
  };

  const isSelected = (id: number) => {
    if (selectAllMode === 'all') return true;
    return selectedAllocationIds.includes(id);
  };

  // Export to CSV with filters
  const exportToCSV = () => {
    // Filter allocations based on export filters
    let filteredData = allocations;
    
    if (exportFilters.userId) {
      filteredData = filteredData.filter(a => a.user_id === Number(exportFilters.userId));
    }
    if (exportFilters.leaveTypeId) {
      filteredData = filteredData.filter(a => a.leave_type_id === Number(exportFilters.leaveTypeId));
    }
    if (exportFilters.year) {
      filteredData = filteredData.filter(a => 
        new Date(a.cycle_end_date).getFullYear() === Number(exportFilters.year)
      );
    }
    if (exportFilters.dateFrom) {
      const fromDate = new Date(exportFilters.dateFrom);
      filteredData = filteredData.filter(a => new Date(a.cycle_start_date) >= fromDate);
    }
    if (exportFilters.dateTo) {
      const toDate = new Date(exportFilters.dateTo);
      filteredData = filteredData.filter(a => new Date(a.cycle_end_date) <= toDate);
    }

    const headers = ['Staff Name', 'Email', 'Leave Type', 'Allocated Days', 'Used Days', 'Remaining Days', 'Carried Over', 'Cycle Start', 'Cycle End'];
    const data = filteredData.map(a => [
      a.user_name || '',
      staffMembers.find(s => s.id === a.user_id)?.email || '',
      a.leave_type_name || '',
      Number(a.allocated_days),
      Number(a.used_days),
      Number(a.allocated_days) - Number(a.used_days),
      Number(a.carried_over_days),
      new Date(a.cycle_start_date).toLocaleDateString(),
      new Date(a.cycle_end_date).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create filename with filter info
    const filterParts = [];
    if (exportFilters.userId) filterParts.push(`user${exportFilters.userId}`);
    if (exportFilters.leaveTypeId) filterParts.push(`type${exportFilters.leaveTypeId}`);
    if (exportFilters.year) filterParts.push(exportFilters.year);
    const filterSuffix = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
    
    link.href = URL.createObjectURL(blob);
    link.download = `leave_allocations${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    // Close modal after export
    setShowExportModal(false);
    // Reset filters
    setExportFilters({
      userId: '',
      leaveTypeId: '',
      year: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Calculate stats
  const totalAllocated = allocations.reduce((sum, a) => sum + (Number(a.allocated_days) || 0), 0);
  const totalUsed = allocations.reduce((sum, a) => sum + (Number(a.used_days) || 0), 0);
  const totalRemaining = totalAllocated - totalUsed;
  const avgUtilization = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  // Get cycle year from cycle_end_date
  const getCycleYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  // Filter allocations by year
  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = searchTerm === '' ||
                         allocation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = !selectedUserId || allocation.user_id === Number(selectedUserId);
    const matchesLeaveType = !selectedLeaveTypeId || allocation.leave_type_id === Number(selectedLeaveTypeId);
    const matchesYear = !selectedYear || getCycleYear(allocation.cycle_end_date) === selectedYear;

    return matchesSearch && matchesUser && matchesLeaveType && matchesYear;
  });

  // Calculate remaining days
  const calculateRemaining = (allocated: number, used: number) => allocated - used;

  // Get remaining color class
  const getRemainingColor = (remaining: number) => {
    if (remaining < 5) return 'text-red-600 bg-red-50';
    if (remaining < 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Get progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Leave Allocations</h1>
        <p className="text-secondary mt-1">Manage employee leave day allocations and balances</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-success-100 border border-success-500 rounded-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-success-700">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-success-600 hover:text-success-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-error-100 border border-error-500 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-error-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-error-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-error-600 hover:text-error-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-100)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
            </div>
            <div>
              <p className="text-muted">Total Allocations</p>
              <p className="text-2xl font-bold text-primary">{allocations.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--success-100)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
            </div>
            <div>
              <p className="text-muted">Days Allocated</p>
              <p className="text-2xl font-bold text-success-600">{totalAllocated}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--warning-100)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--warning-500)' }} />
            </div>
            <div>
              <p className="text-muted">Days Used</p>
              <p className="text-2xl font-bold text-warning-600">{totalUsed}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#d1fae5', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
            </div>
            <div>
              <p className="text-muted">Days Remaining</p>
              <p className="text-2xl font-bold text-success-600">{totalRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons and Search */}
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

          {selectedAllocationIds.length > 0 || selectAllMode !== 'none' ? (
            <button
              onClick={handleBulkDelete}
              className="btn btn-sm btn-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectAllMode === 'all' ? 'All' : selectedAllocationIds.length})
            </button>
          ) : null}

          <div className="flex-1"></div>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-sm btn-outline"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                Cycle Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
                className="input w-full"
                style={{ backgroundColor: 'white', color: '#1f2937' }}
              >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Staff Member
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                className="input w-full"
                style={{ backgroundColor: 'white', color: '#1f2937' }}
              >
                <option value="">All Staff</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Leave Type
              </label>
              <select
                value={selectedLeaveTypeId}
                onChange={(e) => setSelectedLeaveTypeId(e.target.value ? Number(e.target.value) : '')}
                className="input w-full"
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
            {(selectedUserId || selectedLeaveTypeId || selectedYear) && (
              <div className="lg:col-span-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserId('');
                    setSelectedLeaveTypeId('');
                    setSelectedYear('');
                  }}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Selection Info */}
      {(selectedAllocationIds.length > 0 || selectAllMode !== 'none') && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-primary-800">
            {selectAllMode === 'all'
              ? 'All allocations selected'
              : `${selectedAllocationIds.length} allocation${selectedAllocationIds.length > 1 ? 's' : ''} selected`}
          </span>
          <button
            onClick={() => {
              setSelectedAllocationIds([]);
              setSelectAllMode('none');
            }}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Allocations Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell" style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectAllMode !== 'none'}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
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
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
                      <span className="text-gray-600">Loading allocations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary-500" />
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
                    <tr key={allocation.id} className="table-row hover:bg-gray-50">
                      <td className="table-cell">
                        <input
                          type="checkbox"
                          checked={isSelected(allocation.id)}
                          onChange={() => toggleSelection(allocation.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-primary">{allocation.user_name || `User ${allocation.user_id}`}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm font-medium text-gray-700">
                          {allocation.leave_type_name || `Type ${allocation.leave_type_id}`}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-success-50">
                          <CheckCircle className="w-3 h-3 text-success-600" />
                          <span className="font-semibold text-sm text-success-700">{allocated}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-warning-50">
                          <Calendar className="w-3 h-3 text-warning-600" />
                          <span className="font-semibold text-sm text-warning-700">{used}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${getRemainingColor(remaining)}`}>
                            <span className="font-semibold text-sm">{remaining} days</span>
                          </div>
                          <div className="mt-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressColor(percentage)}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-600">
                          {Number(allocation.carried_over_days) || 0}
                        </span>
                        <span className="text-xs text-muted ml-1">days</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            <Calendar className="inline w-3 h-3 mr-1" />
                            {new Date(allocation.cycle_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-muted">
                            to {new Date(allocation.cycle_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailsModal(allocation)}
                            className="btn btn-sm btn-outline"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openEditModal(allocation)}
                            className="btn btn-sm btn-outline"
                            style={{ borderColor: '#059669', color: '#059669' }}
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(allocation)}
                            className="btn btn-sm btn-outline"
                            style={{ borderColor: '#dc2626', color: '#dc2626' }}
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
          <div className="p-4 border-t" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * limit) + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{Math.min(currentPage * limit, pagination.totalRecords)}</span> of{' '}
                  <span className="font-semibold text-gray-900">{pagination.totalRecords}</span> allocations
                </div>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="input input-sm"
                  style={{ backgroundColor: 'white', color: '#1f2937', padding: '0.25rem 0.5rem' }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    borderColor: '#e5e7eb',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
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
                      className="min-w-[2.5rem] px-2 py-1.5 border rounded-lg transition-all"
                      style={{
                        backgroundColor: currentPage === pageNum ? 'var(--primary-600)' : 'white',
                        borderColor: currentPage === pageNum ? 'var(--primary-600)' : '#e5e7eb',
                        color: currentPage === pageNum ? 'white' : '#374151',
                        fontSize: '0.875rem',
                        fontWeight: currentPage === pageNum ? 600 : 500,
                        boxShadow: currentPage === pageNum ? '0 1px 2px 0 rgba(37, 99, 235, 0.2)' : 'none'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{
                    backgroundColor: currentPage === pagination.totalPages ? '#f3f4f6' : 'white',
                    borderColor: '#e5e7eb',
                    color: currentPage === pagination.totalPages ? '#9ca3af' : '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Allocation Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-600)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 className="modal-title">Create Leave Allocation</h3>
                  <p className="text-sm text-muted">Allocate leave days to a staff member</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              {/* Error Display */}
              {createModalError && (
                <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-base font-bold text-orange-900">Error</p>
                    <p className="text-sm font-semibold text-orange-800 mt-1">{createModalError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateModalError(null)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member *
                  </label>
                  <select
                    value={createForm.user_id || ''}
                    onChange={(e) => setCreateForm({ ...createForm, user_id: Number(e.target.value) })}
                    className="input w-full"
                    required
                  >
                    <option value="" disabled>Select Staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={createForm.leave_type_id || ''}
                    onChange={(e) => setCreateForm({ ...createForm, leave_type_id: Number(e.target.value) })}
                    className="input w-full"
                    required
                  >
                    <option value="" disabled>Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} — {type.days_per_year || type.daysPerYear} days/year
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allocated Days *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.allocated_days || ''}
                      onChange={(e) => setCreateForm({ ...createForm, allocated_days: Number(e.target.value) })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carried Over Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.carried_over_days || ''}
                      onChange={(e) => setCreateForm({ ...createForm, carried_over_days: Number(e.target.value) })}
                      className="input w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cycle Start Date *
                    </label>
                    <input
                      type="date"
                      value={createForm.cycle_start_date}
                      onChange={(e) => setCreateForm({ ...createForm, cycle_start_date: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cycle End Date *
                    </label>
                    <input
                      type="date"
                      value={createForm.cycle_end_date}
                      onChange={(e) => setCreateForm({ ...createForm, cycle_end_date: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAllocation}
                className="btn btn-primary"
              >
                Create Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Allocation Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '42rem' }}>
            {/* Header */}
            <div className="modal-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.35rem 1.6rem',
              borderBottom: '1px solid #f0f0f4',
              background: 'linear-gradient(135deg, #fafbff 0%, #f4f6fc 100%)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#4f46e5',
                  boxShadow: '0 4px 12px #4f46e555',
                  flexShrink: 0,
                }}>
                  <Users size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f1117', letterSpacing: '-0.01em' }}>
                    Bulk Allocate Leave
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8b8fa8', marginTop: '0.1rem' }}>
                    {bulkForm.user_ids?.length
                      ? `${bulkForm.user_ids.length} staff member${bulkForm.user_ids.length !== 1 ? 's' : ''} selected`
                      : 'Select staff members below'}
                  </p>
                </div>
              </div>
              <button
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b8fa8',
                  transition: 'background 0.15s, color 0.15s',
                  flexShrink: 0,
                }}
                onClick={() => setShowBulkModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-content" style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem 1.6rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Leave Type + Days */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>
                      Leave Type <span style={{ color: '#ef4444', marginLeft: '0.15rem' }}>*</span>
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.9rem',
                        border: '1.5px solid #e8eaf0',
                        borderRadius: '0.6rem',
                        fontSize: '0.875rem',
                        color: '#0f1117',
                        background: '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        transition: 'border 0.15s',
                      }}
                      value={bulkForm.leave_type_id || ''}
                      onChange={(e) => setBulkForm({ ...bulkForm, leave_type_id: Number(e.target.value) })}
                    >
                      <option value="" disabled>Select type…</option>
                      {leaveTypes.map(t => (
                        <option key={t.id} value={t.id} style={{ color: '#0f1117' }}>
                          {t.name} ({t.daysPerYear || t.days_per_year} days/yr)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>
                      Allocated Days <span style={{ color: '#ef4444', marginLeft: '0.15rem' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.9rem',
                        border: '1.5px solid #e8eaf0',
                        borderRadius: '0.6rem',
                        fontSize: '0.875rem',
                        color: '#0f1117',
                        background: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      placeholder="e.g. 21"
                      value={bulkForm.allocated_days || ''}
                      onChange={(e) => setBulkForm({ ...bulkForm, allocated_days: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Cycle Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>
                      Cycle Start <span style={{ color: '#ef4444', marginLeft: '0.15rem' }}>*</span>
                    </label>
                    <input
                      type="date"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.9rem',
                        border: '1.5px solid #e8eaf0',
                        borderRadius: '0.6rem',
                        fontSize: '0.875rem',
                        color: '#0f1117',
                        background: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      value={bulkForm.cycle_start_date}
                      onChange={(e) => setBulkForm({ ...bulkForm, cycle_start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>
                      Cycle End <span style={{ color: '#ef4444', marginLeft: '0.15rem' }}>*</span>
                    </label>
                    <input
                      type="date"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.9rem',
                        border: '1.5px solid #e8eaf0',
                        borderRadius: '0.6rem',
                        fontSize: '0.875rem',
                        color: '#0f1117',
                        background: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      value={bulkForm.cycle_end_date}
                      onChange={(e) => setBulkForm({ ...bulkForm, cycle_end_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Carried Over */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.9rem',
                      border: '1.5px solid #e8eaf0',
                      borderRadius: '0.6rem',
                      fontSize: '0.875rem',
                      color: '#0f1117',
                      background: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    placeholder="0"
                    value={bulkForm.carried_over_days || ''}
                    onChange={(e) => setBulkForm({ ...bulkForm, carried_over_days: Number(e.target.value) })}
                  />
                </div>

                {/* Staff Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>
                    Select Staff <span style={{ color: '#ef4444', marginLeft: '0.15rem' }}>*</span>
                  </label>

                  {/* Search bar */}
                  <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8b8fa8' }} />
                    <input
                      type="text"
                      placeholder="Search by name or email…"
                      value={bulkStaffSearch}
                      onChange={(e) => setBulkStaffSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.9rem',
                        border: '1.5px solid #e8eaf0',
                        borderRadius: '0.6rem',
                        fontSize: '0.875rem',
                        color: '#0f1117',
                        background: '#fff',
                        outline: 'none',
                        paddingLeft: '2.25rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Selected tags */}
                  {bulkForm.user_ids && bulkForm.user_ids.length > 0 && (
                    <div style={{
                      border: '1.5px solid #e8eaf0',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      background: '#fafbff',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Selected · {bulkForm.user_ids.length}
                        </span>
                        <button
                          onClick={() => setBulkForm({ ...bulkForm, user_ids: [] })}
                          style={{ fontSize: '0.74rem', color: '#8b8fa8', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Clear all
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '7rem', overflowY: 'auto' }}>
                        {bulkForm.user_ids.map(uid => {
                          const s = staffMembers.find(x => x.id === uid);
                          if (!s) return null;
                          return (
                            <span
                              key={uid}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.65rem',
                                background: '#f0f1fa',
                                border: '1px solid #e3e5f5',
                                borderRadius: '100px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: '#4b4f72',
                              }}
                            >
                              <span>{s.name.split(' ')[0]}</span>
                              <button
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: '#8b8fa8',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                onClick={() => setBulkForm({ ...bulkForm, user_ids: bulkForm.user_ids?.filter(i => i !== uid) })}
                              >
                                <X size={11} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Results list */}
                  <div style={{
                    border: '1.5px solid #e8eaf0',
                    borderRadius: '0.75rem',
                    overflowY: 'auto',
                    maxHeight: '14rem',
                    background: '#fff',
                  }}>
                    {bulkStaffSearch ? (
                      staffMembers
                        .filter(s => {
                          const q = bulkStaffSearch.toLowerCase();
                          const isAlreadySelected = bulkForm.user_ids?.includes(s.id);
                          return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) && !isAlreadySelected;
                        })
                        .map((s, i, arr) => (
                          <div
                            key={s.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.65rem 0.9rem',
                              cursor: 'pointer',
                              transition: 'background 0.12s',
                              background: 'transparent',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left',
                              borderBottom: i < arr.length - 1 ? '1px solid #f3f4f8' : 'none',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f8fc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => setBulkForm({ ...bulkForm, user_ids: [...(bulkForm.user_ids || []), s.id] })}
                          >
                            {/* Avatar */}
                            <div style={{
                              width: '2.2rem',
                              height: '2.2rem',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: avatarColor(s.name),
                              flexShrink: 0,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#fff',
                              letterSpacing: '0.02em',
                            }}>
                              {initials(s.name)}
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f1117' }}>{s.name}</div>
                              <div style={{ fontSize: '0.74rem', color: '#8b8fa8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                            </div>
                            {/* Add button */}
                            <div style={{
                              width: '1.9rem',
                              height: '1.9rem',
                              borderRadius: '50%',
                              border: '1.5px solid #e3e5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              color: '#8b8fa8',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              flexShrink: 0,
                            }}>
                              <Plus size={13} />
                            </div>
                          </div>
                        ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#8b8fa8', fontSize: '0.83rem' }}>
                        <Users size={22} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                        <div>Type to search staff members</div>
                      </div>
                    )}
                    {bulkStaffSearch && staffMembers.filter(s => {
                      const q = bulkStaffSearch.toLowerCase();
                      const isAlreadySelected = bulkForm.user_ids?.includes(s.id);
                      return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) && !isAlreadySelected;
                    }).length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#8b8fa8', fontSize: '0.83rem' }}>
                        No results for "{bulkStaffSearch}"
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
                    <button
                      style={{
                        flex: 1,
                        padding: '0.55rem 1.2rem',
                        borderRadius: '0.6rem',
                        border: 'none',
                        background: '#4f46e5',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'opacity 0.15s, transform 0.1s',
                        letterSpacing: '-0.01em',
                      }}
                      onClick={() => setBulkForm({ ...bulkForm, user_ids: staffMembers.map(s => s.id) })}
                    >
                      Select All ({staffMembers.length})
                    </button>
                    {bulkForm.user_ids && bulkForm.user_ids.length > 0 && (
                      <button
                        style={{
                          padding: '0.55rem 1.2rem',
                          borderRadius: '0.6rem',
                          border: '1.5px solid #e3e5f5',
                          background: '#fff',
                          color: '#5a5d78',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          letterSpacing: '-0.01em',
                        }}
                        onClick={() => setBulkForm({ ...bulkForm, user_ids: [] })}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              padding: '1.1rem 1.6rem',
              borderTop: '1px solid #f0f0f4',
              background: '#fafbff',
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkForm({
                    leave_type_id: 0,
                    allocated_days: 21,
                    cycle_start_date: new Date().toISOString().split('T')[0],
                    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
                    carried_over_days: 0,
                    user_ids: [],
                  });
                }}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '0.6rem',
                  border: '1.5px solid #e3e5f5',
                  background: '#fff',
                  color: '#5a5d78',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  letterSpacing: '-0.01em',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAllocate}
                disabled={!bulkForm.leave_type_id || !bulkForm.allocated_days || !bulkForm.user_ids?.length}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '0.6rem',
                  border: 'none',
                  background: '#4f46e5',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: (!bulkForm.leave_type_id || !bulkForm.allocated_days || !bulkForm.user_ids?.length) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'opacity 0.15s, transform 0.1s',
                  letterSpacing: '-0.01em',
                  opacity: (!bulkForm.leave_type_id || !bulkForm.allocated_days || !bulkForm.user_ids?.length) ? 0.45 : 1,
                }}
              >
                <Users size={15} />
                Allocate to {bulkForm.user_ids?.length || 0} Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Allocate All Modal */}
      {showBulkAllModal && (
        <div className="modal-overlay" onClick={() => setShowBulkAllModal(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-600)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 className="modal-title">Allocate to All Active Users</h3>
                  <p className="text-sm text-muted">Create allocations for all active staff members</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowBulkAllModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    value={bulkAllForm.leave_type_id || ''}
                    onChange={(e) => setBulkAllForm({ ...bulkAllForm, leave_type_id: Number(e.target.value) })}
                    className="input w-full"
                    required
                    style={{ backgroundColor: 'white', color: '#1f2937' }}
                  >
                    <option value="" disabled>Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id} style={{ color: '#1f2937' }}>
                        {type.name} ({type.days_per_year || type.daysPerYear} days/year)
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
                    className="input w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cycle Start Date *
                    </label>
                    <input
                      type="date"
                      value={bulkAllForm.cycle_start_date}
                      onChange={(e) => setBulkAllForm({ ...bulkAllForm, cycle_start_date: e.target.value })}
                      className="input w-full"
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
                      className="input w-full"
                      required
                    />
                  </div>
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
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowBulkAllModal(false);
                  resetBulkAllForm();
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAllocateAll}
                className="btn btn-primary"
                style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
              >
                Allocate to All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Allocation Modal */}
      {showEditModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setSelectedAllocation(null); resetEditForm(); }}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: '#059669', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 className="modal-title">Edit Leave Allocation</h3>
                  <p className="text-sm text-muted">Update allocation details</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleEditAllocation} className="modal-content">
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
                    className="input w-full"
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
                    className="input w-full"
                    required
                  />
                  {editForm.used_days > (editForm.allocated_days + editForm.carried_over_days) && (
                    <p className="mt-1 text-sm text-error-600 flex items-center gap-1">
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
                    className="input w-full"
                  />
                </div>
                <div className="bg-primary-50 p-3 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <strong>Remaining Days:</strong>{' '}
                    <span className={editForm.allocated_days + editForm.carried_over_days - editForm.used_days < 0 ? 'text-error-600 font-semibold' : 'text-primary-600 font-semibold'}>
                      {editForm.allocated_days + editForm.carried_over_days - editForm.used_days}
                    </span>
                  </p>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAllocation(null);
                    resetEditForm();
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editForm.used_days > (editForm.allocated_days + editForm.carried_over_days)}
                  className="btn btn-primary flex-1"
                >
                  Update Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => { setShowDetailsModal(false); setSelectedAllocation(null); }}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-600)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 className="modal-title">Allocation Details</h3>
                  <p className="text-sm text-muted">View complete allocation information</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => { setShowDetailsModal(false); setSelectedAllocation(null); }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                {/* Staff Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Staff Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium text-gray-900">{selectedAllocation.user_name || `User ${selectedAllocation.user_id}`}</p>
                    </div>
                    {/* <div>
                      <span className="text-gray-500">User ID:</span>
                      <p className="font-medium text-gray-900">{selectedAllocation.user_id}</p>
                    </div> */}
                  </div>
                </div>

                {/* Leave Type Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Leave Type
                  </h4>
                  <div className="text-sm">
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium text-gray-900">{selectedAllocation.leave_type_name || `Type ${selectedAllocation.leave_type_id}`}</p>
                  </div>
                </div>

                {/* Allocation Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Allocation Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Allocated Days:</span>
                      <p className="font-semibold text-success-600">{Number(selectedAllocation.allocated_days)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Used Days:</span>
                      <p className="font-semibold text-warning-600">{Number(selectedAllocation.used_days)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining Days:</span>
                      <p className={`font-semibold ${(Number(selectedAllocation.allocated_days) - Number(selectedAllocation.used_days)) < 5 ? 'text-error-600' : 'text-success-600'}`}>
                        {Number(selectedAllocation.allocated_days) - Number(selectedAllocation.used_days)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Carried Over:</span>
                      <p className="font-medium text-gray-900">{Number(selectedAllocation.carried_over_days)}</p>
                    </div>
                  </div>
                </div>

                {/* Cycle Period */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Cycle Period
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <p className="font-medium text-gray-900">{new Date(selectedAllocation.cycle_start_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <p className="font-medium text-gray-900">{new Date(selectedAllocation.cycle_end_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Usage Progress
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Utilization</span>
                      <span className="font-medium text-gray-900">
                        {((Number(selectedAllocation.used_days) / Number(selectedAllocation.allocated_days)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor((Number(selectedAllocation.used_days) / Number(selectedAllocation.allocated_days)) * 100)}`}
                        style={{ width: `${Math.min((Number(selectedAllocation.used_days) / Number(selectedAllocation.allocated_days)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <span>Created:</span>
                      <p className="font-medium text-gray-700">{new Date(selectedAllocation.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span>Last Updated:</span>
                      <p className="font-medium text-gray-700">{new Date(selectedAllocation.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => { setShowDetailsModal(false); setSelectedAllocation(null); }}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(selectedAllocation);
                }}
                className="btn btn-primary"
              >
                Edit Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}></div>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Download className="w-5 h-5 mr-2 inline" />
                Export Leave Allocations
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowExportModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <p className="text-sm text-gray-600 mb-4">
                Filter the data before exporting. Leave fields empty to export all allocations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staff Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Staff Member
                  </label>
                  <select
                    className="input w-full"
                    value={exportFilters.userId}
                    onChange={(e) => setExportFilters({ ...exportFilters, userId: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">All Staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Leave Type
                  </label>
                  <select
                    className="input w-full"
                    value={exportFilters.leaveTypeId}
                    onChange={(e) => setExportFilters({ ...exportFilters, leaveTypeId: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">All Leave Types</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Cycle Year
                  </label>
                  <select
                    className="input w-full"
                    value={exportFilters.year}
                    onChange={(e) => setExportFilters({ ...exportFilters, year: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    Cycle Start Date From
                  </label>
                  <input
                    type="date"
                    className="input w-full"
                    value={exportFilters.dateFrom}
                    onChange={(e) => setExportFilters({ ...exportFilters, dateFrom: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    Cycle End Date To
                  </label>
                  <input
                    type="date"
                    className="input w-full"
                    value={exportFilters.dateTo}
                    onChange={(e) => setExportFilters({ ...exportFilters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview count */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>
                    {(() => {
                      let count = allocations.length;
                      if (exportFilters.userId) count = allocations.filter(a => a.user_id === Number(exportFilters.userId)).length;
                      if (exportFilters.leaveTypeId) count = allocations.filter(a => a.leave_type_id === Number(exportFilters.leaveTypeId)).length;
                      if (exportFilters.year) count = allocations.filter(a => new Date(a.cycle_end_date).getFullYear() === Number(exportFilters.year)).length;
                      return count;
                    })()}
                  </strong>{' '}
                  allocations will be exported
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => { setShowDeleteModal(false); setSelectedAllocation(null); }}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-error-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Allocation</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this allocation for{' '}
                <strong>{selectedAllocation.user_name || `User ${selectedAllocation.user_id}`}</strong>?
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
                  className="flex-1 px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
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
