# 🏗️ Service & Interface Layer Architecture
> Complete guide to the HR Dashboard's data layer architecture

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI COMPONENTS                             │
│  (HolidayManagementView, HolidayList, etc.)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE SERVICES                              │
│  (holidayService, leaveManagementService, etc.)                 │
│  - Business logic                                                │
│  - Data transformation                                           │
│  - Error handling                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓ calls
┌─────────────────────────────────────────────────────────────────┐
│                    API SERVICES                                  │
│  (apiServices.ts - centralized API calls)                       │
│  - HTTP requests (axios)                                         │
│  - Authentication headers                                        │
│  - Response normalization                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓ communicates with
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API                                   │
│  (Express.js Server - /api/holidays, /api/leaves, etc.)         │
└─────────────────────────────────────────────────────────────────┘
                              ↑ defines
┌─────────────────────────────────────────────────────────────────┐
│                    TYPE INTERFACES                               │
│  (apiInterfaces.ts - TypeScript types)                          │
│  - Data contracts                                                │
│  - Request/Response shapes                                       │
│  - Type safety                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/services/
├── apiInterfaces.ts           # TypeScript interfaces (TYPES)
├── apiServices.ts             # Centralized API calls (HTTP LAYER)
│
├── authService.ts             # Authentication & authorization
├── systemApi.ts               # System initialization
├── initServices.ts            # System setup
│
├── holidayService.ts          # Holiday management
├── leaveManagementService.ts  # Leave requests & approvals
├── leaveAllocationService.ts  # Leave entitlement allocation
├── branchManagementService.ts # Branch/office locations
├── departmentManagementService.ts
├── staffManagementService.ts
├── attendanceService.ts
├── attendanceSettingsService.ts
├── useAttendanceService.ts
├── shiftSchedulingService.ts
├── payrollService.ts
├── appraisalService.ts
├── kpiService.ts
├── roleManagementService.ts
└── userManagementService.ts
```

---

## 🎯 Layer Responsibilities

### 1️⃣ **Interface Layer** (`apiInterfaces.ts`)

**Purpose:** Define TypeScript types for type safety across the app.

**What it contains:**
- Data models (what data looks like)
- Request types (what you send to API)
- Response types (what API sends back)

**Example:**
```typescript
// === DATA MODEL ===
// What a Holiday looks like when received from API
export interface Holiday {
  id: number;
  holiday_name: string;
  date: string;
  branch_id: number | null;
  is_mandatory: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// === REQUEST TYPE ===
// What you send when creating a holiday
export interface CreateHolidayRequest {
  holiday_name: string;
  date: string;
  branch_id?: number | null;
  is_mandatory?: boolean;
  description?: string | null;
}

// === UPDATE TYPE ===
// All fields optional for partial updates
export interface UpdateHolidayRequest {
  holiday_name?: string;
  date?: string;
  branch_id?: number | null;
  is_mandatory?: boolean;
  description?: string | null;
}
```

**Why it matters:**
- ✅ IntelliSense in your editor
- ✅ Compile-time error catching
- ✅ Self-documenting code
- ✅ Consistent data shapes

---

### 2️⃣ **API Service Layer** (`apiServices.ts`)

**Purpose:** Centralized HTTP communication with the backend.

**What it does:**
- Makes axios HTTP calls
- Adds authentication tokens to headers
- Handles errors uniformly
- Normalizes response format

**Example:**
```typescript
export const apiServices = {
  // GET all holidays
  async getHolidays(params?: any) {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${API_ENDPOINT}/holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params  // query parameters
      });

      return {
        success: true,
        message: "Holidays retrieved successfully",
        data: { holidays: response.data.data?.holidays || [] }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch holidays',
        data: { holidays: [] }
      };
    }
  },

  // POST create holiday
  async createHoliday(data: any) {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_ENDPOINT}/holidays`, 
        data,  // request body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        message: "Holiday created successfully",
        data: { holiday: response.data.data?.holiday }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create holiday',
        data: { holiday: null }
      };
    }
  },

  // PUT update holiday
  async updateHoliday(id: number, data: any) {
    // ... similar pattern
  },

  // DELETE holiday
  async deleteHoliday(id: number) {
    // ... similar pattern
  }
};
```

**Why it matters:**
- ✅ Single source of truth for API calls
- ✅ Consistent error handling
- ✅ Authentication handled automatically
- ✅ Easy to test and mock

---

### 3️⃣ **Feature Service Layer** (e.g., `holidayService.ts`)

