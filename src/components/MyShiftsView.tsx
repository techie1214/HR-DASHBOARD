// src/components/MyShiftsView.tsx
// My Shifts View - For employees to view their assigned shifts

import React, { useState, useEffect } from 'react';
import { myShiftsService, ShiftAssignment, UpcomingShift } from '../services/myShiftsService';
import {
  Calendar, Clock, Users, TrendingUp, CheckCircle, AlertCircle,
  ChevronRight, ChevronLeft, Sun, Moon, Coffee, Timer
} from 'lucide-react';

// Design tokens
const colors = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryPale: '#eff6ff',
  primaryBorder: '#bfdbfe',
  accent: '#d97706',
  accentLight: '#fbbf24',
  accentPale: '#fffbeb',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  surfaceMuted: '#f1f5f9',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  success: '#059669',
  successPale: '#ecfdf5',
  successBorder: '#a7f3d0',
  warning: '#d97706',
  warningPale: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#dc2626',
  dangerPale: '#fef2f2',
  dangerBorder: '#fecaca',
  purple: '#7c3aed',
  purplePale: '#f5f3ff',
  purpleBorder: '#ddd6fe',
};

const card: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontFamily: 'inherit',
};

const badge = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.25rem 0.6rem',
  background: bg,
  color: color,
  borderRadius: '99px',
  fontSize: '0.72rem',
  fontWeight: 600,
});

