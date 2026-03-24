// src/components/ShiftSchedulingView.tsx
// Enhanced Shift Scheduling — Restyled with refined industrial-precision aesthetic

import React, { useState, useEffect, useMemo } from 'react';
import {
  shiftSchedulingService,
  ShiftTemplate,
  EmployeeShiftAssignment,
  CreateShiftTemplateRequest,
  AssignShiftToEmployeeRequest,
  ShiftException,
  CreateShiftExceptionRequest
} from '../services/shiftSchedulingService';
import { getAllStaff } from '../services/staffManagementService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import { exceptionTypeService, ExceptionType } from '../services/exceptionTypeService';
import {
  Calendar, Clock, Settings, Plus, Edit3, Trash2, Users, Building,
  RotateCcw, CheckCircle, AlertCircle, TrendingUp, Copy, Zap, Sun,
  Moon, Coffee, Timer, ChevronRight, X, Save, Sparkles
} from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  department?: string;
  branch_id?: number;
}

interface TemplateWithStats extends ShiftTemplate {
  assignmentCount?: number;
  hoursPerDay?: number;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const colors = {
  // Primary slate-blue palette
  primary:        '#1e40af',
  primaryLight:   '#3b82f6',
  primaryPale:    '#eff6ff',
  primaryBorder:  '#bfdbfe',
  // Accent — warm amber
  accent:         '#d97706',
  accentLight:    '#fbbf24',
  accentPale:     '#fffbeb',
  // Surface
  surface:        '#ffffff',
  surfaceAlt:     '#f8fafc',
  surfaceMuted:   '#f1f5f9',
  // Borders
  border:         '#e2e8f0',
  borderStrong:   '#cbd5e1',
  // Text
  textPrimary:    '#0f172a',
  textSecondary:  '#475569',
  textMuted:      '#94a3b8',
  // Semantic
  success:        '#059669',
  successPale:    '#ecfdf5',
  successBorder:  '#a7f3d0',
  warning:        '#d97706',
  warningPale:    '#fffbeb',
  warningBorder:  '#fde68a',
  danger:         '#dc2626',
  dangerPale:     '#fef2f2',
  dangerBorder:   '#fecaca',
  purple:         '#7c3aed',
  purplePale:     '#f5f3ff',
  purpleBorder:   '#ddd6fe',
};

// Shared inline style helpers
const card: React.CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border: `1.5px solid ${colors.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: colors.textPrimary,
  background: colors.surface,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: '0.4rem',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.55rem 1.1rem',
  background: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s, transform 0.1s, box-shadow 0.15s',
  boxShadow: `0 1px 3px rgba(30,64,175,0.3)`,
  fontFamily: 'inherit',
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.55rem 1.1rem',
  background: colors.surface,
  color: colors.textSecondary,
  border: `1.5px solid ${colors.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s',
  fontFamily: 'inherit',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.4rem',
  background: 'transparent',
  color: colors.textMuted,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background 0.12s, color 0.12s',
  fontFamily: 'inherit',
};

const badge = (bg: string, text: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.2rem 0.65rem',
  borderRadius: '100px',
  fontSize: '0.72rem',
  fontWeight: 600,
  background: bg,
  color: text,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
});

const statCard = (accentColor: string, paleBg: string): React.CSSProperties => ({
  ...card,
  padding: '1.1rem 1.25rem',
  borderTop: `3px solid ${accentColor}`,
  background: paleBg,
  cursor: 'default',
  transition: 'box-shadow 0.15s, transform 0.15s',
});

// ─── Component ────────────────────────────────────────────────────────────────

