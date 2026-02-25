// This component displays a card with pending leave requests
// It shows employee information and provides approve/decline action buttons

// Import React hooks for state management
import { useState, useEffect } from 'react';
// Import Lucide React icons for approve and decline buttons
import { Check, X, Calendar } from "lucide-react";
// Import leave management service
import { getAllLeaveRequests, updateLeaveRequestStatus, LeaveRequest as LeaveRequestType } from '../services/leaveManagementService';

// Define the interface for leave request items
interface LeaveRequestItem {
  id: number;
  name: string;
  avatar: string;
  type: string;
  duration: string;
  dates: string;
  status: string;
}

// Main component function for leave request card
const  LeaveRequestCard = () => {
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  // State for leave requests from API
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  
  // Helper function to get leave type name based on ID
  const getLeaveTypeName = (leaveTypeId: number): string => {
    switch(leaveTypeId) {
      case 1: return 'Annual';
      case 2: return 'Sick';
      case 3: return 'Emergency';
      case 4: return 'Maternity';
      case 5: return 'Paternity';
      case 6: return 'Unpaid';
      default: return 'Bereaved';
    }
  };

  // Load pending leave requests from API when component mounts
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all leave requests
        const response = await getAllLeaveRequests();
        if (response.success && response.leaveRequests) {
          // Filter for pending requests and transform to match UI interface
          const pendingRequests = response.leaveRequests
            .filter(req => req.status === 'pending')
            .slice(0, 4) // Limit to 4 most recent pending requests
            .map(req => ({
              id: req.id,
              name: `User ${req.userId}`, // In a real app, you'd fetch user details
              avatar: `U${req.userId}`.substring(0, 2), // Generate avatar initials
              type: getLeaveTypeName(req.leaveTypeId),
              duration: `${Math.floor((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} days`, // Calculate actual duration
              dates: `${new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
              status: req.status.charAt(0).toUpperCase() + req.status.slice(1)
            }));

          setLeaveRequests(pendingRequests);
        } else {
          console.warn('Failed to fetch leave requests from API:', response.message);
          // Set to empty array if API call fails
          setLeaveRequests([]);
        }
      } catch (err) {
        console.error('Error fetching pending leave requests:', err);
        
        // Set to empty array in case of error
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  // Handler for approving a leave request
  const handleApprove = async (requestId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateLeaveRequestStatus(requestId, 'approved', undefined);

      if (response.success) {
        // Update the local state to reflect the change
        setLeaveRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        throw new Error(response.message || 'Failed to approve leave request');
      }
    } catch (err) {
      console.error('Error approving leave request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while approving the request');
    } finally {
      setLoading(false);
    }
  };

  // Handler for declining a leave request
  const handleDecline = async (requestId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateLeaveRequestStatus(requestId, 'rejected', 'Manager decision');

      if (response.success) {
        // Update the local state to reflect the change
        setLeaveRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        throw new Error(response.message || 'Failed to decline leave request');
      }
    } catch (err) {
      console.error('Error declining leave request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while declining the request');
    } finally {
      setLoading(false);
    }
  };

  // Main render return
  return (
    // Card container with padding
    <div className="card p-6">
      {/* Card title */}
      <h3 className="mb-4">Pending Leave Requests</h3>

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error p-3 rounded mb-4">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {leaveRequests.length > 0 ? (
            leaveRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                {/* Employee information section */}
                <div className="flex items-center gap-3">
                  {/* Employee avatar with initials */}
                  <div className="avatar">{request.avatar}</div>
                  {/* Employee details */}
                  <div>
                    {/* Employee name */}
                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{request.name}</div>
                    {/* Leave type and duration */}
                    <div className="text-sm text-muted">
                      {request.type} • {request.duration}
                    </div>
                    {/* Leave dates */}
                    <div className="text-sm text-muted">{request.dates}</div>
                  </div>
                </div>
                {/* Action buttons section */}
                <div className="flex gap-2">
                  {/* Approve button with green styling */}
                  <button
                    className="btn btn-outline btn-sm green"
                    onClick={() => handleApprove(request.id)}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  {/* Decline button with red styling */}
                  <button
                    className="btn btn-outline btn-sm red"
                    onClick={() => handleDecline(request.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Requests</h3>
              <p className="text-gray-500">There are currently no pending leave requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LeaveRequestCard;
