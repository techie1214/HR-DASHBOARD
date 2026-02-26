import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  User,
  CreateUserRequest,
  UpdateUserRequest
} from '../services/userManagementService';
import { getAllRoles } from '../services/roleManagementService';
import { getAllBranches } from '../services/branchManagementService';
import { User as UserIcon, Plus, Edit3, Trash2, X, Check, AlertCircle, Mail, Shield, Building } from 'lucide-react';

const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalUsers_count, setTotalUsers_count] = useState(0);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(0);
  const [branchId, setBranchId] = useState<number>(0);

  // Lists for dropdowns
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Load users when page changes
  useEffect(() => {
    loadUsersAndOptions();
  }, [currentPage]);

  // Load users on component mount
  useEffect(() => {
    loadUsersAndOptions();
  }, []);

  const loadUsersAndOptions = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Load users with pagination
      const usersResponse = await getAllUsers(currentPage, itemsPerPage);
      if (usersResponse.success) {
        setUsers(usersResponse.users || []);
        // Use the total and totalPages from API
        const total = usersResponse.total || 0;
        const totalPages = usersResponse.totalPages || Math.ceil(total / itemsPerPage);
        setTotalUsers_count(total);
        console.log('Users loaded:', usersResponse.users?.length, 'Total:', total, 'Total Pages:', totalPages);
      } else {
        setError(usersResponse.message || 'Failed to load users');
      }

      // Only reload roles, branches if not already loaded (optimization)
      if (roles.length === 0) {
        const rolesResponse = await getAllRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.roles || []);
        }
      }

      if (branches.length === 0) {
        const branchesResponse = await getAllBranches();
        if (branchesResponse.success) {
          setBranches(branchesResponse.branches || []);
        }
      }
    } catch (err: any) {
      const errorMessage = err.code === 'ERR_NETWORK' 
        ? 'Network error: Unable to connect to server. Please ensure the backend is running.'
        : err.message || 'An error occurred while loading data';
      setError(errorMessage);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRoleId(0);
    setBranchId(0);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userData: CreateUserRequest = {
        firstName,
        lastName,
        email,
        password,
        roleId,
        branchId
      };

      const response = await createUser(userData);

      if (response.success) {
        setSuccessMessage('User created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowCreateForm(false);
        resetForm();
        loadUsersAndOptions();
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      const userData: UpdateUserRequest = {
        firstName,
        lastName,
        email,
        roleId,
        branchId
      };

      const response = await updateUser(editingUser.id, userData);

      if (response.success) {
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowEditForm(false);
        setEditingUser(null);
        resetForm();
        loadUsersAndOptions();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await deleteUser(id);

        if (response.success) {
          setSuccessMessage('User deleted successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
          loadUsersAndOptions();
        } else {
          setError(response.message || 'Failed to delete user');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting user');
      }
    }
  };

  const handleActivateUser = async (id: number) => {
    try {
      const response = await toggleUserStatus(id, true);
      if (response.success) {
        setSuccessMessage('User activated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadUsersAndOptions();
      } else {
        setError(response.message || 'Failed to activate user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while activating user');
    }
  };

  const handleDeactivateUser = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const response = await toggleUserStatus(id, false);
        if (response.success) {
          setSuccessMessage('User deactivated successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
          loadUsersAndOptions();
        } else {
          setError(response.message || 'Failed to deactivate user');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while deactivating user');
      }
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setRoleId(user.roleId);
    setBranchId(user.branchId);
    setPassword('');
    setShowEditForm(true);
  };

  // Calculate statistics - use totalUsers_count for total, and calculate active/inactive from all users
  const totalUsers = totalUsers_count; // Use API total, not page count
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;
  const adminUsers = users.filter(u => roles.find(r => r.id === u.roleId)?.name.toLowerCase().includes('admin')).length;
  
  // For accurate active/inactive counts, we'd need to fetch all users or get stats from API
  // For now, show counts from current page but indicate it's partial data
  const activeUsersDisplay = totalUsers_count > itemsPerPage 
    ? `${activeUsers}+` // Show + to indicate there are more
    : activeUsers;
  const inactiveUsersDisplay = totalUsers_count > itemsPerPage
    ? `${inactiveUsers}+`
    : inactiveUsers;

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

      {/* Stats Cards - Horizontal layout to save space */}
      <div className="grid grid-cols-4 gap-4" style={{ maxWidth: '800px' }}>
        <div className="card p-3 cursor-pointer transition-all hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2.5rem', height: '2.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon className="w-4 h-4" style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: '1', marginBottom: '0.25rem' }}>Total Users</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '1' }}>{totalUsers}</p>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2.5rem', height: '2.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check className="w-4 h-4" style={{ color: '#16a34a' }} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: '1', marginBottom: '0.25rem' }}>Active</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '1' }}>{activeUsersDisplay}</p>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-wrapper" style={{ backgroundColor: '#fef9c3', width: '2.5rem', height: '2.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X className="w-4 h-4" style={{ color: '#ca8a04' }} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: '1', marginBottom: '0.25rem' }}>Inactive</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '1' }}>{inactiveUsersDisplay}</p>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff', width: '2.5rem', height: '2.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield className="w-4 h-4" style={{ color: '#9333ea' }} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: '1', marginBottom: '0.25rem' }}>Admins</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '1' }}>{adminUsers}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Create User Form Modal */}
      {showCreateForm && (
        <>
          <div className="modal-overlay" onClick={() => { setShowCreateForm(false); resetForm(); }}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => { setShowCreateForm(false); resetForm(); }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="input w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    className="input w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min. 8 characters)"
                    minLength={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <select
                        className="input w-full"
                        value={roleId}
                        onChange={(e) => setRoleId(Number(e.target.value))}
                        style={{ color: roleId ? '#1f2937' : '#6b7280' }}
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
                    <label className="block text-sm font-medium mb-1">Branch *</label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <select
                        className="input w-full"
                        value={branchId}
                        onChange={(e) => setBranchId(Number(e.target.value))}
                        style={{ color: branchId ? '#1f2937' : '#6b7280' }}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setShowCreateForm(false); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check className="w-4 h-4 mr-2" />
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit User Form Modal */}
      {showEditForm && editingUser && (
        <>
          <div className="modal-overlay" onClick={() => { setShowEditForm(false); setEditingUser(null); resetForm(); }}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User: {firstName} {lastName}</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => { setShowEditForm(false); setEditingUser(null); resetForm(); }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="input w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <select
                        className="input w-full"
                        value={roleId}
                        onChange={(e) => setRoleId(Number(e.target.value))}
                        style={{ color: roleId ? '#1f2937' : '#6b7280' }}
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
                    <label className="block text-sm font-medium mb-1">Branch *</label>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <select
                        className="input w-full"
                        value={branchId}
                        onChange={(e) => setBranchId(Number(e.target.value))}
                        style={{ color: branchId ? '#1f2937' : '#6b7280' }}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setShowEditForm(false); setEditingUser(null); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check className="w-4 h-4 mr-2" />
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Existing Users</h3>
          <p className="text-muted text-sm">Showing {users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Branch</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-gray-400" />
                      <span>{roles.find(r => r.id === user.roleId)?.name || (
                        <span className="text-muted">N/A</span>
                      )}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {branches.find(b => b.id === user.branchId)?.name || (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell right">
                    <div className="flex items-center justify-end gap-2">
                      {user.isActive ? (
                        <button
                          className="btn btn-sm btn-outline yellow"
                          onClick={() => handleDeactivateUser(user.id)}
                          title="Deactivate user"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline green"
                          onClick={() => handleActivateUser(user.id)}
                          title="Activate user"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Activate
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => startEditing(user)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline red"
                        onClick={() => handleDeleteUser(user.id)}
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
        
        {/* Pagination Controls */}
        {(totalUsers_count > itemsPerPage || users.length === itemsPerPage) && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalUsers_count)} of {totalUsers_count} users
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(totalUsers_count / itemsPerPage)) }, (_, i) => {
                const totalPages = Math.ceil(totalUsers_count / itemsPerPage);
                const pageNum = currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                    ? totalPages - 4 + i
                    : currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => prev + 1);
                }}
                disabled={currentPage >= Math.ceil(totalUsers_count / itemsPerPage)}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Users Yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first user</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementView;
