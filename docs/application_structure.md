# HR Front Application Structure Documentation

## Overview

This document describes the structure and organization of the HR Front application, a comprehensive HR dashboard built with React and TypeScript. The application provides various modules for managing employees, attendance, leaves, performance, recruitment, and other HR functions.

## Project Architecture

### Technology Stack
- **Framework**: React 18.x with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **UI Components**: Radix UI primitives for accessible components
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for fast development and builds
- **State Management**: React hooks (useState, useEffect)

### Folder Structure
```
hrFront/
├── docs/                   # Documentation files
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   └── ui/            # Base UI components (buttons, cards, etc.)
│   ├── data/              # Mock data and API utilities
│   ├── guidelines/        # Development guidelines
│   ├── styles/            # Global styles
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Build configuration
└── README.md             # Project overview
```

## Core Components

### Main Application Flow
1. **Authentication**: Login component handles user authentication
2. **Navigation**: Sidebar provides access to different modules
3. **Content Area**: Dynamic rendering of views based on navigation selection
4. **Header**: Contains search functionality, notifications, and user controls

### Component Categories

#### 1. View Components (src/components/)
These components represent major sections of the application:

- **AllStaffView**: Comprehensive staff directory and management
- **AttendanceView**: Track and monitor employee attendance
- **BranchManagementView**: Manage company branches and locations
- **LeaveManagementView**: Handle employee leave requests and approvals
- **PerformanceView**: Track and evaluate employee performance
- **RecruitmentView**: Manage job openings and candidate applications
- **ReportsView**: Generate and view HR reports
- **TimeManagementView**: Set and manage work schedules
- **OffDaysView**: Manage company holidays and off days
- **EmployeesView**: Employee-specific information and management
- **Setup**: System initialization component for first-time setup
- **Dashboard Views**: Various dashboard components (AttendanceChart, DepartmentChart, StatsCard, etc.)

#### 2. UI Components (src/components/ui/)
Reusable base components following design system principles:

- **Form Elements**: Input, Button, Checkbox, Radio Group, Select, etc.
- **Layout Components**: Card, Sheet, Dialog, Alert Dialog
- **Navigation**: Navigation Menu, Tabs, Breadcrumb
- **Data Display**: Table, Badge, Avatar, Progress
- **Feedback**: Toast, Alert, Skeleton
- **Overlay**: Popover, Tooltip, Dropdown Menu

#### 3. Data Components (src/data/)
Mock data and data structures:

- **attendanceData.ts**: Sample attendance records
- **branchData.ts**: Company branch information
- **staffData.ts**: Employee data and profiles
- **timeData.ts**: Time tracking and scheduling data

## Key Features

### 0. System Initialization
- **Setup Component**: First-time system setup screen that appears when the system hasn't been initialized
- **API Integration**: Checks system readiness at `/api/system-complete/readiness`
- **Admin Creation**: Creates the initial system administrator account via `/api/system-complete/setup-complete`
- **Form Validation**: Collects required information (email, password, full name, phone)
- **Redirect Logic**: Automatically redirects after successful initialization or if system is already set up

### 1. Dashboard
- Overview tab with key metrics (total employees, attendance rate, pending leaves, new hires)
- Analytics tab with charts and data visualization
- Employee table view

### 2. Staff Management
- All Staff Directory with detailed profiles
- Add/Edit staff functionality
- Search and filter capabilities

### 3. Attendance Tracking
- Real-time attendance monitoring
- Visual charts and reports
- Time management features

### 4. Leave Management
- Leave request submission and approval workflow
- Leave balance tracking
- Different leave types (annual, sick, maternity, etc.)

### 5. Performance Management
- Performance metrics and KPIs
- Review tracking and evaluation

### 6. Advanced Search
- Global search across staff, departments, and leave types
- Keyboard navigation (Ctrl+K to focus search)
- Categorized results with avatars and metadata

### 7. Notifications
- Notification panel for alerts and updates
- Unread notification indicators

## Routing and Navigation

The application uses a state-based routing system within a single-page application:

- **Sidebar Navigation**: Main menu with icons and labels
- **Dynamic Content Rendering**: Switch statement renders appropriate view based on active state
- **Tab System**: Dashboard has multiple tabs (Overview, Employees, Analytics)

## Styling Approach

- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Consistent Design System**: Components follow unified design principles
- **Responsive Layout**: Adapts to different screen sizes
- **Dark/Light Mode**: Theme support using next-themes

## State Management

- **Component State**: useState for local component state
- **Application State**: useState in App component for global state
- **Effects**: useEffect for side effects and data fetching
- **Local Storage**: Persists login status

## Authentication

- Simple login form with username/password
- Local storage for session persistence
- Protected routes (redirects to login if not authenticated)

## Build Configuration

- **Vite**: Fast development server and optimized builds
- **SWC Plugin**: Fast React compilation
- **Alias Configuration**: Path aliases for easier imports
- **Target**: ESNext for modern JavaScript features

## Development Scripts

- `npm run dev`: Starts development server on port 3000
- `npm run build`: Creates production build in build/ directory

## Best Practices Implemented

1. **Component Modularity**: Each feature is encapsulated in its own component
2. **Accessibility**: Using Radix UI ensures accessibility compliance
3. **Performance**: Efficient rendering and state management
4. **Code Organization**: Clear separation of concerns
5. **Type Safety**: TypeScript for improved development experience
6. **Responsive Design**: Mobile-first approach with responsive layouts

## Future Enhancements

Potential areas for improvement:
- API integration for real data
- Advanced filtering and sorting options
- Export functionality for reports
- Role-based access control
- Internationalization support
- Unit and integration tests