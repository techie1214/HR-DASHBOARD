// This component displays a comprehensive staff directory view
// It provides filtering, searching, and detailed staff profile access

import { useState, useEffect } from 'react';
import { Search, Users, UserX, Plus, Mail, Phone, MapPin, Briefcase, Calendar, UserCheck, X } from 'lucide-react';
import { StaffMember, isStaffOnActiveOffDay } from '../data/staffData';
import { StaffMember as ApiStaffMember } from '../services/staffManagementService';
import { StaffProfileView } from './StaffProfileViewSimple';
import StaffInvitationView from './StaffInvitationView';
import { getAllStaff, activateStaff, deactivateStaff } from '../services/staffManagementService';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Color palettes for staff cards based on department (dynamically assigned)
const departmentColorPalette = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600', avatarBg: 'bg-blue-100', avatarText: 'text-blue-700' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600', avatarBg: 'bg-green-100', avatarText: 'text-green-700' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600', avatarBg: 'bg-amber-100', avatarText: 'text-amber-700' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600', avatarBg: 'bg-purple-100', avatarText: 'text-purple-700' },
  { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', icon: 'text-pink-600', avatarBg: 'bg-pink-100', avatarText: 'text-pink-700' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: 'text-indigo-600', avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', icon: 'text-teal-600', avatarBg: 'bg-teal-100', avatarText: 'text-teal-700' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600', avatarBg: 'bg-orange-100', avatarText: 'text-orange-700' },
];

// Get color scheme for a department based on hash
const getDepartmentColorIndex = (department: string): number => {
  if (!department || department === 'N/A') return 0;
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = ((hash << 5) - hash) + department.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % departmentColorPalette.length;
};

