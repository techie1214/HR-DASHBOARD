import React, { useState, useEffect } from 'react';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  assignPermissionsToRole,
  removePermissionsFromRole,
  getRolePermissions,
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest
} from '../services/roleManagementService';
import { Shield, Key, Plus, Edit3, Trash2, X, Check, AlertCircle, Lock, Users } from 'lucide-react';

const RoleManagementView = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form data
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // Load roles and permissions on component mount
  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load roles
      const rolesResponse = await getAllRoles();
      if (rolesResponse.success) {
        setRoles(rolesResponse.roles || []);
      } else {
        setError(rolesResponse.message || 'Failed to load roles');
      }

      // Load permissions
      const permissionsResponse = await getAvailablePermissions();
      if (permissionsResponse.success) {
        setPermissions(permissionsResponse.permissions || []);
        setAvailablePermissions(permissionsResponse.permissions || []);
      } else {
        setError(permissionsResponse.message || 'Failed to load permissions');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    const roleData: CreateRoleRequest = {
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions
    };

    try {
      const response = await createRole(roleData);
      if (response.success) {
        setSuccessMessage('Role created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to create role');
      }
    } catch (err) {
      setError('An error occurred while creating the role');
      console.error(err);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !roleName.trim()) {
      setError('Role name is required');
      return;
    }

    const roleData: UpdateRoleRequest = {
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions
    };

    try {
      const response = await updateRole(editingRole.id, roleData);
      if (response.success) {
        setSuccessMessage('Role updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred while updating the role');
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteRole(roleId);
      if (response.success) {
        setSuccessMessage('Role deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to delete role');
      }
    } catch (err) {
      setError('An error occurred while deleting the role');
      console.error(err);
    }
  };

  const handleAssignPermissions = async (roleId: string, permissionsToAdd: string[]) => {
    try {
      const response = await assignPermissionsToRole(roleId, permissionsToAdd);
      if (response.success) {
        setSuccessMessage('Permissions assigned successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to assign permissions');
      }
    } catch (err) {
      setError('An error occurred while assigning permissions');
      console.error(err);
    }
  };

  const handleRemovePermissions = async (roleId: string, permissionsToRemove: string[]) => {
    try {
      const response = await removePermissionsFromRole(roleId, permissionsToRemove);
      if (response.success) {
        setSuccessMessage('Permissions removed successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to remove permissions');
      }
    } catch (err) {
      setError('An error occurred while removing permissions');
      console.error(err);
    }
  };

  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setShowCreateForm(false);
    setShowEditForm(false);
    setShowPermissionsForm(false);
    setEditingRole(null);
    setError(null);
  };

  const handleEditClick = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions.map(p => p.key));
    setShowEditForm(true);
    setError(null);
  };

  const handleManagePermissionsClick = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions.map(p => p.key));
    setShowPermissionsForm(true);
    setError(null);
  };

  const togglePermission = (permissionKey: string) => {
    if (selectedPermissions.includes(permissionKey)) {
      setSelectedPermissions(selectedPermissions.filter(key => key !== permissionKey));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionKey]);
    }
  };

  // Calculate statistics
  const totalRoles = roles.length;
  const adminRoles = roles.filter(r => r.name.toLowerCase().includes('admin')).length;
  const userRoles = roles.filter(r => r.name.toLowerCase().includes('user') && !r.name.toLowerCase().includes('admin')).length;
  const totalPermissions = roles.reduce((acc, role) => acc + role.permissions.length, 0);

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

      {/* Stats Cards - Compact design to fit all 4 on one line */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Shield className="w-3 h-3" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Total Roles</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{totalRoles}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Lock className="w-3 h-3" style={{ color: '#9333ea' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Admin Roles</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{adminRoles}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Users className="w-3 h-3" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>User Roles</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{userRoles}</p>
            </div>
          </div>
        </div>

        <div className="card p-3 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef9c3', width: '2rem', height: '2rem', borderRadius: '0.375rem' }}>
              <Key className="w-3 h-3" style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.65rem', lineHeight: '1' }}>Permissions</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25' }}>{totalPermissions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </button>
      </div>

      {/* Create Role Form Modal */}
      {showCreateForm && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="roleName" className="block text-sm font-medium mb-1">Role Name *</label>
                  <input
                    type="text"
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., HR Manager, Developer"
                  />
                </div>

                <div>
                  <label htmlFor="roleDescription" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="roleDescription"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="input w-full"
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Permissions</label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                    {availablePermissions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.map((permission) => (
                          <div key={permission.key} className="flex items-start p-2 rounded hover:bg-white transition-colors">
                            <input
                              type="checkbox"
                              id={`perm-${permission.key}`}
                              checked={selectedPermissions.includes(permission.key)}
                              onChange={() => togglePermission(permission.key)}
                              className="mt-1 mr-2 w-4 h-4"
                            />
                            <label htmlFor={`perm-${permission.key}`} className="flex-1 cursor-pointer">
                              <div className="text-sm text-gray-700">{permission.description}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No permissions available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateRole}>
                <Check className="w-4 h-4 mr-2" />
                Create Role
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Role Form Modal */}
      {showEditForm && editingRole && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Role: {editingRole.name}</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="editRoleName" className="block text-sm font-medium mb-1">Role Name *</label>
                  <input
                    type="text"
                    id="editRoleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="input w-full"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label htmlFor="editRoleDescription" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="editRoleDescription"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="input w-full"
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Permissions</label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                    {availablePermissions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.map((permission) => (
                          <div key={permission.key} className="flex items-start p-2 rounded hover:bg-white transition-colors">
                            <input
                              type="checkbox"
                              id={`edit-perm-${permission.key}`}
                              checked={selectedPermissions.includes(permission.key)}
                              onChange={() => togglePermission(permission.key)}
                              className="mt-1 mr-2 w-4 h-4"
                            />
                            <label htmlFor={`edit-perm-${permission.key}`} className="flex-1 cursor-pointer">
                              <div className="text-sm text-gray-700">{permission.description}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No permissions available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateRole}>
                <Check className="w-4 h-4 mr-2" />
                Update Role
              </button>
            </div>
          </div>
        </>
      )}

      {/* Permissions Management Form Modal */}
      {showPermissionsForm && editingRole && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Manage Permissions for: {editingRole.name}</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="p-4 rounded bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Assign or Remove Permissions</p>
                      <p className="text-xs text-blue-700 mt-1">Check permissions to assign, uncheck to remove. Changes will be applied when you save.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Available Permissions</label>
                  <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-50">
                    {availablePermissions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.map((permission) => (
                          <div key={permission.key} className="flex items-start p-2 rounded hover:bg-white transition-colors">
                            <input
                              type="checkbox"
                              id={`manage-perm-${permission.key}`}
                              checked={selectedPermissions.includes(permission.key)}
                              onChange={() => togglePermission(permission.key)}
                              className="mt-1 mr-2 w-4 h-4"
                            />
                            <label htmlFor={`manage-perm-${permission.key}`} className="flex-1 cursor-pointer">
                              <div className="text-sm text-gray-700">{permission.description}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No permissions available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const currentPermissions = editingRole.permissions.map(p => p.key);
                  const permissionsToAdd = selectedPermissions.filter(p => !currentPermissions.includes(p));
                  const permissionsToRemove = currentPermissions.filter(p => !selectedPermissions.includes(p));

                  if (permissionsToAdd.length > 0) {
                    handleAssignPermissions(editingRole.id, permissionsToAdd);
                  }

                  if (permissionsToRemove.length > 0) {
                    handleRemovePermissions(editingRole.id, permissionsToRemove);
                  }

                  if (permissionsToAdd.length === 0 && permissionsToRemove.length === 0) {
                    resetForm();
                  }
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Save Permissions
              </button>
            </div>
          </div>
        </>
      )}

      {/* Roles Table */}
      <div className="card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Existing Roles</h3>
          <p className="text-muted text-sm">Showing {roles.length} role{roles.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Permissions</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem', backgroundColor: '#dbeafe' }}>
                        <Shield className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{role.name}</p>
                        <p className="text-xs text-muted">ID: {typeof role.id === 'string' ? role.id.slice(0, 8) : role.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {role.description || '—'}
                    </p>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Key className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">{role.permissions.length}</span>
                      <span className="text-muted text-xs">
                        {role.permissions.length === 1 ? 'permission' : 'permissions'}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="table-cell right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(role)}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleManagePermissionsClick(role)}
                        className="btn btn-sm btn-outline"
                      >
                        <Key className="w-3 h-3 mr-1" />
                        Permissions
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="btn btn-sm btn-outline red"
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
        {roles.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Roles Yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first role</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagementView;
