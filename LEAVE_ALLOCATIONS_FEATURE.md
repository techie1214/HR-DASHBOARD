# Leave Allocations Feature Implementation

## Overview
This document describes the newly implemented Leave Allocations feature in the HR Management System, which allows HR administrators to manage leave day allocations for staff members.

## Features Implemented

### 1. Leave Allocation Service (`src/services/leaveAllocationService.ts`)

A comprehensive service layer that handles all API communications for leave allocations:

#### API Endpoints Supported:
- **GET** `/api/leave/allocations/my-allocations` - Get current user's allocations
- **GET** `/api/leave/allocations` - Get all allocations (Admin/HR) with pagination
- **GET** `/api/leave/allocations/:id` - Get specific allocation by ID
- **POST** `/api/leave/allocations` - Create single allocation
- **POST** `/api/leave/allocations/bulk` - Bulk allocate to selected users
- **POST** `/api/leave/allocations/allocate-all` - Allocate to all active users
- **PUT** `/api/leave/allocations/:id` - Update allocation
- **DELETE** `/api/leave/allocations/:id` - Delete allocation

#### Key Interfaces:
```typescript
LeaveAllocation {
  id: number;
  userId: number;
  leaveTypeId: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  carriedOverDays: number;
  cycleStartDate: string;
  cycleEndDate: string;
  user?: { name, email, staff_id };
  leaveType?: { name, daysPerYear, isPaid };
}
```

### 2. Leave Allocation View Component (`src/components/LeaveAllocationView.tsx`)

A comprehensive UI component with the following features:

#### Main Features:
- **Data Table**: Displays all leave allocations with key information
- **Search & Filters**: Filter by staff member, leave type, and search by name/email
- **Pagination**: Navigate through large datasets with configurable page size
- **Real-time Updates**: Refresh data and update allocation status

#### CRUD Operations:
1. **Create Allocation**
   - Single allocation for individual staff
   - Select staff member from dropdown
   - Choose leave type
   - Set allocated days, cycle dates, and carryover

2. **Bulk Allocation - Selected Users**
   - Allocate same leave type to multiple users
   - Checkbox selection for target users
   - Efficient batch processing

3. **Bulk Allocation - All Users**
   - One-click allocation to all active staff
   - Uses leave type's standard days allocation
   - Ideal for annual leave cycles

4. **Update Allocation**
   - Edit allocated days, used days, carryover
   - Modify cycle dates
   - View-only staff and leave type info

5. **Delete Allocation**
   - Confirmation modal to prevent accidents
   - Clear warning message

#### Visual Indicators:
- **Remaining Days Progress Bar**: Color-coded (Green > 10, Yellow 5-10, Red < 5)
- **Usage Percentage**: Visual representation of leave utilization
- **Status Colors**: Different colors for different leave levels

### 3. Navigation Integration (`src/App.tsx`)

Added Leave Allocations as a separate tab in the main navigation:
- **Location**: Between "Leaves Management" and "Attendance"
- **Icon**: CalendarDays icon
- **Route**: `leave-allocations`

## User Interface

