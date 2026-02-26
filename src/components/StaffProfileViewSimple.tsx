// Staff Profile View - Improved version with real API data
import { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, FileText, Edit2, Save, X } from 'lucide-react';
import { StaffMember } from '../data/staffData';
import { getStaffById, updateStaff } from '../services/staffManagementService';

interface StaffProfileViewProps {
  staff: StaffMember;
  onBack: () => void;
  onUpdate: (staff: StaffMember) => void;
}

export function StaffProfileView({ staff, onBack, onUpdate }: StaffProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'employment' | 'contact'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState<StaffMember>(staff);

  useEffect(() => {
    setEditedStaff(staff);
  }, [staff]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateStaff(staff.id, {
        designation: editedStaff.departmentRole,
        department: editedStaff.department,
        // Add other fields as needed
      });
      
      if (response.success) {
        onUpdate(editedStaff);
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update staff');
      }
    } catch (err) {
      setError('An error occurred while updating staff');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr || dateStr === 'N/A') return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const computeYearsEmployed = (dateStr?: string | null) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) return 'N/A';
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years -= 1;
    return `${years >= 0 ? years : 0} years`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="btn btn-outline"
            style={{ width: '2.5rem', height: '2.5rem' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">Staff Profile</h2>
        </div>

        {/* Staff Info Header */}
        <div className="flex items-start gap-6">
          <div
            className="avatar"
            style={{
              width: '6rem',
              height: '6rem',
              fontSize: '1.5rem',
              backgroundColor: '#2563eb',
              color: 'white'
            }}
          >
            {editedStaff.avatar || `${editedStaff.firstName[0]}${editedStaff.lastName[0]}`}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                  {editedStaff.firstName} {editedStaff.middleName} {editedStaff.lastName}
                </h3>
                <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                  {editedStaff.departmentRole} • {editedStaff.department}
                </p>
                <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                  <span className={`badge ${editedStaff.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                    {editedStaff.status}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Employee ID: {editedStaff.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="btn btn-primary"
                disabled={loading}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <div className="tabs-list">
          <button
            className={`tabs-trigger ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tabs-trigger ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal
          </button>
          <button
            className={`tabs-trigger ${activeTab === 'employment' ? 'active' : ''}`}
            onClick={() => setActiveTab('employment')}
          >
            Employment
          </button>
          <button
            className={`tabs-trigger ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Information</h4>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <InfoItem
                  icon={User}
                  label="Full Name"
                  value={`${editedStaff.firstName} ${editedStaff.middleName} ${editedStaff.lastName}`}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Designation"
                  value={editedStaff.departmentRole}
                />
                <InfoItem
                  icon={FileText}
                  label="Department"
                  value={editedStaff.department}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date Employed"
                  value={formatDate(editedStaff.dateEmployed)}
                />
                <InfoItem
                  icon={Calendar}
                  label="Years Employed"
                  value={computeYearsEmployed(editedStaff.dateEmployed)}
                />
                <InfoItem
                  icon={User}
                  label="Status"
                  value={editedStaff.status}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <InfoItem
                  icon={User}
                  label="First Name"
                  value={editedStaff.firstName}
                  editable={isEditing}
                  onChange={(value) => setEditedStaff({ ...editedStaff, firstName: value })}
                />
                <InfoItem
                  icon={User}
                  label="Middle Name"
                  value={editedStaff.middleName}
                  editable={isEditing}
                  onChange={(value) => setEditedStaff({ ...editedStaff, middleName: value })}
                />
                <InfoItem
                  icon={User}
                  label="Last Name"
                  value={editedStaff.lastName}
                  editable={isEditing}
                  onChange={(value) => setEditedStaff({ ...editedStaff, lastName: value })}
                />
                <InfoItem
                  icon={User}
                  label="Gender"
                  value={editedStaff.gender}
                  editable={isEditing}
                  onChange={(value) => setEditedStaff({ ...editedStaff, gender: value })}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(editedStaff.dateOfBirth)}
                />
                <InfoItem
                  icon={MapPin}
                  label="State of Origin"
                  value={editedStaff.stateOfOrigin}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Employment Details</h4>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <InfoItem
                  icon={Briefcase}
                  label="Designation"
                  value={editedStaff.departmentRole}
                  editable={isEditing}
                  onChange={(value) => setEditedStaff({ ...editedStaff, departmentRole: value })}
                />
                <InfoItem
                  icon={FileText}
                  label="Department"
                  value={editedStaff.department}
                  editable={isEditing}
                  onChange={(value) => setEditedStaff({ ...editedStaff, department: value })}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date Employed"
                  value={formatDate(editedStaff.dateEmployed)}
                />
                <InfoItem
                  icon={User}
                  label="Job Status"
                  value={editedStaff.jobStatus}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Branch Type"
                  value={editedStaff.branchType}
                />
                <InfoItem
                  icon={Calendar}
                  label="Years Employed"
                  value={computeYearsEmployed(editedStaff.dateEmployed)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <InfoItem
                  icon={Mail}
                  label="Email Address"
                  value={editedStaff.email}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone Number"
                  value={editedStaff.phoneNumber}
                />
                <InfoItem
                  icon={MapPin}
                  label="Address"
                  value={editedStaff.address}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for info items
function InfoItem({
  icon: Icon,
  label,
  value,
  editable = false,
  onChange
}: {
  icon: any;
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted" />
        <span className="text-sm text-muted">{label}</span>
      </div>
      {editable && onChange ? (
        <input
          type="text"
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ backgroundColor: 'white' }}
        />
      ) : (
        <p className="font-medium" style={{ color: '#0f172a' }}>{value}</p>
      )}
    </div>
  );
}
