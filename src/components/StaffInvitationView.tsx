import React, { useState, useEffect } from 'react';
import {
  inviteStaff,
  getAllStaffInvitations,
  getAvailableRolesForInvitation,
  resendStaffInvitation,
  revokeStaffInvitation,
  StaffInvitation,
  StaffInvitationRequest,
  Role,
  Branch,
  Department
} from '../services/staffManagementService';
import { getAllBranches as getAllBranchesService } from '../services/branchManagementService';
import { getAllDepartments } from '../services/departmentManagementService';

const StaffInvitationView = () => {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which invitation is being acted upon

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load invitations
      const invitationsResponse = await getAllStaffInvitations();
      if (invitationsResponse.success) {
        setInvitations(invitationsResponse.invitations || []);
      } else {
        setError(invitationsResponse.message || 'Failed to load invitations');
      }
      
      // Load roles
      const rolesResponse = await getAvailableRolesForInvitation();
      if (rolesResponse.success) {
        setRoles(rolesResponse.roles || []);
      } else {
        setError(rolesResponse.message || 'Failed to load roles');
      }
      
      // Load branches
      const branchesResponse = await getAllBranchesService();
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches || []);
      } else {
        setError(branchesResponse.message || 'Failed to load branches');
      }
      
      // Load departments
      const departmentsResponse = await getAllDepartmentsService();
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.departments || []);
      } else {
        setError(departmentsResponse.message || 'Failed to load departments');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStaff = async () => {
    if (!firstName.trim() || !lastName.trim() || !personalEmail.trim() || !roleId || !branchId || !departmentId) {
      setError('All fields are required');
      return;
    }

    const invitationData: StaffInvitationRequest = {
      firstName,
      lastName,
      personalEmail,
      roleId,
      branchId,
      departmentId
    };

    try {
      const response = await inviteStaff(invitationData);
      if (response.success) {
        setInvitations([...invitations, response.invitation!]);
        resetForm();
        loadData(); // Refresh the list
      } else {
        setError(response.message || 'Failed to invite staff');
      }
    } catch (err) {
      setError('An error occurred while inviting staff');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPersonalEmail('');
    setRoleId('');
    setBranchId('');
    setDepartmentId('');
    setShowInviteForm(false);
    setError(null);
  };

  const handleResendInvitation = async (invitationId: string) => {
    setActionLoading(invitationId);
    try {
      const response = await resendStaffInvitation(invitationId);
      if (response.success) {
        setError(null);
        loadData(); // Refresh the list
      } else {
        setError(response.message || 'Failed to resend invitation');
      }
    } catch (err) {
      setError('An error occurred while resending the invitation');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) {
      return;
    }

    setActionLoading(invitationId);
    try {
      const response = await revokeStaffInvitation(invitationId);
      if (response.success) {
        setError(null);
        loadData(); // Refresh the list
      } else {
        setError(response.message || 'Failed to revoke invitation');
      }
    } catch (err) {
      setError('An error occurred while revoking the invitation');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
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

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Staff Invitations</h2>
        <button
          onClick={() => {
            resetForm();
            setShowInviteForm(true);
          }}
          className="btn btn-primary"
        >
          Invite New Staff
        </button>
      </div>

      {/* Invite Staff Form */}
      {showInviteForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Invite New Staff Member</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="personalEmail" className="block text-sm font-medium mb-1">Personal Email *</label>
              <input
                type="email"
                id="personalEmail"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="input w-full"
                placeholder="Enter personal email"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">Role *</label>
                <select
                  id="role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="branch" className="block text-sm font-medium mb-1">Branch *</label>
                <select
                  id="branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-1">Department *</label>
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select a department</option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleInviteStaff}
                className="btn btn-primary"
              >
                Send Invitation
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

      {/* Invitations List */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Pending Invitations</h3>
        
        {invitations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Branch</th>
                  <th className="table-header-cell">Department</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Expires</th>
                  <th className="table-header-cell">Sent</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="table-row">
                    <td className="table-cell font-medium">{invitation.firstName} {invitation.lastName}</td>
                    <td className="table-cell">{invitation.personalEmail}</td>
                    <td className="table-cell">
                      {roles.find(r => r.id === invitation.roleId)?.name || invitation.roleId}
                    </td>
                    <td className="table-cell">
                      {branches.find(b => b.id === invitation.branchId)?.name || invitation.branchId}
                    </td>
                    <td className="table-cell">
                      {departments.find(d => d.id === invitation.departmentId)?.name || invitation.departmentId}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        invitation.status === 'pending' ? 'badge-warning' :
                        invitation.status === 'accepted' ? 'badge-success' :
                        'badge-danger'
                      }`}>
                        {invitation.status ? invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="table-cell">{new Date(invitation.expiresAt).toLocaleDateString()}</td>
                    <td className="table-cell">{new Date(invitation.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell">
                      {invitation.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            disabled={actionLoading === invitation.id}
                            className="btn btn-sm btn-outline"
                            title="Resend Invitation"
                          >
                            {actionLoading === invitation.id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              'Resend'
                            )}
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            disabled={actionLoading === invitation.id}
                            className="btn btn-sm btn-error text-white"
                            title="Revoke Invitation"
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                      {invitation.status !== 'pending' && (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending invitations. Send your first staff invitation to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { StaffInvitationView };