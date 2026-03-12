# 📅 Attendance Calendar View Specification

## Overview
A responsive, interactive calendar component for displaying monthly attendance data at a glance.

---

## 🎨 UI/UX Requirements

### Visual Design
- **No gradients** - Use solid, flat colors only
- **Clean borders** - Subtle gray borders (#e5e7eb) for grid structure
- **Color coding**:
  - Present: Green (#16a34a) with light green background (#dcfce7)
  - Late: Yellow (#ca8a04) with light yellow background (#fef3c7)
  - Absent: Red (#dc2626) with light red background (#fee2e2)
  - Leave: Blue (#2563eb) with light blue background (#dbeafe)
  - Holiday: Red background tint (#fef2f2)
  - Weekend: Gray background tint (#f9fafb)
  - Today: Blue background tint (#eff6ff)

### Responsive Behavior
- **Mobile (< 640px)**:
  - Compact day cells (min-height: 80px)
  - Hide text labels on badges, show icons + numbers only
  - Stack navigation buttons vertically
  - Smaller font sizes (text-xs)
  
- **Tablet (640px - 1024px)**:
  - Medium day cells (min-height: 100px)
  - Show abbreviated labels (Present → "Pres")
  - Side-by-side navigation
  
- **Desktop (> 1024px)**:
  - Full-size day cells (min-height: 120px)
  - Show full labels
  - All features visible

### Interactions
- **Hover effects**: Day cells highlight on hover (bg-gray-50)
- **Click actions**: Click day to view detailed attendance list (future enhancement)
- **Navigation**: Previous/Next month, Jump to Today
- **Export**: Download month's attendance data as CSV

---

## 📊 Data Structure

### Interface Definition

```typescript
interface CalendarDayData {
  // Date Information
  date: string;                    // ISO format: "2026-03-15"
  dayOfMonth: number;              // 1-31
  dayOfWeek: number;               // 0-6 (Sun-Sat)
  isToday: boolean;                // true if current date
  isWeekend: boolean;              // true if Sat/Sun
  isHoliday: boolean;              // true if public holiday
  holidayName?: string;            // e.g., "Labour Day"
  
  // Attendance Counts
  totalStaff: number;              // Expected staff count
  present: number;                 // Present count (includes late)
  late: number;                    // Late arrivals
  absent: number;                  // Absent count
  onLeave: number;                 // On leave count
  holidayWorking: number;          // Working on holiday
  
  // Calculated Metrics
  attendanceRate: number;          // (present / totalStaff) * 100
  status: 'excellent' | 'good' | 'average' | 'poor';  // Based on rate
  
  // Raw Data (for drill-down)
  records: AttendanceRecord[];     // Full attendance records for this day
}

interface AttendanceRecord {
  id: number;
  user_id: number;
  staff_name: string;
  staff_email: string;
  date: string;
  check_in_time: string;           // HH:mm:ss
  check_out_time: string;          // HH:mm:ss
  status: 'present' | 'late' | 'absent' | 'leave' | 'holiday' | 'holiday-working';
  branch_name: string;
  department: string;
  actual_working_hours?: number;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
}

interface CalendarMonthData {
  month: number;                   // 0-11 (Jan-Dec)
  year: number;                    // e.g., 2026
  monthName: string;               // "March"
  totalDays: number;               // 28-31
  startingDay: number;             // 0-6 (day of week for 1st)
  days: CalendarDayData[];         // Array of day data
  
  // Month Summary
  summary: {
    totalWorkingDays: number;
    averageAttendanceRate: number;
    bestDay: CalendarDayData;      // Highest attendance rate
    worstDay: CalendarDayData;     // Lowest attendance rate
    totalHolidays: number;
    totalAbsentDays: number;
  };
}
```

---

## 🔧 Component Props

```typescript
interface AttendanceCalendarProps {
  // Data
  monthData: CalendarMonthData;
  
  // Callbacks
  onMonthChange: (month: number, year: number) => void;
  onDayClick: (day: CalendarDayData) => void;
  onExport: (month: number, year: number) => void;
  
  // Configuration
  showWeekends: boolean;           // Show/hide weekend columns
  showHolidays: boolean;           // Show/hide holiday indicators
  showAttendanceRate: boolean;     // Show/hide rate percentage
  minCellHeight?: string;          // Override default cell height
  
  // State
  isLoading: boolean;
  error?: string;
}
```

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [← Prev]  March 2026  [Next →]     [Today]  [📥 Export]   │
├─────────────────────────────────────────────────────────────┤
│ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat                    │
├─────┼─────┼─────┼─────┼─────┼─────┼─────                    │
│     │     │     │     │     │  1  │  2                     │
│     │     │     │     │     │ ✓45 │ ✓42                    │
│     │     │     │     │     │ ✗3  │ ✗5                     │
├─────┼─────┼─────┼─────┼─────┼─────┼─────                    │
│  3  │  4  │  5  │  6  │  7  │  8  │  9                     │
│ ✓43 │ ✓44 │ ✓41 │ ✓45 │     │ ✓40 │ ✓38                    │
│ ✗4  │ ✗2  │ ✗6  │ ✗3  │     │ ✗8  │ ✗7                     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────                    │

┌─────────────────────────────────────────────────────────────┐
│ Legend:                                                     │
│ ✓ Present  ⚠ Late  ✗ Absent  🏖️ Leave  🎉 Holiday  🌐 Weekend│
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### 1. Day Cell Content
Each day cell displays:
- **Day number** (top-right, bold)
- **Holiday indicator** (🎉 + name if holiday)
- **Present count** (green badge with ✓)
- **Late count** (yellow badge with ⚠) - optional
- **Absent count** (red badge with ✗)
- **Leave count** (blue badge with 🏖️) - optional
- **Attendance rate** (color-coded percentage) - optional

### 2. Visual Indicators
- **Background colors** indicate day type:
  - White → Regular weekday
  - Light red → Holiday
  - Light gray → Weekend
  - Light blue → Today
  
- **Border highlighting** for:
  - Today (blue border)
  - Selected day (thick border)

### 3. Navigation
- **Previous Month** button (←)
- **Next Month** button (→)
- **Today** button (quick jump)
- **Month/Year** display (clickable for date picker - future)

### 4. Export Functionality
- Export current month's data as CSV
- Include all attendance records
- Filter by branch/department (future)

---

## 📱 Responsive Breakpoints

```css
/* Mobile: < 640px */
.calendar-grid {
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.day-cell {
  min-height: 80px;
  padding: 4px;
  font-size: 12px;
}

.badge {
  font-size: 10px;
  padding: 2px 4px;
}

/* Tablet: 640px - 1024px */
@media (min-width: 640px) {
  .day-cell {
    min-height: 100px;
    padding: 8px;
    font-size: 14px;
  }
  
  .badge {
    font-size: 11px;
    padding: 4px 6px;
  }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .day-cell {
    min-height: 120px;
    padding: 12px;
    font-size: 14px;
  }
  
  .badge {
    font-size: 12px;
    padding: 6px 8px;
  }
}
```

---

## 🔮 Future Enhancements

1. **Click to drill-down** - View detailed attendance list for selected day
2. **Drag to select range** - Select multiple days for batch operations
3. **Heat map mode** - Color intensity based on attendance rate
4. **Comparison view** - Compare with previous month/year
5. **Print-friendly layout** - Optimized for PDF export
6. **Custom date range** - View arbitrary date ranges (not just months)
7. **Staff filter** - Show only specific staff/department attendance
8. **Trend indicators** - ↑↓ arrows showing improvement/decline

---

## 📝 Example Usage

```tsx
import AttendanceCalendar from './AttendanceCalendar';

function AttendanceView() {
  const [monthData, setMonthData] = useState<CalendarMonthData | null>(null);
  
  // Fetch data when month/year changes
  useEffect(() => {
    fetchCalendarData(2026, 2); // March 2026 (0-indexed)
  }, []);
  
  const handleExport = (month: number, year: number) => {
    exportAttendanceToCSV(month, year);
  };
  
  const handleDayClick = (day: CalendarDayData) => {
    console.log('Clicked day:', day.date);
    // Show detailed view for this day
  };
  
  return (
    <AttendanceCalendar
      monthData={monthData}
      onMonthChange={(month, year) => fetchCalendarData(year, month)}
      onDayClick={handleDayClick}
      onExport={handleExport}
      showWeekends={true}
      showHolidays={true}
      showAttendanceRate={true}
      isLoading={false}
    />
  );
}
```

---

## ✅ Acceptance Criteria

- [ ] Renders 7-column grid for days of week
- [ ] Shows correct number of days for month (28-31)
- [ ] Empty cells for days before 1st of month
- [ ] Correct background colors for weekends/holidays/today
- [ ] Attendance badges display correctly (present, absent, late, leave)
- [ ] Attendance rate calculated and color-coded
- [ ] Navigation buttons work (prev/next/today)
- [ ] Export button triggers CSV download
- [ ] Responsive on mobile, tablet, desktop
- [ ] No gradients used (solid colors only)
- [ ] Hover effects on day cells
- [ ] Legend displays all status types
- [ ] Loading state shows spinner
- [ ] Error state shows message

---

## 🎨 Color Palette

```css
/* Status Colors */
--present-bg: #dcfce7;
--present-text: #16a34a;
--present-border: #86efac;

--late-bg: #fef3c7;
--late-text: #ca8a04;
--late-border: #fde047;

--absent-bg: #fee2e2;
--absent-text: #dc2626;
--absent-border: #fca5a5;

--leave-bg: #dbeafe;
--leave-text: #2563eb;
--leave-border: #93c5fd;

/* Day Type Colors */
--holiday-bg: #fef2f2;
--weekend-bg: #f9fafb;
--today-bg: #eff6ff;
--today-border: #3b82f6;

/* Neutral Colors */
--border-color: #e5e7eb;
--text-primary: #1f2937;
--text-secondary: #6b7280;
--text-muted: #9ca3af;
```

---

**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 4-6 hours