const MyShiftsView = () => {
  const [activeTab, setActiveTab] = useState<'my-shifts' | 'upcoming' | 'team'>('my-shifts');
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<UpcomingShift[]>([]);
  const [teamShifts, setTeamShifts] = useState<any>({});
  const [stats, setStats] = useState({ total: 0, active: 0, upcomingCount: 0 });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-shifts') {
        const result = await myShiftsService.getMyShifts();
        if (result.success && result.data) {
          setAssignments(result.data.assignments || []);
          setStats({
            total: result.data.total || 0,
            active: result.data.activeCount || 0,
            upcomingCount: 0
          });
        }
      } else if (activeTab === 'upcoming') {
        const result = await myShiftsService.getMyUpcomingShifts(30);
        if (result.success && result.data) {
          setUpcomingShifts(result.data.shifts || []);
          setStats({
            total: 0,
            active: 0,
            upcomingCount: result.data.shifts?.length || 0
          });
        }
      } else if (activeTab === 'team') {
        const result = await myShiftsService.getTeamShifts();
        if (result.success && result.data) {
          setTeamShifts(result.data.shiftsByDepartment || {});
        }
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftTypeIcon = (shiftType: string) => {
    switch (shiftType.toLowerCase()) {
      case 'morning': return Sun;
      case 'afternoon': return Clock;
      case 'night': return Moon;
      default: return Clock;
    }
  };

  const getShiftTypeColors = (shiftType: string) => {
    switch (shiftType.toLowerCase()) {
      case 'morning': return { bg: colors.successPale, color: colors.success, icon: Sun };
      case 'afternoon': return { bg: colors.accentPale, color: colors.accent, icon: Clock };
      case 'night': return { bg: colors.primaryPale, color: colors.primary, icon: Moon };
      default: return { bg: colors.surfaceMuted, color: colors.textSecondary, icon: Clock };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
  };

  const renderMyShiftsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Info Box */}
      <div style={{ padding: '1rem', background: colors.primaryPale, border: `1px solid ${colors.primaryBorder}`, borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textPrimary, lineHeight: 1.5 }}>
          <strong>Your Shift Assignments:</strong> View all your assigned shifts, schedules, and exceptions.
          This shows when you're expected to clock in and out.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
        <StatCard
          icon={Calendar}
          label="Total Assignments"
          value={stats.total}
          accent={colors.primary}
          pale={colors.primaryPale}
        />
        <StatCard
          icon={CheckCircle}
          label="Active"
          value={stats.active}
          accent={colors.success}
          pale={colors.successPale}
        />
      </div>

      {/* Assignments Table */}
      <div style={card}>
        <div style={{ padding: '1.25rem', borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>My Shift Assignments</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Your scheduled working hours</p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No shift assignments yet"
            sub="Your manager will assign shifts to you soon"
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.surfaceAlt }}>
                  <Th>Shift</Th>
                  <Th>Hours</Th>
                  <Th>Break</Th>
                  <Th>Period</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Pattern</Th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => {
                  const shiftColors = getShiftTypeColors(a.shiftType);
                  const Icon = shiftColors.icon;
                  return (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.25rem', height: '2.25rem', borderRadius: '8px',
                            background: shiftColors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Icon size={14} color={shiftColors.color} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{a.templateName}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: colors.textMuted }}>{a.shiftType}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textPrimary }}>
                          {formatTime(a.startTime)} - {formatTime(a.endTime)}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{a.breakDuration} min</span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                            From: {formatDate(a.effectiveFrom)}
                          </span>
                          {a.effectiveTo ? (
                            <span style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                              To: {formatDate(a.effectiveTo)}
                            </span>
                          ) : (
                            <span style={badge(colors.successPale, colors.success)}>Ongoing</span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <span style={badge(colors.purplePale, colors.purple)}>{a.assignmentType}</span>
                      </Td>
                      <Td>
                        <span style={badge(
                          a.status === 'active' ? colors.successPale : colors.surfaceMuted,
                          a.status === 'active' ? colors.success : colors.textMuted
                        )}>
                          {a.status}
                        </span>
                      </Td>
                      <Td>
                        {a.recurrencePattern && a.recurrencePattern !== 'none' ? (
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {a.recurrenceDays.slice(0, 3).map((day: string) => (
                              <span key={day} style={{
                                padding: '0.15rem 0.45rem',
                                background: colors.surfaceMuted,
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: colors.textSecondary
                              }}>
                                {day.substring(0, 3)}
                              </span>
                            ))}
                            {a.recurrenceDays.length > 3 && (
                              <span style={{ fontSize: '0.7rem', color: colors.textMuted }}>
                                +{a.recurrenceDays.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>One-time</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderUpcomingTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Info Box */}
      <div style={{ padding: '1rem', background: colors.accentPale, border: `1px solid ${colors.accentBorder}`, borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textPrimary, lineHeight: 1.5 }}>
          <strong>Upcoming Shifts:</strong> Your schedule for the next 30 days.
          Green = Regular shift, Orange = Exception/special schedule.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
        <StatCard
          icon={Calendar}
          label="Days Scheduled"
          value={stats.upcomingCount}
          accent={colors.accent}
          pale={colors.accentPale}
        />
      </div>

      {/* Calendar View */}
      <div style={card}>
        <div style={{ padding: '1.25rem', borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>Next 30 Days</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Your upcoming work schedule</p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
        ) : upcomingShifts.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming shifts"
            sub="You have no shifts scheduled for the next 30 days"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', padding: '1.25rem' }}>
            {upcomingShifts.map((shift, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: shift.isException ? colors.accentPale : colors.surface,
                  border: `1px solid ${shift.isException ? colors.accentBorder : colors.border}`,
                  borderRadius: '8px',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>
                    {formatDate(shift.date)}
                  </span>
                  {shift.isException && (
                    <span style={badge(colors.accentPale, colors.accent)}>
                      <AlertCircle size={12} />
                      Exception
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={16} color={shift.isException ? colors.accent : colors.primary} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary }}>
                  {shift.templateName}
                </p>
                {shift.breakDuration && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                    <Coffee size={12} color={colors.textMuted} />
                    <span style={{ fontSize: '0.7rem', color: colors.textMuted }}>
                      {shift.breakDuration} min break
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Info Box */}
      <div style={{ padding: '1rem', background: colors.purplePale, border: `1px solid ${colors.purpleBorder}`, borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textPrimary, lineHeight: 1.5 }}>
          <strong>Team Shifts:</strong> View shift assignments for your department.
          Shows who is scheduled to work and their shifts.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>Loading...</div>
      ) : Object.keys(teamShifts).length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team shifts found"
          sub="Your team hasn't been assigned shifts yet"
        />
      ) : (
        Object.entries(teamShifts).map(([department, shifts]: [string, any]) => (
          <div key={department} style={card}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${colors.border}`, background: colors.surfaceAlt }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color={colors.primary} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary }}>
                  {department || 'Unassigned'}
                </h3>
                <span style={badge(colors.primaryPale, colors.primary)}>
                  {shifts.length} member{shifts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                {shifts.map((member: any) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '1rem',
                      background: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                        background: colors.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.primary }}>
                          {member.userName.charAt(0)}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary, fontSize: '0.875rem' }}>
                          {member.userName}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: colors.textMuted }}>
                          {member.userEmail}
                        </p>
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={14} color={colors.textMuted} />
                        <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                          {formatTime(member.startTime)} - {formatTime(member.endTime)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textMuted }}>
                        {member.templateName}
                      </p>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={badge(colors.successPale, colors.success)}>
                          <CheckCircle size={10} />
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', background: colors.surfaceMuted, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary }}>My Shifts</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: colors.textMuted }}>
          View your assigned shifts and upcoming schedule
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <TabButton
          active={activeTab === 'my-shifts'}
          onClick={() => setActiveTab('my-shifts')}
          icon={Calendar}
          label="My Shifts"
        />
        <TabButton
          active={activeTab === 'upcoming'}
          onClick={() => setActiveTab('upcoming')}
          icon={TrendingUp}
          label="Upcoming"
        />
        <TabButton
          active={activeTab === 'team'}
          onClick={() => setActiveTab('team')}
          icon={Users}
          label="Team"
        />
      </div>

      {/* Content */}
      {activeTab === 'my-shifts' && renderMyShiftsTab()}
      {activeTab === 'upcoming' && renderUpcomingTab()}
      {activeTab === 'team' && renderTeamTab()}
    </div>
  );
};

// Helper Components

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.6rem 1rem',
      background: active ? colors.primary : colors.surface,
      color: active ? '#fff' : colors.textSecondary,
      border: `1px solid ${active ? colors.primary : colors.border}`,
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s',
      fontFamily: 'inherit',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = colors.surfaceAlt;
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = colors.surface;
      }
    }}
  >
    <Icon size={16} />
    {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, accent, pale }: any) => (
  <div style={{
    padding: '1.25rem',
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <div style={{
      width: '3rem', height: '3rem', borderRadius: '10px',
      background: pale, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={20} color={accent} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textMuted, fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary }}>{value}</p>
    </div>
  </div>
);

const Th = ({ children, right }: any) => (
  <th style={{
    padding: '0.75rem 1rem',
    textAlign: right ? 'right' : 'left',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.textMuted,
    borderBottom: `2px solid ${colors.border}`
  }}>
    {children}
  </th>
);

const Td = ({ children, right }: any) => (
  <td style={{
    padding: '1rem',
    textAlign: right ? 'right' : 'left',
    color: colors.textPrimary,
    verticalAlign: 'middle'
  }}>
    {children}
  </td>
);

const EmptyState = ({ icon: Icon, title, sub }: any) => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <div style={{
      width: '4rem', height: '4rem', borderRadius: '50%',
      background: colors.primaryPale, border: `1px solid ${colors.primaryBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 1rem'
    }}>
      <Icon size={22} color={colors.primary} />
    </div>
    <p style={{ fontWeight: 600, color: colors.textPrimary, margin: '0 0 0.3rem' }}>{title}</p>
    <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: 0 }}>{sub}</p>
  </div>
);

export default MyShiftsView;