export function AllStaffView({ initialSelectedStaff }: { initialSelectedStaff?: StaffMember | null }) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [minYearsFilter, setMinYearsFilter] = useState<number | ''>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(initialSelectedStaff || null);
  const [showStaffInvitation, setShowStaffInvitation] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadStaffList();
  }, [currentPage, activeFilter, departmentFilter]);

  useEffect(() => {
    if (initialSelectedStaff) {
      setSelectedStaff(initialSelectedStaff);
    }
  }, [initialSelectedStaff]);

  const mapApiToUiStaff = (apiStaff: ApiStaffMember): StaffMember => {
    const fullNameParts = apiStaff.full_name ? apiStaff.full_name.split(' ') : [];
    const firstName = fullNameParts[0] || 'N/A';
    const lastName = fullNameParts.length > 1 ? fullNameParts[fullNameParts.length - 1] : apiStaff.employee_id || 'N/A';
    const middleName = fullNameParts.length > 2 ? fullNameParts.slice(1, -1).join(' ') : '';

    return {
      id: apiStaff.id.toString(),
      firstName,
      middleName,
      lastName,
      dateOfBirth: apiStaff.date_of_birth || 'N/A',
      placeOfBirth: 'N/A',
      gender: apiStaff.gender || 'Male',
      stateOfOrigin: 'N/A',
      lga: 'N/A',
      phoneNumber: apiStaff.phone_number || 'N/A',
      email: apiStaff.email || apiStaff.work_email || apiStaff.personal_email || 'N/A',
      address: 'N/A',
      education: [],
      department: apiStaff.department || 'N/A',
      departmentRole: apiStaff.designation || 'N/A',
      branchType: 'Single',
      jobStatus: apiStaff.employment_type || 'Permanent',
      dateEmployed: apiStaff.joining_date || 'N/A',
      branches: [],
      guardianFirstName: 'N/A',
      guardianLastName: 'N/A',
      guardianDOB: 'N/A',
      guardianPhone: apiStaff.emergency_contact_phone || 'N/A',
      guardianEmail: 'N/A',
      guardianAddress: 'N/A',
      guardianBusinessName: 'N/A',
      guardianBusinessAddress: 'N/A',
      leaves: [],
      offDays: [],
      documents: [],
      status: (apiStaff.status === 'active' ? 'Active' : 'Inactive'),
      avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`
    };
  };

  const loadStaffList = async () => {
    try {
      setLoading(true);
      
      // Build filters object
      const filters: { status?: string; department?: string; search?: string } = {};
      if (activeFilter !== 'all') {
        filters.status = activeFilter === 'active' ? 'active' : 'inactive';
      }
      if (departmentFilter) {
        filters.department = departmentFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await getAllStaff(currentPage, itemsPerPage, filters);
      if (response.success) {
        const mappedStaff = response.staff?.map(mapApiToUiStaff) || [];
        setStaffList(mappedStaff);
        
        // Update pagination info
        if (response.pagination) {
          setTotalItems(response.pagination.totalItems);
          setTotalPages(response.pagination.totalPages);
        } else {
          // Fallback if no pagination data
          setTotalItems(mappedStaff.length);
          setTotalPages(Math.ceil(mappedStaff.length / itemsPerPage));
        }
        
        setError(null);
      } else {
        setError(response.message || 'Failed to load staff members');
      }
    } catch (err) {
      setError('An error occurred while loading staff members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffInvited = () => {
    loadStaffList();
    setShowStaffInvitation(false);
  };

  const handleActivateStaff = async (staffId: string) => {
    setActionLoading(`activate-${staffId}`);
    try {
      const response = await activateStaff(staffId);
      if (response.success) {
        setError(null);
        loadStaffList();
      } else {
        setError(response.message || 'Failed to activate staff member');
      }
    } catch (err) {
      setError('An error occurred while activating staff member');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateStaff = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this staff member?')) {
      return;
    }
    setActionLoading(`deactivate-${staffId}`);
    try {
      const response = await deactivateStaff(staffId);
      if (response.success) {
        setError(null);
        loadStaffList();
      } else {
        setError(response.message || 'Failed to deactivate staff member');
      }
    } catch (err) {
      setError('An error occurred while deactivating staff member');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const computeYearsEmployed = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) return 0;
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years -= 1;
    return years >= 0 ? years : 0;
  };

  const departmentOptions = Array.from(new Set(staffList.map(s => s.department))).filter(Boolean) as string[];

  // Since filtering is done server-side, filteredStaff is just the current page of staffList
  const filteredStaff = staffList;

  // Calculate counts for active and inactive staff (from full list - would need separate API call for accurate counts)
  const totalStaff = totalItems; // Use total from API pagination
  const activeCount = staffList.filter(s => s.status === 'Active').length;
  const inactiveCount = staffList.filter(s => s.status === 'Inactive').length;

  // Pagination calculation for display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff; // Already paginated from API

  if (selectedStaff) {
    return (
      <StaffProfileView
        staff={selectedStaff}
        onBack={() => {
          setSelectedStaff(null);
          loadStaffList();
        }}
        onUpdate={(updatedStaff) => {
          setSelectedStaff(updatedStaff);
          loadStaffList();
        }}
      />
    );
  }

  return (
    <div className="space-y-6" style={{ position: 'relative' }}>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowStaffInvitation(true)}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          padding: 0,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          zIndex: 40
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Header Statistics Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Total Staff Card */}
        <div className="stats-card">
          <div className="stats-card-content">
            <div className="stats-card-title">Total Staff</div>
            <div className="stats-card-value">{totalStaff}</div>
          </div>
          <div className="stats-card-icon bg-blue">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Active Staff Card */}
        <div className="stats-card">
          <div className="stats-card-content">
            <div className="stats-card-title">Active</div>
            <div className="stats-card-value">{activeCount}</div>
          </div>
          <div className="stats-card-icon bg-green">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Inactive Staff Card */}
        <div className="stats-card">
          <div className="stats-card-content">
            <div className="stats-card-title">Inactive</div>
            <div className="stats-card-value">{inactiveCount}</div>
          </div>
          <div className="stats-card-icon bg-orange">
            <UserX className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Departments Card */}
        <div className="stats-card">
          <div className="stats-card-content">
            <div className="stats-card-title">Departments</div>
            <div className="stats-card-value">{departmentOptions.length}</div>
          </div>
          <div className="stats-card-icon bg-purple">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="input-wrapper" style={{ width: 'auto', flex: 1, minWidth: '250px' }}>
            <div className="input-icon">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              className="input input-with-icon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({totalStaff})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'inactive' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive ({inactiveCount})
            </button>

            <select
              className="input input-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              <option value="">All Departments</option>
              {departmentOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <input
              type="number"
              className="input input-sm"
              placeholder="Min years"
              min={0}
              value={minYearsFilter === '' ? '' : String(minYearsFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setMinYearsFilter(v === '' ? '' : Math.max(0, Number(v)));
              }}
              style={{ width: '110px' }}
            />
          </div>
        </div>
      </div>

      {/* Staff List Display */}
      <div className="card">
        <div className="p-4 border-b">
          <h3>Staff Directory</h3>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Showing {paginatedStaff.length} of {filteredStaff.length} staff members{totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}
          </p>
        </div>

        <div className="staff-grid">
          {paginatedStaff.map((staff) => {
            const colorIndex = getDepartmentColorIndex(staff.department);
            const colors = departmentColorPalette[colorIndex];

            return (
              <div
                key={staff.id}
                className={`staff-card ${colors.bg} ${colors.border}`}
                style={{
                  borderLeft: `4px solid`,
                  borderLeftColor: `var(--${colors.text?.split('-')[1]}-500)`
                }}
                onClick={() => setSelectedStaff(staff)}
              >
                <div className="flex items-start gap-4">
                  {/* Staff Avatar */}
                  <div
                    className={`avatar ${colors.avatarBg} ${colors.avatarText}`}
                    style={{ width: '3.5rem', height: '3.5rem', fontSize: '1rem' }}
                  >
                    {staff.avatar || `${staff.firstName[0]}${staff.lastName[0]}`}
                  </div>

                  {/* Staff Information */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={colors.text} style={{ fontWeight: 600, marginBottom: '0.125rem' }}>
                          {staff.firstName} {staff.middleName} {staff.lastName}
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                          {staff.departmentRole}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`badge ${staff.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {staff.status}
                        </span>

                        {isStaffOnActiveOffDay(staff) && (
                          <span
                            className="badge"
                            style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.7rem' }}
                          >
                            On Off Day
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Staff Details Grid */}
                    <div className="staff-info-grid">
                      <div className={`flex items-center gap-2 ${colors.icon}`}>
                        <Briefcase className="w-3 h-3" />
                        <span className="text-xs" style={{ color: 'inherit' }}>{staff.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{staff.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="mt-2 text-sm text-muted text-center">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} staff members
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="avatar" style={{ width: '4rem', height: '4rem', marginBottom: '1rem' }}>
              <Users className="w-8 h-8" />
            </div>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>No staff members found</p>
          </div>
        )}
      </div>

      {/* Staff Invitation View */}
      {showStaffInvitation && (
        <div
          className="notification-overlay"
          onClick={() => setShowStaffInvitation(false)}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-4 border-b"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h2 style={{ margin: 0 }}>Invite New Staff</h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowStaffInvitation(false)}
                style={{ width: '2rem', height: '2rem' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <StaffInvitationView onSuccess={handleStaffInvited} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
