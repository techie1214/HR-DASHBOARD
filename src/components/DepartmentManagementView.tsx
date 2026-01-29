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

const DepartmentManagementView = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Form data
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [departmentBranchId, setDepartmentBranchId] = useState('');
  const [departmentHeadId, setDepartmentHeadId] = useState('');
  const [departmentStatus, setDepartmentStatus] = useState('active');

  // Load departments and branches on component mount
  useEffect(() => {
    loadDepartmentsAndBranches();
  }, []);

  const loadDepartmentsAndBranches = async () => {
    try {
      setLoading(true);
      
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
    if (!departmentName.trim() || !departmentBranchId.trim()) {
      setError('Department name and branch are required');
      return;
    }

    const departmentData: CreateDepartmentRequest = {
      name: departmentName,
      description: departmentDescription,
      branch_id: departmentBranchId
    };

    try {
      const response = await createDepartment(departmentData);
      if (response.success) {
        setDepartments([...departments, response.department!]);
        resetForm();
        loadDepartmentsAndBranches(); // Refresh the list
      } else {
        setError(response.message || 'Failed to create department');
      }
    } catch (err) {
      setError('An error occurred while creating the department');
      console.error(err);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !departmentName.trim() || !departmentBranchId.trim()) {
      setError('Department name and branch are required');
      return;
    }

    const departmentData: UpdateDepartmentRequest = {
      name: departmentName,
      description: departmentDescription,
      branch_id: departmentBranchId,
      head_id: departmentHeadId,
      status: departmentStatus
    };

    try {
      const response = await updateDepartment(editingDepartment.id, departmentData);
      if (response.success) {
        setDepartments(departments.map(d => d.id === editingDepartment.id ? {...response.department!, branch_id: response.department!.branch_id} : d));
        resetForm();
        loadDepartmentsAndBranches(); // Refresh the list
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
        setDepartments(departments.filter(d => d.id !== departmentId));
        loadDepartmentsAndBranches(); // Refresh the list
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
    setDepartmentHeadId('');
    setDepartmentStatus('active');
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingDepartment(null);
    setError(null);
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setDepartmentDescription(department.description);
    setDepartmentBranchId(department.branch_id);
    setDepartmentHeadId(department.head_id || '');
    setDepartmentStatus(department.status || 'active');
    setShowEditForm(true);
    setError(null);
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
        <h2 className="text-xl font-semibold">Department Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
        >
          Create New Department
        </button>
      </div>

      {/* Create Department Form */}
      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Create New Department</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium mb-1">Department Name *</label>
              <input
                type="text"
                id="departmentName"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="input w-full"
                placeholder="Enter department name"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="departmentBranch" className="block text-sm font-medium mb-1">Branch *</label>
                <select
                  id="departmentBranch"
                  value={departmentBranchId}
                  onChange={(e) => setDepartmentBranchId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="departmentHead" className="block text-sm font-medium mb-1">Department Head</label>
                <input
                  type="text"
                  id="departmentHead"
                  value={departmentHeadId}
                  onChange={(e) => setDepartmentHeadId(e.target.value)}
                  className="input w-full"
                  placeholder="Enter department head ID (optional)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="departmentStatus" className="block text-sm font-medium mb-1">Status</label>
              <select
                id="departmentStatus"
                value={departmentStatus}
                onChange={(e) => setDepartmentStatus(e.target.value)}
                className="input w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleCreateDepartment}
                className="btn btn-primary"
              >
                Create Department
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

      {/* Edit Department Form */}
      {showEditForm && editingDepartment && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Edit Department: {editingDepartment.name}</h3>
          
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="editDepartmentBranch" className="block text-sm font-medium mb-1">Branch *</label>
                <select
                  id="editDepartmentBranch"
                  value={departmentBranchId}
                  onChange={(e) => setDepartmentBranchId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="editDepartmentHead" className="block text-sm font-medium mb-1">Department Head</label>
                <input
                  type="text"
                  id="editDepartmentHead"
                  value={departmentHeadId}
                  onChange={(e) => setDepartmentHeadId(e.target.value)}
                  className="input w-full"
                  placeholder="Enter department head ID (optional)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="editDepartmentStatus" className="block text-sm font-medium mb-1">Status</label>
              <select
                id="editDepartmentStatus"
                value={departmentStatus}
                onChange={(e) => setDepartmentStatus(e.target.value)}
                className="input w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleUpdateDepartment}
                className="btn btn-primary"
              >
                Update Department
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

      {/* Departments List */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Existing Departments</h3>
        
        {departments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Description</th>
                  <th className="table-header-cell">Branch</th>
                  <th className="table-header-cell">Head</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id} className="table-row">
                    <td className="table-cell font-medium">{department.name}</td>
                    <td className="table-cell">{department.description}</td>
                    <td className="table-cell">
                      {branches.find(b => b.id === department.branch_id)?.name || department.branch_id || '-'}
                    </td>
                    <td className="table-cell">{department.head_id || '-'}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        department.status === 'active' ? 'badge-success' :
                        department.status === 'inactive' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {department.status ? department.status.charAt(0).toUpperCase() + department.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="table-cell">{new Date(department.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(department)}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department.id)}
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
            <p className="text-gray-500">No departments found. Create your first department to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { DepartmentManagementView };