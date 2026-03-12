import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Gift,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Users,
  ArrowLeft
} from "lucide-react";

// ─── Type Definitions ───────────────────────────────────────────────────────
export interface CalendarDayData {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  totalStaff: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  records: any[];
}

export interface CalendarMonthData {
  month: number;
  year: number;
  monthName: string;
  totalDays: number;
  startingDay: number;
  days: CalendarDayData[];
  summary: {
    totalWorkingDays: number;
    averageAttendanceRate: number;
    bestDay?: CalendarDayData;
    worstDay?: CalendarDayData;
    totalHolidays: number;
    totalAbsentDays: number;
  };
}

export interface AttendanceCalendarProps {
  monthData: CalendarMonthData | null;
  isLoading: boolean;
  error?: string;
  onMonthChange: (month: number, year: number) => void;
  onExport: (month: number, year: number) => void;
  onDayClick?: (day: CalendarDayData) => void;
  onBackToList?: () => void;
  showWeekends?: boolean;
  showAttendanceRate?: boolean;
}

// ─── Color Helpers ──────────────────────────────────────────────────────────
const getRateColor = (rate: number): string => {
  if (rate >= 95) return "#16a34a";
  if (rate >= 85) return "#ca8a04";
  if (rate >= 70) return "#f97316";
  return "#dc2626";
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AttendanceCalendar({
  monthData,
  isLoading,
  error,
  onMonthChange,
  onExport,
  onDayClick,
  onBackToList,
  showWeekends = true,
  showAttendanceRate = true,
}: AttendanceCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const prevMonth = () => {
    if (monthData) {
      if (monthData.month === 0) {
        onMonthChange(11, monthData.year - 1);
      } else {
        onMonthChange(monthData.month - 1, monthData.year);
      }
      setSelectedDay(null);
    }
  };

  const nextMonth = () => {
    if (monthData) {
      if (monthData.month === 11) {
        onMonthChange(0, monthData.year + 1);
      } else {
        onMonthChange(monthData.month + 1, monthData.year);
      }
      setSelectedDay(null);
    }
  };

  const handleExport = () => {
    if (monthData) {
      onExport(monthData.month, monthData.year);
    }
  };

  const allDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayLabels = showWeekends ? allDayLabels : allDayLabels.slice(1, 6);

  const buildGrid = () => {
    if (!monthData) return [];
    const cells: (CalendarDayData | null)[] = [];

    if (showWeekends) {
      for (let i = 0; i < monthData.startingDay; i++) {
        cells.push(null);
      }
      monthData.days.forEach(d => cells.push(d));
    } else {
      const startAdj = Math.max(0, monthData.startingDay - 1);
      for (let i = 0; i < startAdj; i++) {
        cells.push(null);
      }
      monthData.days.filter(d => !d.isWeekend).forEach(d => cells.push(d));
    }
    return cells;
  };

  const grid = buildGrid();
  const cols = showWeekends ? 7 : 5;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
      padding: "24px 16px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .day-cell { transition: background 0.15s, box-shadow 0.15s, transform 0.1s; cursor: pointer; }
        .day-cell:hover { transform: translateY(-1px); }
        .nav-btn { transition: background 0.15s, color 0.15s, transform 0.1s; }
        .nav-btn:hover { transform: translateY(-1px); }
        .badge-pill { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 999px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
        .rate-bar { height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
        .rate-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Title Bar ── */}
        <div style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {onBackToList && (
              <button
                onClick={onBackToList}
                className="nav-btn"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to List</span>
              </button>
            )}
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#6b7280",
                textTransform: "uppercase",
                marginBottom: 4
              }}>
                HR Dashboard
              </div>
              <h1 style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em"
              }}>
                Attendance Calendar
              </h1>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "14px 20px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="nav-btn"
              onClick={prevMonth}
              style={{
                width: 34,
                height: 34,
                border: "1px solid #e5e7eb",
                background: "white",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ minWidth: 160, textAlign: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>
                {monthData?.monthName}
              </span>
              <span style={{ fontSize: 18, fontWeight: 300, color: "#6b7280", marginLeft: 8 }}>
                {monthData?.year}
              </span>
            </div>
            <button
              className="nav-btn"
              onClick={nextMonth}
              style={{
                width: 34,
                height: 34,
                border: "1px solid #e5e7eb",
                background: "white",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="nav-btn"
              onClick={handleExport}
              style={{
                padding: "6px 14px",
                border: "1px solid #e5e7eb",
                background: "#f8fafc",
                color: "#374151",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Summary Row ── */}
        {monthData && !isLoading && (
          <div className="fade-in" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            marginBottom: 16
          }}>
            {[
              {
                label: "Avg Attendance",
                value: `${monthData.summary.averageAttendanceRate}%`,
                color: getRateColor(monthData.summary.averageAttendanceRate),
                icon: <TrendingUp size={14} />
              },
              {
                label: "Working Days",
                value: monthData.summary.totalWorkingDays,
                color: "#374151",
                icon: <CalendarDays size={14} />
              },
              {
                label: "Holidays",
                value: monthData.summary.totalHolidays,
                color: "#dc2626",
                icon: <Gift size={14} />
              },
              {
                label: "Best Day",
                value: monthData.summary.bestDay ? `${monthData.summary.bestDay.attendanceRate}%` : "—",
                color: "#16a34a",
                icon: <CheckCircle2 size={14} />
              },
              {
                label: "Total Absent",
                value: monthData.summary.totalAbsentDays,
                color: "#dc2626",
                icon: <Users size={14} />
              },
            ].map(s => (
              <div key={s.label} style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "16px 20px"
              }}>
                <div style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontWeight: 500,
                  marginBottom: 6,
                  display: "flex",
                  gap: 4,
                  alignItems: "center"
                }}>
                  {s.icon}
                  <span>{s.label}</span>
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: "-0.02em"
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Calendar Grid ── */}
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden"
        }}>

          {/* Day Headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            borderBottom: "1px solid #e5e7eb"
          }}>
            {dayLabels.map(d => (
              <div key={d} style={{
                padding: "10px 0",
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#9ca3af",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "#fafafa"
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div
                className="spinner"
                style={{
                  width: 32,
                  height: 32,
                  border: "3px solid #e5e7eb",
                  borderTop: "3px solid #3b82f6",
                  borderRadius: "50%",
                  margin: "0 auto 12px"
                }}
              />
              <div style={{ color: "#9ca3af", fontSize: 14 }}>
                Loading attendance data...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div style={{ padding: 60, textAlign: "center" }}>
              <AlertCircle size={48} style={{ color: "#dc2626", margin: "0 auto 12px" }} />
              <div style={{ color: "#dc2626", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                Error Loading Data
              </div>
              <div style={{ color: "#9ca3af", fontSize: 14 }}>{error}</div>
            </div>
          )}

          {/* Grid */}
          {!isLoading && monthData && (
            <div className="fade-in" style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`
            }}>
              {grid.map((day, idx) => {
                if (!day) return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      minHeight: 110,
                      background: "#fafafa",
                      borderRight: "1px solid #f1f5f9",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                  />
                );

                const isSelected = selectedDay?.date === day.date;
                const isHovered = hoveredDay === day.date;
                let bg = "white";
                if (day.isHoliday) bg = "#fef2f2";
                else if (day.isWeekend) bg = "#f9fafb";
                else if (day.isToday) bg = "#eff6ff";
                if (isSelected) bg = "#e0f2fe";
                if (isHovered && !isSelected) bg = "#f8fafc";

                const border = day.isToday
                  ? "2px solid #3b82f6"
                  : isSelected
                    ? "2px solid #0ea5e9"
                    : "1px solid #f1f5f9";

                return (
                  <div
                    key={day.date}
                    className="day-cell"
                    onClick={() => {
                      setSelectedDay(isSelected ? null : day);
                      onDayClick?.(day);
                    }}
                    onMouseEnter={() => setHoveredDay(day.date)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      minHeight: 110,
                      background: bg,
                      border,
                      padding: "8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      position: "relative"
                    }}
                  >
                    {/* Day Number */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: day.isToday ? "#2563eb" : day.isWeekend ? "#9ca3af" : "#374151",
                        fontFamily: "'DM Mono', monospace"
                      }}>
                        {day.dayOfMonth}
                      </span>
                      {day.isToday && (
                        <span style={{
                          fontSize: 9,
                          background: "#2563eb",
                          color: "white",
                          borderRadius: 4,
                          padding: "1px 5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em"
                        }}>
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Holiday Name */}
                    {day.isHoliday && (
                      <div style={{
                        fontSize: 10,
                        color: "#dc2626",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        display: "flex",
                        gap: 3,
                        alignItems: "center"
                      }}>
                        <Gift size={10} />
                        <span style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {day.holidayName}
                        </span>
                      </div>
                    )}

                    {/* Weekend indicator */}
                    {day.isWeekend && !day.isHoliday && (
                      <div style={{
                        fontSize: 9,
                        color: "#9ca3af",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        display: "flex",
                        alignItems: "center",
                        gap: 3
                      }}>
                        <CalendarIcon size={8} />
                        <span>Weekend</span>
                      </div>
                    )}

                    {/* Attendance Badges */}
                    {day.totalStaff > 0 && (day.present > 0 || day.late > 0 || day.onLeave > 0 || day.absent > 0) && (
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        marginTop: 2
                      }}>
                        {day.present > 0 && (
                          <span className="badge-pill" style={{ background: "#dcfce7", color: "#16a34a" }}>
                            <CheckCircle2 size={10} /> {day.present}
                          </span>
                        )}
                        {day.absent > 0 && (
                          <span className="badge-pill" style={{ background: "#fee2e2", color: "#dc2626" }}>
                            <XCircle size={10} /> {day.absent}
                          </span>
                        )}
                        {day.late > 0 && (
                          <span className="badge-pill" style={{ background: "#fef3c7", color: "#ca8a04" }}>
                            <Clock size={10} /> {day.late}
                          </span>
                        )}
                        {day.onLeave > 0 && (
                          <span className="badge-pill" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            <Plane size={10} /> {day.onLeave}
                          </span>
                        )}
                      </div>
                    )}

                    {/* No data indicator */}
                    {day.totalStaff > 0 && day.present === 0 && day.late === 0 && day.onLeave === 0 && day.absent === 0 && !day.isWeekend && !day.isHoliday && (
                      <div style={{
                        fontSize: 9,
                        color: "#9ca3af",
                        fontWeight: 500,
                        textAlign: "center",
                        marginTop: 8
                      }}>
                        No data
                      </div>
                    )}

                    {/* Attendance Rate Bar */}
                    {showAttendanceRate && !day.isWeekend && day.attendanceRate > 0 && (
                      <div style={{ marginTop: "auto" }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 2
                        }}>
                          <span style={{
                            fontSize: 10,
                            color: getRateColor(day.attendanceRate),
                            fontWeight: 700,
                            fontFamily: "'DM Mono', monospace"
                          }}>
                            {day.attendanceRate}%
                          </span>
                        </div>
                        <div className="rate-bar">
                          <div
                            className="rate-fill"
                            style={{
                              width: `${day.attendanceRate}%`,
                              background: getRateColor(day.attendanceRate)
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Selected Day Detail ── */}
        {selectedDay && !selectedDay.isWeekend && (
          <div className="fade-in" style={{
            marginTop: 16,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "20px 24px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16
            }}>
              <div>
                <div style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 2
                }}>
                  Selected Day
                </div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111827"
                }}>
                  {new Date(selectedDay.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                  {selectedDay.isHoliday && (
                    <span style={{
                      marginLeft: 10,
                      fontSize: 13,
                      color: "#dc2626",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <Gift size={13} /> {selectedDay.holidayName}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#9ca3af"
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 12
            }}>
              {[
                { label: "Present", value: selectedDay.present, bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle2 size={14} /> },
                { label: "Absent", value: selectedDay.absent, bg: "#fee2e2", color: "#dc2626", icon: <XCircle size={14} /> },
                { label: "Late", value: selectedDay.late, bg: "#fef3c7", color: "#ca8a04", icon: <Clock size={14} /> },
                { label: "On Leave", value: selectedDay.onLeave, bg: "#dbeafe", color: "#2563eb", icon: <Plane size={14} /> },
                { label: "Total Staff", value: selectedDay.totalStaff, bg: "#f3f4f6", color: "#374151", icon: <Users size={14} /> },
                { label: "Rate", value: `${selectedDay.attendanceRate}%`, bg: "#f3f4f6", color: getRateColor(selectedDay.attendanceRate), icon: <TrendingUp size={14} /> },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg,
                  borderRadius: 8,
                  padding: "10px 14px"
                }}>
                  <div style={{
                    fontSize: 10,
                    color: s.color,
                    fontWeight: 600,
                    opacity: 0.7,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}>
                    {s.icon}
                    {s.label}
                  </div>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: s.color,
                    fontFamily: "'DM Mono', monospace"
                  }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Legend ── */}
        <div style={{
          marginTop: 16,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "14px 20px"
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9ca3af",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10
          }}>
            Legend
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {[
              { icon: <CheckCircle2 size={12} />, bg: "#dcfce7", color: "#16a34a", label: "Present" },
              { icon: <XCircle size={12} />, bg: "#fee2e2", color: "#dc2626", label: "Absent" },
              { icon: <Clock size={12} />, bg: "#fef3c7", color: "#ca8a04", label: "Late" },
              { icon: <Plane size={12} />, bg: "#dbeafe", color: "#2563eb", label: "Leave" },
              { icon: <Gift size={12} />, bg: "#fef2f2", color: "#dc2626", label: "Holiday" },
              { icon: <CalendarIcon size={12} />, bg: "#f9fafb", color: "#9ca3af", label: "Weekend" },
              { icon: <CalendarIcon size={12} />, bg: "#eff6ff", color: "#2563eb", label: "Today" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span className="badge-pill" style={{ background: l.bg, color: l.color }}>
                  {l.icon}
                </span>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
