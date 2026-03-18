// Staff Profile View - Comprehensive version with ALL staff details from database
import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, FileText, Edit2, Save, X,
  CreditCard, GraduationCap, Award, Activity, AlertCircle, BookOpen, Building2, Clock,
  Shield, Stethoscope, Banknote, Target, Users, FileCheck, BadgeCheck, CalendarDays, ChevronDown,
  Upload, Download, Trash2, Eye, File, FileType
} from 'lucide-react';
import { StaffMember } from '../data/staffData';
import { getStaffById, updateStaff } from '../services/staffManagementService';
import { getAllBranches } from '../services/branchManagementService';
import { getAllDepartments } from '../services/departmentManagementService';
import { uploadStaffDocument, getStaffDocuments, deleteStaffDocument, getDocumentUrl, downloadStaffDocument, StaffDocument } from '../services/staffDocumentService';
import statesAndLgas from 'nigeria-state-lga-data';

interface StaffProfileViewProps {
  staff: StaffMember;
  onBack: () => void;
  onUpdate: (staff: StaffMember) => void;
}

export function StaffProfileView({ staff, onBack, onUpdate }: StaffProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'employment' | 'contact' | 'education' | 'emergency' | 'banking' | 'medical' | 'resignation' | 'documents' | 'guarantors'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState<any>(staff);
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingDocument, setViewingDocument] = useState<StaffDocument | null>(null);
  
  // Dropdown data
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [nigerianStates, setNigerianStates] = useState<string[]>([]);
  const [selectedStateLgas, setSelectedStateLgas] = useState<string[]>([]);

  // Hardcoded dropdown options (must match backend ENUM values)
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = ['Male', 'Female', 'Other'];
  // Backend ENUM: ('full_time', 'part_time', 'contract', 'temporary')
  const employmentTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' }
  ];
  const jobStatusOptions = ['Active', 'Probation', 'Suspended', 'Terminated', 'Resigned'];
  const gratuityOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' }
  ];
  const overtimeEligibilityOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' }
  ];
  const workModeOptions = [
    { value: 'office', label: 'Office' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  useEffect(() => {
    setEditedStaff(staff);
    // Load branches and departments
    loadDropdownData();
    // Load Nigerian states
    const states = statesAndLgas.getStates();
    setNigerianStates(states);
    // Load staff documents
    loadDocuments();
  }, [staff]);

  // Update LGAs when state changes
  useEffect(() => {
    if (editedStaff.stateOfOrigin) {
      const lgas = statesAndLgas.getLgas(editedStaff.stateOfOrigin);
      setSelectedStateLgas(lgas || []);
    }
  }, [editedStaff.stateOfOrigin]);

  const loadDropdownData = async () => {
    try {
      const [branchesRes, deptsRes] = await Promise.all([
        getAllBranches(),
        getAllDepartments()
      ]);
      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches);
      }
      if (deptsRes.success && deptsRes.departments) {
        setDepartments(deptsRes.departments);
      }
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  };

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const response = await getStaffDocuments(staff.id);
      if (response.success) {
        setDocuments(response.data.documents);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedDocumentType) {
      setError('Please select a file and document type');
      return;
    }

    setUploadingDocument(true);
    setError(null);
    try {
      const response = await uploadStaffDocument(staff.id, selectedDocumentType, selectedFile);
      if (response.success) {
        setSuccessMessage('Document uploaded successfully');
        setShowUploadModal(false);
        setSelectedFile(null);
        setSelectedDocumentType('');
        loadDocuments();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to upload document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (docId: number, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteStaffDocument(docId);
      if (response.success) {
        setSuccessMessage('Document deleted successfully');
        loadDocuments();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handleDownloadDocument = async (doc: StaffDocument) => {
    try {
      await downloadStaffDocument(doc);
    } catch (err: any) {
      setError(err.message || 'Failed to download document');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Build comprehensive API payload with ALL fields
      const apiData: any = {
        first_name: editedStaff.firstName,
        last_name: editedStaff.lastName,
        middle_name: editedStaff.middleName,
        email: editedStaff.email,
        work_email: editedStaff.workEmail,
        phone_number: editedStaff.phoneNumber,
        alternate_phone: editedStaff.alternatePhone,
        designation: editedStaff.designation || editedStaff.departmentRole,
        department: editedStaff.department,
        branch_id: editedStaff.branchId,
        employment_type: editedStaff.employmentType,
        date_joined: editedStaff.joiningDate || editedStaff.dateEmployed,
        status: editedStaff.status?.toLowerCase() || 'active',
        // Personal info
        gender: editedStaff.gender,
        date_of_birth: editedStaff.dateOfBirth,
        blood_group: editedStaff.bloodGroup,
        state_of_origin: editedStaff.stateOfOrigin,
        lga: editedStaff.lga,
        marital_status: editedStaff.maritalStatus,
        // Address
        current_address: editedStaff.currentAddress,
        permanent_address: editedStaff.permanentAddress,
        town: editedStaff.town,
        zip_code: editedStaff.zipCode,
        // Employment
        job_status: editedStaff.jobStatus,
        weekly_working_hours: editedStaff.weeklyWorkingHours,
        probation_end_date: editedStaff.probationEndDate,
        contract_end_date: editedStaff.contractEndDate,
        notice_period_days: editedStaff.noticePeriodDays,
        pay_grade: editedStaff.payGrade,
        base_salary: editedStaff.baseSalary,
        // Banking
        bank_name: editedStaff.bankName,
        bank_account_number: editedStaff.bankAccountNumber,
        bank_ifsc_code: editedStaff.bankIfscCode,
        tax_identification_number: editedStaff.taxIdentificationNumber,
        provident_fund_id: editedStaff.providentFundId,
        // Emergency
        emergency_contact_name: editedStaff.emergencyContactName,
        emergency_contact_phone: editedStaff.emergencyContactPhone,
        emergency_contact_relationship: editedStaff.emergencyContactRelationship,
        // Education
        highest_qualification: editedStaff.highestQualification,
        university_school: editedStaff.universitySchool,
        year_of_graduation: editedStaff.yearOfGraduation,
        professional_certifications: editedStaff.professionalCertifications,
        languages_known: editedStaff.languagesKnown,
        primary_skills: editedStaff.primarySkills,
        // Medical
        allergies: editedStaff.allergies,
        special_medical_notes: editedStaff.specialMedicalNotes,
        medical_insurance_id: editedStaff.medicalInsuranceId,
        gratuity_applicable: editedStaff.gratuityApplicable === 'Yes' || editedStaff.gratuityApplicable === '1' || editedStaff.gratuityApplicable === true ? 1 : 0,
        overtime_eligibility: editedStaff.overtimeEligibility === 'Yes' || editedStaff.overtimeEligibility === '1' || editedStaff.overtimeEligibility === true ? 1 : 0,
        work_mode: editedStaff.workMode,
        // Resignation (if applicable)
        resignation_date: editedStaff.resignationDate,
        notice_period_start: editedStaff.noticePeriodStart,
        notice_period_end: editedStaff.noticePeriodEnd,
        last_working_date: editedStaff.lastWorkingDate,
        relieving_date: editedStaff.relievingDate,
        reason_for_leaving: editedStaff.reasonForLeaving,
        previous_company: editedStaff.previousCompany,
        experience_years: editedStaff.experienceYears,
        reference_check_status: editedStaff.referenceCheckStatus,
        background_verification_status: editedStaff.backgroundVerificationStatus
      };

      // Remove undefined/null fields
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined || apiData[key] === null || apiData[key] === '') {
          delete apiData[key];
        }
      });

      console.log('Saving staff data:', apiData);
      const response = await updateStaff(staff.id, apiData);

      if (response.success) {
        setSuccessMessage('Staff profile updated successfully');
        // Update the local state with the saved data
        const updatedStaff = { ...editedStaff };
        onUpdate(updatedStaff);
        setTimeout(() => setSuccessMessage(null), 3000);
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update staff');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'An error occurred while updating staff');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr || dateStr === 'N/A' || dateStr === '') return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const computeYearsEmployed = (dateStr?: string | null) => {
    if (!dateStr || dateStr === 'N/A' || dateStr === '') return 'N/A';
    try {
      const start = new Date(dateStr);
      if (isNaN(start.getTime())) return 'N/A';
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      const monthDiff = now.getMonth() - start.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years -= 1;
      return `${years >= 0 ? years : 0} years`;
    } catch {
      return 'N/A';
    }
  };

  const renderField = (icon: any, label: string, value: any, field?: string, type: string = 'text', options?: any[]) => {
    const isEditable = isEditing && field;
    const currentValue = field ? editedStaff[field] : value;

    return (
      <div className="p-4" style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-muted">{label}</span>
        </div>
        {isEditable ? (
          type === 'select' && options ? (
            <div className="relative">
              <select
                className="input w-full pr-10"
                value={currentValue || ''}
                onChange={(e) => setEditedStaff({ ...editedStaff, [field]: e.target.value })}
                style={{ backgroundColor: 'white', appearance: 'none' }}
              >
                <option value="">Select {label}</option>
                {options.map((opt: any) => (
                  <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : type === 'textarea' ? (
            <textarea
              className="input w-full"
              value={currentValue || ''}
              onChange={(e) => setEditedStaff({ ...editedStaff, [field]: e.target.value })}
              rows={3}
              style={{ backgroundColor: 'white' }}
            />
          ) : type === 'date' ? (
            <input
              type="date"
              className="input w-full"
              value={currentValue ? currentValue.split('T')[0] : ''}
              onChange={(e) => setEditedStaff({ ...editedStaff, [field]: e.target.value })}
              style={{ backgroundColor: 'white' }}
            />
          ) : type === 'number' ? (
            <input
              type="number"
              className="input w-full"
              value={currentValue || ''}
              onChange={(e) => setEditedStaff({ ...editedStaff, [field]: e.target.value })}
              style={{ backgroundColor: 'white' }}
            />
          ) : (
            <input
              type="text"
              className="input w-full"
              value={currentValue || ''}
              onChange={(e) => setEditedStaff({ ...editedStaff, [field]: e.target.value })}
              style={{ backgroundColor: 'white' }}
            />
          )
        ) : (
          <p className="font-medium" style={{ color: '#0f172a' }}>
            {type === 'date' ? formatDate(currentValue) : currentValue || 'Not specified'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-semibold">Staff Profile</h2>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="btn"
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 600,
              border: 'none',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            {isEditing ? (
              <><Save className="w-4 h-4 mr-2" /> Save Changes</>
            ) : (
              <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>
            )}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Staff Info Header */}
        <div className="flex items-start gap-6">
          <div className="avatar" style={{ width: '6rem', height: '6rem', fontSize: '1.5rem', backgroundColor: '#2563eb', color: 'white' }}>
            {editedStaff.avatar || `${editedStaff.firstName?.[0] || ''}${editedStaff.lastName?.[0] || ''}`}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
              {editedStaff.firstName} {editedStaff.middleName} {editedStaff.lastName}
            </h3>
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              {editedStaff.departmentRole || editedStaff.designation} • {editedStaff.department}
            </p>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${editedStaff.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                {editedStaff.status}
              </span>
              {editedStaff.employeeId && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  ID: {editedStaff.employeeId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-2" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="flex flex-wrap gap-1 overflow-x-auto  ">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'personal', label: 'Personal', icon: User },
            { id: 'employment', label: 'Employment', icon: Briefcase },
            { id: 'contact', label: 'Contact', icon: Mail },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'emergency', label: 'Emergency', icon: AlertCircle },
            { id: 'banking', label: 'Banking', icon: CreditCard },
            { id: 'medical', label: 'Medical', icon: Stethoscope },
            { id: 'resignation', label: 'Resignation', icon: FileCheck },
            { id: 'documents', label: 'Documents', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                borderColor: activeTab === tab.id ? '#2563eb' : 'transparent'
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Quick Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<User className="w-4 h-4 text-muted" />, 'Full Name', `${editedStaff.firstName} ${editedStaff.middleName} ${editedStaff.lastName}`)}
                {renderField(<Briefcase className="w-4 h-4 text-muted" />, 'Designation', editedStaff.departmentRole || editedStaff.designation)}
                {renderField(<Building2 className="w-4 h-4 text-muted" />, 'Department', editedStaff.department)}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Date Employed', formatDate(editedStaff.joiningDate || editedStaff.dateEmployed))}
                {renderField(<Clock className="w-4 h-4 text-muted" />, 'Years Employed', computeYearsEmployed(editedStaff.joiningDate || editedStaff.dateEmployed))}
                {renderField(<Shield className="w-4 h-4 text-muted" />, 'Status', editedStaff.status)}
                {renderField(<FileText className="w-4 h-4 text-muted" />, 'Employee ID', editedStaff.employeeId)}
                {renderField(<Users className="w-4 h-4 text-muted" />, 'Employment Type', editedStaff.employmentType)}
                {renderField(<MapPin className="w-4 h-4 text-muted" />, 'Branch', editedStaff.branch)}
              </div>
            </div>
          </div>
        )}

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<User className="w-4 h-4 text-muted" />, 'First Name', editedStaff.firstName, 'firstName')}
                {renderField(<User className="w-4 h-4 text-muted" />, 'Middle Name', editedStaff.middleName, 'middleName')}
                {renderField(<User className="w-4 h-4 text-muted" />, 'Last Name', editedStaff.lastName, 'lastName')}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Date of Birth', editedStaff.dateOfBirth, 'dateOfBirth', 'date')}
                {renderField(
                  <User className="w-4 h-4 text-muted" />,
                  'Gender',
                  editedStaff.gender,
                  'gender',
                  'select',
                  genderOptions
                )}
                {renderField(
                  <Activity className="w-4 h-4 text-muted" />,
                  'Blood Group',
                  editedStaff.bloodGroup,
                  'bloodGroup',
                  'select',
                  bloodGroupOptions
                )}
                {renderField(
                  <MapPin className="w-4 h-4 text-muted" />,
                  'State of Origin',
                  editedStaff.stateOfOrigin,
                  'stateOfOrigin',
                  'select',
                  nigerianStates
                )}
                {renderField(
                  <MapPin className="w-4 h-4 text-muted" />,
                  'LGA',
                  editedStaff.lga,
                  'lga',
                  'select',
                  selectedStateLgas
                )}
                {renderField(
                  <Users className="w-4 h-4 text-muted" />,
                  'Marital Status',
                  editedStaff.maritalStatus,
                  'maritalStatus',
                  'select',
                  maritalStatusOptions
                )}
              </div>
            </div>
          </div>
        )}

        {/* Employment Tab */}
        {activeTab === 'employment' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Employment Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<Briefcase className="w-4 h-4 text-muted" />, 'Designation', editedStaff.departmentRole || editedStaff.designation, 'designation')}
                {renderField(
                  <Building2 className="w-4 h-4 text-muted" />,
                  'Department',
                  editedStaff.department,
                  'department',
                  'select',
                  departments.map(d => ({ value: d.name, label: d.name }))
                )}
                {renderField(
                  <MapPin className="w-4 h-4 text-muted" />,
                  'Branch',
                  editedStaff.branch,
                  'branchId',
                  'select',
                  branches.map(b => ({ value: b.id, label: b.name }))
                )}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Date Joined', formatDate(editedStaff.joiningDate || editedStaff.dateEmployed), 'dateJoined', 'date')}
                {renderField(
                  <Users className="w-4 h-4 text-muted" />,
                  'Employment Type',
                  editedStaff.employmentType,
                  'employmentType',
                  'select',
                  employmentTypeOptions
                )}
                {renderField(
                  <Target className="w-4 h-4 text-muted" />,
                  'Job Status',
                  editedStaff.jobStatus,
                  'jobStatus',
                  'select',
                  jobStatusOptions
                )}
                {renderField(<Clock className="w-4 h-4 text-muted" />, 'Weekly Hours', editedStaff.weeklyWorkingHours, 'weeklyWorkingHours', 'number')}
                {renderField(<CalendarDays className="w-4 h-4 text-muted" />, 'Probation End', formatDate(editedStaff.probationEndDate), 'probationEndDate', 'date')}
                {renderField(<CalendarDays className="w-4 h-4 text-muted" />, 'Contract End', formatDate(editedStaff.contractEndDate), 'contractEndDate', 'date')}
                {renderField(<Clock className="w-4 h-4 text-muted" />, 'Notice Period', `${editedStaff.noticePeriodDays || 'N/A'} days`, 'noticePeriodDays', 'number')}
                {renderField(<Award className="w-4 h-4 text-muted" />, 'Pay Grade', editedStaff.payGrade, 'payGrade')}
                {renderField(<Banknote className="w-4 h-4 text-muted" />, 'Base Salary', editedStaff.baseSalary, 'baseSalary', 'number')}
                {renderField(
                  <Banknote className="w-4 h-4 text-muted" />,
                  'Gratuity Applicable',
                  editedStaff.gratuityApplicable === '1' || editedStaff.gratuityApplicable === true || editedStaff.gratuityApplicable === 'Yes' ? 'Yes' : 'No',
                  'gratuityApplicable',
                  'select',
                  gratuityOptions
                )}
                {renderField(
                  <Clock className="w-4 h-4 text-muted" />,
                  'Overtime Eligible',
                  editedStaff.overtimeEligibility === '1' || editedStaff.overtimeEligibility === true || editedStaff.overtimeEligibility === 'Yes' ? 'Yes' : 'No',
                  'overtimeEligibility',
                  'select',
                  overtimeEligibilityOptions
                )}
                {renderField(
                  <Briefcase className="w-4 h-4 text-muted" />,
                  'Work Mode',
                  editedStaff.workMode,
                  'workMode',
                  'select',
                  workModeOptions
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<Mail className="w-4 h-4 text-muted" />, 'Work Email', editedStaff.workEmail, 'workEmail')}
                {renderField(<Mail className="w-4 h-4 text-muted" />, 'Personal Email', editedStaff.email, 'email')}
                {renderField(<Phone className="w-4 h-4 text-muted" />, 'Phone Number', editedStaff.phoneNumber, 'phoneNumber')}
                {renderField(<Phone className="w-4 h-4 text-muted" />, 'Alternate Phone', editedStaff.alternatePhone, 'alternatePhone')}
                {renderField(<MapPin className="w-4 h-4 text-muted" />, 'Current Address', editedStaff.currentAddress, 'currentAddress', 'textarea')}
                {renderField(<MapPin className="w-4 h-4 text-muted" />, 'Permanent Address', editedStaff.permanentAddress, 'permanentAddress', 'textarea')}
                {renderField(<MapPin className="w-4 h-4 text-muted" />, 'Town/City', editedStaff.town, 'town')}
                {renderField(<MapPin className="w-4 h-4 text-muted" />, 'ZIP Code', editedStaff.zipCode, 'zipCode')}
              </div>
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education & Qualifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<GraduationCap className="w-4 h-4 text-muted" />, 'Highest Qualification', editedStaff.highestQualification, 'highestQualification')}
                {renderField(<BookOpen className="w-4 h-4 text-muted" />, 'University/School', editedStaff.universitySchool, 'universitySchool')}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Year of Graduation', editedStaff.yearOfGraduation, 'yearOfGraduation', 'number')}
                {renderField(<Award className="w-4 h-4 text-muted" />, 'Professional Certifications', editedStaff.professionalCertifications, 'professionalCertifications', 'textarea')}
                {renderField(<BookOpen className="w-4 h-4 text-muted" />, 'Languages Known', editedStaff.languagesKnown, 'languagesKnown')}
                {renderField(<Award className="w-4 h-4 text-muted" />, 'Primary Skills', editedStaff.primarySkills, 'primarySkills', 'textarea')}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Emergency Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<User className="w-4 h-4 text-muted" />, 'Contact Name', editedStaff.emergencyContactName, 'emergencyContactName')}
                {renderField(<Phone className="w-4 h-4 text-muted" />, 'Contact Phone', editedStaff.emergencyContactPhone, 'emergencyContactPhone')}
                {renderField(<Users className="w-4 h-4 text-muted" />, 'Relationship', editedStaff.emergencyContactRelationship, 'emergencyContactRelationship')}
              </div>
            </div>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === 'banking' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Banking & Tax Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<Building2 className="w-4 h-4 text-muted" />, 'Bank Name', editedStaff.bankName, 'bankName')}
                {renderField(<CreditCard className="w-4 h-4 text-muted" />, 'Account Number', editedStaff.bankAccountNumber, 'bankAccountNumber')}
                {renderField(<CreditCard className="w-4 h-4 text-muted" />, 'IFSC Code', editedStaff.bankIfscCode, 'bankIfscCode')}
                {renderField(<FileText className="w-4 h-4 text-muted" />, 'Tax ID (TIN)', editedStaff.taxIdentificationNumber, 'taxIdentificationNumber')}
                {renderField(<Banknote className="w-4 h-4 text-muted" />, 'Provident Fund ID', editedStaff.providentFundId, 'providentFundId')}
                {renderField(<Banknote className="w-4 h-4 text-muted" />, 'Medical Insurance ID', editedStaff.medicalInsuranceId, 'medicalInsuranceId')}
              </div>
            </div>
          </div>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Medical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<Activity className="w-4 h-4 text-muted" />, 'Blood Group', editedStaff.bloodGroup, 'bloodGroup')}
                {renderField(<AlertCircle className="w-4 h-4 text-muted" />, 'Allergies', editedStaff.allergies, 'allergies', 'textarea')}
                {renderField(<AlertCircle className="w-4 h-4 text-muted" />, 'Medical Notes', editedStaff.specialMedicalNotes, 'specialMedicalNotes', 'textarea')}
                {renderField(<Shield className="w-4 h-4 text-muted" />, 'Medical Insurance', editedStaff.medicalInsuranceId, 'medicalInsuranceId')}
                {renderField(<Shield className="w-4 h-4 text-muted" />, 'Gratuity Applicable', editedStaff.gratuityApplicable ? 'Yes' : 'No', 'gratuityApplicable')}
              </div>
            </div>
          </div>
        )}

        {/* Resignation Tab */}
        {activeTab === 'resignation' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Resignation & Exit Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Resignation Date', formatDate(editedStaff.resignationDate), 'resignationDate', 'date')}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Notice Period Start', formatDate(editedStaff.noticePeriodStart), 'noticePeriodStart', 'date')}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Notice Period End', formatDate(editedStaff.noticePeriodEnd), 'noticePeriodEnd', 'date')}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Last Working Date', formatDate(editedStaff.lastWorkingDate), 'lastWorkingDate', 'date')}
                {renderField(<Calendar className="w-4 h-4 text-muted" />, 'Relieving Date', formatDate(editedStaff.relievingDate), 'relievingDate', 'date')}
                {renderField(<FileText className="w-4 h-4 text-muted" />, 'Reason for Leaving', editedStaff.reasonForLeaving, 'reasonForLeaving', 'textarea')}
                {renderField(<BookOpen className="w-4 h-4 text-muted" />, 'Previous Company', editedStaff.previousCompany, 'previousCompany')}
                {renderField(<Clock className="w-4 h-4 text-muted" />, 'Experience (Years)', editedStaff.experienceYears, 'experienceYears', 'number')}
                {renderField(<BadgeCheck className="w-4 h-4 text-muted" />, 'Reference Check', editedStaff.referenceCheckStatus, 'referenceCheckStatus')}
                {renderField(<BadgeCheck className="w-4 h-4 text-muted" />, 'Background Verification', editedStaff.backgroundVerificationStatus, 'backgroundVerificationStatus')}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Staff Documents
                </h4>
                <button
                  className="btn btn-primary btn-sm flex items-center gap-2"
                  onClick={() => setShowUploadModal(true)}
                  disabled={isEditing}
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>

              {documentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted mt-2">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12" style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <FileText className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="font-medium text-gray-900 mb-1">No documents uploaded</p>
                  <p className="text-sm text-muted mb-4">Upload documents like ID, certificates, resumes, etc.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      style={{ backgroundColor: '#fff' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                            <FileType className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{doc.document_type}</p>
                            <p className="text-xs text-muted">{formatDate(doc.uploaded_at)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 truncate" title={doc.document_name}>
                        {doc.document_name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted mb-3">
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span className="uppercase">{doc.mime_type.split('/')[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline flex-1"
                          onClick={() => setViewingDocument(doc)}
                          title="View"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline flex-1"
                          onClick={() => handleDownloadDocument(doc)}
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline red flex-1"
                          onClick={() => handleDeleteDocument(doc.id, doc.document_name)}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    {/* Upload Document Modal */}
    {showUploadModal && (
      <>
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}></div>
        <div className="modal">
          <div className="modal-header">
            <h3>Upload Document</h3>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowUploadModal(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="modal-content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Document Type *</label>
                <select
                  className="input w-full"
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                >
                  <option value="">Select document type</option>
                  <option value="ID Document">ID Document</option>
                  <option value="Resume/CV">Resume/CV</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Reference Letter">Reference Letter</option>
                  <option value="Medical Report">Medical Report</option>
                  <option value="Training Certificate">Training Certificate</option>
                  <option value="Performance Review">Performance Review</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {selectedFile ? selectedFile.name : 'Drag and drop your file here, or click to browse'}
                  </p>
                  <p className="text-xs text-muted mb-3">PDF, JPG, PNG (Max 10MB)</p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                  />
                  <label htmlFor="file-upload" className="btn btn-sm btn-outline cursor-pointer">
                    Choose File
                  </label>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleUploadDocument}
              disabled={uploadingDocument || !selectedFile || !selectedDocumentType}
            >
              {uploadingDocument ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </>
    )}

    {/* View Document Modal */}
    {viewingDocument && (
      <>
        <div className="modal-overlay" onClick={() => setViewingDocument(null)} style={{ zIndex: 9999 }}></div>
        <div className="modal" style={{ maxWidth: '900px', zIndex: 10000, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '80vh', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <FileType className="w-6 h-6 text-primary" />
              <div>
                <h3>{viewingDocument.document_name}</h3>
                <p className="text-xs text-muted mt-0.5">
                  {viewingDocument.document_type} • {(viewingDocument.file_size / 1024).toFixed(1)} KB • {formatDate(viewingDocument.uploaded_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-sm btn-primary" 
                onClick={() => handleDownloadDocument(viewingDocument)}
                title="Download"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <a
                href={getDocumentUrl(viewingDocument.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
                title="Open in new tab"
              >
                <Eye className="w-4 h-4" />
                Full Screen
              </a>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewingDocument(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="modal-content" style={{ flex: 1, overflow: 'auto', padding: '0', backgroundColor: '#f1f5f9' }}>
            {/* Document Preview */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {viewingDocument.mime_type.includes('image') ? (
                // Image preview
                <img
                  src={getDocumentUrl(viewingDocument.file_path)}
                  alt={viewingDocument.document_name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              ) : viewingDocument.mime_type === 'application/pdf' ? (
                // PDF preview
                <iframe
                  src={getDocumentUrl(viewingDocument.file_path)}
                  className="w-full h-full rounded-lg shadow-lg"
                  style={{ minHeight: '70vh', border: 'none' }}
                  title={viewingDocument.document_name}
                />
              ) : (
                // Other file types - show download prompt
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                  <File className="w-20 h-20 text-primary mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">{viewingDocument.document_name}</h4>
                  <p className="text-muted mb-4">This file type cannot be previewed. Please download to view.</p>
                  <button className="btn btn-primary" onClick={() => handleDownloadDocument(viewingDocument)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}
    </div>
  );
}
