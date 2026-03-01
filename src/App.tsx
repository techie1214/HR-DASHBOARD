import { useState, useEffect, useRef } from "react";
import { NotificationPanel } from "./components/NotificationPanel";
import { AllStaffView } from "./components/AllStaffView";
import { BranchManagementView } from "./components/BranchManagementView";
import { TimeManagementView } from "./components/TimeManagementView";
import { OffDaysView } from "./components/OffDaysView";
import { StatsCard } from "./components/StatsCard";
import { AttendanceChart } from "./components/AttendanceChart";
import { DepartmentChart } from "./components/DepartmentChart";
import LeaveRequestCard from "./components/LeaveRequestCard";
import { RecentHires } from "./components/RecentHires";
import { AttendanceView } from "./components/AttendanceView";
import { EmployeesView } from "./components/EmployeesView";
import { DepartmentManagementView } from "./components/DepartmentManagementView";
import PerformanceView from "./components/PerformanceView";
import RecruitmentView from "./components/RecruitmentView";
import ReportsView from "./components/ReportsView";
import PayrollView from "./components/PayrollView";
import AppraisalView from "./components/AppraisalView";
import LeaveManagementView from "./components/LeaveManagementView";
import LeaveAllocationView from "./components/LeaveAllocationView";
import PerformanceMetrics from "./components/PerformanceMetrics";
import { EmployeeTable } from "./components/EmployeeTable";
import KPIView from "./components/KPIView";
import HolidayManagementView from "./components/HolidayManagementView";
import ShiftSchedulingView from "./components/ShiftSchedulingView";
// import  StaffManagementView  from "./components/StaffManagementView";
import { mockNotifications, mockStaffData } from "./data/staffData";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  UserPlus,
  Clock,
  Menu,
  PieChart,
  Building,
  Sun,
  Shield,
  User as UserIcon,
  DollarSign,
  Award,
  Target,
  CalendarDays
} from "lucide-react";
import { Login } from "./components/Login";
import RoleManagementView from "./components/RoleManagementView";
import SystemInitialization from "./components/SystemInitialization";
import UserManagementView from "./components/UserManagementView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { checkSystemReadiness } from "./services/apiServices";
import { isAuthenticated, logout, getUserInfo, setupAxiosInterceptors } from "./services/authService";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  user?: {
    name?: string;
    email?: string;
    avatarInitials?: string;
  };
}

