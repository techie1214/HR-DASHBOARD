import React, { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  User,
  CreateUserRequest,
  UpdateUserRequest
} from '../services/userManagementService';
import { getAllRoles } from '../services/roleManagementService';
import { getAllBranches } from '../services/branchManagementService';
import { getAllDepartments } from '../services/departmentManagementService';
import { User as UserIcon, Plus, Edit3, Trash2, X, Check } from 'lucide-react';

const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [departmentId, setDepartmentId] = useState<number>(0);

  // Lists for dropdowns
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Load users on component mount
  useEffect(() => {
    loadUsersAndOptions();
  }, []);

  const loadUsersAndOptions = async () => {
    try {
      setLoading(true);

      // Load users
      const usersResponse = await getAllUsers();
      if (usersResponse.success) {
        setUsers(usersResponse.users || []);
      } else {
        setError(usersResponse.message || 'Failed to load users');
      }

      // Load roles
      const rolesResponse = await getAllRoles();
      if (rolesResponse.success) {
        setRoles(rolesResponse.roles || []);
      }

      // Load branches
      const branchesResponse = await getAllBranches();
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches || []);
      }

      // Load departments
      const departmentsResponse = await getAllDepartments();
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.departments || []);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading data');
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
    setDepartmentId(0);
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
        branchId,
        departmentId
      };

      const response = await createUser(userData);
      
      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // Reload users
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
        branchId,
        departmentId
      };

      const response = await updateUser(editingUser.id, userData);
      
      if (response.success) {
        setShowEditForm(false);
        setEditingUser(null);
        resetForm();
        // Reload users
        loadUsersAndOptions();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await deleteUser(id);
        
        if (response.success) {
          // Reload users
          loadUsersAndOptions();
        } else {
          setError(response.message || 'Failed to delete user');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting user');
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
    setDepartmentId(user.departmentId);
    setPassword(''); // Don't populate password for editing
    setShowEditForm(true);
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
      {/* Header Section with action buttons */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-muted">Manage system users and their access rights</p>
        </div> */}
        <div className="flex items-center gap-3">
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
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          <div className="flex items-center">
            <X className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Create New User</h3>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="input input-bordered w-full"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <select
                  className="input input-bordered w-full"
                  value={branchId}
                  onChange={(e) => setBranchId(Number(e.target.value))}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="input input-bordered w-full"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
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
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Edit User: {editingUser.firstName} {editingUser.lastName}</h3>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowEditForm(false);
                setEditingUser(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="input input-bordered w-full"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <select
                  className="input input-bordered w-full"
                  value={branchId}
                  onChange={(e) => setBranchId(Number(e.target.value))}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="input input-bordered w-full"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
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
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Users */}
      <div className="card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Existing Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{roles.find(r => r.id === user.roleId)?.name || 'N/A'}</td>
                  <td>{branches.find(b => b.id === user.branchId)?.name || 'N/A'}</td>
                  <td>{departments.find(d => d.id === user.departmentId)?.name || 'N/A'}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => startEditing(user)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;