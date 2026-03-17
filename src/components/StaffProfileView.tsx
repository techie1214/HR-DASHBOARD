// This component provides a comprehensive staff profile view with multiple tabs
// It displays detailed staff information, allows editing, and manages various aspects of staff data

// Import React hooks for state management
import { useState, useEffect } from 'react';
// Import Lucide React icons for UI elements
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, GraduationCap, Briefcase, Users, FileText, Clock, Plus, Check, X, Upload, Building, UserCheck, AlertCircle } from 'lucide-react';
// Import staff data types and functions from staffData module
import { StaffMember, Education, Leave, OffDay, Document, updateStaffStatus, updateStaff, Department, getLeaveBalance, LeaveBalance, mockStaffData } from '../data/staffData';
// Import branch data function
import { getBranches } from '../data/branchData';
// Import real API service
import { updateStaff as updateStaffApi, getStaffById } from '../services/staffManagementService';

// Interface defining props for StaffProfileView component
interface StaffProfileViewProps {
  staff: StaffMember; // The staff member data to display
  onBack: () => void; // Function to handle back navigation
  onUpdate: (staff: StaffMember) => void; // Function to handle staff updates
}

// Main component function for staff profile view
export function StaffProfileView({ staff, onBack, onUpdate }: StaffProfileViewProps) {
  // State for active tab navigation
  const [activeTab, setActiveTab] = useState<'details' | 'contact' | 'education' | 'employment' | 'branches' | 'guardian' | 'leave' | 'offdays' | 'documents'>('details');
  // State for showing deactivate/activate confirmation modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  // State for showing add leave modal
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  // State for showing add education modal
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  // State for showing add document modal
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  // State for showing assign branch modal
  const [showAssignBranchModal, setShowAssignBranchModal] = useState(false);
  // State for showing assign off day modal
  const [showAssignOffDayModal, setShowAssignOffDayModal] = useState(false);
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State for edited staff data
  const [editedStaff, setEditedStaff] = useState<StaffMember>(staff);
  // State for saving
  const [saving, setSaving] = useState(false);
  // State for error
  const [error, setError] = useState<string | null>(null);

  // Form states for modals
  const [educationForm, setEducationForm] = useState({
    school: '',
    courseOfStudy: '',
    certification: '',
    startYear: '',
    endYear: ''
  });
  const [leaveForm, setLeaveForm] = useState({
    type: 'Annual' as 'Sick' | 'Annual' | 'Emergency' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Bereaved',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [branchForm, setBranchForm] = useState({
    branchId: '',
    baseStatus: 'Primary' as 'Primary' | 'Secondary'
  });
  const [offDayForm, setOffDayForm] = useState({
    date: '',
    reason: ''
  });
  const [documentForm, setDocumentForm] = useState({
    name: '',
    type: 'PDF'
  });

  // Effect to update editedStaff when staff prop changes
  useEffect(() => {
    setEditedStaff(staff);
  }, [staff]);

  // Helper: compute full years employed from date string
  const computeYearsEmployed = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) return 'N/A';
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years -= 1;
    return String(years >= 0 ? years : 0);
  };

  // Departments available in the system (derived from mock data)
  const departmentOptions = Array.from(new Set(mockStaffData.map(s => s.department))).filter(Boolean) as string[];

  // Handler function for deactivating/activating staff member
  const handleDeactivate = () => {
    // Toggle between Active and Inactive status
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    // Update staff status in data store
    const success = updateStaffStatus(staff.id, newStatus);
    
    // If update successful, update local state and notify parent
    if (success) {
      const updatedStaff = { ...staff, status: newStatus } as StaffMember;
      onUpdate(updatedStaff);
    }
    // Close the modal
    setShowDeactivateModal(false);
  };

  // Handler for adding education
  const handleAddEducation = () => {
    if (!educationForm.school || !educationForm.certification) {
      alert('Please fill in required fields (School and Certification)');
      return;
    }

    const newEducation: Education = {
      id: `EDU${Date.now()}`,
      school: educationForm.school,
      courseOfStudy: educationForm.courseOfStudy,
      certification: educationForm.certification,
      startYear: educationForm.startYear,
      endYear: educationForm.endYear
    };

    const updatedStaff = {
      ...staff,
      education: [...staff.education, newEducation]
    };

    updateStaff(staff.id, updatedStaff);
    onUpdate(updatedStaff);
    setEducationForm({ school: '', courseOfStudy: '', certification: '', startYear: '', endYear: '' });
    setShowAddEducationModal(false);
  };

  // Handler for adding leave request
  const handleAddLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const startDate = new Date(leaveForm.startDate);
    const endDate = new Date(leaveForm.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: Leave = {
      id: `LV${Date.now()}`,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: 'Pending'
    };

    const updatedStaff = {
      ...staff,
      leaves: [...staff.leaves, newLeave]
    };

    updateStaff(staff.id, updatedStaff);
    onUpdate(updatedStaff);
    setLeaveForm({ type: 'Annual', startDate: '', endDate: '', reason: '' });
    setShowAddLeaveModal(false);
  };

  // Handler for assigning branch
  const handleAssignBranch = () => {
    if (!branchForm.branchId) {
      alert('Please select a branch');
      return;
    }

    const availableBranches = getBranches();
    const selectedBranch = availableBranches.find(b => b === branchForm.branchId);
    if (!selectedBranch) {
      alert('Invalid branch selected');
      return;
    }

    const newBranch = {
      id: `BR${String(staff.branches.length + 1).padStart(3, '0')}`,
      name: selectedBranch,
      baseStatus: branchForm.baseStatus
    };

    const updatedStaff = {
      ...staff,
      branches: [...staff.branches, newBranch]
    };

    updateStaff(staff.id, updatedStaff);
    onUpdate(updatedStaff);
    setBranchForm({ branchId: '', baseStatus: 'Primary' });
    setShowAssignBranchModal(false);
  };

  // Handler for assigning off day
  const handleAssignOffDay = () => {
    if (!offDayForm.date || !offDayForm.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const newOffDay: OffDay = {
      id: `OFF${Date.now()}`,
      date: offDayForm.date,
      reason: offDayForm.reason
    };

    const updatedStaff = {
      ...staff,
      offDays: [...staff.offDays, newOffDay]
    };

    updateStaff(staff.id, updatedStaff);
    onUpdate(updatedStaff);
    setOffDayForm({ date: '', reason: '' });
    setShowAssignOffDayModal(false);
  };

  // Handler for uploading document
  const handleUploadDocument = () => {
    if (!documentForm.name) {
      alert('Please enter document name');
      return;
    }

    const newDocument: Document = {
      id: `DOC${Date.now()}`,
      name: documentForm.name,
      type: documentForm.type,
      uploadedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    const updatedStaff = {
      ...staff,
      documents: [...staff.documents, newDocument]
    };

    updateStaff(staff.id, updatedStaff);
    onUpdate(updatedStaff);
    setDocumentForm({ name: '', type: 'PDF' });
    setShowAddDocumentModal(false);
  };

  // Function to render content based on active tab
  const renderTabContent = () => {
    // Switch statement to handle different tab content
    switch (activeTab) {
      // Personal details tab
      case 'details':
        return (
          <div className="profile-section">
            <h3 style={{ marginBottom: '1rem' }}>Personal Details</h3>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.firstName}
                    onChange={(e) => setEditedStaff({ ...editedStaff, firstName: e.target.value })}
                  />
                ) : (
                  <p>{staff.firstName}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Middle Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.middleName}
                    onChange={(e) => setEditedStaff({ ...editedStaff, middleName: e.target.value })}
                  />
                ) : (
                  <p>{staff.middleName}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.lastName}
                    onChange={(e) => setEditedStaff({ ...editedStaff, lastName: e.target.value })}
                  />
                ) : (
                  <p>{staff.lastName}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="input"
                    value={editedStaff.dateOfBirth ? new Date(editedStaff.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedStaff({ ...editedStaff, dateOfBirth: e.target.value })}
                  />
                ) : (
                  <p>{new Date(staff.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Place of Birth</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.placeOfBirth}
                    onChange={(e) => setEditedStaff({ ...editedStaff, placeOfBirth: e.target.value })}
                  />
                ) : (
                  <p>{staff.placeOfBirth}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    className="input"
                    value={editedStaff.gender}
                    onChange={(e) => setEditedStaff({ ...editedStaff, gender: e.target.value as 'Male' | 'Female' })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p>{staff.gender}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>State of Origin</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.stateOfOrigin}
                    onChange={(e) => setEditedStaff({ ...editedStaff, stateOfOrigin: e.target.value })}
                  />
                ) : (
                  <p>{staff.stateOfOrigin}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>LGA</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.lga}
                    onChange={(e) => setEditedStaff({ ...editedStaff, lga: e.target.value })}
                  />
                ) : (
                  <p>{staff.lga}</p>
                )}
              </div>
            </div>
          </div>
        );

      // Contact details tab
      case 'contact':
        return (
          <div className="profile-section">
            <h3 style={{ marginBottom: '1rem' }}>Contact Details</h3>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.phoneNumber}
                    onChange={(e) => setEditedStaff({ ...editedStaff, phoneNumber: e.target.value })}
                  />
                ) : (
                  <p>{staff.phoneNumber}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="input"
                    value={editedStaff.email}
                    onChange={(e) => setEditedStaff({ ...editedStaff, email: e.target.value })}
                  />
                ) : (
                  <p>{staff.email}</p>
                )}
              </div>
              <div className="profile-detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Residential Address</label>
                {isEditing ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={editedStaff.address}
                    onChange={(e) => setEditedStaff({ ...editedStaff, address: e.target.value })}
                  />
                ) : (
                  <p>{staff.address}</p>
                )}
              </div>
            </div>
          </div>
        );

      // Education details tab
      case 'education':
        return (
          <div className="profile-section">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3>Education Details</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowAddEducationModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </button>
            </div>
            <div className="space-y-4">
              {staff.education.map((edu, index) => (
                <div key={edu.id} className="card p-4" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="flex items-start gap-3">
                    <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                      <GraduationCap className="w-5 h-5" style={{ color: '#2563eb' }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{edu.school}</p>
                      <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {edu.courseOfStudy} • {edu.certification}
                      </p>
                      <p className="text-xs text-muted">
                        {edu.startYear} - {edu.endYear}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // Employment details tab
      case 'employment':
        return (
          <div className="profile-section">
            <h3 style={{ marginBottom: '1rem' }}>Employment Details</h3>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <label>Department</label>
                {isEditing ? (
                  <select
                    className="input"
                    value={editedStaff.department}
                    onChange={(e) => setEditedStaff({ ...editedStaff, department: e.target.value as Department })}
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <p>{staff.department}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Department Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.departmentRole}
                    onChange={(e) => setEditedStaff({ ...editedStaff, departmentRole: e.target.value })}
                  />
                ) : (
                  <p>{staff.departmentRole}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Branch Type</label>
                {isEditing ? (
                  <select
                    className="input"
                    value={editedStaff.branchType}
                    onChange={(e) => setEditedStaff({ ...editedStaff, branchType: e.target.value as 'Single' | 'Multiple' | 'All' })}
                  >
                    <option value="Single">Single</option>
                    <option value="Multiple">Multiple</option>
                    <option value="All">All</option>
                  </select>
                ) : (
                  <p>{staff.branchType}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Job Status</label>
                {isEditing ? (
                  <select
                    className="input"
                    value={editedStaff.jobStatus}
                    onChange={(e) => setEditedStaff({ ...editedStaff, jobStatus: e.target.value as any })}
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Add HOC">Add HOC</option>
                    <option value="Intern">Intern</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                ) : (
                  <p>{staff.jobStatus}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Date Employed</label>
                <p>{new Date(staff.dateEmployed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="profile-detail-item">
                <label>Number of Years Employed</label>
                <p>{computeYearsEmployed(staff.dateEmployed)} years</p>
              </div>
            </div>
          </div>
        );

      // Branches tab
      case 'branches':
        return (
          <div className="profile-section">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3>Staff Branches</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowAssignBranchModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Branch
              </button>
            </div>
            <div className="card">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Branch Name</th>
                    <th className="table-header-cell">Base Status</th>
                    <th className="table-header-cell right">Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.branches.map((branch) => (
                    <tr key={branch.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted" />
                          {branch.name}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${branch.baseStatus === 'Primary' ? 'badge-success' : 'badge-secondary'}`}>
                          {branch.baseStatus}
                        </span>
                      </td>
                      <td className="table-cell right">
                        <button className="btn btn-sm btn-outline red">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // Guardian/next of kin tab
      case 'guardian':
        return (
          <div className="profile-section">
            <h3 style={{ marginBottom: '1rem' }}>Guardian/Next of Kin Details</h3>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.guardianFirstName}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianFirstName: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianFirstName}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.guardianLastName}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianLastName: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianLastName}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="input"
                    value={editedStaff.guardianDOB ? new Date(editedStaff.guardianDOB).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianDOB: e.target.value })}
                  />
                ) : (
                  <p>{new Date(staff.guardianDOB).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.guardianPhone}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianPhone: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianPhone}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="input"
                    value={editedStaff.guardianEmail}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianEmail: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianEmail}</p>
                )}
              </div>
              <div className="profile-detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Residential Address</label>
                {isEditing ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={editedStaff.guardianAddress}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianAddress: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianAddress}</p>
                )}
              </div>
              <div className="profile-detail-item">
                <label>Business Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editedStaff.guardianBusinessName}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianBusinessName: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianBusinessName}</p>
                )}
              </div>
              <div className="profile-detail-item" style={{ gridColumn: '2 / -1' }}>
                <label>Business Address</label>
                {isEditing ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={editedStaff.guardianBusinessAddress}
                    onChange={(e) => setEditedStaff({ ...editedStaff, guardianBusinessAddress: e.target.value })}
                  />
                ) : (
                  <p>{staff.guardianBusinessAddress}</p>
                )}
              </div>
            </div>
          </div>
        );

      // Leave management tab
      case 'leave':
        return (
          <div className="profile-section">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3>Leave Management</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowAddLeaveModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Leave Request
              </button>
            </div>
            
            {/* Leave Balances Section */}
            <div className="card p-6" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Leave Balances</h4>
              {(() => {
                const leaveBalance = getLeaveBalance(staff.id);
                if (!leaveBalance) {
                  return (
                    <p className="text-muted">No leave balance data available</p>
                  );
                }
                
                const leaveTypes = [
                  { key: 'annual', name: 'Annual Leave', data: leaveBalance.annual, icon: '🏖️' },
                  { key: 'sick', name: 'Sick Leave', data: leaveBalance.sick, icon: '🤒' },
                  { key: 'maternity', name: 'Maternity Leave', data: leaveBalance.maternity, icon: '🤱' },
                  { key: 'paternity', name: 'Paternity Leave', data: leaveBalance.paternity, icon: '👶' },
                  { key: 'bereaved', name: 'Bereavement Leave', data: leaveBalance.bereaved, icon: '🕊️' }
                ];
                
                return (
                  <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
                    {leaveTypes.map((leaveType) => {
                      const remaining = leaveType.data.total - leaveType.data.used;
                      return (
                        <div key={leaveType.key} className="card p-4" style={{ backgroundColor: '#f9fafb' }}>
                          <div className="flex items-center gap-3">
                            <div style={{ fontSize: '1.5rem' }}>{leaveType.icon}</div>
                            <div className="flex-1">
                              <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{leaveType.name}</p>
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: remaining > 0 ? '#16a34a' : '#dc2626' }}>
                                  {remaining} days
                                </span>
                                <span className="text-xs text-muted">
                                  of {leaveType.data.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            
            <div className="space-y-4">
              {staff.leaves.length === 0 ? (
                <div className="card p-8 flex flex-col items-center justify-center">
                  <Calendar className="w-12 h-12" style={{ color: '#e5e7eb' }} />
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>No leave requests</p>
                </div>
              ) : (
                staff.leaves.map((leave) => (
                  <div key={leave.id} className="card p-4">
                    <div className="flex items-start justify-between gap-4" style={{ marginBottom: '1rem' }}>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{leave.type}</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`badge ${
                        leave.status === 'Approved' ? 'badge-success' : 
                        leave.status === 'Declined' ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{leave.reason}</p>
                    {leave.reply && (
                      <div className="p-3 rounded" style={{ backgroundColor: '#f9fafb', marginBottom: '1rem' }}>
                        <p className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>HR Reply:</p>
                        <p style={{ fontSize: '0.875rem' }}>{leave.reply}</p>
                      </div>
                    )}
                    {leave.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button className="btn btn-sm btn-outline green">
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button className="btn btn-sm btn-outline red">
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </button>
                        <button className="btn btn-sm btn-outline">
                          Reply
                        </button>
                      </div>
                    )}
                    {leave.status !== 'Pending' && (
                      <button className="btn btn-sm btn-outline">
                        Reply
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      // Off days tab
      case 'offdays':
        return (
          <div className="profile-section">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3>Off Days</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowAssignOffDayModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Off Day
              </button>
            </div>
            <div className="card">
              {staff.offDays.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <Clock className="w-12 h-12" style={{ color: '#e5e7eb' }} />
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>No off days recorded</p>
                </div>
              ) : (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Reason</th>
                      <th className="table-header-cell right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.offDays.map((offday) => (
                      <tr key={offday.id} className="table-row">
                        <td className="table-cell">
                          {new Date(offday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="table-cell">{offday.reason}</td>
                        <td className="table-cell right">
                          <button className="btn btn-sm btn-outline red">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      // Documents tab
      case 'documents':
        return (
          <div className="profile-section">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3>Documents</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowAddDocumentModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            </div>
            <div className="card">
              {staff.documents.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12" style={{ color: '#e5e7eb' }} />
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>No documents uploaded</p>
                </div>
              ) : (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Document Name</th>
                      <th className="table-header-cell">Type</th>
                      <th className="table-header-cell">Upload Date</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.documents.map((doc) => (
                      <tr key={doc.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted" />
                            {doc.name}
                          </div>
                        </td>
                        <td className="table-cell">{doc.type}</td>
                        <td className="table-cell">
                          {new Date(doc.uploadedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${
                            doc.status === 'Approved' ? 'badge-success' : 
                            doc.status === 'Rejected' ? 'badge-danger' : 
                            'badge-warning'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="table-cell right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.status === 'Pending' && (
                              <>
                                <button className="btn btn-sm btn-outline green">Approve</button>
                                <button className="btn btn-sm btn-outline red">Reject</button>
                              </>
                            )}
                            <button className="btn btn-sm btn-outline">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      // Default case for invalid tab
      default:
        return null;
    }
  };

  // Main component render
  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div>
        {/* Back navigation button */}
        <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Staff Directory
        </button>
        
        {/* Staff Header Card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="avatar" style={{ width: '5rem', height: '5rem', fontSize: '1.5rem' }}>
                {staff.firstName[0]}{staff.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                  <h2 style={{ marginBottom: 0 }}>{staff.firstName} {staff.middleName} {staff.lastName}</h2>
                  <span className={`badge ${staff.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                    {staff.status}
                  </span>
                </div>
                <p className="text-muted" style={{ marginBottom: '0.5rem' }}>{staff.departmentRole}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted" />
                    <span style={{ fontSize: '0.875rem' }}>{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted" />
                    <span style={{ fontSize: '0.875rem' }}>{staff.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted" />
                    <span style={{ fontSize: '0.875rem' }}>ID: {staff.id}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button className="btn btn-sm btn-primary" onClick={() => { setIsEditing(true); setEditedStaff({ ...staff }); }}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn btn-sm btn-primary" onClick={async () => {
                    setSaving(true);
                    setError(null);
                    try {
                      // Convert staff data to API format
                      const apiData: any = {
                        first_name: editedStaff.firstName,
                        last_name: editedStaff.lastName,
                        middle_name: editedStaff.middleName,
                        email: editedStaff.email,
                        work_email: editedStaff.workEmail,
                        phone_number: editedStaff.phoneNumber,
                        alternate_phone: editedStaff.alternatePhone,
                        physical_address: editedStaff.physicalAddress,
                        postal_address: editedStaff.postalAddress,
                        town: editedStaff.town,
                        zip_code: editedStaff.zipCode,
                        department_id: editedStaff.departmentId,
                        branch_id: editedStaff.branchId,
                        designation: editedStaff.designation,
                        date_joined: editedStaff.dateJoined,
                        contract_type: editedStaff.contractType,
                        status: editedStaff.status.toLowerCase(),
                        reports_to: editedStaff.reportsTo
                      };
                      
                      const response = await updateStaffApi(staff.id, apiData);
                      if (response.success && response.staff) {
                        onUpdate(editedStaff);
                        setIsEditing(false);
                      } else {
                        setError(response.message || 'Failed to update staff profile');
                      }
                    } catch (err: any) {
                      setError(err.message || 'An error occurred while updating');
                    } finally {
                      setSaving(false);
                    }
                  }} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </>
              )}
              <button 
                className={`btn btn-sm ${staff.status === 'Active' ? 'btn-outline red' : 'btn-outline green'}`}
                onClick={() => setShowDeactivateModal(true)}
              >
                {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card">
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <User className="w-4 h-4" />
            Details
          </button>
          <button 
            className={`profile-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <Phone className="w-4 h-4" />
            Contact
          </button>
          <button 
            className={`profile-tab ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <GraduationCap className="w-4 h-4" />
            Education
          </button>
          <button 
            className={`profile-tab ${activeTab === 'employment' ? 'active' : ''}`}
            onClick={() => setActiveTab('employment')}
          >
            <Briefcase className="w-4 h-4" />
            Employment
          </button>
          <button 
            className={`profile-tab ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            <Building className="w-4 h-4" />
            Branches
          </button>
          <button 
            className={`profile-tab ${activeTab === 'guardian' ? 'active' : ''}`}
            onClick={() => setActiveTab('guardian')}
          >
            <UserCheck className="w-4 h-4" />
            Guardian
          </button>
          <button 
            className={`profile-tab ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
          >
            <Calendar className="w-4 h-4" />
            Leave
          </button>
          <button 
            className={`profile-tab ${activeTab === 'offdays' ? 'active' : ''}`}
            onClick={() => setActiveTab('offdays')}
          >
            <Clock className="w-4 h-4" />
            Off Days
          </button>
          <button 
            className={`profile-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="w-4 h-4" />
            Documents
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {renderTabContent()}
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <>
          {/* Modal overlay */}
          <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}></div>
          {/* Modal content */}
          <div className="modal">
            {/* Modal header */}
            <div className="modal-header">
              <h3>{staff.status === 'Active' ? 'Deactivate' : 'Activate'} Staff Member</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowDeactivateModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal content with warning */}
            <div className="modal-content">
              <div className="flex items-start gap-3 p-4 rounded" style={{ backgroundColor: '#fef3c7' }}>
                <AlertCircle className="w-5 h-5" style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Confirm Action</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    Are you sure you want to {staff.status === 'Active' ? 'deactivate' : 'activate'} {staff.firstName} {staff.lastName}?
                  </p>
                </div>
              </div>
            </div>
            {/* Modal footer with action buttons */}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
              <button className={`btn ${staff.status === 'Active' ? 'btn-outline red' : 'btn-primary'}`} onClick={handleDeactivate}>
                {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Education Modal */}
      {showAddEducationModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddEducationModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Add Education</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowAddEducationModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">School/Institution *</label>
                  <input
                    type="text"
                    className="input"
                    value={educationForm.school}
                    onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course of Study</label>
                  <input
                    type="text"
                    className="input"
                    value={educationForm.courseOfStudy}
                    onChange={(e) => setEducationForm({ ...educationForm, courseOfStudy: e.target.value })}
                    placeholder="Enter course/field of study"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Certification/Degree *</label>
                  <input
                    type="text"
                    className="input"
                    value={educationForm.certification}
                    onChange={(e) => setEducationForm({ ...educationForm, certification: e.target.value })}
                    placeholder="e.g., BSc Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Year</label>
                    <input
                      type="text"
                      className="input"
                      value={educationForm.startYear}
                      onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                      placeholder="e.g., 2015"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Year</label>
                    <input
                      type="text"
                      className="input"
                      value={educationForm.endYear}
                      onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                      placeholder="e.g., 2019"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddEducationModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEducation}>Add Education</button>
            </div>
          </div>
        </>
      )}

      {/* Add Leave Request Modal */}
      {showAddLeaveModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddLeaveModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Add Leave Request</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowAddLeaveModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Leave Type</label>
                  <select
                    className="input"
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                    <option value="Bereaved">Bereavement Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      className="input"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Enter reason for leave request"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddLeaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddLeave}>Submit Request</button>
            </div>
          </div>
        </>
      )}

      {/* Assign Branch Modal */}
      {showAssignBranchModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAssignBranchModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Branch</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowAssignBranchModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Branch</label>
                  <select
                    className="input"
                    value={branchForm.branchId}
                    onChange={(e) => setBranchForm({ ...branchForm, branchId: e.target.value })}
                  >
                    <option value="">Choose a branch...</option>
                    {getBranches().map((branch, index) => (
                      <option key={index} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Base Status</label>
                  <select
                    className="input"
                    value={branchForm.baseStatus}
                    onChange={(e) => setBranchForm({ ...branchForm, baseStatus: e.target.value as 'Primary' | 'Secondary' })}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAssignBranchModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssignBranch}>Assign Branch</button>
            </div>
          </div>
        </>
      )}

      {/* Assign Off Day Modal */}
      {showAssignOffDayModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAssignOffDayModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Off Day</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowAssignOffDayModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={offDayForm.date}
                    onChange={(e) => setOffDayForm({ ...offDayForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={offDayForm.reason}
                    onChange={(e) => setOffDayForm({ ...offDayForm, reason: e.target.value })}
                    placeholder="Enter reason for off day"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAssignOffDayModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssignOffDay}>Assign Off Day</button>
            </div>
          </div>
        </>
      )}

      {/* Upload Document Modal */}
      {showAddDocumentModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddDocumentModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowAddDocumentModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Document Name</label>
                  <input
                    type="text"
                    className="input"
                    value={documentForm.name}
                    onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Document Type</label>
                  <select
                    className="input"
                    value={documentForm.type}
                    onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                  >
                    <option value="PDF">PDF</option>
                    <option value="Image">Image</option>
                    <option value="Word">Word Document</option>
                    <option value="Excel">Excel Spreadsheet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="p-4 rounded" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <p className="text-sm text-muted">
                    <strong>Note:</strong> This is a demo interface. In a real application, you would upload an actual file here.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddDocumentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUploadDocument}>Upload Document</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
