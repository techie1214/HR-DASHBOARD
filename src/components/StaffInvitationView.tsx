import React, { useState, useEffect } from 'react';
import { X, Mail, User, Briefcase, Building, Send, RefreshCw, Trash2, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  inviteStaff,
  getAllStaffInvitations,
  getAvailableRolesForInvitation,
  resendStaffInvitation,
  revokeStaffInvitation,
  StaffInvitation as StaffInvitationType
} from '../services/staffManagementService';
import { getAllBranches as getAllBranchesService } from '../services/branchManagementService';
import { getAllDepartments } from '../services/departmentManagementService';

interface StaffInvitationViewProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface StaffInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  roleName: string;
  branchName: string;
  departmentName: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

const StaffInvitationView: React.FC<StaffInvitationViewProps> = ({ onSuccess, onClose }) => {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Dropdowns
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load invitations
      const invitationsResponse = await getAllStaffInvitations();
      if (invitationsResponse.success && invitationsResponse.invitations) {
        const mappedInvitations: StaffInvitation[] = invitationsResponse.invitations.map((inv: any) => ({
          id: inv.id?.toString() || inv.invitation_id?.toString(),
          email: inv.email || inv.personal_email,
          firstName: inv.first_name || inv.firstName,
          lastName: inv.last_name || inv.lastName,
          fullName: `${inv.first_name || inv.firstName || ''} ${inv.last_name || inv.lastName || ''}`.trim(),
          status: (inv.status || 'pending') as 'pending' | 'accepted' | 'expired' | 'cancelled',
          roleName: inv.role_name || inv.roleName || 'N/A',
          branchName: inv.branch_name || inv.branchName || 'N/A',
          departmentName: inv.department_name || inv.departmentName || 'N/A',
          invitedBy: inv.invited_by_name || inv.invitedByName || 'System',
          createdAt: inv.created_at || inv.createdAt,
          expiresAt: inv.expires_at || inv.expiresAt,
          acceptedAt: inv.accepted_at || inv.acceptedAt
        }));
        setInvitations(mappedInvitations);
      }

      // Load roles
      const rolesResponse = await getAvailableRolesForInvitation();
      if (rolesResponse.success && rolesResponse.roles) {
        setRoles(rolesResponse.roles);
      }

      // Load branches
      const branchesResponse = await getAllBranchesService();
      if (branchesResponse.success && branchesResponse.branches) {
        setBranches(branchesResponse.branches);
      }

      // Load departments
      const departmentsResponse = await getAllDepartments();
      if (departmentsResponse.success && departmentsResponse.departments) {
        setDepartments(departmentsResponse.departments);
      }
    } catch (err: any) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !personalEmail.trim() || !roleId || !branchId || !departmentId) {
      setError('All fields marked with * are required');
      return;
    }

    const invitationData = {
      firstName,
      lastName,
      personalEmail,
      roleId: parseInt(roleId),
      branchId: parseInt(branchId),
      departmentId: parseInt(departmentId)
    };

    setActionLoading('invite');
    try {
      const response = await inviteStaff(invitationData);
      if (response.success) {
        setSuccessMessage('Invitation sent successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadData();
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || 'Failed to send invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setActionLoading(null);
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
  };

  const handleResendInvitation = async (invitationId: string) => {
    setActionLoading(`resend-${invitationId}`);
    try {
      const response = await resendStaffInvitation(invitationId);
      if (response.success) {
        setSuccessMessage('Invitation resent successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadData();
      } else {
        setError(response.message || 'Failed to resend invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`revoke-${invitationId}`);
    try {
      const response = await revokeStaffInvitation(invitationId);
      if (response.success) {
        setSuccessMessage('Invitation revoked successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadData();
      } else {
        setError(response.message || 'Failed to revoke invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: Clock, label: 'Pending' },
      accepted: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle, label: 'Accepted' },
      expired: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: XCircle, label: 'Expired' },
      cancelled: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200', icon: XCircle, label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#0f172a' }}>Staff Invitations</h2>
          <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
            Manage pending and accepted staff invitations
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInviteForm(true)}
          className="btn btn-primary"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Invitation
        </button>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div
          className="notification-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowInviteForm(false)}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-4 border-b"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 className="text-lg font-semibold">Send Staff Invitation</h3>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="btn btn-ghost btn-icon"
                style={{ width: '2rem', height: '2rem' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleInviteStaff} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      First Name *
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="input w-full"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                    Personal Email *
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="input w-full"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="john.doe@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Role *
                    </label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <select
                        className="input w-full"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        required
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Branch *
                    </label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <select
                        className="input w-full"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                      Department *
                    </label>
                    <select
                      className="input w-full"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowInviteForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading === 'invite'}
                  >
                    {actionLoading === 'invite' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invitations List */}
      <div className="card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Invitation History</h3>
          <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
            {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Candidate</th>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Invited</th>
                <th className="table-header-cell">Expires</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div
                        className="avatar"
                        style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}
                      >
                        {invitation.firstName[0]}{invitation.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium" style={{ fontSize: '0.875rem' }}>
                          {invitation.fullName}
                        </p>
                        <p className="text-xs text-muted">{invitation.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="text-sm">{invitation.roleName}</p>
                      <p className="text-xs text-muted">{invitation.departmentName}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(invitation.status)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Calendar className="w-3 h-3" />
                      {formatDate(invitation.createdAt)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3 text-muted" />
                      <span className={invitation.status === 'expired' ? 'text-red-600' : 'text-muted'}>
                        {formatDate(invitation.expiresAt)}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell right">
                    <div className="flex items-center justify-end gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResendInvitation(invitation.id)}
                            disabled={actionLoading?.startsWith('resend')}
                            className="btn btn-sm btn-outline"
                            title="Resend Invitation"
                          >
                            <RefreshCw className={`w-3 h-3 ${actionLoading === `resend-${invitation.id}` ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            disabled={actionLoading?.startsWith('revoke')}
                            className="btn btn-sm btn-outline red"
                            title="Revoke Invitation"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invitations.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium" style={{ color: '#0f172a', marginBottom: '0.5rem' }}>
              No Invitations Yet
            </h3>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              Get started by sending your first staff invitation
            </p>
            <button
              type="button"
              onClick={() => setShowInviteForm(true)}
              className="btn btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffInvitationView;
