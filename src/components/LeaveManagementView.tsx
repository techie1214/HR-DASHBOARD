// This component provides comprehensive leave management functionality
// It handles leave requests, approvals, reporting, and year-end processing

// Import React hooks for state management
import { useState, useEffect } from 'react';
// Import Lucide React icons for UI elements
import { Search, Calendar, Download, Filter, Check, X, Clock, User, Building, FileText, TrendingUp, AlertCircle, CalendarDays, Info } from 'lucide-react';
// Import leave management service
import {
  getAllLeaveRequests,
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
  getUserLeaveBalance,
  createLeaveType,
  getAllLeaveTypes,
  LeaveRequest as LeaveRequestType,
  LeaveBalance,
  LeaveType
} from '../services/leaveManagementService';

// Interface defining the structure of a leave request
interface LeaveRequest {
  id: string; // Unique leave request identifier
  staffId: string; // ID of the staff member requesting leave
  staffName: string; // Full name of the staff member
  department: string; // Department the staff belongs to
  branch: string; // Branch location
  leaveType: 'Sick' | 'Annual' | 'Emergency' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Bereaved'; // Type of leave
  startDate: string; // Start date of leave (YYYY-MM-DD format)
  endDate: string; // End date of leave (YYYY-MM-DD format)
  duration: number; // Number of days requested
  reason: string; // Reason for the leave request
  status: 'Pending' | 'Approved' | 'Declined' | 'Active'; // Current status of the request
  requestDate: string; // Date the request was submitted
  approvedBy?: string; // Name of the person who approved (optional)
  approvalDate?: string; // Date of approval (optional)
  declineReason?: string; // Reason for decline if declined (optional)
  coveringStaff?: string; // Staff member covering duties (optional)
}