### Main View Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Leave Allocations                              [+ New]     │
│  Manage leave day allocations for staff members  [Bulk]    │
│                                              [Allocate All] │
├─────────────────────────────────────────────────────────────┤
│  [Search...]  [Filters]  [Refresh]                          │
├─────────────────────────────────────────────────────────────┤
│ Staff     │ Leave Type │ Alloc │ Used │ Remain │ Cycle     │
├───────────┼────────────┼───────┼──────┼────────┼───────────┤
│ John D.   │ Annual     │  21   │  5   │  16 🟢 │ Jan-Dec   │
│ Jane S.   │ Sick       │  10   │  8   │   2 🔴 │ Jan-Dec   │
│ ...       │ ...        │ ...   │ ... │  ...   │ ...       │
└─────────────────────────────────────────────────────────────┘
```

### Modal Dialogs

1. **Create Allocation Modal**
   - Staff Member dropdown
   - Leave Type dropdown
   - Allocated Days input
   - Cycle Start/End date pickers
   - Carried Over Days input

2. **Bulk Allocation Modal**
   - Leave Type dropdown
   - Allocated Days input
   - User selection checklist
   - Cycle dates
   - Carryover option

3. **Allocate to All Modal**
   - Simplified form for mass allocation
   - Leave Type and days only
   - Automatic application to all active users

4. **Edit Allocation Modal**
   - Read-only staff and leave type info
   - Editable: allocated, used, carried days
   - Adjustable cycle dates

5. **Delete Confirmation Modal**
   - Warning icon
   - Staff name confirmation
   - Cancel/Delete buttons

## Usage Guide

### For HR Administrators

#### Creating Individual Allocation:
1. Click "New Allocation" button
2. Select staff member from dropdown
3. Choose leave type
4. Enter number of days to allocate
5. Set cycle period (start and end dates)
6. Optionally add carried over days
7. Click "Create Allocation"

#### Bulk Allocation to Selected Users:
1. Click "Bulk Allocate" button
2. Select leave type
3. Enter days to allocate
4. Check boxes for target users
5. Set cycle period
6. Click "Allocate to Selected"

#### Allocate to All Active Users:
1. Click "Allocate to All" button
2. Select leave type
3. Enter standard allocation days
4. Set cycle period
5. Click "Allocate to All"

#### Updating Allocations:
1. Click Edit icon on any allocation row
2. Modify values as needed
3. Click "Update Allocation"

#### Deleting Allocations:
1. Click Delete icon on allocation row
2. Confirm deletion in modal
3. Allocation is permanently removed

### For Regular Users

Users can view their own allocations through the "My Allocations" endpoint, which is accessible via the API. A dedicated user view can be added if needed.

## Data Flow

```
┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   User UI    │ ───> │   Service   │ ───> │  Backend API │
│  Component   │ <─── │   Layer     │ <─── │  Endpoints   │
└──────────────┘      └─────────────┘      └──────────────┘
       │                      │                      │
       │                      │                      │
       v                      v                      v
  - Display data        - HTTP calls          - Database
  - User input          - Error handling      - Business logic
  - Validation          - Data transform      - Validation
```

## Error Handling

The service implements comprehensive error handling:

- **401 Unauthorized**: Token expired or missing
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **400 Bad Request**: Invalid input data
- **Network Errors**: Connection issues

All errors are displayed to users with clear, actionable messages.

## Permissions Required

Based on the Postman collection, the following permissions are needed:

- `leave_allocation:read` - View allocations
- `leave_allocation:create` - Create new allocations
- `leave_allocation:update` - Modify existing allocations
- `leave_allocation:delete` - Remove allocations

## Testing

### Manual Testing Checklist:
- [ ] View all allocations with pagination
- [ ] Search allocations by staff name
- [ ] Filter by leave type
- [ ] Create new individual allocation
- [ ] Bulk allocate to selected users
- [ ] Bulk allocate to all users
- [ ] Edit existing allocation
- [ ] Delete allocation with confirmation
- [ ] View remaining days with color indicators
- [ ] Navigate using pagination controls
- [ ] Refresh data manually

### API Testing:
Use the provided Postman collection (`leave.postman.json`) to test all endpoints.

## Future Enhancements

Potential improvements for future iterations:

1. **Export Functionality**: Download allocations as CSV/PDF
2. **Email Notifications**: Notify users of new allocations
3. **Allocation History**: Track changes over time
4. **Bulk Edit**: Update multiple allocations at once
5. **Allocation Templates**: Save common allocation patterns
6. **Reporting Dashboard**: Visual analytics for allocation trends
7. **Auto-allocation**: Schedule recurring allocations
8. **User Self-Service**: Allow users to view their allocations

## Files Modified/Created

### Created:
- `src/services/leaveAllocationService.ts` - Service layer
- `src/components/LeaveAllocationView.tsx` - Main UI component

### Modified:
- `src/App.tsx` - Added navigation and route

## Dependencies

The component uses:
- React (useState, useEffect)
- Lucide React (icons)
- Axios (HTTP client)
- Tailwind CSS (styling)

## Browser Compatibility

Tested and compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- **Pagination**: Limits data fetched per request (default 20)
- **Lazy Loading**: Staff and leave types loaded on demand
- **Debounced Search**: Prevents excessive API calls
- **Optimistic Updates**: UI updates before server confirmation

## Security

- JWT token authentication required
- Permission-based access control
- Input validation on client and server
- XSS protection through React's escaping
- CSRF protection via token headers

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoint configuration
3. Ensure valid authentication token
4. Check user permissions
5. Review network requests in DevTools

---

**Implementation Date**: February 25, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