function Sidebar({ activeView, onNavigate, user }: SidebarProps) {
  // Generate avatar initials from user name if available
  const getAvatarInitials = () => {
    if (user?.avatarInitials) return user.avatarInitials;
    if (user?.name) {
      const nameParts = user.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      } else if (nameParts.length === 1) {
        return nameParts[0][0].toUpperCase();
      }
    }
    // Default initials if no name is available
    return 'AU'; // Anonymous User
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="logo-box">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#0f172a" }}>HR Dashboard</p>
            <p className="text-xs" style={{ color: "#6b7280" }}>Management Portal</p>
          </div>
        </div>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-group">
          <div className="sidebar-group-label">Main Menu</div>
          <ul className="sidebar-menu">
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("dashboard")}
                className={`sidebar-menu-button ${activeView === "dashboard" ? "active" : ""}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("allstaff")}
                className={`sidebar-menu-button ${activeView === "allstaff" ? "active" : ""}`}
              >
                <Users className="w-4 h-4" />
                <span>All Staff</span>
              </button>
            </li>
            {/* <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("offdays")}
                className={`sidebar-menu-button ${activeView === "offdays" ? "active" : ""}`}
              >
                <Sun className="w-4 h-4" />
                <span>Off Days</span>
              </button>
            </li> */}
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("leave")}
                className={`sidebar-menu-button ${activeView === "leave" ? "active" : ""}`}
              >
                <Calendar className="w-4 h-4" />
                <span>Leaves Management</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("leave-allocations")}
                className={`sidebar-menu-button ${activeView === "leave-allocations" ? "active" : ""}`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Leave Allocations</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("attendance")}
                className={`sidebar-menu-button ${activeView === "attendance" ? "active" : ""}`}
              >
                <Clock className="w-4 h-4" />
                <span>Attendance</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("branches")}
                className={`sidebar-menu-button ${activeView === "branches" ? "active" : ""}`}
              >
                <Building className="w-4 h-4" />
                <span>Branch Management</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("departments")}
                className={`sidebar-menu-button ${activeView === "departments" ? "active" : ""}`}
              >
                <Building className="w-4 h-4" />
                <span>Department Management</span>
              </button>
            </li>
            {/* <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("timemanagement")}
                className={`sidebar-menu-button ${activeView === "timemanagement" ? "active" : ""}`}
              >
                <Clock className="w-4 h-4" />
                <span>Time Management</span>
              </button>
            </li> */}
            {/* <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("payroll")}
                className={`sidebar-menu-button ${activeView === "payroll" ? "active" : ""}`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Payroll</span>
              </button>
            </li> */}
            {/* <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("appraisal")}
                className={`sidebar-menu-button ${activeView === "appraisal" ? "active" : ""}`}
              >
                <Award className="w-4 h-4" />
                <span>Appraisal</span>
              </button>
            </li> */}
            {/* <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("kpi")}
                className={`sidebar-menu-button ${activeView === "kpi" ? "active" : ""}`}
              >
                <Target className="w-4 h-4" />
                <span>KPI</span>
              </button>
            </li> */}
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("holidays")}
                className={`sidebar-menu-button ${activeView === "holidays" ? "active" : ""}`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Holidays</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("shiftscheduling")}
                className={`sidebar-menu-button ${activeView === "shiftscheduling" ? "active" : ""}`}
              >
                <Calendar className="w-4 h-4" />
                <span>Shift Scheduling</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="sidebar-group">
          <div className="sidebar-group-label">Settings</div>
          <ul className="sidebar-menu">
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("usermanagement")}
                className={`sidebar-menu-button ${activeView === "usermanagement" ? "active" : ""}`}
              >
                <UserIcon className="w-4 h-4" />
                <span>User Management</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("rolemanagement")}
                className={`sidebar-menu-button ${activeView === "rolemanagement" ? "active" : ""}`}
              >
                <Shield className="w-4 h-4" />
                <span>Role Management</span>
              </button>
            </li>
            <li className="sidebar-menu-item">
              <button
                onClick={() => onNavigate("settings")}
                className={`sidebar-menu-button ${activeView === "settings" ? "active" : ""}`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="sidebar-footer">
        <div className="flex items-center gap-3">
          <div className="avatar">{getAvatarInitials()}</div>
          <div className="flex-1">
            <p className="text-sm" style={{ fontWeight: 500, color: "#0f172a" }}>
              {user?.name || 'Guest User'}
            </p>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              {user?.email || 'No email'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  console.log('App component is rendering');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSystemInitialized, setIsSystemInitialized] = useState<boolean|null>(null); // null = checking, true/false = result
  const [user, setUser] = useState<{ name?: string; email?: string; avatarInitials?: string } | null>(null);
  const prevIsLoggedIn = useRef<boolean | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedStaffFromSearch, setSelectedStaffFromSearch] = useState<any>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ordinal = day > 3 && day < 21 ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
    return `${day}${ordinal} ${month} ${year}. ${hours}:${minutes}`;
  });
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  // Define the function outside of useEffect to make it accessible
  const checkSystemInitialization = async () => {
    console.log('Starting system initialization check...');
    try {
      console.log('About to call checkSystemReadiness...');
      const readinessData = await checkSystemReadiness();
      console.log('System initialization data:', readinessData);
      setIsSystemInitialized(readinessData.ready || readinessData.initialized || false);
    } catch (error) {
      console.error('Error checking system initialization:', error);
      // If there's an error checking (network error, timeout, etc.), assume system is not initialized
      setIsSystemInitialized(false);
    }
  };

  // Initialize axios interceptors
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  // Check system initialization status on mount
  useEffect(() => {
    console.log('Checking system initialization...');
    checkSystemInitialization();
  }, []);

  // Check login status and load user details only after system initialization is confirmed
  useEffect(() => {
    if (isSystemInitialized === true) {
      const authenticated = isAuthenticated();

      // Only update state if it has actually changed
      prevIsLoggedIn.current = prevIsLoggedIn.current ?? !authenticated; // Initialize if undefined

      if (prevIsLoggedIn.current !== authenticated) {
        setIsLoggedIn(authenticated);
        prevIsLoggedIn.current = authenticated;

        // Load user details if authenticated
        if (authenticated) {
          const userInfo = getUserInfo();
          if (userInfo) {
            setUser({
              name: userInfo.fullName || userInfo.name || userInfo.fullname || userInfo.username || userInfo.displayName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
              email: userInfo.email || userInfo.Email,
            });
          }
        } else {
          // Clear user data when logging out
          setUser(null);
        }
      }
      // If isLoggedIn is already correct, don't update it to prevent re-renders
    }
  }, [isSystemInitialized]);

  const handleLogin = () => {
    const authenticated = isAuthenticated();

    // Only update state if the authentication status has actually changed
    if (prevIsLoggedIn.current !== authenticated) {
      setIsLoggedIn(authenticated);
      prevIsLoggedIn.current = authenticated;

      // Load user details after login
      const userInfo = getUserInfo();
      if (userInfo) {
        setUser({
          name: userInfo.fullName || userInfo.name || userInfo.fullname || userInfo.username || userInfo.displayName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
          email: userInfo.email || userInfo.Email,
        });
      }
    }
  };

  const handleLogout = () => {
    logout();

    // Only update state if the authentication status has actually changed
    if (prevIsLoggedIn.current !== false) {
      setIsLoggedIn(false);
      prevIsLoggedIn.current = false;
      setUser(null); // Clear user state on logout
    }
  };

  // Handle global search with multiple categories
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedResultIndex(-1);
    
    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const queryLower = query.toLowerCase();
    const allResults: any[] = [];

    // Staff search
    const staffMatches = mockStaffData.filter(staff =>
      `${staff.firstName} ${staff.middleName} ${staff.lastName}`.toLowerCase().includes(queryLower) ||
      staff.email.toLowerCase().includes(queryLower) ||
      staff.id.toLowerCase().includes(queryLower) ||
      staff.department.toLowerCase().includes(queryLower) ||
      staff.departmentRole.toLowerCase().includes(queryLower) ||
      staff.phoneNumber.includes(query) ||
      staff.stateOfOrigin.toLowerCase().includes(queryLower)
    ).slice(0, 5).map((staff, index) => ({
      type: 'staff',
      category: 'Staff Members',
      categoryIcon: '👤',
      id: staff.id,
      title: `${staff.firstName} ${staff.middleName} ${staff.lastName}`,
      subtitle: `${staff.departmentRole} • ${staff.department}`,
      meta: staff.status === 'Active' ? '✓ Active' : '⊘ Inactive',
      metaColor: staff.status === 'Active' ? '#16a34a' : '#6b7280',
      data: staff,
      resultIndex: index
    }));

    // Department search
    const departments = ['Sales', 'Technical', 'Solar', 'Logistics', 'Audit', 'HR', 'RMS', 'Digital Media Team'];
    const departmentMatches = departments
      .filter(dept => dept.toLowerCase().includes(queryLower))
      .map((dept, index) => ({
        type: 'department',
        category: 'Departments',
        categoryIcon: '🏢',
        id: `dept-${dept}`,
        title: dept,
        subtitle: `View staff in ${dept}`,
        meta: `${mockStaffData.filter(s => s.department === dept).length} staff`,
        metaColor: '#2563eb',
        data: { name: dept },
        resultIndex: index
      }));

    // Leave type search
    const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Bereaved', 'Emergency', 'Unpaid'];
    const leaveMatches = leaveTypes
      .filter(type => type.toLowerCase().includes(queryLower))
      .map((type, index) => ({
        type: 'leave',
        category: 'Leave Types',
        categoryIcon: '🏖️',
        id: `leave-${type}`,
        title: `${type} Leave`,
        subtitle: 'View leave requests',
        meta: 'Manage',
        metaColor: '#7c3aed',
        data: { name: type },
        resultIndex: index
      }));

    allResults.push(...staffMatches, ...departmentMatches, ...leaveMatches);
    
    setSearchResults(allResults);
    setShowSearchResults(allResults.length > 0);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef?.focus();
        return;
      }

      if (!showSearchResults || searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
      } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
        e.preventDefault();
        handleSearchResultClick(searchResults[selectedResultIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSearchResults(false);
        setSelectedResultIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearchResults, searchResults, selectedResultIndex, searchInputRef]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
        setSelectedResultIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search result click
  const handleSearchResultClick = (result: any) => {
    if (result.type === 'staff') {
      setActiveView('allstaff');
      setSelectedStaffFromSearch(result.data);
      setShowSearchResults(false);
      setSearchQuery("");
    } else if (result.type === 'department') {
      setActiveView('allstaff');
      setShowSearchResults(false);
      setSearchQuery("");
    } else if (result.type === 'leave') {
      setActiveView('leave');
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ordinal = day > 3 && day < 21 ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
      setCurrentTime(`${day}${ordinal} ${month} ${year}. ${hours}:${minutes}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
              <StatsCard 
                title="Total Employees"
                value="248"
                change="+12 this month"
                changeType="positive"
                icon={Users}
                iconColor="bg-blue"
              />
              <StatsCard 
                title="Attendance Rate"
                value="96.5%"
                change="+2.1% from last week"
                changeType="positive"
                icon={Clock}
                iconColor="bg-green"
              />
              <StatsCard 
                title="Pending Leaves"
                value="18"
                change="4 urgent"
                changeType="neutral"
                icon={Calendar}
                iconColor="bg-orange"
              />
              <StatsCard 
                title="New Hires"
                value="12"
                change="This month"
                changeType="positive"
                icon={UserPlus}
                iconColor="bg-purple"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
              <AttendanceChart />
              <DepartmentChart />
            </div>

            {/* Leave Requests and Recent Hires */}
            <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
              <LeaveRequestCard />
              <RecentHires />
            </div>

            {/* Performance Metrics */}
            <PerformanceMetrics />
          </div>
        );
      
      case "employees":
        return <EmployeeTable />;
      
      case "analytics":
        return (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
              <AttendanceChart />
              <DepartmentChart />
            </div>
            {/* Performance Metrics */}
            <PerformanceMetrics />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div>
            {/* Tabs */}
            <div className="tabs-list mb-6">
              <button 
                className={`tabs-trigger ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button 
                className={`tabs-trigger ${activeTab === "employees" ? "active" : ""}`}
                onClick={() => setActiveTab("employees")}
              >
                Employees
              </button>
              <button 
                className={`tabs-trigger ${activeTab === "analytics" ? "active" : ""}`}
                onClick={() => setActiveTab("analytics")}
              >
                Analytics
              </button>
            </div>

            {renderDashboardContent()}
          </div>
        );

      case "allstaff":
        return <AllStaffView initialSelectedStaff={selectedStaffFromSearch} />;

      case "offdays":
        return <OffDaysView />;

      case "leave":
        return <LeaveManagementView />;

      case "leave-allocations":
        return <LeaveAllocationView />;

      case "attendance":
        return <AttendanceView />;

      case "branches":
        return <BranchManagementView />;

      case "departments":
        return <DepartmentManagementView />;

      case "timemanagement":
        return <TimeManagementView />;

      case "employees":
        return <EmployeesView />;

      case "performance":
        return <PerformanceView />;

      case "recruitment":
        return <RecruitmentView />;

      case "reports":
        return <ReportsView />;

      case "payroll":
        return <PayrollView />;

      case "appraisal":
        return <AppraisalView />;

      case "kpi":
        return <KPIView />;

      case "holidays":
        return <HolidayManagementView />;

      case "shiftscheduling":
        return <ShiftSchedulingView />;

      case "usermanagement":
        return <UserManagementView />;
      case "rolemanagement":
        return <RoleManagementView />;
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2>Settings</h2>
              <p className="text-muted">Configure your HR dashboard preferences</p>
            </div>
            <div className="card p-6">
              <h3 className="mb-4">General Settings</h3>
              <p className="text-muted">Settings page coming soon...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        return {
          title: "HR Dashboard",
          subtitle: "Welcome back! Here's what's happening with your organization today."
        };
      case "allstaff":
        return {
          title: "All Staff Directory",
          subtitle: "Comprehensive staff management and profile viewing"
        };
      case "offdays":
        return {
          title: "Off Days Management",
          subtitle: "Manage and assign staff off days"
        };
      case "leave":
        return {
          title: "Leave Management",
          subtitle: "Manage employee leave requests and balances"
        };
      case "attendance":
        return {
          title: "Attendance Tracking",
          subtitle: "Monitor employee attendance and work hours"
        };
      case "branches":
        return {
          title: "Branch Management",
          subtitle: "Attendance reports and branch analytics"
        };
      case "departments":
        return {
          title: "Department Management",
          subtitle: "Manage organizational departments and structures"
        };
      case "timemanagement":
        return {
          title: "Time Management",
          subtitle: "Set resumption times for branches and individual staff"
        };
      case "employees":
        return {
          title: "Employee Directory",
          subtitle: "Manage and view all employee information"
        };
      case "performance":
        return {
          title: "Performance Management",
          subtitle: "Track and manage employee performance reviews"
        };
      case "recruitment":
        return {
          title: "Recruitment",
          subtitle: "Manage job openings and candidate applications"
        };
      case "reports":
        return {
          title: "Reports & Analytics",
          subtitle: "Generate and manage HR reports"
        };
      case "payroll":
        return {
          title: "Payroll Management",
          subtitle: "Manage payroll runs and employee compensation"
        };
      case "appraisal":
        return {
          title: "Appraisal Management",
          subtitle: "Manage employee performance evaluations"
        };
      case "kpi":
        return {
          title: "KPI Management",
          subtitle: "Track and manage key performance indicators"
        };
      case "holidays":
        return {
          title: "Holiday Management",
          subtitle: "Manage company holidays and non-working days"
        };
      case "shiftscheduling":
        return {
          title: "Shift Scheduling",
          subtitle: "Manage employee shift assignments and schedules"
        };
      case "usermanagement":
        return {
          title: "User Management",
          subtitle: "Manage system users and their access rights"
        };
      case "rolemanagement":
        return {
          title: "Role Management",
          subtitle: "Manage user roles and permissions"
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Configure your HR dashboard preferences"
        };
      default:
        return {
          title: "HR Dashboard",
          subtitle: "Welcome back!"
        };
    }
  };

  const pageInfo = getPageTitle();

  console.log('isSystemInitialized value:', isSystemInitialized);

  // If system initialization status is still being checked, show a loading state
  if (isSystemInitialized === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>HR Dashboard</div>
          <div style={{ fontSize: '1rem', color: '#64748b' }}>Checking system status...</div>
        </div>
      </div>
    );
  }

  // If system is not initialized, show the SystemInitialization component
  if (isSystemInitialized === false) {
    console.log('Showing SystemInitialization component');
    return (
      <ErrorBoundary>
        <SystemInitialization onSystemInitialized={() => {
          // When system is initialized, refresh the readiness check
          checkSystemInitialization();
        }} />
      </ErrorBoundary>
    );
  } else {
    console.log('System is initialized, proceeding to login check');
  }

  // Only check for login after system is confirmed initialized
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} onNavigate={setActiveView} user={user} />
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="sidebar-trigger">
                <Menu className="w-4 h-4" />
              </button>
              <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={setSearchInputRef}
                    type="text"
                    placeholder="Search staff, departments, leave types... (Ctrl+K)"
                    className="input input-with-icon"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery && searchResults.length > 0 && setShowSearchResults(true)}
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", width: '100%' }}
                  />
                </div>

                {/* Enhanced Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    zIndex: 50
                  }}>
                    {/* Group results by category */}
                    {(() => {
                      const grouped = searchResults.reduce((acc: any, result: any) => {
                        if (!acc[result.category]) {
                          acc[result.category] = [];
                        }
                        acc[result.category].push(result);
                        return acc;
                      }, {});

                      return Object.entries(grouped).map(([category, items]: [string, any]) => (
                        <div key={category}>
                          {/* Category Header */}
                          <div style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f9fafb',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {items[0].categoryIcon} {category}
                          </div>

                          {/* Results in Category */}
                          {items.map((result: any, itemIndex: number) => {
                            const globalIndex = searchResults.indexOf(result);
                            return (
                              <button
                                key={`${category}-${itemIndex}`}
                                onClick={() => handleSearchResultClick(result)}
                                style={{
                                  width: '100%',
                                  padding: '0.875rem 1rem',
                                  borderBottom: '1px solid #f3f4f6',
                                  backgroundColor: selectedResultIndex === globalIndex ? '#f0f9ff' : 'white',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => {
                                  setSelectedResultIndex(globalIndex);
                                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                    {/* Avatar */}
                                    {result.type === 'staff' && (
                                      <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '50%',
                                        backgroundColor: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: '#6b7280',
                                        flexShrink: 0
                                      }}>
                                        {result.data.firstName[0] + result.data.lastName[0]}
                                      </div>
                                    )}
                                    {(result.type === 'department' || result.type === 'leave') && (
                                      <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        flexShrink: 0
                                      }}>
                                        {result.categoryIcon}
                                      </div>
                                    )}

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontWeight: 500, fontSize: '0.875rem', margin: 0, color: '#0f172a' }}>
                                        {result.title}
                                      </p>
                                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginTop: '0.25rem' }}>
                                        {result.subtitle}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Meta Info */}
                                  <div style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: result.metaColor + '15',
                                    color: result.metaColor,
                                    borderRadius: '0.25rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}>
                                    {result.meta}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ));
                    })()}

                    {/* Footer Info */}
                    <div style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f9fafb',
                      borderTop: '1px solid #e5e7eb',
                      fontSize: '0.7rem',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                      <span>↑↓ Navigate • ↵ Select • ESC Close</span>
                    </div>
                  </div>
                )}

                {/* No Results State */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== "" && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    zIndex: 50
                  }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                      No results found for "{searchQuery}"
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>
                      Try searching by name, ID, department, or leave type
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 mr-3">{currentTime}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setNotificationPanelOpen(!notificationPanelOpen)} style={{ position: 'relative' }}>
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="badge badge-sm badge-error">{unreadNotifications}</span>
                )}
              </button>
              <button className="btn btn-ghost" onClick={handleLogout} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                Logout
              </button>
              <div className="avatar">AD</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-6 py-8">
          <div className="mb-8">
            <h1 style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>{pageInfo.title}</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{pageInfo.subtitle}</p>
          </div>

          {renderContent()}
        </div>
      </main>
      {notificationPanelOpen && <NotificationPanel onClose={() => setNotificationPanelOpen(false)} />}
    </div>
  );
}