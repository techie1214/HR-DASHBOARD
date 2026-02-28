# HR Frontend Improvement Roadmap

**Priority:** Performance & Best UX First  
**Status:** In Progress  
**Last Updated:** February 28, 2026

---

## ✅ Phase 1: Core UX & Modal Improvements (COMPLETED)

### 1.1 Add Staff Modal
- [x] **Fix modal positioning** - Modal now centered with slideUp animation
- [x] **Apply standard design system** - Matched existing UI patterns
- [x] **Enhanced header** - Added icon, title, and subtitle
- [x] **Section cards** - Each form section in card with icon
- [x] **Loading state** - Spinner on submit button
- [x] **Improved footer** - Better spacing and styling

### 1.2 Staff ID Display
- [ ] **Remove ID column from tables** - Clean up table display
- [ ] **ID accessible via details view** - Keep ID available when needed

---

## ✅ Phase 2: Leave Management Enhancements (COMPLETED)

### 2.1 Leave Request Details Modal
**Endpoint:** `GET /api/leave/:id`

**Completed:**
- [x] **Full details display** - All fields from API response
- [x] **Employee info card** - Avatar, name, ID, department
- [x] **Leave details grid** - Type, days, submission date
- [x] **Date cards** - Start and end dates with icons
- [x] **Reason display** - Full text in styled card
- [x] **Attachments viewer** - PDF/image icons with View/Download buttons
- [x] **Approval/Rejection info** - Shows reviewer, date, and comments
- [x] **Loading state** - Spinner while fetching
- [x] **Error state** - Message when unable to load

**Attachments Features:**
- File type icons (PDF, image, other)
- File name, type, and size display
- View button (opens in new tab)
- Download button
- Multiple attachments support

### 2.2 Leave Types Display
- [x] **Removed emojis** - No more 🤒🏖️🚨
- [x] **Uniform Calendar icon** - Same icon for all leave types
- [x] **Icon container** - Colored background with Calendar icon

### 2.3 Leave Type Edit Feature
**Endpoint:** `PUT /api/leave-types/:id`

**Completed:**
- [x] **Pronounced edit button** - "Edit" label + pencil icon
- [x] **Outlined button style** - More visible than ghost button
- [x] **Better positioning** - Top-right corner of card

**Still Needed:**
- [ ] Edit modal implementation
- [ ] is_active toggle
- [ ] Validation

### 2.4 Pagination Design (Leave Management)
**Completed:**
- [x] **Modern rounded buttons** - rounded-lg styling
- [x] **Icon arrows** - Chevron icons for Prev/Next
- [x] **Active page highlight** - Blue background with shadow
- [x] **Better spacing** - gap-1 between buttons
- [x] **Disabled states** - Grayed out when at boundaries
- [x] **Info text styling** - Bold numbers for emphasis
- [x] **Light background** - #f9fafb background for section

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