const ShiftSchedulingView = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'assignments' | 'exceptions' | 'types'>('templates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [templates, setTemplates] = useState<TemplateWithStats[]>([]);
  const [assignments, setAssignments] = useState<EmployeeShiftAssignment[]>([]);
  const [exceptions, setExceptions] = useState<ShiftException[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [exceptionTypes, setExceptionTypes] = useState<ExceptionType[]>([]);

  const [exceptionFilter, setExceptionFilter] = useState<'all' | 'active' | 'pending'>('all');

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    start_time: '08:00:00',
    end_time: '17:00:00',
    break_duration_minutes: 60,
    recurrence_pattern: 'weekly',
    recurrence_days: '["monday","tuesday","wednesday","thursday","friday"]',
  });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeShiftAssignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    user_id: 0,
    shift_template_id: 0,
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    assignment_type: 'permanent' as 'permanent' | 'temporary' | 'rotating',
    recurrence_pattern: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    recurrence_day_of_week: '',
    recurrence_end_date: '',
  });

  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [editingException, setEditingException] = useState<ShiftException | null>(null);
  const [exceptionForm, setExceptionForm] = useState<CreateShiftExceptionRequest & { exception_type_id?: number }>({
    user_id: 0,
    exception_date: new Date().toISOString().split('T')[0],
    exception_type: 'special_schedule',
    exception_type_id: undefined,
    new_start_time: '09:00:00',
    new_end_time: '17:00:00',
    new_break_duration_minutes: 60,
    reason: '',
    status: 'active',
  });

  const [isRecurringException, setIsRecurringException] = useState(false);
  const [bulkExceptionDates, setBulkExceptionDates] = useState<Date[]>([]);
  const [bulkExceptionConfig, setBulkExceptionConfig] = useState({
    recurrence_pattern: 'weekly' as 'daily' | 'weekly' | 'custom',
    recurrence_days: [] as string[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

  const toggleDay = (day: string) => {
    const current = JSON.parse(templateForm.recurrence_days);
    const updated = current.includes(day) ? current.filter((d: string) => d !== day) : [...current, day];
    setTemplateForm({ ...templateForm, recurrence_days: JSON.stringify(updated) });
  };
  const hasDay = (day: string) => JSON.parse(templateForm.recurrence_days).includes(day);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, branchesRes, typesRes] = await Promise.all([
        getAllStaff(1, 1000),
        getAllBranches(),
        exceptionTypeService.getExceptionTypes(true)
      ]);
      if (staffRes.success && staffRes.staff) {
        setStaffMembers(staffRes.staff.map((s: any) => ({
          id: s.id,
          name: [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ') || s.email,
          email: s.work_email || s.email,
          department: s.department,
          branch_id: s.branch_id
        })));
      }
      if (branchesRes.success && branchesRes.branches) setBranches(branchesRes.branches);
      if (typesRes.success && typesRes.data) {
        setExceptionTypes(typesRes.data.exceptionTypes || []);
        if (typesRes.data.exceptionTypes?.length > 0 && !exceptionForm.exception_type_id) {
          setExceptionForm(prev => ({ ...prev, exception_type_id: typesRes.data.exceptionTypes[0].id }));
        }
      }
      if (activeTab === 'templates') {
        const res = await shiftSchedulingService.getShiftTemplates();
        if (res.success && res.data) {
          setTemplates((res.data.shiftTemplates || []).map((t: ShiftTemplate) => ({
            ...t,
            assignmentCount: assignments.filter(a => a.shift_template_id === t.id).length,
            hoursPerDay: calculateHours(t.start_time, t.end_time, t.break_duration_minutes)
          })));
        }
      } else if (activeTab === 'assignments') {
        const res = await shiftSchedulingService.getEmployeeShiftAssignments();
        if (res.success && res.data) setAssignments(res.data.employeeShiftAssignments || []);
      } else if (activeTab === 'exceptions') {
        const res = await shiftSchedulingService.getAllShiftExceptions();
        if (res.success && res.data) setExceptions(res.data.exceptions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (start: string, end: string, breakMin: number) => {
    const s = new Date(`2000-01-01T${start}`);
    let e = new Date(`2000-01-01T${end}`);
    if (e < s) e = new Date(`2000-01-02T${end}`);
    return Math.max(0, parseFloat(((e.getTime() - s.getTime() - breakMin * 60000) / 3600000).toFixed(2)));
  };

  const getShiftType = (start: string, end: string) => {
    const h = parseInt(start.split(':')[0]);
    if (h >= 5 && h < 12) return { type: 'Morning', color: '#b45309', bg: '#fef3c7', icon: Sun };
    if (h >= 12 && h < 17) return { type: 'Afternoon', color: '#0369a1', bg: '#e0f2fe', icon: Coffee };
    return { type: 'Night', color: '#4338ca', bg: '#eef2ff', icon: Moon };
  };

  const detectConflict = (userId: number, startDate: string, endDate: string, excludeId?: number) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    return assignments.find(a => {
      if (a.id === excludeId || a.user_id !== userId || a.status !== 'active') return false;
      const aStart = new Date(a.effective_from);
      const aEnd = a.effective_to ? new Date(a.effective_to) : null;
      let overlap = false;
      if (end && aEnd) overlap = start <= aEnd && end >= aStart;
      else overlap = start >= aStart && (!aEnd || start <= aEnd);
      if (!overlap) return false;
      const et = templates.find(t => t.id === a.shift_template_id);
      const nt = templates.find(t => t.id === assignmentForm.shift_template_id);
      if (et && nt && et.recurrence_days && nt.recurrence_days) {
        try {
          const ed = JSON.parse(et.recurrence_days), nd = JSON.parse(nt.recurrence_days);
          if (ed.filter((d: string) => nd.includes(d)).length === 0) return false;
        } catch {}
      }
      return true;
    });
  };

  // ─── Template handlers ───────────────────────────────────────────────────
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await shiftSchedulingService.createShiftTemplate({
        name: templateForm.name, start_time: templateForm.start_time,
        end_time: templateForm.end_time, break_duration_minutes: templateForm.break_duration_minutes,
        recurrence_pattern: templateForm.recurrence_pattern, recurrence_days: templateForm.recurrence_days,
      });
      if (res.success) { setSuccessMessage('Shift template created successfully'); setShowTemplateModal(false); resetTemplateForm(); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed to create template');
    } catch (err: any) { setError(err.message || 'Failed to create template'); } finally { setLoading(false); }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingTemplate) return; setLoading(true);
    try {
      const res = await shiftSchedulingService.updateShiftTemplate(editingTemplate.id, templateForm);
      if (res.success) { setSuccessMessage('Shift template updated'); setShowTemplateModal(false); setEditingTemplate(null); resetTemplateForm(); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed to update template');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Delete this shift template?')) return; setLoading(true);
    try {
      const res = await shiftSchedulingService.deleteShiftTemplate(id);
      if (res.success) { setSuccessMessage('Template deleted'); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const resetTemplateForm = () => {
    setTemplateForm({ name: '', start_time: '08:00:00', end_time: '17:00:00', break_duration_minutes: 60, recurrence_pattern: 'weekly', recurrence_days: '["monday","tuesday","wednesday","thursday","friday"]' });
    setEditingTemplate(null);
  };

  const openEditTemplate = (t: ShiftTemplate) => {
    setEditingTemplate(t);
    setTemplateForm({ name: t.name, start_time: t.start_time, end_time: t.end_time, break_duration_minutes: t.break_duration_minutes, recurrence_pattern: t.recurrence_pattern || 'weekly', recurrence_days: t.recurrence_days || '["monday","tuesday","wednesday","thursday","friday"]' });
    setShowTemplateModal(true);
  };

  // ─── Assignment handlers ─────────────────────────────────────────────────
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = detectConflict(assignmentForm.user_id, assignmentForm.effective_from, assignmentForm.effective_to || '');
    if (conflict) { setError('This employee already has an active shift during this period.'); return; }
    setLoading(true);
    try {
      const res = await shiftSchedulingService.assignShiftToEmployee({ user_id: assignmentForm.user_id, shift_template_id: assignmentForm.shift_template_id, effective_from: assignmentForm.effective_from, effective_to: assignmentForm.effective_to || null });
      if (res.success) { setSuccessMessage('Assignment created'); setShowAssignmentModal(false); resetAssignmentForm(); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({ user_id: 0, shift_template_id: 0, effective_from: new Date().toISOString().split('T')[0], effective_to: '', assignment_type: 'permanent', recurrence_pattern: 'none', recurrence_day_of_week: '', recurrence_end_date: '' });
    setEditingAssignment(null);
  };

  // ─── Exception handlers ──────────────────────────────────────────────────
  const handleCreateException = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await shiftSchedulingService.createShiftException(exceptionForm);
      if (res.success) { setSuccessMessage('Exception created'); setShowExceptionModal(false); resetExceptionForm(); loadData(); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleUpdateException = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingException) return; setLoading(true);
    try {
      const res = await shiftSchedulingService.updateShiftException(editingException.id, exceptionForm);
      if (res.success) { setSuccessMessage('Exception updated'); setShowExceptionModal(false); resetExceptionForm(); loadData(); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleDeleteException = async (id: number) => {
    if (!confirm('Delete this exception?')) return; setLoading(true);
    try {
      const res = await shiftSchedulingService.deleteShiftException(id);
      if (res.success) { setSuccessMessage('Exception deleted'); loadData(); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const resetExceptionForm = () => {
    setExceptionForm({ user_id: 0, exception_date: new Date().toISOString().split('T')[0], exception_type: 'special_schedule', new_start_time: '09:00:00', new_end_time: '17:00:00', new_break_duration_minutes: 60, reason: '', status: 'active' });
    setEditingException(null); setIsRecurringException(false); setBulkExceptionDates([]);
    setBulkExceptionConfig({ recurrence_pattern: 'weekly', recurrence_days: [], start_date: new Date().toISOString().split('T')[0], end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
  };

  // ─── Exception type handlers ─────────────────────────────────────────────
  const [showExceptionTypeModal, setShowExceptionTypeModal] = useState(false);
  const [editingExceptionType, setEditingExceptionType] = useState<ExceptionType | null>(null);
  const [exceptionTypeForm, setExceptionTypeForm] = useState({ name: '', code: '', description: '', icon: 'AlertCircle', color: 'bg-gray-100 text-gray-700', default_start_time: '', default_end_time: '', default_break_duration: 60 });

  const resetExceptionTypeForm = () => { setExceptionTypeForm({ name: '', code: '', description: '', icon: 'AlertCircle', color: 'bg-gray-100 text-gray-700', default_start_time: '', default_end_time: '', default_break_duration: 60 }); setEditingExceptionType(null); };

  const handleCreateExceptionType = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await exceptionTypeService.createExceptionType(exceptionTypeForm);
      if (res.success) { setSuccessMessage('Exception type created'); setShowExceptionTypeModal(false); resetExceptionTypeForm(); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleUpdateExceptionType = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingExceptionType) return; setLoading(true);
    try {
      const res = await exceptionTypeService.updateExceptionType(editingExceptionType.id, exceptionTypeForm);
      if (res.success) { setSuccessMessage('Exception type updated'); setShowExceptionTypeModal(false); resetExceptionTypeForm(); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleDeleteExceptionType = async (id: number) => {
    if (!confirm('Delete this exception type?')) return; setLoading(true);
    try {
      const res = await exceptionTypeService.deleteExceptionType(id);
      if (res.success) { setSuccessMessage('Exception type deleted'); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleToggleExceptionType = async (id: number) => {
    setLoading(true);
    try {
      const res = await exceptionTypeService.toggleExceptionTypeActive(id);
      if (res.success) { setSuccessMessage(`Type ${res.data.exceptionType.is_active ? 'activated' : 'deactivated'}`); loadData(); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(res.message || 'Failed');
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const openEditExceptionType = (type: ExceptionType) => {
    setEditingExceptionType(type);
    setExceptionTypeForm({ name: type.name, code: type.code, description: type.description || '', icon: type.icon, color: type.color, default_start_time: type.default_start_time || '', default_end_time: type.default_end_time || '', default_break_duration: type.default_break_duration });
    setShowExceptionTypeModal(true);
  };

  const calculateBulkExceptionDates = () => {
    const dates: Date[] = [];
    const start = new Date(bulkExceptionConfig.start_date);
    const end = new Date(bulkExceptionConfig.end_date);
    const sel = bulkExceptionConfig.recurrence_days;
    let cur = new Date(start);
    while (cur <= end) {
      const d = cur.toLocaleDateString('en-US', { weekday: 'lowercase' });
      if (bulkExceptionConfig.recurrence_pattern === 'daily' || sel.includes(d)) dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    setBulkExceptionDates(dates);
    return dates;
  };

  const handleCreateBulkExceptions = async () => {
    if (!bulkExceptionDates.length) { setError('No dates selected.'); return; }
    setLoading(true);
    let ok = 0, fail = 0;
    try {
      for (const d of bulkExceptionDates) {
        try {
          const res = await shiftSchedulingService.createShiftException({ user_id: exceptionForm.user_id, exception_date: d.toISOString().split('T')[0], exception_type: exceptionForm.exception_type, new_start_time: exceptionForm.new_start_time, new_end_time: exceptionForm.new_end_time, new_break_duration_minutes: exceptionForm.new_break_duration_minutes, reason: exceptionForm.reason, status: exceptionForm.status });
          if (res.success) ok++; else fail++;
        } catch { fail++; }
      }
      setSuccessMessage(`Created ${ok} exception${ok !== 1 ? 's' : ''}${fail ? ` (${fail} failed)` : ''}`);
      setShowExceptionModal(false); resetExceptionForm(); loadData(); setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) { setError(`Failed: ${err.message}`); } finally { setLoading(false); }
  };

  const toggleBulkExceptionDay = (day: string) => setBulkExceptionConfig(prev => ({ ...prev, recurrence_days: prev.recurrence_days.includes(day) ? prev.recurrence_days.filter(d => d !== day) : [...prev.recurrence_days, day] }));
  const hasBulkExceptionDay = (day: string) => bulkExceptionConfig.recurrence_days.includes(day);

  const stats = useMemo(() => {
    const ta = templates.length;
    const aa = templates.filter(t => !t.recurrence_pattern || t.recurrence_pattern === 'weekly').length;
    const tAsg = assignments.length;
    const aAsg = assignments.filter(a => a.status === 'active').length;
    const avg = ta > 0 ? (templates.reduce((s, t) => s + (calculateHours(t.start_time, t.end_time, t.break_duration_minutes) || 0), 0) / ta).toFixed(1) : 0;
    const cov = staffMembers.length > 0 ? Math.round((aAsg / staffMembers.length) * 100) : 0;
    return { totalTemplates: ta, activeTemplates: aa, totalAssignments: tAsg, activeAssignments: aAsg, avgHours: avg, coverageRate: cov };
  }, [templates, assignments, staffMembers]);

  // ─── Avatar helper ───────────────────────────────────────────────────────
  const avatarColors = ['#1e40af','#0369a1','#059669','#7c3aed','#b45309','#be185d'];
  const avatarBg = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // ─── Shared UI primitives ────────────────────────────────────────────────
  const StatCard = ({ icon: Icon, label, value, accent, pale }: any) => (
    <div style={statCard(accent, pale)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = (card as any).boxShadow; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={accent} />
        </div>
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary, margin: '0.1rem 0 0', lineHeight: 1 }}>{value}</p>
        </div>
      </div>
    </div>
  );

  const Avatar = ({ name }: { name: string }) => (
    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: avatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, letterSpacing: '0.03em' }}>
      {initials(name)}
    </div>
  );

  const DayPill = ({ day, active, onClick }: { day: string; active: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: active ? 'none' : `1.5px solid ${colors.border}`, background: active ? colors.primary : colors.surface, color: active ? '#fff' : colors.textSecondary, cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit' }}>
      {dayLabels[day as keyof typeof dayLabels]}
    </button>
  );

  const StatusDot = ({ status }: { status: string }) => {
    const map: Record<string, [string, string, string]> = {
      active:   [colors.success, colors.successPale, colors.successBorder],
      pending:  [colors.warning, colors.warningPale, colors.warningBorder],
      inactive: [colors.textMuted, colors.surfaceMuted, colors.border],
      expired:  [colors.danger,  colors.dangerPale,  colors.dangerBorder],
    };
    const [dot, bg, border] = map[status] || map.inactive;
    return (
      <span style={{ ...badge(bg, dot), border: `1px solid ${border}` }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
        {status}
      </span>
    );
  };

  // ─── Table wrapper ───────────────────────────────────────────────────────
  const TableWrap = ({ children }: { children: React.ReactNode }) => (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          {children}
        </table>
      </div>
    </div>
  );

  const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th style={{ padding: '0.75rem 1rem', textAlign: right ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', background: colors.surfaceAlt, borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );

  const Td = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <td style={{ padding: '0.85rem 1rem', textAlign: right ? 'right' : 'left', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'middle', color: colors.textPrimary }}>
      {children}
    </td>
  );

  const EmptyState = ({ icon: Icon, title, sub, action }: any) => (
    <tr>
      <td colSpan={20} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: colors.primaryPale, border: `1px solid ${colors.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Icon size={22} color={colors.primary} />
        </div>
        <p style={{ fontWeight: 600, color: colors.textPrimary, margin: '0 0 0.3rem' }}>{title}</p>
        <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: '0 0 1.25rem' }}>{sub}</p>
        {action}
      </td>
    </tr>
  );

  const LoadingRow = () => (
    <tr>
      <td colSpan={20} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: colors.textMuted }}>
          <RotateCcw size={16} style={{ animation: 'spin 1s linear infinite' }} color={colors.primary} />
          <span style={{ fontSize: '0.875rem' }}>Loading…</span>
        </div>
      </td>
    </tr>
  );

  // ─── Modal shell ─────────────────────────────────────────────────────────
  const Modal = ({ children, onClose, width = '34rem' }: { children: React.ReactNode; onClose: () => void; width?: string }) => (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: `min(${width}, calc(100vw - 2rem))`, maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: colors.surface, borderRadius: '16px', boxShadow: '0 20px 60px rgba(15,23,42,0.2), 0 4px 16px rgba(15,23,42,0.1)', zIndex: 50, overflow: 'hidden' }}>
        {children}
      </div>
    </>
  );

  const ModalHeader = ({ title, sub, accentColor, icon: Icon, onClose }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${colors.border}`, background: colors.surfaceAlt, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: colors.textMuted, marginTop: '0.1rem' }}>{sub}</p>
        </div>
      </div>
      <button onClick={onClose} style={{ ...btnGhost, color: colors.textMuted }} onMouseEnter={e => (e.currentTarget.style.background = colors.surfaceMuted)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <X size={18} />
      </button>
    </div>
  );

  const ModalBody = ({ children }: { children: React.ReactNode }) => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      {children}
    </div>
  );

  const ModalFooter = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: `1px solid ${colors.border}`, background: colors.surfaceAlt, flexShrink: 0 }}>
      {children}
    </div>
  );

  const FormField = ({ label, required, children, hint }: any) => (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: colors.danger, marginLeft: 3 }}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: '0.72rem', color: colors.textMuted, marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  );

  // ─── Tabs ────────────────────────────────────────────────────────────────
  const tabs: { key: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { key: 'templates',   label: 'Templates',       icon: Settings    },
    { key: 'assignments', label: 'Assignments',      icon: Users       },
    { key: 'exceptions',  label: 'Exceptions',       icon: AlertCircle },
    { key: 'types',       label: 'Exception Types',  icon: Settings    },
  ];

  // ─── Render tabs ─────────────────────────────────────────────────────────

  const renderTemplatesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: colors.textPrimary }}>Shift Templates</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Reusable shift patterns for your organisation</p>
        </div>
        <button style={btnPrimary} onClick={() => { resetTemplateForm(); setShowTemplateModal(true); }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1d3a9e')}
          onMouseLeave={e => (e.currentTarget.style.background = colors.primary)}>
          <Plus size={15} /> New Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '0.75rem' }}>
        <StatCard icon={Settings}     label="Total Templates"  value={stats.totalTemplates}  accent={colors.primary}  pale={colors.primaryPale} />
        <StatCard icon={CheckCircle}  label="Active"           value={stats.activeTemplates} accent={colors.success}  pale={colors.successPale} />
        <StatCard icon={Timer}        label="Avg Hours / Day"  value={`${stats.avgHours}h`}  accent={colors.purple}   pale={colors.purplePale}  />
        <StatCard icon={Users}        label="In Use"           value={templates.reduce((s, t) => s + (t.assignmentCount || 0), 0)} accent={colors.accent} pale={colors.accentPale} />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Template</Th>
            <Th>Break</Th>
            <Th>Pattern</Th>
            <Th>Days</Th>
            <Th>Usage</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? <LoadingRow /> : templates.length === 0 ? (
            <EmptyState icon={Settings} title="No templates yet" sub="Create your first shift template to get started"
              action={<button style={btnPrimary} onClick={() => { resetTemplateForm(); setShowTemplateModal(true); }}><Plus size={14} /> Create Template</button>} />
          ) : templates.map(t => {
            const st = getShiftType(t.start_time, t.end_time);
            const Icon = st.icon;
            return (
              <tr key={t.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color={st.color} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{t.name}</p>
                      <span style={{ fontSize: '0.72rem', color: colors.textMuted, marginTop: 2, display: 'block' }}>{t.start_time?.substring(0, 5)} – {t.end_time?.substring(0, 5)}</span>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{t.break_duration_minutes} min</span>
                </Td>
                <Td>
                  <span style={badge(colors.purplePale, colors.purple)}>{t.recurrence_pattern || 'None'}</span>
                </Td>
                <Td>
                  {t.recurrence_days ? (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {(() => { try { const days = JSON.parse(t.recurrence_days); return Array.isArray(days) ? days.map((d: string) => <span key={d} style={{ padding: '0.15rem 0.45rem', background: colors.surfaceMuted, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, color: colors.textSecondary, border: `1px solid ${colors.border}` }}>{d.substring(0, 3)}</span>) : <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>—</span>; } catch { return <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>—</span>; } })()}
                    </div>
                  ) : <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>—</span>}
                </Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '80px', height: '5px', background: colors.surfaceMuted, borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((t.assignmentCount || 0) * 10, 100)}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`, borderRadius: '99px' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary }}>{t.assignmentCount || 0}</span>
                  </div>
                </Td>
                <Td right>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button style={{ ...btnGhost, color: colors.success, padding: '0.4rem 0.6rem', border: `1px solid ${colors.successBorder}`, borderRadius: '6px', background: colors.successPale }} onClick={() => openEditTemplate(t)}>
                      <Edit3 size={13} />
                    </button>
                    <button style={{ ...btnGhost, color: colors.danger, padding: '0.4rem 0.6rem', border: `1px solid ${colors.dangerBorder}`, borderRadius: '6px', background: colors.dangerPale }} onClick={() => handleDeleteTemplate(t.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );

  const renderAssignmentsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: colors.textPrimary }}>Employee Assignments</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Assign shift templates to your team members</p>
        </div>
        <button style={btnPrimary} onClick={() => { resetAssignmentForm(); setShowAssignmentModal(true); }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1d3a9e')}
          onMouseLeave={e => (e.currentTarget.style.background = colors.primary)}>
          <Plus size={15} /> Assign Shift
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '0.75rem' }}>
        <StatCard icon={Users}       label="Total"    value={stats.totalAssignments}  accent={colors.primary} pale={colors.primaryPale} />
        <StatCard icon={CheckCircle} label="Active"   value={stats.activeAssignments} accent={colors.success} pale={colors.successPale} />
        <StatCard icon={TrendingUp}  label="Coverage" value={`${stats.coverageRate}%`} accent={colors.purple}  pale={colors.purplePale}  />
        <StatCard icon={Building}    label="Staff"    value={staffMembers.length}     accent={colors.accent}  pale={colors.accentPale}  />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Employee</Th>
            <Th>Shift</Th>
            <Th>Period</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? <LoadingRow /> : assignments.length === 0 ? (
            <EmptyState icon={Users} title="No assignments yet" sub="Assign shifts to employees to get started" />
          ) : assignments.map(a => {
            const tmpl = templates.find(t => t.id === a.shift_template_id);
            const staff = staffMembers.find(s => s.id === a.user_id);
            const st = tmpl ? getShiftType(tmpl.start_time, tmpl.end_time) : null;
            const Icon = st?.icon || Clock;
            const typeColors: Record<string, [string, string]> = { permanent: [colors.primaryPale, colors.primary], temporary: [colors.accentPale, colors.accent], rotating: [colors.purplePale, colors.purple] };
            const [tBg, tC] = typeColors[a.assignment_type] || typeColors.permanent;
            return (
              <tr key={a.id} onMouseEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Avatar name={staff?.name || '?'} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{staff?.name || `User ${a.user_id}`}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textMuted }}>{staff?.email || staff?.department}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '6px', background: st?.bg || colors.surfaceMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={12} color={st?.color || colors.textMuted} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: colors.textPrimary }}>{tmpl?.name || `Template ${a.shift_template_id}`}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textMuted }}>{tmpl ? `${tmpl.start_time?.substring(0, 5)} – ${tmpl.end_time?.substring(0, 5)}` : ''}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.78rem', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.success, display: 'inline-block' }} />
                      {new Date(a.effective_from).toLocaleDateString()}
                    </span>
                    {a.effective_to ? (
                      <span style={{ fontSize: '0.78rem', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.danger, display: 'inline-block' }} />
                        {new Date(a.effective_to).toLocaleDateString()}
                      </span>
                    ) : <span style={badge(colors.successPale, colors.success)}>Ongoing</span>}
                  </div>
                </Td>
                <Td><span style={badge(tBg, tC)}>{a.assignment_type}</span></Td>
                <Td><StatusDot status={a.status} /></Td>
                <Td right>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button style={{ ...btnGhost, color: colors.success, padding: '0.4rem 0.6rem', border: `1px solid ${colors.successBorder}`, borderRadius: '6px', background: colors.successPale }} onClick={() => { setEditingAssignment(a); setShowAssignmentModal(true); }}>
                      <Edit3 size={13} />
                    </button>
                    <button style={{ ...btnGhost, color: colors.danger, padding: '0.4rem 0.6rem', border: `1px solid ${colors.dangerBorder}`, borderRadius: '6px', background: colors.dangerPale }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </div>
  );

  const renderExceptionsTab = () => {
    const filtered = exceptionFilter === 'all' ? exceptions : exceptions.filter(ex => ex.status === exceptionFilter);
    const exStats = { total: exceptions.length, active: exceptions.filter(e => e.status === 'active').length, pending: exceptions.filter(e => e.status === 'pending').length };
    const exTypeMap: Record<string, [string, string]> = {
      early_release:   [colors.accentPale, colors.accent],
      late_start:      [colors.primaryPale, colors.primary],
      day_off:         [colors.dangerPale, colors.danger],
      special_schedule:[colors.purplePale, colors.purple],
      holiday_work:    [colors.successPale, colors.success],
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: colors.textPrimary }}>Shift Exceptions</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>One-time schedule overrides for specific dates</p>
          </div>
          <button style={btnPrimary} onClick={() => { resetExceptionForm(); setShowExceptionModal(true); }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1d3a9e')}
            onMouseLeave={e => (e.currentTarget.style.background = colors.primary)}>
            <Plus size={15} /> Add Exception
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '0.75rem' }}>
          <StatCard icon={Calendar}    label="Total"   value={exStats.total}   accent={colors.primary} pale={colors.primaryPale} />
          <StatCard icon={CheckCircle} label="Active"  value={exStats.active}  accent={colors.success} pale={colors.successPale} />
          <StatCard icon={AlertCircle} label="Pending" value={exStats.pending} accent={colors.warning}  pale={colors.warningPale} />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'active', 'pending'] as const).map(f => (
            <button key={f} onClick={() => setExceptionFilter(f)}
              style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', background: exceptionFilter === f ? colors.primary : colors.surfaceMuted, color: exceptionFilter === f ? '#fff' : colors.textSecondary, boxShadow: exceptionFilter === f ? `0 1px 3px rgba(30,64,175,0.25)` : 'none' }}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.75 }}>
                {f === 'all' ? exStats.total : f === 'active' ? exStats.active : exStats.pending}
              </span>
            </button>
          ))}
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Employee</Th>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>New Hours</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRow /> : filtered.length === 0 ? (
              <EmptyState icon={Calendar} title={exceptionFilter === 'all' ? 'No exceptions found' : `No ${exceptionFilter} exceptions`} sub={exceptionFilter === 'all' ? 'Create the first exception to get started' : 'Try switching filter'} />
            ) : filtered.map(ex => {
              const staff = staffMembers.find(s => s.id === ex.user_id);
              const [eBg, eC] = exTypeMap[ex.exception_type] || [colors.surfaceMuted, colors.textSecondary];
              return (
                <tr key={ex.id} onMouseEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar name={staff?.name || '?'} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{staff?.name || `User ${ex.user_id}`}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: colors.textMuted }}>{staff?.department}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={13} color={colors.textMuted} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textPrimary }}>
                        {new Date(ex.exception_date).toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Td>
                  <Td><span style={badge(eBg, eC)}>{ex.exception_type.replace(/_/g, ' ')}</span></Td>
                  <Td>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textPrimary }}>{ex.new_start_time?.substring(0, 5)} – {ex.new_end_time?.substring(0, 5)}</span>
                      {ex.new_break_duration_minutes && <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: colors.textMuted }}>{ex.new_break_duration_minutes} min break</p>}
                    </div>
                  </Td>
                  <Td><p style={{ margin: 0, fontSize: '0.8rem', color: colors.textSecondary, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.reason}</p></Td>
                  <Td><StatusDot status={ex.status} /></Td>
                  <Td right>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button style={{ ...btnGhost, color: colors.success, padding: '0.4rem 0.6rem', border: `1px solid ${colors.successBorder}`, borderRadius: '6px', background: colors.successPale }}
                        onClick={() => { setEditingException(ex); setExceptionForm({ user_id: ex.user_id, exception_date: ex.exception_date, exception_type: ex.exception_type, new_start_time: ex.new_start_time, new_end_time: ex.new_end_time, new_break_duration_minutes: ex.new_break_duration_minutes || 60, reason: ex.reason, status: ex.status }); setShowExceptionModal(true); }}>
                        <Edit3 size={13} />
                      </button>
                      <button style={{ ...btnGhost, color: colors.danger, padding: '0.4rem 0.6rem', border: `1px solid ${colors.dangerBorder}`, borderRadius: '6px', background: colors.dangerPale }} onClick={() => handleDeleteException(ex.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </div>
    );
  };

  const renderTypesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: colors.textPrimary }}>Exception Types</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: colors.textMuted }}>Manage custom exception types for shift exceptions</p>
        </div>
        <button style={btnPrimary} onClick={() => { resetExceptionTypeForm(); setShowExceptionTypeModal(true); }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1d3a9e')}
          onMouseLeave={e => (e.currentTarget.style.background = colors.primary)}>
          <Plus size={15} /> New Type
        </button>
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Code</Th>
            <Th>Description</Th>
            <Th>Default Times</Th>
            <Th>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {exceptionTypes.length === 0 ? (
            <EmptyState icon={Settings} title="No exception types" sub="Create your first exception type"
              action={<button style={btnPrimary} onClick={() => { resetExceptionTypeForm(); setShowExceptionTypeModal(true); }}><Plus size={14} /> Create First Type</button>} />
          ) : exceptionTypes.map(type => (
            <tr key={type.id} onMouseEnter={e => (e.currentTarget.style.background = colors.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={type.color} style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{type.name}</span>
                  {type.is_system && <span style={{ fontSize: '0.68rem', color: colors.textMuted, fontStyle: 'italic' }}>system</span>}
                </div>
              </Td>
              <Td><code style={{ fontSize: '0.78rem', background: colors.surfaceMuted, padding: '0.15rem 0.45rem', borderRadius: '4px', color: colors.purple, fontFamily: 'monospace' }}>{type.code}</code></Td>
              <Td><span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{type.description || '—'}</span></Td>
              <Td>
                <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  {type.default_start_time && type.default_end_time ? `${type.default_start_time.substring(0,5)} – ${type.default_end_time.substring(0,5)}` : '—'}
                </span>
              </Td>
              <Td>
                <button
                  style={{ ...badge(type.is_active ? colors.successPale : colors.surfaceMuted, type.is_active ? colors.success : colors.textMuted), border: `1px solid ${type.is_active ? colors.successBorder : colors.border}`, cursor: type.is_system ? 'default' : 'pointer', transition: 'all 0.12s' }}
                  onClick={() => !type.is_system && handleToggleExceptionType(type.id)}
                  disabled={type.is_system}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: type.is_active ? colors.success : colors.textMuted, display: 'inline-block' }} />
                  {type.is_active ? 'Active' : 'Inactive'}
                </button>
              </Td>
              <Td right>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                  <button style={{ ...btnGhost, color: colors.success, padding: '0.4rem 0.6rem', border: `1px solid ${colors.successBorder}`, borderRadius: '6px', background: colors.successPale }} onClick={() => openEditExceptionType(type)}>
                    <Edit3 size={13} />
                  </button>
                  {!type.is_system && (
                    <button style={{ ...btnGhost, color: colors.danger, padding: '0.4rem 0.6rem', border: `1px solid ${colors.dangerBorder}`, borderRadius: '6px', background: colors.dangerPale }} onClick={() => handleDeleteExceptionType(type.id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      {/* Inline keyframe for spin */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Toast messages */}
      {successMessage && (
        <div style={{ padding: '0.875rem 1.1rem', background: colors.successPale, border: `1px solid ${colors.successBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CheckCircle size={16} color={colors.success} />
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#065f46', flex: 1 }}>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={{ ...btnGhost, color: colors.success }}><X size={15} /></button>
        </div>
      )}
      {error && (
        <div style={{ padding: '0.875rem 1.1rem', background: colors.dangerPale, border: `1px solid ${colors.dangerBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={16} color={colors.danger} />
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#7f1d1d', flex: 1 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ ...btnGhost, color: colors.danger }}><X size={15} /></button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ background: colors.surfaceAlt, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '0.35rem', display: 'flex', gap: '0.25rem' }}>
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: active ? 700 : 500, transition: 'all 0.15s', background: active ? colors.surface : 'transparent', color: active ? colors.primary : colors.textMuted, boxShadow: active ? '0 1px 4px rgba(15,23,42,0.08)' : 'none' }}>
              <Icon size={14} />
              <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
              {active && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.primary, display: 'inline-block', marginLeft: '0.1rem' }} />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'templates'   && renderTemplatesTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'exceptions'  && renderExceptionsTab()}
      {activeTab === 'types'       && renderTypesTab()}

      {/* ── Template Modal ─────────────────────────────────────────────── */}
      {showTemplateModal && (
        <Modal onClose={() => { setShowTemplateModal(false); resetTemplateForm(); }}>
          <ModalHeader title={`${editingTemplate ? 'Edit' : 'Create'} Shift Template`} sub="Define a reusable shift pattern" accentColor={colors.primary} icon={Settings} onClose={() => { setShowTemplateModal(false); resetTemplateForm(); }} />
          <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} style={{ display: 'contents' }}>
            <ModalBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <FormField label="Template Name" required>
                  <input style={inputStyle} type="text" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="e.g. Morning Shift, Standard Hours, Night Rotation" required />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <FormField label="Start Time" required>
                    <input style={inputStyle} type="time" value={templateForm.start_time} onChange={e => setTemplateForm({ ...templateForm, start_time: e.target.value })} required />
                  </FormField>
                  <FormField label="End Time" required>
                    <input style={inputStyle} type="time" value={templateForm.end_time} onChange={e => setTemplateForm({ ...templateForm, end_time: e.target.value })} required />
                  </FormField>
                </div>
                <FormField label="Break Duration (minutes)" hint="Recommended: 60 for 8-hour shifts">
                  <input style={inputStyle} type="number" value={templateForm.break_duration_minutes} onChange={e => setTemplateForm({ ...templateForm, break_duration_minutes: Number(e.target.value) })} min={0} max={180} />
                </FormField>
                <FormField label="Recurrence Pattern">
                  <select style={inputStyle} value={templateForm.recurrence_pattern} onChange={e => setTemplateForm({ ...templateForm, recurrence_pattern: e.target.value })}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </FormField>
                <FormField label="Recurrence Days" hint="Select the days this shift applies to">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {daysOfWeek.map(d => <DayPill key={d} day={d} active={hasDay(d)} onClick={() => toggleDay(d)} />)}
                  </div>
                </FormField>
              </div>
            </ModalBody>
            <ModalFooter>
              <button type="button" style={btnOutline} onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={loading}>
                {loading ? <><RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} />{editingTemplate ? 'Update Template' : 'Create Template'}</>}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* ── Assignment Modal ────────────────────────────────────────────── */}
      {showAssignmentModal && (
        <Modal onClose={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}>
          <ModalHeader title={`${editingAssignment ? 'Edit' : 'Create'} Assignment`} sub="Assign a shift template to an employee" accentColor={colors.primary} icon={Users} onClose={() => { setShowAssignmentModal(false); resetAssignmentForm(); }} />
          <form onSubmit={handleCreateAssignment} style={{ display: 'contents' }}>
            <ModalBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <FormField label="Employee" required>
                  <select style={inputStyle} value={assignmentForm.user_id || ''} onChange={e => setAssignmentForm({ ...assignmentForm, user_id: Number(e.target.value) })} required>
                    <option value="">Select Employee</option>
                    {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Shift Template" required>
                  <select style={inputStyle} value={assignmentForm.shift_template_id || ''} onChange={e => setAssignmentForm({ ...assignmentForm, shift_template_id: Number(e.target.value) })} required>
                    <option value="">Select Template</option>
                    {templates.map(t => {
                      const h = calculateHours(t.start_time, t.end_time, t.break_duration_minutes);
                      return <option key={t.id} value={t.id}>{t.name} ({t.start_time?.substring(0,5)} – {t.end_time?.substring(0,5)}, {h}h)</option>;
                    })}
                  </select>
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <FormField label="Effective From" required>
                    <input style={inputStyle} type="date" value={assignmentForm.effective_from} onChange={e => setAssignmentForm({ ...assignmentForm, effective_from: e.target.value })} required />
                  </FormField>
                  <FormField label="Effective To">
                    <input style={inputStyle} type="date" value={assignmentForm.effective_to} onChange={e => setAssignmentForm({ ...assignmentForm, effective_to: e.target.value })} />
                  </FormField>
                </div>
                {assignmentForm.effective_to && (
                  <div style={{ padding: '0.75rem 1rem', background: colors.warningPale, border: `1px solid ${colors.warningBorder}`, borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: colors.warning }}>Temporary Assignment</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#92400e' }}>Expires on {new Date(assignmentForm.effective_to).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <button type="button" style={btnOutline} onClick={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={loading}>
                {loading ? <><RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} />{editingAssignment ? 'Update Assignment' : 'Create Assignment'}</>}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* ── Exception Modal ─────────────────────────────────────────────── */}
      {showExceptionModal && (
        <Modal onClose={() => { setShowExceptionModal(false); resetExceptionForm(); }} width="36rem">
          <ModalHeader title={`${editingException ? 'Edit' : 'Create'} Shift Exception`} sub={isRecurringException ? 'Recurring schedule override for multiple dates' : 'One-time schedule override for a specific date'} accentColor={colors.purple} icon={Calendar} onClose={() => { setShowExceptionModal(false); resetExceptionForm(); }} />
          <ModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Bulk mode toggle */}
              {!editingException && (
                <div style={{ padding: '1rem', background: colors.purplePale, border: `1px solid ${colors.purpleBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Zap size={15} color={colors.purple} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary }}>Bulk Exception Creation</p>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: colors.textMuted }}>{isRecurringException ? 'Create exceptions for multiple dates at once' : 'Create exception for a single date'}</p>
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={isRecurringException} onChange={e => { setIsRecurringException(e.target.checked); if (e.target.checked) calculateBulkExceptionDates(); }} />
                    <div style={{ width: '2.5rem', height: '1.4rem', background: isRecurringException ? colors.purple : colors.border, borderRadius: '99px', transition: 'background 0.2s', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '2px', left: isRecurringException ? 'calc(100% - 1.1rem - 2px)' : '2px', width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  </label>
                </div>
              )}

              <FormField label="Employee" required>
                <select style={inputStyle} value={exceptionForm.user_id || ''} onChange={e => setExceptionForm({ ...exceptionForm, user_id: Number(e.target.value) })} required>
                  <option value="">Select Employee</option>
                  {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </FormField>

              {(!isRecurringException || editingException) ? (
                <FormField label="Exception Date" required>
                  <input style={inputStyle} type="date" value={exceptionForm.exception_date} onChange={e => setExceptionForm({ ...exceptionForm, exception_date: e.target.value })} required />
                </FormField>
              ) : (
                <div style={{ padding: '1rem', background: colors.primaryPale, border: `1px solid ${colors.primaryBorder}`, borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <FormField label="Recurrence Pattern">
                    <select style={inputStyle} value={bulkExceptionConfig.recurrence_pattern}
                      onChange={e => { const p = e.target.value as any; setBulkExceptionConfig({ ...bulkExceptionConfig, recurrence_pattern: p }); if (p === 'daily') setBulkExceptionConfig(prev => ({ ...prev, recurrence_days: daysOfWeek })); }}>
                      <option value="daily">Daily (Every day)</option>
                      <option value="weekly">Weekly (Select specific days)</option>
                    </select>
                  </FormField>
                  {bulkExceptionConfig.recurrence_pattern === 'weekly' && (
                    <FormField label="Select Days">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                        {daysOfWeek.map(d => <DayPill key={d} day={d} active={hasBulkExceptionDay(d)} onClick={() => { toggleBulkExceptionDay(d); calculateBulkExceptionDates(); }} />)}
                      </div>
                    </FormField>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <FormField label="Start Date" required>
                      <input style={inputStyle} type="date" value={bulkExceptionConfig.start_date} onChange={e => { setBulkExceptionConfig({ ...bulkExceptionConfig, start_date: e.target.value }); calculateBulkExceptionDates(); }} required />
                    </FormField>
                    <FormField label="End Date" required>
                      <input style={inputStyle} type="date" value={bulkExceptionConfig.end_date} onChange={e => { setBulkExceptionConfig({ ...bulkExceptionConfig, end_date: e.target.value }); calculateBulkExceptionDates(); }} required />
                    </FormField>
                  </div>
                  {bulkExceptionDates.length > 0 && (
                    <div style={{ padding: '0.65rem 0.875rem', background: colors.successPale, border: `1px solid ${colors.successBorder}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={14} color={colors.success} />
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#065f46' }}>Will create {bulkExceptionDates.length} exception{bulkExceptionDates.length !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>
              )}

              <FormField label="Exception Type" required hint={
                exceptionForm.exception_type === 'late_start' ? 'Employee will start later than their scheduled time' :
                exceptionForm.exception_type === 'early_release' ? 'Employee will leave earlier than their scheduled time' :
                exceptionForm.exception_type === 'day_off' ? 'Employee is not required to work on this date' :
                exceptionForm.exception_type === 'special_schedule' ? 'Custom schedule for this specific date' :
                exceptionForm.exception_type === 'holiday_work' ? 'Employee is scheduled to work on a holiday' : ''
              }>
                <select style={inputStyle} value={exceptionForm.exception_type_id || ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    const t = exceptionTypes.find(x => x.id === id);
                    setExceptionForm({ ...exceptionForm, exception_type_id: id, exception_type: t?.code || 'special_schedule', new_start_time: t?.default_start_time || exceptionForm.new_start_time, new_end_time: t?.default_end_time || exceptionForm.new_end_time, new_break_duration_minutes: t?.default_break_duration || exceptionForm.new_break_duration_minutes });
                  }} required>
                  <option value="">Select Exception Type</option>
                  {exceptionTypes.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_system ? ' (System)' : ''}</option>)}
                </select>
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <FormField label="New Start Time" required>
                  <input style={inputStyle} type="time" value={exceptionForm.new_start_time} onChange={e => setExceptionForm({ ...exceptionForm, new_start_time: e.target.value })} required />
                </FormField>
                <FormField label="New End Time" required>
                  <input style={inputStyle} type="time" value={exceptionForm.new_end_time} onChange={e => setExceptionForm({ ...exceptionForm, new_end_time: e.target.value })} required />
                </FormField>
              </div>

              <FormField label="Break Duration (minutes)">
                <input style={inputStyle} type="number" value={exceptionForm.new_break_duration_minutes} onChange={e => setExceptionForm({ ...exceptionForm, new_break_duration_minutes: Number(e.target.value) })} min={0} max={180} />
              </FormField>

              <FormField label="Reason" required>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' } as React.CSSProperties} value={exceptionForm.reason} onChange={e => setExceptionForm({ ...exceptionForm, reason: e.target.value })} placeholder="Explain why this exception is needed…" rows={3} required />
              </FormField>

              <FormField label="Status">
                <select style={inputStyle} value={exceptionForm.status} onChange={e => setExceptionForm({ ...exceptionForm, status: e.target.value as any })}>
                  <option value="active">Active</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </FormField>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" style={btnOutline} onClick={() => { setShowExceptionModal(false); resetExceptionForm(); }}>Cancel</button>
            {isRecurringException && !editingException ? (
              <button type="button" style={{ ...btnPrimary, background: colors.purple }} disabled={loading || !bulkExceptionDates.length} onClick={handleCreateBulkExceptions}
                onMouseEnter={e => (e.currentTarget.style.background = '#6d28d9')}
                onMouseLeave={e => (e.currentTarget.style.background = colors.purple)}>
                {loading ? <><RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</> : <><Zap size={14} /> Create {bulkExceptionDates.length} Exception{bulkExceptionDates.length !== 1 ? 's' : ''}</>}
              </button>
            ) : (
              <button type="button" style={btnPrimary} disabled={loading} onClick={editingException ? handleUpdateException : handleCreateException}
                onMouseEnter={e => (e.currentTarget.style.background = '#1d3a9e')}
                onMouseLeave={e => (e.currentTarget.style.background = colors.primary)}>
                {loading ? <><RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} />{editingException ? 'Update Exception' : 'Create Exception'}</>}
              </button>
            )}
          </ModalFooter>
        </Modal>
      )}

      {/* ── Exception Type Modal ────────────────────────────────────────── */}
      {showExceptionTypeModal && (
        <Modal onClose={() => { setShowExceptionTypeModal(false); resetExceptionTypeForm(); }}>
          <ModalHeader title={`${editingExceptionType ? 'Edit' : 'Create'} Exception Type`} sub="Define a custom exception type" accentColor={colors.purple} icon={Settings} onClose={() => { setShowExceptionTypeModal(false); resetExceptionTypeForm(); }} />
          <form onSubmit={editingExceptionType ? handleUpdateExceptionType : handleCreateExceptionType} style={{ display: 'contents' }}>
            <ModalBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <FormField label="Name" required>
                  <input style={inputStyle} type="text" value={exceptionTypeForm.name} onChange={e => setExceptionTypeForm({ ...exceptionTypeForm, name: e.target.value })} placeholder="e.g. Medical Appointment" required />
                </FormField>
                <FormField label="Code" required hint="Lowercase letters and underscores only. Cannot be changed after creation.">
                  <input style={{ ...inputStyle, fontFamily: 'monospace', ...(editingExceptionType ? { background: colors.surfaceMuted, color: colors.textMuted, cursor: 'not-allowed' } : {}) }} type="text" value={exceptionTypeForm.code} onChange={e => setExceptionTypeForm({ ...exceptionTypeForm, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="e.g. medical_appt" pattern="[a-z_]+" required disabled={!!editingExceptionType} />
                </FormField>
                <FormField label="Description">
                  <textarea style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties} value={exceptionTypeForm.description} onChange={e => setExceptionTypeForm({ ...exceptionTypeForm, description: e.target.value })} placeholder="Describe when to use this exception type…" rows={2} />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <FormField label="Default Start Time">
                    <input style={inputStyle} type="time" value={exceptionTypeForm.default_start_time} onChange={e => setExceptionTypeForm({ ...exceptionTypeForm, default_start_time: e.target.value })} />
                  </FormField>
                  <FormField label="Default End Time">
                    <input style={inputStyle} type="time" value={exceptionTypeForm.default_end_time} onChange={e => setExceptionTypeForm({ ...exceptionTypeForm, default_end_time: e.target.value })} />
                  </FormField>
                </div>
                <FormField label="Colour Scheme">
                  <select style={inputStyle} value={exceptionTypeForm.color} onChange={e => setExceptionTypeForm({ ...exceptionTypeForm, color: e.target.value })}>
                    <option value="bg-blue-100 text-blue-700">Blue</option>
                    <option value="bg-amber-100 text-amber-700">Amber</option>
                    <option value="bg-red-100 text-red-700">Red</option>
                    <option value="bg-purple-100 text-purple-700">Purple</option>
                    <option value="bg-green-100 text-green-700">Green</option>
                    <option value="bg-pink-100 text-pink-700">Pink</option>
                    <option value="bg-indigo-100 text-indigo-700">Indigo</option>
                    <option value="bg-cyan-100 text-cyan-700">Cyan</option>
                    <option value="bg-gray-100 text-gray-700">Gray</option>
                  </select>
                </FormField>
              </div>
            </ModalBody>
            <ModalFooter>
              <button type="button" style={btnOutline} onClick={() => { setShowExceptionTypeModal(false); resetExceptionTypeForm(); }}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={loading}>
                {loading ? <><RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} />{editingExceptionType ? 'Update Type' : 'Create Type'}</>}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ShiftSchedulingView;
