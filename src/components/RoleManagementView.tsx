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

const RoleManagementView = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setRoles([...roles, response.role!]);
        resetForm();
        loadRolesAndPermissions(); // Refresh the list
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
        setRoles(roles.map(r => r.id === editingRole.id ? {...response.role!, permissions: response.role!.permissions} : r));
        resetForm();
        loadRolesAndPermissions(); // Refresh the list
      } else {
        setError(response.message || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred while updating the role');
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      const response = await deleteRole(roleId);
      if (response.success) {
        setRoles(roles.filter(r => r.id !== roleId));
        loadRolesAndPermissions(); // Refresh the list
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
        loadRolesAndPermissions(); // Refresh the list
        setShowPermissionsForm(false);
        resetForm();
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
        loadRolesAndPermissions(); // Refresh the list
        setShowPermissionsForm(false);
        resetForm();
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
    // Pre-select the permissions that the role already has
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
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end items-center">
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
        >
          Create New Role
        </button>
      </div>

      {/* Create Role Form */}
      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Create New Role</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium mb-1">Role Name *</label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="input w-full"
                placeholder="Enter role name"
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
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {availablePermissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.key} className="flex items-start">
                        <input
                          type="checkbox"
                          id={`perm-${permission.key}`}
                          checked={selectedPermissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="mt-1 mr-2"
                        />
                        <label htmlFor={`perm-${permission.key}`} className="flex-1">
                          <div className="font-medium">{permission.key}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No permissions available</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleCreateRole}
                className="btn btn-primary"
              >
                Create Role
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

      {/* Edit Role Form */}
      {showEditForm && editingRole && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Edit Role: {editingRole.name}</h3>

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
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {availablePermissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.key} className="flex items-start">
                        <input
                          type="checkbox"
                          id={`edit-perm-${permission.key}`}
                          checked={selectedPermissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="mt-1 mr-2"
                        />
                        <label htmlFor={`edit-perm-${permission.key}`} className="flex-1">
                          <div className="font-medium">{permission.key}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No permissions available</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleUpdateRole}
                className="btn btn-primary"
              >
                Update Role
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

      {/* Permissions Management Form */}
      {showPermissionsForm && editingRole && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Manage Permissions for: {editingRole.name}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Available Permissions</label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {availablePermissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.key} className="flex items-start">
                        <input
                          type="checkbox"
                          id={`manage-perm-${permission.key}`}
                          checked={selectedPermissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="mt-1 mr-2"
                        />
                        <label htmlFor={`manage-perm-${permission.key}`} className="flex-1">
                          <div className="font-medium">{permission.key}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No permissions available</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  // Determine which permissions to add and which to remove
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
                    // No changes made
                    resetForm();
                  }
                }}
                className="btn btn-primary"
              >
                Save Permissions
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

      {/* Roles List */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Existing Roles</h3>

        {roles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Description</th>
                  <th className="table-header-cell">Permissions Count</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="table-row">
                    <td className="table-cell font-medium">{role.name}</td>
                    <td className="table-cell">{role.description}</td>
                    <td className="table-cell">{role.permissions.length}</td>
                    <td className="table-cell">{role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(role)}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleManagePermissionsClick(role)}
                          className="btn btn-sm btn-outline"
                        >
                          Manage Permissions
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="btn btn-sm btn-outline btn-error"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No roles found. Create your first role to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagementView ;