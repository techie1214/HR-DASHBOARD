# HR Frontend Improvement Roadmap

**Priority:** Performance & Best UX First  
**Status:** In Progress  
**Last Updated:** February 28, 2026

---

## 🎯 Phase 1: Core UX & Modal Improvements (HIGH PRIORITY)

### 1.1 Add Staff Modal
- [ ] **Fix modal positioning** - Modal appears top-left, should be centered
- [ ] **Apply standard design system** - Match existing UI patterns
- [ ] **Form validation** - Ensure all required fields validated
- [ ] **Success/error feedback** - Toast notifications on submit

### 1.2 Staff ID Display
- [ ] **Remove ID column from tables** - Clean up table display
- [ ] **ID accessible via details view** - Keep ID available when needed

---

## 📋 Phase 2: Leave Management Enhancements (HIGH PRIORITY)

### 2.1 Leave Request Details Modal
**Endpoint:** `GET /api/leave/:id`

**Required Display Fields:**
- [ ] Request ID
- [ ] Employee name & ID
- [ ] Leave type name
- [ ] Start date & End date
- [ ] Days requested
- [ ] Reason (full text)
- [ ] Status (with color coding)
- [ ] Submission date
- [ ] Reviewed by (if applicable)
- [ ] Review date (if applicable)
- [ ] Notes/Approver comments

**Attachments Viewer:**
- [ ] **PDF preview** - Embed PDF viewer for letters/documents
- [ ] **Image preview** - Display JPG/PNG attachments inline
- [ ] **Download button** - Allow download of attachments
- [ ] **File info** - Show file name, size, upload date

**Implementation:**
- [ ] Update `handleViewDetails()` function
- [ ] Create `LeaveRequestDetailsModal` component
- [ ] Add attachment rendering logic
- [ ] Test with various file types

### 2.2 Leave Types Display
- [ ] **Remove emojis** - Replace with single consistent icon (Calendar or FileText)
- [ ] **Uniform icon** - Same icon for all leave types

### 2.3 Leave Type Edit Feature
**Endpoint:** `PUT /api/leave-types/:id`

**Request Body:**
```json
{
  "name": "Special Annual Leave",
  "days_per_year": 21,
  "allow_carryover": true,
  "carryover_limit": 10,
  "is_active": true
}
```

**Improvements:**
- [ ] **Pronounced edit button** - Make edit option obvious (pencil icon + label)
- [ ] **Edit modal** - Full form with all fields
- [ ] **is_active toggle** - Switch control for active/inactive
- [ ] **Validation** - Ensure days_per_year > 0
- [ ] **Success feedback** - Toast on successful update
- [ ] **Error handling** - Show validation errors from backend

### 2.4 Pagination Design (Leave Management)
- [ ] **Redesign pagination controls** - Modern, clean design
- [ ] **Prev/Next buttons** - Styled with icons
- [ ] **Page numbers** - Clear, clickable number buttons
- [ ] **Active page indicator** - Highlight current page
- [ ] **Disabled states** - Gray out Prev/Next when at boundaries

**Apply same pagination design to:**
- [ ] User Management screen
- [ ] Leave Allocations screen
- [ ] All Staff screen
- [ ] Any other paginated tables

---

## 📊 Phase 3: Leave Allocations (HIGH PRIORITY)

### 3.1 Load Leave Allocations
**Endpoint:** `GET /api/leave/allocations?year=2026`

- [ ] **Fix API endpoint** - Ensure correct endpoint is called
- [ ] **Year filter dropdown** - Add year selector (optional for now)
- [ ] **Display allocations** - Show all allocations in table
- [ ] **Handle empty state** - Message when no allocations exist

### 3.2 Create New Allocation (Single User)
**Endpoint:** `POST /api/leave/allocations`

**Request Body:**
```json
{
  "user_id": 1,
  "leave_type_id": 3,
  "allocated_days": 20,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 2
}
```

**Implementation:**
- [ ] **Modal form** - All required fields
- [ ] **User dropdown** - Fetch and display all staff
- [ ] **Leave type dropdown** - Fetch from `/api/leave-types`
- [ ] **Date pickers** - Cycle start/end dates
- [ ] **Validation** - Required fields, date ranges
- [ ] **Success feedback** - Show created allocation
- [ ] **Error handling** - Display backend errors

### 3.3 Bulk Allocate (Selected Users)
**Endpoint:** `POST /api/leave/allocations/bulk`

**Request Body:**
```json
{
  "user_ids": [1, 2, 3, 4, 5],
  "leave_type_id": 4,
  "allocated_days": 20,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 0
}
```

**Implementation:**
- [ ] **Modal with checklist** - Checkbox list of all users
- [ ] **Select all/none** - Quick selection buttons
- [ ] **Leave type selector** - Dropdown
- [ ] **Days input** - Number field
- [ ] **Cycle dates** - Date pickers
- [ ] **Summary display** - Show count of selected users
- [ ] **Progress indicator** - Show allocation progress for large batches
- [ ] **Success summary** - "Allocated to X users successfully"

### 3.4 Allocate to All Users
**Endpoint:** `POST /api/leave/allocations/allocate-all`

**Request Body:**
```json
{
  "leave_type_id": 5,
  "allocated_days": 5,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 0
}
```

**Implementation:**
- [ ] **Simplified modal** - Only leave type, days, dates
- [ ] **Confirmation dialog** - Warn about bulk operation
- [ ] **User count display** - "This will allocate to X active users"
- [ ] **Progress indicator** - Show progress for large allocations
- [ ] **Success summary** - Show total allocated, failures if any

### 3.5 Edit Allocation
**Endpoint:** `PUT /api/leave/allocations/:id`

**Request Body:**
```json
{
  "allocated_days": 21,
  "carried_over_days": 3
}
```

**Implementation:**
- [ ] **Edit modal** - Pre-populate with current values
- [ ] **Read-only fields** - User, leave type (cannot change)
- [ ] **Editable fields** - allocated_days, carried_over_days, used_days
- [ ] **Validation** - Days must be >= 0
- [ ] **Update feedback** - Show updated allocation

### 3.6 Delete Allocation
**Endpoint:** `DELETE /api/leave/allocations/:id`

**Implementation:**
- [ ] **Confirmation modal** - "Are you sure?" with allocation details
- [ ] **Warning message** - "This action cannot be undone"
- [ ] **Success feedback** - Toast on successful deletion
- [ ] **Remove from table** - Update UI without refresh

### 3.7 Filter by Staff (Leave Allocations)
- [ ] **Fix staff dropdown** - Currently not working
- [ ] **Populate from API** - Fetch user list
- [ ] **Searchable dropdown** - Type to find staff
- [ ] **Clear filter option** - Reset to show all

---

## 🎨 Phase 4: Design System Consistency (MEDIUM PRIORITY)

### 4.1 Modal Standardization
- [ ] **Center positioning** - All modals centered on screen
- [ ] **Overlay** - Dark backdrop with blur
- [ ] **Close button** - X in top-right corner
- [ ] **Click outside to close** - Dismiss on overlay click
- [ ] **ESC key to close** - Keyboard accessibility
- [ ] **Animation** - Smooth fade/slide in-out
- [ ] **Responsive** - Mobile-friendly modal sizes

### 4.2 Button Consistency
- [ ] **Primary buttons** - Blue, for main actions
- [ ] **Secondary buttons** - Outline style
- [ ] **Danger buttons** - Red, for delete/cancel
- [ ] **Disabled states** - Gray, non-clickable
- [ ] **Loading states** - Spinner during async operations
- [ ] **Icon + text** - Consistent spacing

### 4.3 Form Elements
- [ ] **Input fields** - Consistent height, border radius
- [ ] **Labels** - Above inputs, consistent spacing
- [ ] **Error messages** - Red text below field
- [ ] **Required indicators** - Asterisk (*) for required
- [ ] **Dropdown styling** - Match design system
- [ ] **Date pickers** - Consistent across app

### 4.4 Tables
- [ ] **Header styling** - Bold, background color
- [ ] **Row hover effects** - Subtle highlight
- [ ] **Striped rows** - Alternating backgrounds (optional)
- [ ] **Responsive** - Horizontal scroll on mobile
- [ ] **Empty states** - Helpful messages when no data

---

## ⚡ Phase 5: Performance Optimizations (MEDIUM PRIORITY)

### 5.1 API Call Optimization
- [ ] **Debounced search** - Prevent excessive API calls
- [ ] **Pagination** - Load only visible data
- [ ] **Caching** - Cache static data (leave types, departments)
- [ ] **Lazy loading** - Load modals on-demand
- [ ] **Request cancellation** - Cancel stale requests on unmount

### 5.2 Component Optimization
- [ ] **Memoization** - React.memo for heavy components
- [ ] **useCallback** - Memoize event handlers
- [ ] **Virtual scrolling** - For large lists (100+ items)
- [ ] **Code splitting** - Lazy load heavy views

---

## 🔧 Phase 6: Additional Features (LOW PRIORITY)

### 6.1 Leave Management
- [ ] **Export to CSV/PDF** - Download leave reports
- [ ] **Calendar view** - Visual calendar of approved leaves
- [ ] **Bulk approval** - Select multiple requests, approve at once
- [ ] **Leave history** - Filter by year, employee

### 6.2 Leave Allocations
- [ ] **Year filter** - Filter allocations by year
- [ ] **Expiry tracking** - Show expiring leave days
- [ ] **Bulk edit** - Update multiple allocations
- [ ] **Allocation templates** - Save common allocation patterns

### 6.3 Notifications
- [ ] **Toast notifications** - Success/error messages
- [ ] **Email notifications** - Notify on approval/rejection (backend)
- [ ] **In-app notifications** - Bell icon with notification dropdown

---

## 📝 Implementation Order

### Sprint 1 (This Week)
1. ✅ Fix Add Staff modal positioning
2. ✅ Leave Request Details Modal with attachments
3. ✅ Leave Type edit improvements
4. ✅ Pagination redesign (Leave Management + User Management)

### Sprint 2 (Next Week)
5. ✅ Leave Allocations - Load allocations (GET endpoint)
6. ✅ Leave Allocations - Create single allocation
7. ✅ Leave Allocations - Bulk allocate (selected users)
8. ✅ Leave Allocations - Allocate to all users

### Sprint 3
9. ✅ Leave Allocations - Edit allocation
10. ✅ Leave Allocations - Delete allocation
11. ✅ Leave Allocations - Fix staff filter dropdown
12. ✅ All modals - Standardize design system

### Sprint 4
13. ✅ Performance optimizations
14. ✅ Additional features from Phase 6

---

## 🧪 Testing Checklist

For each feature:
- [ ] **Happy path** - Works with valid data
- [ ] **Validation** - Rejects invalid input
- [ ] **Error handling** - Shows backend errors
- [ ] **Loading states** - Spinner during API calls
- [ ] **Success feedback** - Toast/notification on success
- [ ] **Mobile responsive** - Works on small screens
- [ ] **Keyboard navigation** - Tab through forms
- [ ] **Accessibility** - ARIA labels, screen reader friendly

---

## 📚 API Reference

### Leave Types
- `GET /api/leave-types` - Get all leave types
- `GET /api/leave-types/:id` - Get single leave type
- `POST /api/leave-types` - Create leave type
- `PUT /api/leave-types/:id` - Update leave type
- `DELETE /api/leave-types/:id` - Delete leave type

### Leave Requests
- `GET /api/leave` - Get all leave requests (admin)
- `GET /api/leave/:id` - Get single leave request
- `POST /api/leave` - Create leave request
- `PUT /api/leave/:id` - Update leave request (approve/reject)
- `DELETE /api/leave/:id` - Cancel leave request

### Leave Allocations
- `GET /api/leave/allocations` - Get all allocations
- `GET /api/leave/allocations/:id` - Get single allocation
- `POST /api/leave/allocations` - Create allocation
- `POST /api/leave/allocations/bulk` - Bulk allocate (selected)
- `POST /api/leave/allocations/allocate-all` - Allocate to all
- `PUT /api/leave/allocations/:id` - Update allocation
- `DELETE /api/leave/allocations/:id` - Delete allocation

---

## 📌 Notes

- **Authentication:** All endpoints require Bearer token in Authorization header
- **Date Format:** ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- **Response Format:** All responses wrapped in `{ success: true/false, message: "...", data: {...} }`
- **Field Naming:** Backend uses snake_case, frontend should handle conversion

---

**Next Action:** Start with Phase 1.1 - Fix Add Staff Modal positioning