// Main component function for leave management view
const LeaveManagementView = () => {
  // State for search term input
  const [searchTerm, setSearchTerm] = useState('');
  // State for filtering by request status
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'declined' | 'active' | 'pending'>('all');
  // State for filtering by leave type
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  // State for showing/hiding advanced filters panel
  const [showFilters, setShowFilters] = useState(false);
  // State for filtering by department
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  // State for active tab (requests, report)
  const [activeTab, setActiveTab] = useState<'requests' | 'report'>('requests');
  // State for selected leave request (for modals)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  // State for showing approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  // State for approval action type (approve/decline)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'decline' | null>(null);
  // State for decline reason input
  const [declineReason, setDeclineReason] = useState('');
  // State for showing details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // State for showing create leave type modal
  const [showCreateLeaveTypeModal, setShowCreateLeaveTypeModal] = useState(false);
  // State for showing edit leave type modal
  const [showEditLeaveTypeModal, setShowEditLeaveTypeModal] = useState(false);
  // State for leave types
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  // State for leave requests from API
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  // State for leave balances from API
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  // State for create leave type form
  const [createLeaveTypeForm, setCreateLeaveTypeForm] = useState({
    name: '',
    description: '',
    daysPerYear: null, // Changed from 0 to null
    isPaid: true,
    allowCarryover: false,
    carryoverLimit: null, // Changed from 0 to null
    expiryRuleId: null // Changed from 1 to null
  });
  
  // State for edit leave type form
  const [editLeaveTypeForm, setEditLeaveTypeForm] = useState({
    id: null,
    name: '',
    description: '',
    daysPerYear: null,
    isPaid: true,
    allowCarryover: false,
    carryoverLimit: null,
    expiryRuleId: null
  });

  // Load data from API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch leave types first
        const typesResponse = await getAllLeaveTypes();
        if (typesResponse.success && typesResponse.leaveTypes) {
          // Transform API response to match our UI interface
          const transformedTypes = typesResponse.leaveTypes.map((type: any) => ({
            type: type.name,
            limit: type.days_per_year, // Use the correct field name from API
            color: type.is_paid ? '#3b82f6' : '#6b7280', // Different colors for paid/unpaid
            icon: getLeaveTypeIcon(type.name), // Use a helper function to get appropriate icon
            description: type.description || `${type.days_per_year} days per year`
          }));
          
          setLeaveTypes(transformedTypes);
        } else {
          console.warn('Failed to fetch leave types from API:', typesResponse.message);
          // Set to empty array if API call fails
          setLeaveTypes([]);
        }

        // Fetch leave requests
        const requestsResponse = await getAllLeaveRequests();
        let transformedRequests = [];

        if (requestsResponse.success && requestsResponse.leaveRequests) {
          // Transform API response to match our UI interface
          transformedRequests = requestsResponse.leaveRequests.map(req => ({
            id: req.id.toString(), // Convert to string to match interface
            staffId: req.userId.toString(),
            staffName: `User ${req.userId}`, // In a real app, you'd fetch user details
            department: 'General', // In a real app, you'd fetch department details
            branch: 'Main Office', // In a real app, you'd fetch branch details
            leaveType: req.leaveTypeId === 1 ? 'Annual' :
                      req.leaveTypeId === 2 ? 'Sick' :
                      req.leaveTypeId === 3 ? 'Emergency' :
                      req.leaveTypeId === 4 ? 'Maternity' :
                      req.leaveTypeId === 5 ? 'Paternity' :
                      req.leaveTypeId === 6 ? 'Unpaid' : 'Bereaved',
            startDate: req.startDate,
            endDate: req.endDate,
            duration: calculateDuration(req.startDate, req.endDate),
            reason: req.reason,
            status: req.status === 'approved' ? 'Approved' :
                   req.status === 'rejected' ? 'Declined' : 'Pending',
            requestDate: req.createdAt,
            approvedBy: req.approverComment ? 'Manager' : undefined, // In a real app, you'd get approver name
            approvalDate: req.updatedAt,
            declineReason: req.rejectionReason,
            coveringStaff: undefined // In a real app, you'd get covering staff info
          }));

          setLeaveRequests(transformedRequests);
        } else {
          console.warn('Failed to fetch leave requests from API:', requestsResponse.message);
          // Set to empty array if API call fails
          setLeaveRequests([]);
        }

        // Fetch leave balances for current user (assuming user ID 1 for demo)
        const balancesResponse = await getUserLeaveBalance(1);
        if (balancesResponse.success && balancesResponse.leaveBalances) {
          // Transform API response to match our UI interface
          const transformedBalances = balancesResponse.leaveBalances.map(balance => ({
            staffId: balance.userId.toString(),
            sick: { used: balance.usedDays, total: balance.totalDays },
            annual: { used: balance.usedDays, total: balance.totalDays, firstHalf: 0, secondHalf: 0, rollover: 0 },
            paternity: { used: balance.usedDays, total: balance.totalDays },
            bereaved: { used: balance.usedDays, total: balance.totalDays },
            maternity: { used: balance.usedDays, total: balance.totalDays }
          }));

          setLeaveBalances(transformedBalances);
        } else {
          console.warn('Failed to fetch leave balances from API, using demo data:', balancesResponse.message);
          
          // Demo data for leave balances
          setLeaveBalances([{
            staffId: '1',
            sick: { used: 2, total: 5 },
            annual: { used: 8, total: 14, firstHalf: 5, secondHalf: 3, rollover: 0 },
            paternity: { used: 0, total: 3 },
            bereaved: { used: 1, total: 3 },
            maternity: { used: 0, total: 90 }
          }]);
        }
      } catch (err) {
        console.error('Error fetching leave data:', err);
        
        // Set to empty array in case of error
        setLeaveTypes([]);
        
        // Set to empty array in case of error
        setLeaveRequests([]);
        
        // Demo data for leave balances
        setLeaveBalances([{
          staffId: '1',
          sick: { used: 2, total: 5 },
          annual: { used: 8, total: 14, firstHalf: 5, secondHalf: 3, rollover: 0 },
          paternity: { used: 0, total: 3 },
          bereaved: { used: 1, total: 3 },
          maternity: { used: 0, total: 90 }
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get appropriate icon for leave type
  const getLeaveTypeIcon = (typeName: string) => {
    const type = typeName.toLowerCase();
    if (type.includes('sick') || type.includes('medical')) return '🤒';
    if (type.includes('annual') || type.includes('vacation') || type.includes('leave')) return '🏖️';
    if (type.includes('emergency') || type.includes('urgent')) return '🚨';
    if (type.includes('maternity')) return '🤱';
    if (type.includes('paternity')) return '👶';
    if (type.includes('unpaid')) return '💼';
    if (type.includes('bereav') || type.includes('mourning')) return '🕊️';
    return '🗓️'; // Default icon
  };
  
  // Handler to open edit leave type modal
  const openEditLeaveTypeModal = (type: any) => {
    setEditLeaveTypeForm({
      id: type.id || type.id, // Use the correct field name depending on API response
      name: type.name,
      description: type.description || '',
      daysPerYear: type.days_per_year || type.daysPerYear || null,
      isPaid: type.is_paid || type.isPaid || false,
      allowCarryover: type.allow_carryover || type.allowCarryover || false,
      carryoverLimit: type.carryover_limit || type.carryoverLimit || null,
      expiryRuleId: type.expiry_rule_id || type.expiryRuleId || null
    });
    setShowEditLeaveTypeModal(true);
  };

  // Helper function to calculate duration between two dates
  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Filter leave requests based on search term, status, leave type, and department
  const filteredRequests = leaveRequests.filter(request => {
    // Check if request matches search term (name, ID, department, or reason)
    const matchesSearch = searchTerm === '' ||
      request.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if request matches status filter
    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'approved' ? request.status === 'Approved' :
      filterStatus === 'declined' ? request.status === 'Declined' :
      filterStatus === 'active' ? request.status === 'Active' :
      filterStatus === 'pending' ? request.status === 'Pending' :
      true;

    // Check if request matches leave type filter
    const matchesLeaveType = filterLeaveType === 'all' || request.leaveType === filterLeaveType;
    // Check if request matches department filter
    const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;

    // Return true only if all filter conditions match
    return matchesSearch && matchesStatus && matchesLeaveType && matchesDepartment;
  });

  // Calculate statistics from all leave requests
  const totalRequests = leaveRequests.length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const declinedCount = leaveRequests.filter(r => r.status === 'Declined').length;
  const activeCount = leaveRequests.filter(r => r.status === 'Active').length;
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;

  // Handler for approval/decline actions - opens approval modal
  const handleApprovalAction = (request: LeaveRequest, action: 'approve' | 'decline') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handler for viewing request details - opens details modal
  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Handler for confirming approval/decline action
  const confirmApproval = async () => {
    if (!selectedRequest || !approvalAction) return;

    // Validate annual leave duration limit (7 days max per request)
    if (approvalAction === 'approve' && selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7) {
      alert('Annual leave requests cannot exceed 7 days. Please ask the employee to split the request.');
      return;
    }

    try {
      setLoading(true);
      const requestId = parseInt(selectedRequest.id);

      if (approvalAction === 'approve') {
        // Approve the leave request
        const response = await approveLeaveRequest(requestId, {
          status: 'approved',
          approverComment: 'Approved by HR Manager'
        });

        if (response.success) {
          // Update the local state to reflect the change
          setLeaveRequests(prev => prev.map(req =>
            req.id === selectedRequest.id
              ? { ...req, status: 'Approved', approvedBy: 'HR Manager', approvalDate: new Date().toISOString() }
              : req
          ));
        } else {
          throw new Error(response.message || 'Failed to approve leave request');
        }
      } else if (approvalAction === 'decline') {
        // Reject the leave request
        const response = await rejectLeaveRequest(requestId, {
          status: 'rejected',
          rejectionReason: declineReason
        });

        if (response.success) {
          // Update the local state to reflect the change
          setLeaveRequests(prev => prev.map(req =>
            req.id === selectedRequest.id
              ? { ...req, status: 'Declined', declineReason: declineReason }
              : req
          ));
        } else {
          throw new Error(response.message || 'Failed to reject leave request');
        }
      }

      // Close modal and reset state
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalAction(null);
      setDeclineReason('');
    } catch (err) {
      console.error('Error processing leave request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  // Handler for creating a new leave type
  const handleCreateLeaveType = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await createLeaveType({
        name: createLeaveTypeForm.name,
        description: createLeaveTypeForm.description,
        daysPerYear: createLeaveTypeForm.daysPerYear, // Will be sent as null if not set
        isPaid: createLeaveTypeForm.isPaid,
        allowCarryover: createLeaveTypeForm.allowCarryover,
        carryoverLimit: createLeaveTypeForm.allowCarryover ? createLeaveTypeForm.carryoverLimit : undefined,
        accrualMethod: undefined, // Optional field
        accrualRate: undefined    // Optional field
      });

      if (response.success) {
        // Close the modal and reset form
        setShowCreateLeaveTypeModal(false);
        setCreateLeaveTypeForm({
          name: '',
          description: '',
          daysPerYear: null,
          isPaid: true,
          allowCarryover: false,
          carryoverLimit: null,
          expiryRuleId: null
        });
        
        // Refresh the leave types if needed
        // For now, we'll just show a success message
        alert('Leave type created successfully!');
      } else {
        throw new Error(response.message || 'Failed to create leave type');
      }
    } catch (err) {
      console.error('Error creating leave type:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the leave type');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for editing a leave type
  const handleEditLeaveType = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { updateLeaveType } = await import('../services/leaveManagementService');
      
      const response = await updateLeaveType(editLeaveTypeForm.id!, {
        name: editLeaveTypeForm.name,
        description: editLeaveTypeForm.description,
        daysPerYear: editLeaveTypeForm.daysPerYear,
        isPaid: editLeaveTypeForm.isPaid,
        allowCarryover: editLeaveTypeForm.allowCarryover,
        carryoverLimit: editLeaveTypeForm.allowCarryover ? editLeaveTypeForm.carryoverLimit : undefined,
        accrualMethod: undefined, // Optional field
        accrualRate: undefined    // Optional field
      });

      if (response.success) {
        // Close the modal and reset form
        setShowEditLeaveTypeModal(false);
        setEditLeaveTypeForm({
          id: null,
          name: '',
          description: '',
          daysPerYear: null,
          isPaid: true,
          allowCarryover: false,
          carryoverLimit: null,
          expiryRuleId: null
        });
        
        // Refresh the leave types by calling the API again
        const typesResponse = await getAllLeaveTypes();
        if (typesResponse.success && typesResponse.leaveTypes) {
          const transformedTypes = typesResponse.leaveTypes.map((type: any) => ({
            type: type.name,
            limit: type.days_per_year, // Use the correct field name from API
            color: type.is_paid ? '#3b82f6' : '#6b7280', // Different colors for paid/unpaid
            icon: getLeaveTypeIcon(type.name), // Use a helper function to get appropriate icon
            description: type.description || `${type.days_per_year} days per year`
          }));
          
          setLeaveTypes(transformedTypes);
        }
        
        alert('Leave type updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update leave type');
      }
    } catch (err) {
      console.error('Error updating leave type:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the leave type');
    } finally {
      setLoading(false);
    }
  };

  // Function to render the requests tab content
  const renderRequestsTab = () => (
    <>
      {/* Interactive Stats Cards - clickable cards that filter by status */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-5 gap-4">
        {/* All Requests Card - shows total count and filters to show all */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('all')}
          style={{
            border: filterStatus === 'all' ? '2px solid #2563eb' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'all' ? '#eff6ff' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2.5rem', height: '2.5rem' }}>
              <Calendar className="w-4 h-4" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>All Requests</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalRequests}</p>
            </div>
          </div>
        </div>
        {/* Approved Requests Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('approved')}
          style={{
            border: filterStatus === 'approved' ? '2px solid #16a34a' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'approved' ? '#f0fdf4' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2.5rem', height: '2.5rem' }}>
              <Check className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Approved</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{approvedCount}</p>
            </div>
          </div>
        </div>
        {/* Declined Requests Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('declined')}
          style={{
            border: filterStatus === 'declined' ? '2px solid #dc2626' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'declined' ? '#fef2f2' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2', width: '2.5rem', height: '2.5rem' }}>
              <X className="w-4 h-4" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Declined</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{declinedCount}</p>
            </div>
          </div>
        </div>
        {/* Active Leave Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('active')}
          style={{
            border: filterStatus === 'active' ? '2px solid #10b981' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'active' ? '#ecfdf5' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#d1fae5', width: '2.5rem', height: '2.5rem' }}>
              <CalendarDays className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Active Now</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeCount}</p>
            </div>
          </div>
        </div>
        {/* Pending Requests Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('pending')}
          style={{
            border: filterStatus === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'pending' ? '#fffbeb' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', width: '2.5rem', height: '2.5rem' }}>
              <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar and Filter Controls */}
      <div className="card p-4">
        {/* Main search and action bar */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search input with icon */}
          <div className="input-wrapper" style={{ flex: 1, minWidth: '250px' }}>
            <div className="input-icon">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID, department, or reason..."
              className="input input-with-icon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Toggle filters button */}
          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          {/* Export button */}
          <button className="btn btn-sm btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        {/* Advanced Filters Panel - shown when showFilters is true */}
        {showFilters && (
          <div className="grid grid-cols-1 md-grid-cols-3 gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
            {/* Leave Type Filter */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Leave Type
              </label>
              <select
                className="input"
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                <option value="all">All Types</option>
                {/* Map through leave types to create options */}
                {leaveTypes.map(type => (
                  <option key={type.type} value={type.type}>{type.icon} {type.type}</option>
                ))}
              </select>
            </div>
            {/* Department Filter */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Department
              </label>
              <select
                className="input"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="IT Department">IT Department</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                className="btn btn-outline w-full"
                onClick={() => {
                  setSearchTerm(''); // Clear search term
                  setFilterStatus('all'); // Reset status filter
                  setFilterLeaveType('all'); // Reset leave type filter
                  setSelectedDepartment('all'); // Reset department filter
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Types Guide - interactive cards showing leave policies */}
      <div className="card p-6">
        {/* Header with info icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" style={{ color: '#2563eb' }} />
            <h3 style={{ marginBottom: 0 }}>Leave Types & Policies</h3>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateLeaveTypeModal(true)}
          >
            + Create Leave Type
          </button>
        </div>
        {/* Grid of leave type cards */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-3">
          {/* Check if leave types exist */}
          {leaveTypes.length > 0 ? (
            /* Map through leave types to create interactive cards */
            leaveTypes.map(type => (
              <div
                key={type.type}
                className="flex items-center gap-3 p-3 rounded cursor-pointer transition-all hover-lift relative"
                style={{
                  backgroundColor: filterLeaveType === type.type ? type.color + '20' : '#f9fafb', // Highlight selected type
                  border: filterLeaveType === type.type ? `2px solid ${type.color}` : '1px solid #e5e7eb'
                }}
                onClick={() => setFilterLeaveType(filterLeaveType === type.type ? 'all' : type.type)} // Toggle filter
              >
                {/* Leave type icon */}
                <div className="icon-wrapper" style={{ backgroundColor: type.color + '30', width: '2.75rem', height: '2.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{type.icon}</span>
                </div>
                {/* Leave type details */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{type.type}</p>
                  <p className="text-xs text-muted">{type.description}</p>
                </div>
                {/* Edit button */}
                <button 
                  className="absolute top-1 right-1 btn btn-xs btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click
                    openEditLeaveTypeModal(type);
                  }}
                  title="Edit leave type"
                >
                  ✏️
                </button>
              </div>
            ))
          ) : (
            /* Empty state when no leave types exist */
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Leave Types Created Yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first leave type</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateLeaveTypeModal(true)}
              >
                Create Your First Leave Type
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        {/* Table header with title and count */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>Leave Requests</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Showing {filteredRequests.length} of {totalRequests} requests
                {/* Show active filter indicator */}
                {filterStatus !== 'all' && <span style={{ color: '#2563eb', fontWeight: 500 }}> · {filterStatus}</span>}
              </p>
            </div>
          </div>
        </div>
        {/* Table container */}
        <div className="table-container">
          <table className="table">
            {/* Table header */}
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Leave Details</th>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Duration</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            {/* Table body with filtered requests */}
            <tbody>
              {/* Map through filtered requests to create table rows */}
              {filteredRequests.map((request) => {
                // Find leave type information for styling
                const leaveTypeInfo = leaveTypes.find(t => t.type === request.leaveType);
                return (
                  // Table row for each leave request
                  <tr key={request.id} className="table-row">
                    {/* Employee information cell */}
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {/* Employee avatar with initials */}
                        <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem' }}>
                          {request.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        {/* Employee name and ID */}
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{request.staffName}</p>
                          <p className="text-xs text-muted">{request.staffId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1.25rem' }}>{leaveTypeInfo?.icon}</span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{request.leaveType} Leave</p>
                          <p className="text-xs text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {request.reason}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' → '}
                          {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted">
                          Requested: {new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div 
                        className="flex items-center gap-2 px-3 py-2 rounded"
                        style={{ backgroundColor: leaveTypeInfo?.color + '10', display: 'inline-flex' }}
                      >
                        <Clock className="w-3 h-3" style={{ color: leaveTypeInfo?.color }} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: leaveTypeInfo?.color }}>
                          {request.duration} day{request.duration > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <span className={`badge ${
                          request.status === 'Approved' ? 'badge-success' : 
                          request.status === 'Declined' ? 'badge-danger' : 
                          request.status === 'Active' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {request.status}
                        </span>
                        {request.status === 'Active' && (
                          <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                            Ends {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell right">
                      {request.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="btn btn-sm btn-outline green"
                            onClick={() => handleApprovalAction(request, 'approve')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-outline red"
                            onClick={() => handleApprovalAction(request, 'decline')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewDetails(request)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="icon-wrapper" style={{ backgroundColor: '#f3f4f6', width: '4rem', height: '4rem' }}>
              <Calendar className="w-8 h-8" style={{ color: '#9ca3af' }} />
            </div>
            <p style={{ marginTop: '1rem', fontWeight: 500, color: '#6b7280' }}>No leave requests found</p>
            <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
              {searchTerm || filterStatus !== 'all' || filterLeaveType !== 'all' || selectedDepartment !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Leave requests will appear here'}
            </p>
          </div>
        )}
      </div>
    </>
  );

  const renderReportTab = () => {
    const leaveByType = leaveTypes.map(type => ({
      type: type.type,
      count: leaveRequests.filter(r => r.leaveType === type.type && r.status === 'Approved').length,
      days: leaveRequests.filter(r => r.leaveType === type.type && r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0),
      icon: type.icon,
      color: type.color
    }));

    // Get unique departments from leave requests
    const uniqueDepartments = [...new Set(leaveRequests.map(r => r.department))];
    const departmentStats = uniqueDepartments.map(dept => ({
      dept,
      count: leaveRequests.filter(r => r.department === dept && r.status === 'Approved').length,
      days: leaveRequests.filter(r => r.department === dept && r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0)
    }));

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                <Calendar className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Leave Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {leaveRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
                <User className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Employees on Leave</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Approval Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {approvedCount + declinedCount > 0 ? ((approvedCount / (approvedCount + declinedCount)) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef2f2' }}>
                <AlertCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Pending Review</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leave by Type */}
        <div className="card p-6">
          <h3 style={{ marginBottom: '1.5rem' }}>Leave Distribution by Type</h3>
          <div className="space-y-4">
            {leaveByType.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted">{item.count} requests</span>
                    <span style={{ fontWeight: 600 }}>{item.days} days</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${item.days > 0 ? (item.days / Math.max(...leaveByType.map(d => d.days))) * 100 : 0}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card p-6">
          <h3 style={{ marginBottom: '1.5rem' }}>Leave by Department</h3>
          <div className="space-y-3">
            {departmentStats.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{item.dept}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted">{item.count} requests</span>
                    <span style={{ fontWeight: 600 }}>{item.days} days</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${item.days > 0 ? (item.days / Math.max(...departmentStats.map(d => d.days))) * 100 : 0}%`,
                      backgroundColor: '#2563eb'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  // Main component render return
  return (
    // Main container with vertical spacing
    <div className="space-y-6">
      {loading && (
        <div className="card p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading leave data...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Tab Navigation */}
          <div className="card">
            {/* Tab list container */}
            <div className="tabs-list" style={{ padding: '0 1.5rem' }}>
              {/* Requests Tab */}
              <button
                className={`tabs-trigger ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Leave Requests
              </button>
              {/* Report Tab */}
              <button
                className={`tabs-trigger ${activeTab === 'report' ? 'active' : ''}`}
                onClick={() => setActiveTab('report')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Leave Report
              </button>
              {/* Year-End Analysis Tab */}
            </div>
          </div>

          {/* Conditional rendering based on active tab */}
          {activeTab === 'requests' && renderRequestsTab()}
          {activeTab === 'report' && renderReportTab()}

          {/* Approval Modal - shown when showApprovalModal is true */}
          {showApprovalModal && selectedRequest && (
            <>
              {/* Modal overlay for backdrop */}
              <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}></div>
              {/* Modal dialog */}
              <div className="modal">
                {/* Modal header with title and close button */}
                <div className="modal-header">
                  <h3>{approvalAction === 'approve' ? 'Approve' : 'Decline'} Leave Request</h3>
                  <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowApprovalModal(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Modal content */}
                <div className="modal-content">
                  <div className="space-y-4">
                    {/* Employee information section */}
                    <div className="flex items-center gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb' }}>
                      {/* Employee avatar with initials */}
                      <div className="avatar" style={{ width: '3rem', height: '3rem' }}>
                        {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {/* Employee details */}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedRequest.staffName}</p>
                        <p className="text-xs text-muted">{selectedRequest.staffId} · {selectedRequest.department}</p>
                      </div>
                    </div>

                    {/* Leave details grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Leave type information */}
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Leave Type</p>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '1.25rem' }}>{leaveTypes.find(t => t.type === selectedRequest.leaveType)?.icon}</span>
                          <span style={{ fontWeight: 600 }}>{selectedRequest.leaveType}</span>
                        </div>
                      </div>
                      {/* Duration information */}
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Duration</p>
                        <p style={{ fontWeight: 600 }}>{selectedRequest.duration} day{selectedRequest.duration > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Start Date</p>
                        <p style={{ fontWeight: 600 }}>
                          {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>End Date</p>
                        <p style={{ fontWeight: 600 }}>
                          {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Reason</p>
                      <p style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                        {selectedRequest.reason}
                      </p>
                    </div>

                    {selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7 && approvalAction === 'approve' && (
                      <div className="p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4" style={{ color: '#dc2626', marginTop: '0.125rem', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500 }}>Policy Violation</p>
                            <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                              This annual leave request exceeds the 7-day limit. Please request the employee to split this into separate requests.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {approvalAction === 'decline' && (
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                          Decline Reason *
                        </label>
                        <textarea
                          className="input"
                          rows={3}
                          placeholder="Please provide a reason for declining this request..."
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          style={{ resize: 'vertical' }}
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowApprovalModal(false)}>Cancel</button>
                  <button
                    className={`btn ${approvalAction === 'approve' ? 'btn-primary' : 'btn-outline red'}`}
                    onClick={confirmApproval}
                    disabled={(approvalAction === 'decline' && !declineReason.trim()) || (approvalAction === 'approve' && selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7)}
                  >
                    {approvalAction === 'approve' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve Request
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Decline Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Details Modal */}
          {showDetailsModal && selectedRequest && (
            <>
              <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}></div>
              <div className="modal">
                <div className="modal-header">
                  <h3>Leave Request Details</h3>
                  <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowDetailsModal(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="modal-content">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb' }}>
                      <div className="avatar" style={{ width: '3rem', height: '3rem' }}>
                        {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedRequest.staffName}</p>
                        <p className="text-xs text-muted">{selectedRequest.staffId} · {selectedRequest.department}</p>
                        <p className="text-xs text-muted">{selectedRequest.branch}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Leave Type</p>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '1.25rem' }}>{leaveTypes.find(t => t.type === selectedRequest.leaveType)?.icon}</span>
                          <span style={{ fontWeight: 600 }}>{selectedRequest.leaveType}</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Status</p>
                        <span className={`badge ${
                          selectedRequest.status === 'Approved' ? 'badge-success' :
                          selectedRequest.status === 'Declined' ? 'badge-danger' :
                          selectedRequest.status === 'Active' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Start Date</p>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>End Date</p>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Duration</p>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedRequest.duration} day{selectedRequest.duration > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Reason</p>
                      <p style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                        {selectedRequest.reason}
                      </p>
                    </div>

                    {selectedRequest.coveringStaff && (
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Covering Staff</p>
                        <p style={{ fontWeight: 600 }}>{selectedRequest.coveringStaff}</p>
                      </div>
                    )}

                    {selectedRequest.approvedBy && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            {selectedRequest.status === 'Approved' ? 'Approved By' : 'Declined By'}
                          </p>
                          <p style={{ fontWeight: 600 }}>{selectedRequest.approvedBy}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Date</p>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {selectedRequest.approvalDate && new Date(selectedRequest.approvalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRequest.declineReason && (
                      <div className="p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                        <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500, marginBottom: '0.25rem' }}>Decline Reason</p>
                        <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{selectedRequest.declineReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Modal footer with close button */}
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowDetailsModal(false)}>Close</button>
                </div>
              </div>
            </>
          )}

          {/* Create Leave Type Modal */}
          {showCreateLeaveTypeModal && (
            <>
              <div className="modal-overlay" onClick={() => setShowCreateLeaveTypeModal(false)}></div>
              <div className="modal">
                <div className="modal-header">
                  <h3>Create Leave Type</h3>
                  <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowCreateLeaveTypeModal(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="modal-content">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={createLeaveTypeForm.name}
                        onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, name: e.target.value})}
                        placeholder="Enter leave type name"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="input w-full"
                        value={createLeaveTypeForm.description}
                        onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, description: e.target.value})}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Days Per Year *</label>
                        <input
                          type="number"
                          className="input w-full"
                          value={createLeaveTypeForm.daysPerYear || ''}
                          onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, daysPerYear: e.target.value ? parseInt(e.target.value) : null})}
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Paid Leave?</label>
                        <div className="flex items-center mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={createLeaveTypeForm.isPaid}
                              onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, isPaid: e.target.checked})}
                            />
                            <span className="ml-2">{createLeaveTypeForm.isPaid ? 'Yes' : 'No'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Allow Carryover?</label>
                        <div className="flex items-center mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={createLeaveTypeForm.allowCarryover}
                              onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, allowCarryover: e.target.checked})}
                            />
                            <span className="ml-2">{createLeaveTypeForm.allowCarryover ? 'Yes' : 'No'}</span>
                          </label>
                        </div>
                      </div>
                      
                      {createLeaveTypeForm.allowCarryover && (
                        <div>
                          <label className="form-label">Carryover Limit</label>
                          <input
                            type="number"
                            className="input w-full"
                            value={createLeaveTypeForm.carryoverLimit || ''}
                            onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, carryoverLimit: e.target.value ? parseInt(e.target.value) : null})}
                            min="0"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Expiry Rule ID</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={createLeaveTypeForm.expiryRuleId || ''}
                        onChange={(e) => setCreateLeaveTypeForm({...createLeaveTypeForm, expiryRuleId: e.target.value ? parseInt(e.target.value) : null})}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowCreateLeaveTypeModal(false)}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCreateLeaveType}
                    disabled={!createLeaveTypeForm.name || createLeaveTypeForm.daysPerYear === null || createLeaveTypeForm.daysPerYear < 0}
                  >
                    Create Leave Type
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Edit Leave Type Modal */}
          {showEditLeaveTypeModal && (
            <>
              <div className="modal-overlay" onClick={() => setShowEditLeaveTypeModal(false)}></div>
              <div className="modal">
                <div className="modal-header">
                  <h3>Edit Leave Type</h3>
                  <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowEditLeaveTypeModal(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="modal-content">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={editLeaveTypeForm.name}
                        onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, name: e.target.value})}
                        placeholder="Enter leave type name"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="input w-full"
                        value={editLeaveTypeForm.description}
                        onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, description: e.target.value})}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Days Per Year *</label>
                        <input
                          type="number"
                          className="input w-full"
                          value={editLeaveTypeForm.daysPerYear || ''}
                          onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, daysPerYear: e.target.value ? parseInt(e.target.value) : null})}
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Paid Leave?</label>
                        <div className="flex items-center mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={editLeaveTypeForm.isPaid}
                              onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, isPaid: e.target.checked})}
                            />
                            <span className="ml-2">{editLeaveTypeForm.isPaid ? 'Yes' : 'No'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Allow Carryover?</label>
                        <div className="flex items-center mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={editLeaveTypeForm.allowCarryover}
                              onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, allowCarryover: e.target.checked})}
                            />
                            <span className="ml-2">{editLeaveTypeForm.allowCarryover ? 'Yes' : 'No'}</span>
                          </label>
                        </div>
                      </div>
                      
                      {editLeaveTypeForm.allowCarryover && (
                        <div>
                          <label className="form-label">Carryover Limit</label>
                          <input
                            type="number"
                            className="input w-full"
                            value={editLeaveTypeForm.carryoverLimit || ''}
                            onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, carryoverLimit: e.target.value ? parseInt(e.target.value) : null})}
                            min="0"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Expiry Rule ID</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={editLeaveTypeForm.expiryRuleId || ''}
                        onChange={(e) => setEditLeaveTypeForm({...editLeaveTypeForm, expiryRuleId: e.target.value ? parseInt(e.target.value) : null})}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowEditLeaveTypeModal(false)}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleEditLeaveType}
                    disabled={!editLeaveTypeForm.name || editLeaveTypeForm.daysPerYear === null || editLeaveTypeForm.daysPerYear < 0}
                  >
                    Update Leave Type
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default LeaveManagementView;