**Purpose:** Business logic and convenience methods for specific features.

**What it does:**
- Wraps `apiServices` with feature-specific methods
- Adds business logic and validation
- Provides helper/utility methods
- Transforms data for UI consumption

**Example:**
```typescript
class HolidayService {
  // === CRUD OPERATIONS ===
  
  async getHolidays(params?: {
    branchId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const response = await apiServices.getHolidays(params);
      return response;  // Pass through apiServices response
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;  // Re-throw for component to handle
    }
  }

  async createHoliday(data: CreateHolidayRequest) {
    try {
      const response = await apiServices.createHoliday(data);
      return response;
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  }

  // === HELPER/BUSINESS LOGIC METHODS ===
  
  async getHolidaysForDate(date: string) {
    // Convenience method for specific use case
    const response = await apiServices.getHolidays({ date });
    return response;
  }

  async getHolidaysForDateRange(startDate: string, endDate: string) {
    // Convenience method for date range queries
    const response = await apiServices.getHolidays({ startDate, endDate });
    return response;
  }

  async getHolidaysForBranch(branchId: number) {
    // Convenience method for branch-specific holidays
    const response = await apiServices.getHolidays({ branchId });
    return response;
  }

  async isHoliday(date: string): Promise<boolean> {
    // Business logic: check if a date is a holiday
    const response = await apiServices.getHolidays({ date });
    if (response.success && response.data) {
      return response.data.holidays.length > 0;
    }
    return false;
  }
}

// Export singleton instance
export const holidayService = new HolidayService();
```

**Why it matters:**
- ✅ Separation of concerns
- ✅ Reusable business logic
- ✅ Easy to test in isolation
- ✅ Components stay clean

---

### 4️⃣ **Auth Service** (`authService.ts`)

**Purpose:** Handle authentication, tokens, and session management.

**What it does:**
- Login/logout
- Token storage and retrieval
- Token validation
- Axios interceptor setup

**Example:**
```typescript
// Login
export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post(`${API_ENDPOINT}/auth/login`, credentials);
  
  if (response.data.success) {
    // Store tokens and user info
    secureSetItem('authToken', response.data.tokens.accessToken);
    secureSetItem('userInfo', JSON.stringify(response.data.user));
    secureSetItem('isLoggedIn', 'true');
  }
  
  return response.data;
};

// Logout
export const logout = (): void => {
  secureRemoveItem('authToken');
  secureRemoveItem('userInfo');
  secureRemoveItem('isLoggedIn');
};

// Check if authenticated
export const isAuthenticated = (): boolean => {
  const token = secureGetItem('authToken');
  return !!token;
};

// Get user info
export const getUserInfo = () => {
  const userInfoStr = secureGetItem('userInfo');
  return JSON.parse(userInfoStr);
};

// Setup axios interceptors (auto-add token to requests)
export const setupAxiosInterceptors = (): void => {
  axios.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
```

---

## 🔄 Data Flow Example: Creating a Holiday

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER clicks "Create Holiday" button in HolidayManagementView  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. COMPONENT calls holidayService.createHoliday()                │
│    const newHoliday: CreateHolidayRequest = {                    │
│      holiday_name: "Independence Day",                           │
│      date: "2026-07-04",                                         │
│      branch_id: null,                                            │
│      is_mandatory: true,                                         │
│      description: "National holiday"                             │
│    };                                                            │
│    await holidayService.createHoliday(newHoliday);               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. HOLIDAY SERVICE calls apiServices.createHoliday()             │
│    - Validates data                                              │
│    - Wraps in try-catch                                          │
│    - Logs errors                                                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. API SERVICE makes HTTP POST request                           │
│    - Gets auth token from localStorage                           │
│    - Adds Authorization header                                   │
│    - POST to /api/holidays                                       │
│    - Handles errors                                              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. BACKEND API processes request                                 │
│    - Validates JWT token                                         │
│    - Checks permissions (holiday:create)                         │
│    - Validates data                                              │
│    - Inserts into database                                       │
│    - Returns { success: true, data: { holiday: {...} } }         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE flows back up the chain                              │
│    API Service → Holiday Service → Component                     │
│    Component updates UI, shows success message                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Design Patterns

### 1. **Repository Pattern**
Each feature has its own service that acts as a repository for that domain.

```typescript
// Holiday repository
export const holidayService = new HolidayService();

// Leave repository  
export const leaveManagementService = new LeaveManagementService();

// Branch repository
export const branchManagementService = new BranchManagementService();
```

