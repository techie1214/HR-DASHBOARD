// This component provides comprehensive leave management functionality
// It handles leave requests, approvals, reporting, and year-end processing

// Import React hooks for state management
import { useState, useEffect } from 'react';
// Import Lucide React icons for UI elements
import { Search, Calendar, Download, Filter, Check, X, Clock, User, Building, FileText, TrendingUp, AlertCircle, CalendarDays, Info, CheckCircle } from 'lucide-react';
// Import utility functions
import { cn } from '@/components/ui/utils';
// Import leave management service
import {
  getAllLeaveRequests,
  updateLeaveRequestStatus,
  cancelLeaveRequest,
  getUserLeaveBalance,
  createLeaveType,
  getAllLeaveTypes,
  getLeaveRequestById,
  LeaveRequest as LeaveRequestType,
  LeaveBalance,
  LeaveType
} from '../services/leaveManagementService';
import { triggerLeaveCleanup, getLeaveCleanupStatus } from '../services/leaveCleanupService';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  // State for showing cancellation confirmation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  // State for showing details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // State for selected leave request details (full details from API)
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any | null>(null);
  // State for viewing attachment in modal
  const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
  // State for showing create leave type modal
  const [showCreateLeaveTypeModal, setShowCreateLeaveTypeModal] = useState(false);
  // State for showing edit leave type modal
  const [showEditLeaveTypeModal, setShowEditLeaveTypeModal] = useState(false);
  // State for showing leave cleanup modal
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  // State for leave cleanup status
  const [cleanupStatus, setCleanupStatus] = useState<any | null>(null);
  // State for cleanup loading
  const [cleanupLoading, setCleanupLoading] = useState(false);
  // State for leave types
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  // Store raw API leave types for editing
  const [rawLeaveTypes, setRawLeaveTypes] = useState<any[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for details modal loading indicator
  const [detailsLoading, setDetailsLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  // State for success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // State for leave requests from API
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  // State for leave balances from API
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Status counts from API
  const [pendingTotal, setPendingTotal] = useState(0);
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

  // Load data from API when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching leave types...');
        // Fetch leave types first
        const typesResponse = await getAllLeaveTypes();
        console.log('Leave types response:', typesResponse);
        if (typesResponse.success && typesResponse.leaveTypes) {
          // Store raw API data for editing
          setRawLeaveTypes(typesResponse.leaveTypes);
          
          // Transform API response to match our UI interface
          const transformedTypes = typesResponse.leaveTypes.map((type: any) => ({
            id: type.id, // Keep the ID
            type: type.name,
            limit: type.days_per_year, // Use the correct field name from API
            color: type.is_paid ? '#3b82f6' : '#6b7280', // Different colors for paid/unpaid
            description: type.description || `${type.days_per_year} days per year`
          }));

          console.log('Transformed leave types:', transformedTypes);
          setLeaveTypes(transformedTypes);
        } else {
          console.warn('Failed to fetch leave types from API:', typesResponse.message);
          // Set to empty array if API call fails
          setLeaveTypes([]);
          setRawLeaveTypes([]);
        }

        console.log('Fetching leave requests...');
        
        // Build filters object
        const filters: { status?: string; leaveType?: string; search?: string } = {};
        if (filterStatus !== 'all') {
          // Map frontend status to backend status values
          const backendStatus = 
            filterStatus === 'pending' ? 'submitted' :
            filterStatus === 'declined' ? 'rejected' :
            filterStatus === 'active' ? 'approved' :  // Active = approved leave in progress
            filterStatus;
          filters.status = backendStatus;
        }
        if (filterLeaveType !== 'all') {
          filters.leaveType = filterLeaveType;
        }
        if (searchTerm) {
          filters.search = searchTerm;
        }

        // Fetch leave requests with pagination
        const requestsResponse = await getAllLeaveRequests(currentPage, itemsPerPage, filters);
        console.log('Leave requests response:', requestsResponse);
        let transformedRequests = [];

        if (requestsResponse.success && requestsResponse.leaveRequests) {
          console.log('Transforming', requestsResponse.leaveRequests.length, 'leave requests');
          console.log('Sample raw request:', requestsResponse.leaveRequests[0]);

          // Transform API response to match our UI interface
          transformedRequests = requestsResponse.leaveRequests.map(req => {
            const rawStatus = req.status;
            // Backend uses 'submitted' for pending requests, 'cancelled' for cancelled
            const transformedStatus =
                   req.status === 'approved' ? 'Approved' :
                   req.status === 'rejected' ? 'Declined' :
                   req.status === 'submitted' ? 'Pending' :  // 'submitted' = pending approval
                   req.status === 'cancelled' ? 'Declined' :  // 'cancelled' treated as declined
                   'Active';

            console.log(`Request ${req.id}: raw status="${rawStatus}" -> transformed="${transformedStatus}"`);

            return {
              id: req.id.toString(),
              staffId: req.user_id?.toString() || req.userId?.toString(),
              staffName: req.user_name || `User ${req.user_id}`,
              department: 'General',
              branch: 'Main Office',
              leaveType: req.leave_type_name || req.leaveTypeName || 'Unknown',
              startDate: req.start_date || req.startDate,
              endDate: req.end_date || req.endDate,
              duration: req.days_requested || calculateDuration(req.start_date || req.startDate, req.end_date || req.endDate),
              reason: req.reason,
              status: transformedStatus,
              requestDate: req.created_at || req.createdAt,
              approvedBy: req.reviewed_by ? 'Manager' : undefined,
              approvalDate: req.reviewed_at || req.updatedAt,
              declineReason: req.rejection_reason || req.rejectionReason,
              coveringStaff: undefined
            };
          });

          console.log('Transformed requests:', transformedRequests.length);
          console.log('Pending requests:', transformedRequests.filter(r => r.status === 'Pending').length);
          setLeaveRequests(transformedRequests);

          // Update pagination info
          if (requestsResponse.pagination) {
            setTotalItems(requestsResponse.pagination.totalItems);
            setTotalPages(requestsResponse.pagination.totalPages);
            // Always fetch the total pending count regardless of current filter
            const pendingResponse = await getAllLeaveRequests(1, 1, { status: 'submitted' });
            if (pendingResponse.pagination) {
              setPendingTotal(pendingResponse.pagination.totalItems || 0);
              console.log('Pending total from API:', pendingResponse.pagination.totalItems);
            }
          } else {
            setTotalItems(transformedRequests.length);
            setTotalPages(Math.ceil(transformedRequests.length / itemsPerPage));
            // Fallback: fetch pending count
            const pendingResponse = await getAllLeaveRequests(1, 1, { status: 'submitted' });
            if (pendingResponse.pagination) {
              setPendingTotal(pendingResponse.pagination.totalItems || 0);
            } else {
              setPendingTotal(transformedRequests.filter(r => r.status === 'Pending').length);
            }
          }
        } else {
          console.warn('Failed to fetch leave requests from API:', requestsResponse.message);
          setLeaveRequests([]);
          setTotalItems(0);
          setTotalPages(0);
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
  }, [currentPage, filterStatus, filterLeaveType, searchTerm]);

  // Helper function to get appropriate icon for leave type - now using a single consistent icon
  const getLeaveTypeIcon = () => {
    return Calendar; // Use Lucide Calendar icon for all leave types
  };
  
  // Handler to open edit leave type modal - uses raw API data
  const openEditLeaveTypeModal = (displayType: any) => {
    // Find the raw API data for this leave type
    const rawType = rawLeaveTypes.find(t => t.id === displayType.id);
    
    if (!rawType) {
      console.error('Could not find raw leave type data for id:', displayType.id);
      return;
    }
    
    setEditLeaveTypeForm({
      id: rawType.id,
      name: rawType.name,
      description: rawType.description || '',
      daysPerYear: rawType.days_per_year || null,
      isPaid: rawType.is_paid || false,
      allowCarryover: rawType.allow_carryover || false,
      carryoverLimit: rawType.carryover_limit || null,
      expiryRuleId: rawType.expiry_rule_id || null
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

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined, showTime: boolean = false): string => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      if (showTime) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateShort = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Since filtering is done server-side, filteredRequests is just the current page of leaveRequests
  const filteredRequests = leaveRequests;

  // Calculate pagination for display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests; // Already paginated from API

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterLeaveType, selectedDepartment]);

  // Calculate statistics from API totals
  const totalRequests = totalItems;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const declinedCount = leaveRequests.filter(r => r.status === 'Declined').length;
  const activeCount = leaveRequests.filter(r => r.status === 'Active').length;
  // Use pendingTotal from API when filtered by pending, otherwise calculate from current page
  const pendingCount = filterStatus === 'pending' ? pendingTotal : leaveRequests.filter(r => r.status === 'Pending').length;

  // Handler for approval/decline actions - opens approval modal
  const handleApprovalAction = (request: LeaveRequest, action: 'approve' | 'decline') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handler for viewing request details - opens details modal
  const handleViewDetails = async (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    
    // Fetch full details from API
    setDetailsLoading(true);
    try {
      const response = await getLeaveRequestById(parseInt(request.id));
      if (response.success && response.leaveRequest) {
        setSelectedRequestDetails(response.leaveRequest);
        console.log('Leave request details:', response.leaveRequest);
      } else {
        console.warn('Failed to load leave request details:', response.message);
      }
    } catch (err) {
      console.error('Error fetching leave request details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handler for confirming approval/decline action
  const confirmApproval = async () => {
    if (!selectedRequest || !approvalAction) return;

    try {
      setLoading(true);
      const requestId = parseInt(selectedRequest.id);

      console.log(`${approvalAction === 'approve' ? 'Approving' : 'Rejecting'} leave request ${requestId}`);

      // Use the new updateLeaveRequestStatus function
      const response = await updateLeaveRequestStatus(
        requestId,
        approvalAction === 'approve' ? 'approved' : 'rejected',
        approvalAction === 'decline' ? declineReason : undefined
      );

      console.log('Update response:', response);

      if (response.success) {
        // Update the local state to reflect the change
        setLeaveRequests(prev => prev.map(req =>
          req.id === selectedRequest.id
            ? { 
                ...req, 
                status: approvalAction === 'approve' ? 'Approved' : 'Declined',
                approvedBy: approvalAction === 'approve' ? 'HR Manager' : undefined,
                approvalDate: approvalAction === 'approve' ? new Date().toISOString() : undefined,
                declineReason: approvalAction === 'decline' ? declineReason : undefined
              }
            : req
        ));
        
        setSuccessMessage(response.message || `Leave request ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to process leave request');
      }

      // Close modal and reset state
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalAction(null);
      setDeclineReason('');
    } catch (err: any) {
      console.error('Error processing leave request:', err);
      setError(err.message || 'An error occurred while processing the request');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handler for cancelling an approved leave request
  const handleCancelLeave = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      const requestId = parseInt(selectedRequest.id);

      console.log(`Cancelling leave request ${requestId}`);

      // Use the cancelLeaveRequest function
      const response = await cancelLeaveRequest(requestId);

      console.log('Cancel response:', response);

      if (response.success) {
        // Update the local state to reflect the change
        setLeaveRequests(prev => prev.map(req =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: 'Declined', // Show as Declined in the UI
                declineReason: 'Cancelled by HR'
              }
            : req
        ));

        setSuccessMessage(response.message || 'Leave request cancelled successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to cancel leave request');
      }

      // Close modal and reset state
      setShowCancelModal(false);
      setSelectedRequest(null);
    } catch (err: any) {
      console.error('Error cancelling leave request:', err);
      setError(err.message || 'An error occurred while cancelling the request');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handler for cleaning up expired leave requests
  const handleLeaveCleanup = async () => {
    try {
      setCleanupLoading(true);
      setError(null);

      const response = await triggerLeaveCleanup();

      if (response.success) {
        setSuccessMessage(`Cleanup successful! ${response.message}`);
        setCleanupStatus({
          ...response.data,
          processed: response.data.declinedCount + response.data.errorCount,
        });

        // Refresh leave requests to show updated status with current pagination
        const refreshResponse = await getAllLeaveRequests(currentPage, itemsPerPage, {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          leaveType: filterLeaveType !== 'all' ? filterLeaveType : undefined,
          search: searchTerm || undefined,
        });
        if (refreshResponse.success && refreshResponse.leaveRequests) {
          setLeaveRequests(refreshResponse.leaveRequests);
          if (refreshResponse.pagination) {
            setTotalItems(refreshResponse.pagination.totalItems);
            setTotalPages(refreshResponse.pagination.totalPages);
          }
        }

        // Close modal after successful cleanup and refresh
        setTimeout(() => {
          setShowCleanupModal(false);
          setSuccessMessage(null); // Clear success message after 3 seconds
        }, 2000);
      } else {
        setError(response.message || 'Cleanup failed');
      }
    } catch (err) {
      console.error('Error during leave cleanup:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during cleanup');
    } finally {
      setCleanupLoading(false);
    }
  };

  // Handler for fetching cleanup status
  const handleFetchCleanupStatus = async () => {
    try {
      setCleanupLoading(true);
      const response = await getLeaveCleanupStatus();

      if (response.success) {
        setCleanupStatus(response.data);
      }
    } catch (err) {
      console.error('Error fetching cleanup status:', err);
    } finally {
      setCleanupLoading(false);
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
      {/* Pending Requests Card with Show All Toggle */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div
            className="card p-4 cursor-pointer transition-all hover-lift flex-1"
            onClick={() => setFilterStatus('pending')}
            style={{
              border: filterStatus === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
              backgroundColor: filterStatus === 'pending' ? '#fffbeb' : 'white'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: '#fef9c3', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }}>
                  <Clock className="w-4 h-4" style={{ color: '#ca8a04' }} />
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1' }}>Pending Requests</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '1.25' }}>{pendingCount}</p>
                </div>
              </div>
              {filterStatus === 'pending' && (
                <CheckCircle className="w-5 h-5 text-amber-600" />
              )}
            </div>
          </div>
          
          {filterStatus === 'pending' && (
            <button
              className="btn btn-outline"
              onClick={() => setFilterStatus('all')}
              style={{ padding: '0.625rem 1.25rem', height: 'fit-content' }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Show All
            </button>
          )}
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
                  <option key={type.type} value={type.type}>{type.type}</option>
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
          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                handleFetchCleanupStatus();
                setShowCleanupModal(true);
              }}
              title="View and cleanup expired leave requests"
            >
              <Clock className="w-4 h-4 mr-1" />
              Cleanup Expired Leaves
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateLeaveTypeModal(true)}
            >
              + Create Leave Type
            </button>
          </div>
        </div>
        {/* Grid of leave type cards */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-3">
          {/* Check if leave types exist */}
          {leaveTypes.length > 0 ? (
            /* Map through leave types to create interactive cards */
            leaveTypes.map(type => (
              <div
                key={type.id || type.type}
                className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all hover-lift relative"
                style={{
                  backgroundColor: filterLeaveType === type.type ? type.color + '20' : '#f9fafb',
                  border: filterLeaveType === type.type ? `2px solid ${type.color}` : '1px solid #e5e7eb',
                  minHeight: '80px'
                }}
                onClick={() => setFilterLeaveType(filterLeaveType === type.type ? 'all' : type.type)}
              >
                {/* Leave type icon - left side */}
                <div className="icon-wrapper flex-shrink-0" style={{ backgroundColor: type.color + '30', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar className="w-4 h-4" style={{ color: type.color }} />
                </div>
                {/* Leave type details - middle */}
                <div style={{ flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
                  <p style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.125rem', lineHeight: 1.2 }}>{type.type}</p>
                  <p className="text-xs text-muted" style={{ fontSize: '0.6875rem', lineHeight: 1.3 }}>{type.description}</p>
                </div>
                {/* Edit button - right side */}
                <button
                  className="flex-shrink-0 btn btn-sm btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditLeaveTypeModal(type);
                  }}
                  title="Edit leave type"
                  style={{
                    padding: '0.25rem 0.5rem',
                    height: 'auto',
                    minWidth: 'auto',
                    fontSize: '0.6875rem'
                  }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
                {/* Show active filter indicator */}
                {filterStatus !== 'all' && <span style={{ color: '#2563eb', fontWeight: 500 }}> · {filterStatus}</span>}
                {filteredRequests.length !== totalRequests && <span style={{ color: '#059669', fontWeight: 500 }}> (filtered from {totalRequests} total)</span>}
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
            {/* Table body with paginated requests */}
            <tbody>
              {/* Map through paginated requests to create table rows */}
              {paginatedRequests.map((request) => {
                // Find leave type information for styling
                const leaveTypeInfo = leaveTypes.find(t => t.type === request.leaveType);
                return (
                  // Table row for each leave request
                  <tr key={request.id} className="table-row">
                    {/* Employee information cell */}
                    <td className="table-cell">
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{request.staffName}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div style={{ 
                          width: '2rem', 
                          height: '2rem', 
                          borderRadius: '0.375rem', 
                          backgroundColor: leaveTypeInfo?.color + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Calendar className="w-4 h-4" style={{ color: leaveTypeInfo?.color }} />
                        </div>
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
                      ) : request.status === 'Approved' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleViewDetails(request)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Details
                          </button>
                          <button
                            className="btn btn-sm btn-outline red"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowCancelModal(true);
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t" style={{ backgroundColor: '#f9fafb' }}>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

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
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="mt-2 text-sm" style={{ color: '#6b7280' }}>
              Showing <span style={{ fontWeight: 600, color: '#111827' }}>{startIndex + 1}</span> to{' '}
              <span style={{ fontWeight: 600, color: '#111827' }}>{Math.min(endIndex, totalItems)}</span> of{' '}
              <span style={{ fontWeight: 600, color: '#111827' }}>{totalItems}</span> leave requests
            </div>
          </div>
        )}
        
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
        {/* Summary Cards - 4 cards in single row */}
        <div className="grid grid-cols-2 lg-grid-cols-4 gap-3">
          <div className="card p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', minWidth: '2.25rem', width: '2.25rem', height: '2.25rem', borderRadius: '0.375rem', flexShrink: 0 }}>
                <Calendar className="w-4 h-4" style={{ color: '#2563eb' }} />
              </div>
              <div className="min-w-0">
                <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: 1.1 }}>Total Leave Days</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.2 }}>
                  {leaveRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4', minWidth: '2.25rem', width: '2.25rem', height: '2.25rem', borderRadius: '0.375rem', flexShrink: 0 }}>
                <User className="w-4 h-4" style={{ color: '#16a34a' }} />
              </div>
              <div className="min-w-0">
                <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: 1.1 }}>Employees on Leave</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.2 }}>{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="card p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', minWidth: '2.25rem', width: '2.25rem', height: '2.25rem', borderRadius: '0.375rem', flexShrink: 0 }}>
                <TrendingUp className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
              <div className="min-w-0">
                <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: 1.1 }}>Approval Rate</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.2 }}>
                  {approvedCount + declinedCount > 0 ? ((approvedCount / (approvedCount + declinedCount)) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="card p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef2f2', minWidth: '2.25rem', width: '2.25rem', height: '2.25rem', borderRadius: '0.375rem', flexShrink: 0 }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#dc2626' }} />
              </div>
              <div className="min-w-0">
                <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: 1.1 }}>Pending Review</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.2 }}>{pendingCount}</p>
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

          {/* Approval Modal - Modern Design */}
          {showApprovalModal && selectedRequest && (
            <>
              <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}></div>
              <div className="modal modal-lg animate-scale-in">
                <div className="modal-header">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      approvalAction === 'approve' 
                        ? "bg-gradient-to-br from-green-500 to-green-600" 
                        : "bg-gradient-to-br from-red-500 to-red-600"
                    )}>
                      {approvalAction === 'approve' ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="modal-title text-xl font-semibold text-slate-900">
                        {approvalAction === 'approve' ? 'Approve' : 'Decline'} Leave Request
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Request #{selectedRequest.id}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-ghost btn-icon rounded-lg hover:bg-slate-100 transition-colors" 
                    onClick={() => setShowApprovalModal(false)}
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="modal-content space-y-5">
                  {/* Employee Info Card */}
                  <div className="card p-4 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-base">{selectedRequest.staffName}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{selectedRequest.staffId} · {selectedRequest.department}</p>
                      </div>
                      <div className={cn(
                        "badge px-3 py-1.5 text-xs font-semibold",
                        selectedRequest.status === 'Pending' ? "badge-warning" :
                        selectedRequest.status === 'Approved' ? "badge-success" :
                        selectedRequest.status === 'Declined' ? "badge-error" : "badge-secondary"
                      )}>
                        {selectedRequest.status}
                      </div>
                    </div>
                  </div>

                  {/* Leave Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Leave Type</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedRequest.leaveType}</p>
                    </div>
                    <div className="card p-4 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedRequest.duration} {selectedRequest.duration > 1 ? 'days' : 'day'}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</span>
                      <p className="font-medium text-slate-900 mt-1.5 text-sm">
                        {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Date</span>
                      <p className="font-medium text-slate-900 mt-1.5 text-sm">
                        {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason for Leave</span>
                    <div className="card p-4 mt-2 bg-slate-50 border-slate-200">
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedRequest.reason}</p>
                    </div>
                  </div>

                  {/* Policy Warning */}
                  {selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7 && approvalAction === 'approve' && (
                    <div className="card p-4 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900">Policy Violation</p>
                          <p className="text-sm text-red-700 mt-1 leading-relaxed">
                            This annual leave request exceeds the 7-day limit. Please request the employee to split this into separate requests.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Decline Reason Input */}
                  {approvalAction === 'decline' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Decline Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="input min-h-[120px] resize-none"
                        placeholder="Please provide a detailed reason for declining this request..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-slate-50">
                  <button className="btn btn-ghost" onClick={() => setShowApprovalModal(false)}>
                    Cancel
                  </button>
                  <button
                    className={cn(
                      "btn font-semibold px-6",
                      approvalAction === 'approve' 
                        ? "btn-primary bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" 
                        : "btn-danger bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    )}
                    onClick={confirmApproval}
                    disabled={(approvalAction === 'decline' && !declineReason.trim()) || (approvalAction === 'approve' && selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7)}
                  >
                    {approvalAction === 'approve' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Approve Request
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Decline Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Cancel Leave Modal - Modern Design */}
          {showCancelModal && selectedRequest && (
            <>
              <div className="modal-overlay" onClick={() => setShowCancelModal(false)}></div>
              <div className="modal modal-lg animate-scale-in">
                <div className="modal-header">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="modal-title text-xl font-semibold text-slate-900">Cancel Leave Request</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Request #{selectedRequest.id}</p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-ghost btn-icon rounded-lg hover:bg-slate-100 transition-colors" 
                    onClick={() => setShowCancelModal(false)}
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="modal-content space-y-5">
                  {/* Warning Card */}
                  <div className="card p-5 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-base font-semibold text-red-900">Warning: This action will cancel the approved leave</p>
                        <p className="text-sm text-red-700 mt-1.5 leading-relaxed">
                          The employee's leave balance will be restored and the leave request will be marked as declined. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Employee Info Card */}
                  <div className="card p-4 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-base">{selectedRequest.staffName}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{selectedRequest.staffId} · {selectedRequest.department}</p>
                      </div>
                      <div className="badge badge-success px-3 py-1.5 text-xs font-semibold">
                        {selectedRequest.status}
                      </div>
                    </div>
                  </div>

                  {/* Leave Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Leave Type</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedRequest.leaveType}</p>
                    </div>
                    <div className="card p-4 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedRequest.duration} {selectedRequest.duration > 1 ? 'days' : 'day'}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</span>
                      <p className="font-medium text-slate-900 mt-1.5 text-sm">
                        {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Date</span>
                      <p className="font-medium text-slate-900 mt-1.5 text-sm">
                        {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason for Leave</span>
                    <div className="card p-4 mt-2 bg-slate-50 border-slate-200">
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedRequest.reason}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-slate-50">
                  <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>
                    Go Back
                  </button>
                  <button
                    className="btn btn-danger font-semibold px-6"
                    onClick={handleCancelLeave}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Cancel Leave Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Details Modal - Redesigned */}
          {showDetailsModal && selectedRequest && (
            <>
              <div className="bam-overlay" onClick={() => { setShowDetailsModal(false); setSelectedRequestDetails(null); }} style={{ zIndex: 9999 }}></div>
              <div 
                className="bam-modal" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                  maxWidth: '750px', 
                  zIndex: 10000, 
                  position: 'fixed', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header */}
                <div className="bam-header" style={{ 
                  padding: '1.25rem', 
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      flexShrink: 0
                    }}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                        Leave Request Details
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                        Request #{selectedRequest.id}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="bam-btn-close" 
                    onClick={() => { setShowDetailsModal(false); setSelectedRequestDetails(null); }} 
                    title="Close"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#f3f4f6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="bam-body" style={{ 
                  padding: '1.25rem', 
                  overflowY: 'auto',
                  flex: 1
                }}>
                  {detailsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                      <svg className="animate-spin w-8 h-8" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : selectedRequestDetails ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Employee Info Card */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        borderRadius: '0.75rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div className="bam-avatar" style={{
                          width: '4rem',
                          height: '4rem',
                          fontSize: '1rem',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {selectedRequestDetails.user_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0, color: '#111827' }}>{selectedRequestDetails.user_name || selectedRequest.staffName}</p>
                          <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>ID: {selectedRequestDetails.user_id} • {selectedRequest.department || 'General'}</p>
                          <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.125rem 0 0' }}>{selectedRequest.branch || 'Main Office'}</p>
                        </div>
                        <span className={`badge ${
                          selectedRequestDetails.status === 'approved' ? 'badge-success' :
                          selectedRequestDetails.status === 'rejected' ? 'badge-danger' :
                          selectedRequestDetails.status === 'active' ? 'badge-info' :
                          'badge-warning'
                        }`} style={{ 
                          textTransform: 'capitalize',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          flexShrink: 0
                        }}>
                          {selectedRequestDetails.status}
                        </span>
                      </div>

                      {/* Leave Details Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                      }}>
                        <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                          <p style={{ fontSize: '0.6875rem', color: '#0369a1', marginBottom: '0.375rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Leave Type</p>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0c4a6e', margin: 0 }}>{selectedRequestDetails.leave_type_name || selectedRequest.leaveType}</p>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}>
                          <p style={{ fontSize: '0.6875rem', color: '#92400e', marginBottom: '0.375rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Days Requested</p>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#78350f', margin: 0 }}>{selectedRequestDetails.days_requested || selectedRequest.duration} days</p>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                          <p style={{ fontSize: '0.6875rem', color: '#4b5563', marginBottom: '0.375rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Submitted</p>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1f2937', margin: 0 }}>{formatDateShort(selectedRequestDetails.created_at)}</p>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                          <p style={{ fontSize: '0.6875rem', color: '#4b5563', marginBottom: '0.375rem', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Status</p>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1f2937', margin: 0, textTransform: 'capitalize' }}>{selectedRequestDetails.status}</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                      }}>
                        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                            <Calendar className="w-3.5 h-3.5" />
                            Start Date
                          </p>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111827', margin: 0 }}>
                            {formatDate(selectedRequestDetails.start_date)}
                          </p>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                            <Calendar className="w-3.5 h-3.5" />
                            End Date
                          </p>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111827', margin: 0 }}>
                            {formatDate(selectedRequestDetails.end_date)}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div style={{ marginBottom: '0' }}>
                        <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>
                          <FileText className="w-3.5 h-3.5" />
                          Reason for Leave
                        </p>
                        <p style={{ fontSize: '0.875rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', lineHeight: '1.6', margin: 0, color: '#374151' }}>
                          {selectedRequestDetails.reason}
                        </p>
                      </div>

                      {/* Attachments */}
                      {selectedRequestDetails.attachments && selectedRequestDetails.attachments.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Attachments ({selectedRequestDetails.attachments.length})
                          </p>
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {selectedRequestDetails.attachments.map((attachment: any, index: number) => (
                              <div
                                key={index}
                                style={{
                                  padding: '1rem', 
                                  backgroundColor: '#f8fafc',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '1rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                                  <div style={{
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '0.375rem',
                                    backgroundColor: attachment.mime_type?.includes('pdf') ? '#fee2e2' : '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {attachment.mime_type?.includes('pdf') ? (
                                      <FileText className="w-4 h-4" style={{ color: '#dc2626' }} />
                                    ) : (
                                      <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
                                    )}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                      {attachment.file_name || `Attachment ${index + 1}`}
                                    </p>
                                    <p style={{ fontSize: '0.65rem', color: '#6b7280', margin: 0 }}>
                                      {attachment.mime_type || 'Unknown'} · {attachment.file_size ? Math.round(attachment.file_size / 1024) + ' KB' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                  {attachment.file_path && (
                                    <button
                                      onClick={() => setViewingAttachment(attachment)}
                                      className="bam-btn bam-btn-ghost"
                                      style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </button>
                                  )}
                                  <a
                                    href={`${import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api'}${attachment.file_path}`}
                                    download={attachment.file_name}
                                    className="bam-btn bam-btn-primary"
                                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Approval Info */}
                      {(selectedRequestDetails.reviewed_by || selectedRequestDetails.reviewed_at) && (
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: selectedRequestDetails.status === 'approved' ? '#f0fdf4' : '#fef2f2',
                          borderRadius: '0.5rem',
                          border: `1px solid ${selectedRequestDetails.status === 'approved' ? '#bbf7d0' : '#fecaca'}`
                        }}>
                          <p style={{
                            fontSize: '0.65rem',
                            color: selectedRequestDetails.status === 'approved' ? '#166534' : '#991b1b',
                            marginBottom: '0.5rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            margin: 0
                          }}>
                            {selectedRequestDetails.status === 'approved' ? 'Approval Information' : 'Rejection Information'}
                          </p>
                          <div className="bam-row2">
                            <div>
                              <p style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.125rem', margin: 0 }}>
                                {selectedRequestDetails.status === 'approved' ? 'Approved By' : 'Rejected By'}
                              </p>
                              <p style={{ fontWeight: 600, fontSize: '0.8125rem', margin: 0 }}>
                                {selectedRequestDetails.reviewed_by_name || 'HR Manager'}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.125rem', margin: 0 }}>Date</p>
                              <p style={{ fontWeight: 600, fontSize: '0.8125rem', margin: 0 }}>
                                {selectedRequestDetails.reviewed_at && formatDate(selectedRequestDetails.reviewed_at, true)}
                              </p>
                            </div>
                          </div>
                          {selectedRequestDetails.notes && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                              <p style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.25rem', margin: 0 }}>Comments</p>
                              <p style={{ fontSize: '0.8125rem', lineHeight: '1.5', margin: 0 }}>{selectedRequestDetails.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                    ) : (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <AlertCircle className="w-12 h-12" style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', margin: 0 }}>Unable to load details</p>
                      <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>Please try again later</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bam-footer">
                  <button className="bam-btn bam-btn-ghost" onClick={() => { setShowDetailsModal(false); setSelectedRequestDetails(null); }}>Close</button>
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

      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <>
          <div 
            className="modal-overlay" 
            onClick={() => setViewingAttachment(null)}
            style={{ zIndex: 9999 }}
          ></div>
          <div 
            className="modal"
            style={{ 
              maxWidth: '900px', 
              zIndex: 10000, 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              height: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h3>{viewingAttachment.file_name || 'Attachment'}</h3>
                  <p className="text-xs text-muted mt-0.5">
                    {viewingAttachment.mime_type || 'Unknown'} • {viewingAttachment.file_size ? Math.round(viewingAttachment.file_size / 1024) + ' KB' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api'}${viewingAttachment.file_path}`}
                  download={viewingAttachment.file_name}
                  className="btn btn-sm btn-primary"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <a
                  href={`${import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api'}${viewingAttachment.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  <Eye className="w-4 h-4" />
                  Full Screen
                </a>
                <button 
                  className="btn btn-ghost btn-icon" 
                  onClick={() => setViewingAttachment(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div 
              className="modal-content" 
              style={{ 
                flex: 1, 
                overflow: 'auto', 
                padding: '0', 
                backgroundColor: '#f1f5f9' 
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-4">
                {viewingAttachment.mime_type?.includes('image') ? (
                  <img
                    src={`${import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api'}${viewingAttachment.file_path}`}
                    alt={viewingAttachment.file_name || 'Attachment'}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : viewingAttachment.mime_type?.includes('pdf') ? (
                  <iframe
                    src={`${import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api'}${viewingAttachment.file_path}`}
                    className="w-full h-full rounded-lg shadow-lg"
                    style={{ minHeight: '70vh', border: 'none' }}
                    title={viewingAttachment.file_name || 'Attachment'}
                  />
                ) : (
                  <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <File className="w-20 h-20 text-primary mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">{viewingAttachment.file_name || 'Attachment'}</h4>
                    <p className="text-muted mb-4">This file type cannot be previewed. Please download to view.</p>
                    <a
                      href={`${import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api'}${viewingAttachment.file_path}`}
                      download={viewingAttachment.file_name}
                      className="btn btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Leave Cleanup Modal */}
      {showCleanupModal && (
        <div className="modal-overlay" onClick={() => setShowCleanupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <h3>Cleanup Expired Leave Requests</h3>
                  <p className="text-muted text-sm mt-1">
                    Automatically decline pending leave requests with dates that have passed
                  </p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowCleanupModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              {/* Status Information */}
              {cleanupStatus && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f1f5f9' }}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Current Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'white' }}>
                      <p className="text-sm text-muted">Total Pending Leaves</p>
                      <p className="text-2xl font-bold">{cleanupStatus.totalPendingLeaves || 0}</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'white' }}>
                      <p className="text-sm text-muted">Expired Pending Leaves</p>
                      <p className="text-2xl font-bold text-destructive">{cleanupStatus.expiredPendingLeaves || 0}</p>
                    </div>
                  </div>
                  {cleanupStatus.lastRunTime && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted">
                        Last run: {new Date(cleanupStatus.lastRunTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {cleanupStatus.nextRunTime && (
                    <div className="mt-2">
                      <p className="text-sm text-muted">
                        Next run: {new Date(cleanupStatus.nextRunTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cleanup Results */}
              {cleanupStatus?.declinedCount !== undefined && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Cleanup Results</h4>
                  </div>
                  <p className="text-green-700">
                    Processed {cleanupStatus.processed || 0} leave requests
                  </p>
                  <p className="text-green-700 font-semibold">
                    Declined {cleanupStatus.declinedCount} expired requests
                  </p>
                  {cleanupStatus.errorCount > 0 && (
                    <p className="text-amber-700 mt-2">
                      Errors: {cleanupStatus.errorCount}
                    </p>
                  )}
                </div>
              )}

              {/* Info Box */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">What will happen?</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• All pending leave requests with end dates in the past will be declined</li>
                      <li>• Status will be changed to "rejected"</li>
                      <li>• Notes will be set to "Automatically declined: Leave dates have passed"</li>
                      <li>• This action cannot be undone automatically</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowCleanupModal(false)}
                  disabled={cleanupLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleLeaveCleanup}
                  disabled={cleanupLoading}
                >
                  {cleanupLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Running Cleanup...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Run Cleanup Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagementView;
