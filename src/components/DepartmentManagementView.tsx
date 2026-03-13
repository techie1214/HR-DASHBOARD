import React, { useState, useEffect } from 'react';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../services/departmentManagementService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import { Building, Users, Plus, Edit3, Trash2, X, Check, AlertCircle, Briefcase } from 'lucide-react';

const DepartmentManagementView = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Form data
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [departmentBranchId, setDepartmentBranchId] = useState<number | ''>('');

  // Load departments and branches on component mount
  useEffect(() => {
    loadDepartmentsAndBranches();
  }, []);

  const loadDepartmentsAndBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load departments
      const departmentsResponse = await getAllDepartments();
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.departments || []);
      } else {
        setError(departmentsResponse.message || 'Failed to load departments');
      }

      // Load branches
      const branchesResponse = await getAllBranches();
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches || []);
      } else {
        setError(branchesResponse.message || 'Failed to load branches');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!departmentName.trim() || departmentBranchId === '') {
      setError('Department name and branch are required');
      return;
    }

    const departmentData: CreateDepartmentRequest = {
      name: departmentName,
      description: departmentDescription,
      branch_id: Number(departmentBranchId)
    };

    try {
      const response = await createDepartment(departmentData);
      if (response.success) {
        setSuccessMessage('Department created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadDepartmentsAndBranches();
      } else {
        setError(response.message || 'Failed to create department');
      }
    } catch (err) {
      setError('An error occurred while creating the department');
      console.error(err);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !departmentName.trim() || departmentBranchId === '') {
      setError('Department name and branch are required');
      return;
    }

    const departmentData: UpdateDepartmentRequest = {
      name: departmentName,
      description: departmentDescription,
      branch_id: Number(departmentBranchId)
    };

    try {
      const response = await updateDepartment(editingDepartment.id, departmentData);
      if (response.success) {
        setSuccessMessage('Department updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadDepartmentsAndBranches();
      } else {
        setError(response.message || 'Failed to update department');
      }
    } catch (err) {
      setError('An error occurred while updating the department');
      console.error(err);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteDepartment(departmentId);
      if (response.success) {
        setSuccessMessage('Department deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadDepartmentsAndBranches();
      } else {
        setError(response.message || 'Failed to delete department');
      }
    } catch (err) {
      setError('An error occurred while deleting the department');
      console.error(err);
    }
  };

  const resetForm = () => {
    setDepartmentName('');
    setDepartmentDescription('');
    setDepartmentBranchId('');
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingDepartment(null);
    setError(null);
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setDepartmentDescription(department.description || '');
    setDepartmentBranchId(department.branch_id || '');
    setShowEditForm(true);
    setError(null);
  };

  // Calculate statistics
  const totalDepartments = departments.length;
  const itDepartments = departments.filter(d => d.name.toLowerCase().includes('it') || d.name.toLowerCase().includes('tech')).length;
  const hrDepartments = departments.filter(d => d.name.toLowerCase().includes('hr') || d.name.toLowerCase().includes('human')).length;
  const otherDepartments = totalDepartments - itDepartments - hrDepartments;

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

      {/* Stats Cards - Only Total Departments */}
      <div className="grid grid-cols-1 gap-4">
        <div className="card p-6 cursor-pointer transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '3rem', height: '3rem', borderRadius: '0.5rem' }}>
              <Building className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: '1' }}>Total Departments</p>
              <p style={{ fontSize: '2rem', fontWeight: 600, lineHeight: '1' }}>{totalDepartments}</p>
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
          Create New Department
        </button>
      </div>

      {/* Create Department Form Modal */}
      {showCreateForm && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Department</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="departmentName" className="block text-sm font-medium mb-1">Department Name *</label>
                  <input
                    type="text"
                    id="departmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., Engineering, Human Resources"
                  />
                </div>

                <div>
                  <label htmlFor="departmentDescription" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="departmentDescription"
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="input w-full"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="departmentBranch" className="block text-sm font-medium mb-1">Branch *</label>
                  <select
                    id="departmentBranch"
                    value={departmentBranchId}
                    onChange={(e) => setDepartmentBranchId(e.target.value ? Number(e.target.value) : '')}
                    className="input w-full"
                    style={{ color: departmentBranchId ? '#1f2937' : '#6b7280' }}
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateDepartment}>
                <Check className="w-4 h-4 mr-2" />
                Create Department
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Department Form Modal */}
      {showEditForm && editingDepartment && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Department: {editingDepartment.name}</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="editDepartmentName" className="block text-sm font-medium mb-1">Department Name *</label>
                  <input
                    type="text"
                    id="editDepartmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="input w-full"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label htmlFor="editDepartmentDescription" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="editDepartmentDescription"
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="input w-full"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="editDepartmentBranch" className="block text-sm font-medium mb-1">Branch *</label>
                  <select
                    id="editDepartmentBranch"
                    value={departmentBranchId}
                    onChange={(e) => setDepartmentBranchId(e.target.value ? Number(e.target.value) : '')}
                    className="input w-full"
                    style={{ color: departmentBranchId ? '#1f2937' : '#6b7280' }}
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateDepartment}>
                <Check className="w-4 h-4 mr-2" />
                Update Department
              </button>
            </div>
          </div>
        </>
      )}

      {/* Departments Table */}
      <div className="card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Existing Departments</h3>
          <p className="text-muted text-sm">Showing {departments.length} department{departments.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Branch</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem', backgroundColor: '#dbeafe' }}>
                        <Building className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{department.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {department.description || '—'}
                    </p>
                  </td>
                  <td className="table-cell">
                    {branches.find(b => b.id === department.branch_id)?.name || (
                      <span className="text-muted">No branch assigned</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {department.created_at ? new Date(department.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="table-cell right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(department)}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
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
        {departments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Departments Yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first department</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Department
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagementView;
export { DepartmentManagementView };