### 2. **Singleton Pattern**
Services are instantiated once and exported as singletons.

```typescript
class HolidayService { /* ... */ }
export const holidayService = new HolidayService(); // Single instance
```

### 3. **Dependency Injection**
Feature services depend on `apiServices` but don't create it.

```typescript
class HolidayService {
  async getHolidays(params) {
    return await apiServices.getHolidays(params); // Uses external dependency
  }
}
```

### 4. **Type Safety**
All data flows through TypeScript interfaces.

```typescript
// Component receives typed data
const holiday: Holiday = { /* ... */ };

// Service accepts typed request
async createHoliday(data: CreateHolidayRequest) { /* ... */ }
```

---

## 🔧 How to Add a New Feature

### Step 1: Add Interfaces (`apiInterfaces.ts`)
```typescript
export interface Training {
  id: number;
  title: string;
  date: string;
  trainer: string;
  attendees: number;
}

export interface CreateTrainingRequest {
  title: string;
  date: string;
  trainer: string;
  attendees?: number;
}
```

### Step 2: Add API Methods (`apiServices.ts`)
```typescript
export const apiServices = {
  // ... existing methods
  
  async getTrainings() {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_ENDPOINT}/trainings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { success: true, data: { trainings: response.data.data?.trainings } };
  },
  
  async createTraining(data: CreateTrainingRequest) {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_ENDPOINT}/trainings`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { success: true, data: { training: response.data.data?.training } };
  }
};
```

### Step 3: Create Feature Service (`trainingService.ts`)
```typescript
import { apiServices } from './apiServices';
import { Training, CreateTrainingRequest } from './apiInterfaces';

class TrainingService {
  async getTrainings() {
    try {
      return await apiServices.getTrainings();
    } catch (error) {
      console.error('Error fetching trainings:', error);
      throw error;
    }
  }

  async createTraining(data: CreateTrainingRequest) {
    try {
      return await apiServices.createTraining(data);
    } catch (error) {
      console.error('Error creating training:', error);
      throw error;
    }
  }
}

export const trainingService = new TrainingService();
```

### Step 4: Use in Component
```typescript
import { trainingService } from '../services/trainingService';
import { CreateTrainingRequest } from '../services/apiInterfaces';

function TrainingView() {
  const handleCreate = async (data: CreateTrainingRequest) => {
    const response = await trainingService.createTraining(data);
    if (response.success) {
      // Success!
    }
  };
  
  // ...
}
```

---

## 📊 Service Comparison Table

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `authService` | Authentication | `login()`, `logout()`, `isAuthenticated()` |
| `apiServices` | HTTP layer | `getHolidays()`, `createHoliday()`, `updateHoliday()` |
| `holidayService` | Holiday logic | `getHolidays()`, `isHoliday()`, `getHolidaysForBranch()` |
| `leaveManagementService` | Leave requests | `getLeaveRequests()`, `approveLeave()`, `rejectLeave()` |
| `branchManagementService` | Branches | `getAllBranches()`, `createBranch()`, `updateBranch()` |
| `staffManagementService` | Employees | `getAllStaff()`, `createStaff()`, `updateStaff()` |

---

## 🎯 Best Practices

### ✅ DO:
- Use TypeScript interfaces for all data
- Wrap API calls in try-catch
- Log errors with context
- Return consistent response shapes
- Keep components thin (logic in services)
- Use singleton service instances

### ❌ DON'T:
- Call axios directly from components
- Hardcode API endpoints in components
- Skip error handling
- Use `any` type
- Mix business logic with UI logic
- Create new service instances in components

---

## 🔍 Quick Reference

### Holiday Service Methods
```typescript
// Get all holidays
await holidayService.getHolidays(params)

// Get holidays for specific branch
await holidayService.getHolidaysForBranch(branchId)

// Get holidays in date range
await holidayService.getHolidaysForDateRange(startDate, endDate)

// Check if date is a holiday
await holidayService.isHoliday(date)

// Create holiday
await holidayService.createHoliday({ holiday_name, date, branch_id, is_mandatory })

// Update holiday
await holidayService.updateHoliday(id, { holiday_name, date })

// Delete holiday
await holidayService.deleteHoliday(id)
```

### Response Format
```typescript
// Success
{
  success: true,
  message: "Holiday created successfully",
  data: { holiday: { id: 1, holiday_name: "Christmas", ... } }
}

// Error
{
  success: false,
  message: "Invalid date format",
  data: null
}
```

---

*Last updated: March 2026*
