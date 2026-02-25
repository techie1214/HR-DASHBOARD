# Leave Allocations - API Integration Update

## Backend API Response Structure

The backend returns the following structure for leave allocations:

### GET All Allocations Response
```json
{
  "success": true,
  "message": "Leave allocations retrieved successfully",
  "data": {
    "leaveAllocations": [
      {
        "id": 162,
        "user_id": 9,
        "leave_type_id": 3,
        "cycle_start_date": "2025-12-31T23:00:00.000Z",
        "cycle_end_date": "2026-12-30T23:00:00.000Z",
        "allocated_days": "21.00",
        "used_days": "0.00",
        "carried_over_days": "0.00",
        "created_at": "2026-02-25T12:08:15.000Z",
        "updated_at": "2026-02-25T12:08:15.000Z",
        "leave_type_name": "Personal Leave",
        "user_name": "Andrew Phillips"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 11,
      "totalItems": 204,
      "itemsPerPage": 20
    }
  }
}
```

### Key Field Names (Snake Case)
- `user_id` (not userId)
- `leave_type_id` (not leaveTypeId)
- `allocated_days` (not allocatedDays)
- `used_days` (not usedDays)
- `carried_over_days` (not carriedOverDays)
- `cycle_start_date` (not cycleStartDate)
- `cycle_end_date` (not cycleEndDate)
- `user_name` (not user.name)
- `leave_type_name` (not leaveType.name)

## Updated Files

### 1. `src/services/leaveAllocationService.ts`

**Interface Updated:**
```typescript
export interface LeaveAllocation {
  id: number;
  user_id: number;
  leave_type_id: number;
  allocated_days: number | string;  // Can be "21.00" or 21
  used_days: number | string;
  carried_over_days: number | string;
  cycle_start_date: string;
  cycle_end_date: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  leave_type_name?: string;
}
```

**Response Parsing:**
- Changed from `response.data.data.allocations` to `response.data.data.leaveAllocations`
- Updated pagination field names to match backend: `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`

### 2. `src/components/LeaveAllocationView.tsx`

**Table Display:**
- Now uses `allocation.user_name` instead of `allocation.user?.name`
- Now uses `allocation.leave_type_name` instead of `allocation.leaveType?.name`
- Converts string numbers: `Number(allocation.allocated_days)`
- Calculates remaining inline: `allocated - used`

**Form Defaults:**
- Default allocated days: **21** (not 0)
- Matches typical annual leave allocation

**Edit Modal:**
- Simplified to only edit: allocated_days, used_days, carried_over_days
- Removed cycle date editing (set during creation only)
- Displays staff name and leave type as read-only

## API Endpoints Summary

### 1. Get All Allocations (Admin/HR)
```
GET /api/leave/allocations?page=1&limit=20&userId=1&leaveTypeId=3
```

### 2. Create Single Allocation
```
POST /api/leave/allocations
Body:
{
  "user_id": 123,
  "leave_type_id": 1,
  "allocated_days": 21,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 0
}
```

### 3. Bulk Allocate (Selected Users)
```
POST /api/leave/allocations/bulk
Body:
{
  "leave_type_id": 1,
  "allocated_days": 20,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 0,
  "user_ids": [123, 124, 125, 126]
}
```

### 4. Bulk Allocate (All Users)
```
POST /api/leave/allocations/allocate-all
Body:
{
  "leave_type_id": 3,
  "allocated_days": 21,
  "cycle_start_date": "2026-01-01",
  "cycle_end_date": "2026-12-31",
  "carried_over_days": 0
}
```

### 5. Update Allocation
```
PUT /api/leave/allocations/1
Body:
{
  "allocated_days": 25,
  "used_days": 5,
  "carried_over_days": 2
}
```

### 6. Delete Allocation
```
DELETE /api/leave/allocations/1
```

## UI Features

### User Selection
- **Dropdown with names** - No manual ID typing
- Shows: `Staff Name (ID or Email)`
- Sends: `user_id` to backend

### Leave Type Selection
- **Dropdown with leave types**
- Shows: `Leave Type Name (X days/year)`
- Sends: `leave_type_id` to backend

### Bulk Allocation - Selected Users
- Checkbox list of all staff
- Select multiple users
- Same allocation for all selected

### Bulk Allocation - All Users
- One-click allocate to ALL active users
- No user selection needed
- Backend automatically allocates to everyone

### Visual Indicators
- **Green** (> 10 days remaining)
- **Yellow** (5-10 days remaining)
- **Red** (< 5 days remaining)
- Progress bar showing usage percentage

## Testing Checklist

- [x] View all allocations with pagination
- [x] Search by staff name
- [x] Filter by leave type
- [x] Create single allocation (dropdown selection)
- [x] Bulk allocate to selected users (checkboxes)
- [x] Bulk allocate to all users (one-click)
- [x] Edit allocation (days only)
- [x] Delete allocation with confirmation
- [x] View remaining days with colors
- [x] Pagination navigation

## Build Status

✅ **Build successful** - No TypeScript errors
✅ **API compatible** - Matches backend response structure
✅ **Production ready** - All features implemented

## Notes

1. **String vs Number**: Backend returns `"21.00"` for days, frontend converts with `Number()`
2. **Field Names**: All snake_case in API, converted in service layer
3. **Default Values**: 21 days default allocation (standard annual leave)
4. **Date Format**: ISO 8601 (`2026-01-01T00:00:00.000Z`)
5. **Pagination**: Backend uses `currentPage/totalPages/totalItems/itemsPerPage`

---

**Updated**: February 25, 2026
**Status**: Complete & Tested
