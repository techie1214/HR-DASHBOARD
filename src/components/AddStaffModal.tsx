import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { addStaffMember, StaffMember, DEPARTMENTS, Department } from '../data/staffData';
import { getBranches } from '../data/branchData';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staff: StaffMember) => void;
}

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const branches = getBranches();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: 'Sales' as Department,
    departmentRole: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: 'Male' as 'Male' | 'Female',
    stateOfOrigin: '',
    lga: '',
    address: '',
    jobStatus: 'Permanent' as 'Permanent' | 'Ad hoc' | 'Intern' | 'Temporary',
    dateEmployed: new Date().toISOString().split('T')[0],
    branchType: 'Single' as 'Single' | 'Multiple' | 'All',
    guardianFirstName: '',
    guardianLastName: '',
    guardianDOB: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
    guardianBusinessName: '',
    guardianBusinessAddress: '',
  });

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.departmentRole.trim()) {
      setError('Department role is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    // Guardian Information validation
    if (!formData.guardianFirstName.trim()) {
      setError('Guardian first name is required');
      return false;
    }
    if (!formData.guardianLastName.trim()) {
      setError('Guardian last name is required');
      return false;
    }
    if (!formData.guardianDOB) {
      setError('Guardian date of birth is required');
      return false;
    }
    if (!formData.guardianPhone.trim()) {
      setError('Guardian phone number is required');
      return false;
    }
    if (!formData.guardianEmail.trim()) {
      setError('Guardian email is required');
      return false;
    }
    if (!formData.guardianEmail.includes('@')) {
      setError('Please enter a valid guardian email address');
      return false;
    }
    if (!formData.guardianAddress.trim()) {
      setError('Guardian residential address is required');
      return false;
    }
    if (!formData.guardianBusinessName.trim()) {
      setError('Guardian business name is required');
      return false;
    }
    if (!formData.guardianBusinessAddress.trim()) {
      setError('Guardian business address is required');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newStaff = addStaffMember({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        departmentRole: formData.departmentRole,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        gender: formData.gender,
        stateOfOrigin: formData.stateOfOrigin,
        lga: formData.lga,
        address: formData.address,
        jobStatus: formData.jobStatus,
        dateEmployed: formData.dateEmployed,
        branchType: formData.branchType,
        guardianFirstName: formData.guardianFirstName,
        guardianLastName: formData.guardianLastName,
        guardianDOB: formData.guardianDOB,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianAddress: formData.guardianAddress,
        guardianBusinessName: formData.guardianBusinessName,
        guardianBusinessAddress: formData.guardianBusinessAddress,
        education: [],
        branches: selectedBranches.map(name => ({
          id: `BR${Date.now()}`,
          name: name,
          baseStatus: 'Primary' as const
        })),
        leaves: [],
        offDays: [],
        documents: [],
        status: 'Active'
      });

      onSuccess(newStaff);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        department: 'Sales',
        departmentRole: '',
        dateOfBirth: '',
        placeOfBirth: '',
        gender: 'Male',
        stateOfOrigin: '',
        lga: '',
        address: '',
        jobStatus: 'Permanent',
        dateEmployed: new Date().toISOString().split('T')[0],
        branchType: 'Single',
        guardianFirstName: '',
        guardianLastName: '',
        guardianDOB: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianAddress: '',
        guardianBusinessName: '',
        guardianBusinessAddress: '',
      });
      setSelectedBranches([]);
      onClose();
    } catch (err) {
      setError('Failed to add staff member. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ animation: 'fadeIn 0.2s ease-out' }}></div>
      <div 
        className="modal" 
        style={{ 
          maxWidth: '900px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
          width: 'calc(100% - 2rem)'
        }}
      >
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#eff6ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <svg className="w-5 h-5" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Add New Staff Member</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Fill in the details below to add a new staff member</p>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            style={{ 
              width: '2.25rem', 
              height: '2.25rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onClose}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded" style={{ backgroundColor: '#fee2e2', marginBottom: '1rem' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Personal Information */}
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                marginBottom: '1rem', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#374151'
              }}>
                <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </label>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="First Name *"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Middle Name"
                  className="input"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <select
                  className="input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="date"
                  className="input"
                  placeholder="Date of Birth *"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Place of Birth"
                  className="input"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                marginBottom: '1rem', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#374151'
              }}>
                <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </label>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  placeholder="Email *"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  className="input"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="State of Origin"
                  className="input"
                  value={formData.stateOfOrigin}
                  onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="LGA"
                  className="input"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Residential Address"
                  className="input"
                  style={{ gridColumn: '1 / -1' }}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                marginBottom: '1rem', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#374151'
              }}>
                <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Employment Information
              </label>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <select
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Department Role *"
                  className="input"
                  value={formData.departmentRole}
                  onChange={(e) => setFormData({ ...formData, departmentRole: e.target.value })}
                />
                <select
                  className="input"
                  value={formData.jobStatus}
                  onChange={(e) => setFormData({ ...formData, jobStatus: e.target.value as any })}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Ad hoc">Ad hoc</option>
                  <option value="Intern">Intern</option>
                  <option value="Temporary">Temporary</option>
                </select>
                <select
                  className="input"
                  value={formData.branchType}
                  onChange={(e) => setFormData({ ...formData, branchType: e.target.value as any })}
                >
                  <option value="Single">Single</option>
                  <option value="Multiple">Multiple</option>
                  <option value="All">All</option>
                </select>
                <input
                  type="date"
                  className="input"
                  value={formData.dateEmployed}
                  onChange={(e) => setFormData({ ...formData, dateEmployed: e.target.value })}
                />
              </div>
            </div>

            {/* Branch Selection */}
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                marginBottom: '1rem', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#374151'
              }}>
                <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Branch Selection
              </label>
              <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {branches.map((branch) => (
                  <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBranches([...selectedBranches, branch]);
                        } else {
                          setSelectedBranches(selectedBranches.filter(b => b !== branch));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{branch}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Guardian Information (Required) */}
            <details open style={{ 
              padding: '1.25rem', 
              borderRadius: '0.5rem', 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              marginBottom: '1rem'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Guardian/Next of Kin Information *
              </summary>
              <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Guardian First Name *"
                  className="input"
                  required
                  value={formData.guardianFirstName}
                  onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Last Name *"
                  className="input"
                  required
                  value={formData.guardianLastName}
                  onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
                />
                <input
                  type="date"
                  className="input"
                  required
                  value={formData.guardianDOB}
                  onChange={(e) => setFormData({ ...formData, guardianDOB: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Guardian Phone *"
                  className="input"
                  required
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Guardian Email *"
                  className="input"
                  required
                  value={formData.guardianEmail}
                  onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Business Name *"
                  className="input"
                  required
                  value={formData.guardianBusinessName}
                  onChange={(e) => setFormData({ ...formData, guardianBusinessName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Residential Address *"
                  className="input"
                  required
                  style={{ gridColumn: '1 / -1' }}
                  value={formData.guardianAddress}
                  onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Business Address *"
                  className="input"
                  required
                  style={{ gridColumn: '1 / -1' }}
                  value={formData.guardianBusinessAddress}
                  onChange={(e) => setFormData({ ...formData, guardianBusinessAddress: e.target.value })}
                />
              </div>
            </details>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb' }}>
          <button 
            className="btn btn-outline" 
            onClick={onClose} 
            disabled={loading}
            style={{ padding: '0.625rem 1.25rem' }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ 
              padding: '0.625rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Adding Staff...' : 'Add Staff Member'}
          </button>
        </div>
      </div>
    </>
  );
}
