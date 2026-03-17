// src/components/ShiftSchedulingView.tsx
// Enhanced Shift Scheduling with Smart Features & Beautiful UI

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

const ShiftSchedulingView = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'assignments' | 'exceptions' | 'types'>('templates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state
  const [templates, setTemplates] = useState<TemplateWithStats[]>([]);
  const [assignments, setAssignments] = useState<EmployeeShiftAssignment[]>([]);
  const [exceptions, setExceptions] = useState<ShiftException[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [exceptionTypes, setExceptionTypes] = useState<ExceptionType[]>([]);

  // Filter state for exceptions
  const [exceptionFilter, setExceptionFilter] = useState<'all' | 'active' | 'pending'>('all');

  // Template form state
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

  // Assignment form state
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

  // Exception form state
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

  // Bulk exception creation state
  const [isRecurringException, setIsRecurringException] = useState(false);
  const [bulkExceptionDates, setBulkExceptionDates] = useState<Date[]>([]);
  const [bulkExceptionConfig, setBulkExceptionConfig] = useState({
    recurrence_pattern: 'weekly' as 'daily' | 'weekly' | 'custom',
    recurrence_days: [] as string[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
  });

  // Day selector helpers
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
  
  const toggleDay = (day: string) => {
    const current = JSON.parse(templateForm.recurrence_days);
    const updated = current.includes(day) 
      ? current.filter((d: string) => d !== day)
      : [...current, day];
    setTemplateForm({ ...templateForm, recurrence_days: JSON.stringify(updated) });
  };
  
  const hasDay = (day: string) => JSON.parse(templateForm.recurrence_days).includes(day);

  // Load data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [staffRes, branchesRes, typesRes] = await Promise.all([
        getAllStaff(1, 1000),
        getAllBranches(),
        exceptionTypeService.getExceptionTypes(true) // Load only active types
      ]);

      if (staffRes.success && staffRes.staff) {
        const mappedStaff = staffRes.staff.map((s: any) => ({
          id: s.id,
          name: [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ') || s.email,
          email: s.work_email || s.email,
          department: s.department,
          branch_id: s.branch_id
        }));
        setStaffMembers(mappedStaff);
      }

      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches);
      }

      if (typesRes.success && typesRes.data) {
        setExceptionTypes(typesRes.data.exceptionTypes || []);
        // Set default exception type ID if available
        if (typesRes.data.exceptionTypes?.length > 0 && !exceptionForm.exception_type_id) {
          setExceptionForm(prev => ({
            ...prev,
            exception_type_id: typesRes.data.exceptionTypes[0].id
          }));
        }
      }

      if (activeTab === 'templates') {
        const templatesRes = await shiftSchedulingService.getShiftTemplates();
        if (templatesRes.success && templatesRes.data) {
          const templateList = templatesRes.data.shiftTemplates || [];
          // Enrich with stats
          const enriched = templateList.map((t: ShiftTemplate) => ({
            ...t,
            assignmentCount: assignments.filter(a => a.shift_template_id === t.id).length,
            hoursPerDay: calculateHours(t.start_time, t.end_time, t.break_duration_minutes)
          }));
          setTemplates(enriched);
        }
      } else if (activeTab === 'assignments') {
        const assignmentsRes = await shiftSchedulingService.getEmployeeShiftAssignments();
        if (assignmentsRes.success && assignmentsRes.data) {
          setAssignments(assignmentsRes.data.employeeShiftAssignments || []);
        }
      } else if (activeTab === 'exceptions') {
        // Load all exceptions using the admin endpoint (no userId needed)
        const exceptionsRes = await shiftSchedulingService.getAllShiftExceptions();
        if (exceptionsRes.success && exceptionsRes.data) {
          setExceptions(exceptionsRes.data.exceptions || []);
        }
      } else if (activeTab === 'types') {
        // Exception types already loaded above
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Smart helpers
  const calculateHours = (start: string, end: string, breakMin: number) => {
    const startDate = new Date(`2000-01-01T${start}`);
    let endDate = new Date(`2000-01-01T${end}`);
    
    // Handle overnight shifts
    if (endDate < startDate) {
      endDate = new Date(`2000-01-02T${end}`);
    }
    
    const diffMs = endDate.getTime() - startDate.getTime() - (breakMin * 60 * 1000);
    return Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
  };

  const getShiftType = (start: string, end: string) => {
    const hour = parseInt(start.split(':')[0]);
    if (hour >= 5 && hour < 12) return { type: 'Morning', color: 'text-amber-600', bg: 'bg-amber-50', icon: Sun };
    if (hour >= 12 && hour < 17) return { type: 'Afternoon', color: 'text-blue-600', bg: 'bg-blue-50', icon: Coffee };
    return { type: 'Night', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Moon };
  };

  const detectConflict = (userId: number, startDate: string, endDate: string, excludeId?: number) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    return assignments.find(a => {
      if (a.id === excludeId) return false;
      if (a.user_id !== userId) return false;
      if (a.status !== 'active') return false;
      
      const assignStart = new Date(a.effective_from);
      const assignEnd = a.effective_to ? new Date(a.effective_to) : null;
      
      // Check for date overlap
      let hasDateOverlap = false;
      if (end && assignEnd) {
        hasDateOverlap = start <= assignEnd && end >= assignStart;
      } else {
        hasDateOverlap = start >= assignStart && (!assignEnd || start <= assignEnd);
      }

      if (!hasDateOverlap) return false;

      // If dates overlap, check if recurrence days also overlap
      // Note: This logic assumes we have access to the template data for 'a' 
      // which is stored in 'templates' state.
      const existingTemplate = templates.find(t => t.id === a.shift_template_id);
      const newTemplate = templates.find(t => t.id === assignmentForm.shift_template_id);

      if (existingTemplate && newTemplate && existingTemplate.recurrence_days && newTemplate.recurrence_days) {
        try {
          const existingDays = JSON.parse(existingTemplate.recurrence_days);
          const newDays = JSON.parse(newTemplate.recurrence_days);
          const commonDays = existingDays.filter((day: string) => newDays.includes(day));
          
          // If they don't share any days, it's NOT a conflict even if dates overlap
          if (commonDays.length === 0) return false;
        } catch (e) {
          // If JSON parsing fails, fall back to strict overlap
        }
      }

      return true;
    });
  };

  // Template handlers
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const templateData: CreateShiftTemplateRequest = {
        name: templateForm.name,
        start_time: templateForm.start_time,
        end_time: templateForm.end_time,
        break_duration_minutes: templateForm.break_duration_minutes,
        recurrence_pattern: templateForm.recurrence_pattern,
        recurrence_days: templateForm.recurrence_days,
      };

      const response = await shiftSchedulingService.createShiftTemplate(templateData);
      if (response.success) {
        setSuccessMessage('Shift template created successfully');
        setShowTemplateModal(false);
        resetTemplateForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to create template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setLoading(true);
    try {
      const response = await shiftSchedulingService.updateShiftTemplate(editingTemplate.id, templateForm);
      if (response.success) {
        setSuccessMessage('Shift template updated successfully');
        setShowTemplateModal(false);
        setEditingTemplate(null);
        resetTemplateForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to update template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shift template?')) return;

    setLoading(true);
    try {
      const response = await shiftSchedulingService.deleteShiftTemplate(id);
      if (response.success) {
        setSuccessMessage('Shift template deleted successfully');
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      start_time: '08:00:00',
      end_time: '17:00:00',
      break_duration_minutes: 60,
      recurrence_pattern: 'weekly',
      recurrence_days: '["monday","tuesday","wednesday","thursday","friday"]',
    });
    setEditingTemplate(null);
  };

  const openEditTemplate = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      start_time: template.start_time,
      end_time: template.end_time,
      break_duration_minutes: template.break_duration_minutes,
      recurrence_pattern: template.recurrence_pattern || 'weekly',
      recurrence_days: template.recurrence_days || '["monday","tuesday","wednesday","thursday","friday"]',
    });
    setShowTemplateModal(true);
  };

  const applyQuickTemplate = (quick: any) => {
    setTemplateForm({
      name: quick.name,
      start_time: quick.start,
      end_time: quick.end,
      break_duration_minutes: quick.break,
      recurrence_pattern: 'weekly',
      recurrence_days: '["monday","tuesday","wednesday","thursday","friday"]',
    });
  };

  // Assignment handlers
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Smart conflict detection
    const conflict = detectConflict(
      assignmentForm.user_id,
      assignmentForm.effective_from,
      assignmentForm.effective_to || ''
    );
    
    if (conflict) {
      setError('This employee already has an active shift assignment during this period. Please adjust the dates or end the existing assignment first.');
      return;
    }

    setLoading(true);
    try {
      const assignmentData: AssignShiftToEmployeeRequest = {
        user_id: assignmentForm.user_id,
        shift_template_id: assignmentForm.shift_template_id,
        effective_from: assignmentForm.effective_from,
        effective_to: assignmentForm.effective_to || null,
      };

      const response = await shiftSchedulingService.assignShiftToEmployee(assignmentData);
      if (response.success) {
        setSuccessMessage('Shift assignment created successfully');
        setShowAssignmentModal(false);
        resetAssignmentForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to create assignment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      user_id: 0,
      shift_template_id: 0,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      assignment_type: 'permanent',
      recurrence_pattern: 'none',
      recurrence_day_of_week: '',
      recurrence_end_date: '',
    });
    setEditingAssignment(null);
  };

  // Exception handlers
  const handleCreateException = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await shiftSchedulingService.createShiftException(exceptionForm);
      if (response.success) {
        setSuccessMessage('Exception created successfully');
        setShowExceptionModal(false);
        resetExceptionForm();
        loadData();
      } else {
        setError(response.message || 'Failed to create exception');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create exception');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingException) return;
    setLoading(true);

    try {
      const response = await shiftSchedulingService.updateShiftException(editingException.id, exceptionForm);
      if (response.success) {
        setSuccessMessage('Exception updated successfully');
        setShowExceptionModal(false);
        resetExceptionForm();
        loadData();
      } else {
        setError(response.message || 'Failed to update exception');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update exception');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteException = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exception?')) return;
    setLoading(true);

    try {
      const response = await shiftSchedulingService.deleteShiftException(id);
      if (response.success) {
        setSuccessMessage('Exception deleted successfully');
        loadData();
      } else {
        setError(response.message || 'Failed to delete exception');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete exception');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetExceptionForm = () => {
    setExceptionForm({
      user_id: 0,
      exception_date: new Date().toISOString().split('T')[0],
      exception_type: 'special_schedule',
      new_start_time: '09:00:00',
      new_end_time: '17:00:00',
      new_break_duration_minutes: 60,
      reason: '',
      status: 'active',
    });
    setEditingException(null);
    setIsRecurringException(false);
    setBulkExceptionDates([]);
    setBulkExceptionConfig({
      recurrence_pattern: 'weekly',
      recurrence_days: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  // Exception Types state and handlers
  const [showExceptionTypeModal, setShowExceptionTypeModal] = useState(false);
  const [editingExceptionType, setEditingExceptionType] = useState<ExceptionType | null>(null);
  const [exceptionTypeForm, setExceptionTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    icon: 'AlertCircle',
    color: 'bg-gray-100 text-gray-700',
    default_start_time: '',
    default_end_time: '',
    default_break_duration: 60,
  });

  const resetExceptionTypeForm = () => {
    setExceptionTypeForm({
      name: '',
      code: '',
      description: '',
      icon: 'AlertCircle',
      color: 'bg-gray-100 text-gray-700',
      default_start_time: '',
      default_end_time: '',
      default_break_duration: 60,
    });
    setEditingExceptionType(null);
  };

  const handleCreateExceptionType = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await exceptionTypeService.createExceptionType(exceptionTypeForm);
      if (response.success) {
        setSuccessMessage('Exception type created successfully');
        setShowExceptionTypeModal(false);
        resetExceptionTypeForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to create exception type');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create exception type');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExceptionType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExceptionType) return;
    setLoading(true);
    try {
      const response = await exceptionTypeService.updateExceptionType(editingExceptionType.id, exceptionTypeForm);
      if (response.success) {
        setSuccessMessage('Exception type updated successfully');
        setShowExceptionTypeModal(false);
        resetExceptionTypeForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to update exception type');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update exception type');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExceptionType = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exception type? This cannot be undone.')) return;
    setLoading(true);
    try {
      const response = await exceptionTypeService.deleteExceptionType(id);
      if (response.success) {
        setSuccessMessage('Exception type deleted successfully');
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete exception type');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete exception type');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExceptionType = async (id: number) => {
    setLoading(true);
    try {
      const response = await exceptionTypeService.toggleExceptionTypeActive(id);
      if (response.success) {
        setSuccessMessage(`Exception type ${response.data.exceptionType.is_active ? 'activated' : 'deactivated'} successfully`);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to toggle exception type');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle exception type');
    } finally {
      setLoading(false);
    }
  };

  const openEditExceptionType = (type: ExceptionType) => {
    setEditingExceptionType(type);
    setExceptionTypeForm({
      name: type.name,
      code: type.code,
      description: type.description || '',
      icon: type.icon,
      color: type.color,
      default_start_time: type.default_start_time || '',
      default_end_time: type.default_end_time || '',
      default_break_duration: type.default_break_duration,
    });
    setShowExceptionTypeModal(true);
  };
  const calculateBulkExceptionDates = () => {
    const dates: Date[] = [];
    const startDate = new Date(bulkExceptionConfig.start_date);
    const endDate = new Date(bulkExceptionConfig.end_date);
    const selectedDays = bulkExceptionConfig.recurrence_days;

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      if (bulkExceptionConfig.recurrence_pattern === 'daily' || selectedDays.includes(dayName)) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setBulkExceptionDates(dates);
    return dates;
  };

  const handleCreateBulkExceptions = async () => {
    if (bulkExceptionDates.length === 0) {
      setError('No dates selected. Please configure the recurrence pattern.');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Create exceptions for all calculated dates
      for (const date of bulkExceptionDates) {
        try {
          const exceptionData: CreateShiftExceptionRequest = {
            user_id: exceptionForm.user_id,
            exception_date: date.toISOString().split('T')[0],
            exception_type: exceptionForm.exception_type,
            new_start_time: exceptionForm.new_start_time,
            new_end_time: exceptionForm.new_end_time,
            new_break_duration_minutes: exceptionForm.new_break_duration_minutes,
            reason: exceptionForm.reason,
            status: exceptionForm.status,
          };

          const response = await shiftSchedulingService.createShiftException(exceptionData);
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      setSuccessMessage(`Created ${successCount} exception${successCount !== 1 ? 's' : ''} successfully!`);
      setShowExceptionModal(false);
      resetExceptionForm();
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(`Failed to create some exceptions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBulkExceptionDay = (day: string) => {
    setBulkExceptionConfig(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day]
    }));
  };

  const hasBulkExceptionDay = (day: string) => bulkExceptionConfig.recurrence_days.includes(day);

  // Calculate smart stats
  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => !t.recurrence_pattern || t.recurrence_pattern === 'weekly').length;
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const avgHours = templates.length > 0 
      ? (templates.reduce((sum, t) => sum + (calculateHours(t.start_time, t.end_time, t.break_duration_minutes) || 0), 0) / templates.length).toFixed(1)
      : 0;
    const coverageRate = staffMembers.length > 0 ? Math.round((activeAssignments / staffMembers.length) * 100) : 0;

    return { totalTemplates, activeTemplates, totalAssignments, activeAssignments, avgHours, coverageRate };
  }, [templates, assignments, staffMembers]);

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Enhanced Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Shift Templates</h2>
          <p className="text-sm text-gray-500 mt-0.5">Reusable shift patterns for your organization</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetTemplateForm();
            setShowTemplateModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Templates</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTemplates}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeTemplates}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Timer className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Avg Hours/Day</p>
              <p className="text-xl font-bold text-gray-900">{stats.avgHours}h</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">In Use</p>
              <p className="text-xl font-bold text-gray-900">{templates.reduce((sum, t) => sum + (t.assignmentCount || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Templates Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="table-header-cell">Template</th>
                <th className="table-header-cell">Hours</th>
                <th className="table-header-cell">Schedule</th>
                <th className="table-header-cell">Days</th>
                <th className="table-header-cell">Usage</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RotateCcw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading templates...</span>
                    </div>
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">No templates yet</p>
                    <p className="text-gray-500 text-sm mb-4">Create your first shift template to get started</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => { resetTemplateForm(); setShowTemplateModal(true); }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </button>
                  </td>
                </tr>
              ) : (
                templates.map((template) => {
                  const shiftType = getShiftType(template.start_time, template.end_time);
                  const ShiftIcon = shiftType.icon;
                  return (
                    <tr key={template.id} className="table-row hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${shiftType.bg} flex items-center justify-center`}>
                            <ShiftIcon className={`w-5 h-5 ${shiftType.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{template.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                {template.start_time?.substring(0, 5)} - {template.end_time?.substring(0, 5)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{template.break_duration_minutes}min break</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {template.recurrence_pattern || 'None'}
                        </span>
                      </td>
                      <td className="table-cell">
                        {template.recurrence_days ? (
                          <div className="flex gap-1 flex-wrap">
                            {(() => {
                              try {
                                const days = JSON.parse(template.recurrence_days);
                                if (Array.isArray(days)) {
                                  return days.map((day: string) => (
                                    <span key={day} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md capitalize font-medium">
                                      {day.substring(0, 3)}
                                    </span>
                                  ));
                                }
                                return <span className="text-gray-400 text-sm">-</span>;
                              } catch (e) {
                                return <span className="text-gray-400 text-sm">-</span>;
                              }
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.min((template.assignmentCount || 0) * 10, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{template.assignmentCount || 0}</span>
                        </div>
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditTemplate(template)}
                            className="btn btn-sm btn-outline green hover:shadow-md transition-shadow"
                            title="Edit template"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="btn btn-sm btn-outline red hover:shadow-md transition-shadow"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAssignmentsTab = () => (
    <div className="space-y-6">
      {/* Enhanced Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Employee Assignments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Assign shifts to your team members</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetAssignmentForm();
            setShowAssignmentModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Shift
        </button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Coverage</p>
              <p className="text-xl font-bold text-gray-900">{stats.coverageRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Staff</p>
              <p className="text-xl font-bold text-gray-900">{staffMembers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Shift</th>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RotateCcw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading assignments...</span>
                    </div>
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">No assignments yet</p>
                    <p className="text-gray-500 text-sm">Assign shifts to employees to get started</p>
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => {
                  const template = templates.find(t => t.id === assignment.shift_template_id);
                  const staff = staffMembers.find(s => s.id === assignment.user_id);
                  const shiftType = template ? getShiftType(template.start_time, template.end_time) : null;
                  const ShiftIcon = shiftType?.icon || Clock;
                  
                  return (
                    <tr key={assignment.id} className="table-row hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {staff?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{staff?.name || `User ${assignment.user_id}`}</p>
                            <p className="text-xs text-gray-500">{staff?.email || staff?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${shiftType?.bg || 'bg-gray-100'} flex items-center justify-center`}>
                            <ShiftIcon className={`w-4 h-4 ${shiftType?.color || 'text-gray-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{template?.name || `Template ${assignment.shift_template_id}`}</p>
                            <p className="text-xs text-gray-500">{template ? `${template.start_time?.substring(0, 5)} - ${template.end_time?.substring(0, 5)}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">{new Date(assignment.effective_from).toLocaleDateString()}</span>
                          </div>
                          {assignment.effective_to ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              <span className="text-gray-600">{new Date(assignment.effective_to).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Ongoing</span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          assignment.assignment_type === 'permanent' ? 'bg-blue-100 text-blue-700' :
                          assignment.assignment_type === 'temporary' ? 'bg-amber-100 text-amber-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {assignment.assignment_type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${assignment.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="btn btn-sm btn-outline green hover:shadow-md transition-shadow"
                            onClick={() => {
                              setEditingAssignment(assignment);
                              setShowAssignmentModal(true);
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button className="btn btn-sm btn-outline red hover:shadow-md transition-shadow">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExceptionsTab = () => {
    // Filter exceptions
    const filteredExceptions = exceptionFilter === 'all' 
      ? exceptions 
      : exceptions.filter(ex => ex.status === exceptionFilter);

    // Calculate exception stats
    const exceptionStats = {
      total: exceptions.length,
      active: exceptions.filter(ex => ex.status === 'active').length,
      pending: exceptions.filter(ex => ex.status === 'pending').length,
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Shift Exceptions</h2>
            <p className="text-sm text-gray-500 mt-0.5">One-time schedule overrides for specific dates</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetExceptionForm();
              setShowExceptionModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exception
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 transition-all hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-gray-900">{exceptionStats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 transition-all hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active</p>
                <p className="text-xl font-bold text-gray-900">{exceptionStats.active}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 transition-all hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-gray-900">{exceptionStats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              exceptionFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setExceptionFilter('all')}
          >
            All Exceptions
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              exceptionFilter === 'active'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setExceptionFilter('active')}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              exceptionFilter === 'pending'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setExceptionFilter('pending')}
          >
            Pending
          </button>
        </div>

        {/* Exceptions Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header" style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="table-header-cell">Employee</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">New Hours</th>
                  <th className="table-header-cell">Reason</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <RotateCcw className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-gray-600">Loading exceptions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExceptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-purple-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-1">No exceptions found</p>
                      <p className="text-gray-500 text-sm">
                        {exceptionFilter === 'all' 
                          ? 'Create your first exception to get started' 
                          : `No ${exceptionFilter} exceptions`}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredExceptions.map((exception) => {
                    const staff = staffMembers.find(s => s.id === exception.user_id);
                    const exceptionTypeColors = {
                      early_release: 'bg-amber-100 text-amber-700',
                      late_start: 'bg-blue-100 text-blue-700',
                      day_off: 'bg-red-100 text-red-700',
                      special_schedule: 'bg-purple-100 text-purple-700',
                      holiday_work: 'bg-green-100 text-green-700',
                    };

                    return (
                      <tr key={exception.id} className="table-row hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {staff?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{staff?.name || `User ${exception.user_id}`}</p>
                              <p className="text-xs text-gray-500">{staff?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {new Date(exception.exception_date).toLocaleDateString('en-KE', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            exceptionTypeColors[exception.exception_type]
                          }`}>
                            {exception.exception_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-900">
                              {exception.new_start_time?.substring(0, 5)} - {exception.new_end_time?.substring(0, 5)}
                            </span>
                            {exception.new_break_duration_minutes && (
                              <span className="text-xs text-gray-500">
                                {exception.new_break_duration_minutes}min break
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-cell max-w-xs">
                          <p className="text-sm text-gray-600 truncate">{exception.reason}</p>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            exception.status === 'active' ? 'bg-green-100 text-green-700' :
                            exception.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              exception.status === 'active' ? 'bg-green-500' :
                              exception.status === 'pending' ? 'bg-amber-500' :
                              'bg-gray-400'
                            }`}></div>
                            {exception.status}
                          </span>
                        </td>
                        <td className="table-cell right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => {
                                setEditingException(exception);
                                setExceptionForm({
                                  user_id: exception.user_id,
                                  exception_date: exception.exception_date,
                                  exception_type: exception.exception_type,
                                  new_start_time: exception.new_start_time,
                                  new_end_time: exception.new_end_time,
                                  new_break_duration_minutes: exception.new_break_duration_minutes || 60,
                                  reason: exception.reason,
                                  status: exception.status,
                                });
                                setShowExceptionModal(true);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteException(exception.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-2xl font-bold text-gray-900">Shift Scheduling</h1>
        <p className="text-gray-600 mt-1">Manage templates, assignments, and exceptions</p>
      </div> */}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="card p-2" style={{ backgroundColor: '#dbeafe' }}>
        <div className="flex gap-2">
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'templates' 
                ? 'bg-blue-600 text-black shadow-md' 
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <Settings className="w-4 h-4" />
            Templates
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'assignments' 
                ? 'bg-blue-600 text-black shadow-md' 
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('assignments')}
          >
            <Users className="w-4 h-4" />
            Assignments
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'exceptions'
                ? 'bg-blue-600 text-black shadow-md'
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('exceptions')}
          >
            <AlertCircle className="w-4 h-4" />
            Exceptions
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'types'
                ? 'bg-blue-600 text-black shadow-md'
                : 'text-black hover:bg-blue-200'
            }`}
            onClick={() => setActiveTab('types')}
          >
            <Settings className="w-4 h-4" />
            Exception Types
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'exceptions' && renderExceptionsTab()}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Exception Types</h2>
              <p className="text-sm text-gray-500 mt-0.5">Manage custom exception types for shift exceptions</p>
            </div>
            <button className="btn btn-primary" onClick={() => { resetExceptionTypeForm(); setShowExceptionTypeModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Type
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Code</th>
                    <th className="table-header-cell">Description</th>
                    <th className="table-header-cell">Default Times</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptionTypes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Settings className="w-12 h-12 text-gray-300" />
                          <p className="text-muted">No exception types found</p>
                          <button className="btn btn-primary btn-sm" onClick={() => { resetExceptionTypeForm(); setShowExceptionTypeModal(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Type
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    exceptionTypes.map((type) => (
                      <tr key={type.id} className="table-row hover:bg-gray-50">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded ${type.color}`}>{type.name}</span>
                            {type.is_system && <span className="text-xs text-gray-500">(System)</span>}
                          </div>
                        </td>
                        <td className="table-cell text-sm font-mono">{type.code}</td>
                        <td className="table-cell max-w-xs">{type.description || '—'}</td>
                        <td className="table-cell text-sm">
                          {type.default_start_time && type.default_end_time ? (
                            `${type.default_start_time.substring(0,5)} - ${type.default_end_time.substring(0,5)}`
                          ) : '—'}
                        </td>
                        <td className="table-cell">
                          <button
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              type.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => handleToggleExceptionType(type.id)}
                            disabled={type.is_system}
                          >
                            {type.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="table-cell right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="btn btn-sm btn-ghost" onClick={() => openEditExceptionType(type)}>
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {!type.is_system && (
                              <button className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50" onClick={() => handleDeleteExceptionType(type.id)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <>
          <div className="modal-overlay" onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }}></div>
          <div className="modal" style={{ maxWidth: '36rem' }}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingTemplate ? 'Edit' : 'Create'} Shift Template
                  </h3>
                  <p className="text-sm text-gray-500">Define a reusable shift pattern</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              <div className="modal-content space-y-5" style={{ padding: '1.5rem' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g., Morning Shift, Standard Hours, Night Rotation"
                    required
                    style={{ padding: '0.625rem 0.875rem' }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={templateForm.start_time}
                      onChange={(e) => setTemplateForm({ ...templateForm, start_time: e.target.value })}
                      required
                      style={{ padding: '0.625rem 0.875rem' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={templateForm.end_time}
                      onChange={(e) => setTemplateForm({ ...templateForm, end_time: e.target.value })}
                      required
                      style={{ padding: '0.625rem 0.875rem' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Duration (minutes)
                    <span className="text-gray-400 text-xs ml-2">Recommended: 60 for 8-hour shifts</span>
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={templateForm.break_duration_minutes}
                    onChange={(e) => setTemplateForm({ ...templateForm, break_duration_minutes: Number(e.target.value) })}
                    min="0"
                    max="180"
                    style={{ padding: '0.625rem 0.875rem' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Pattern</label>
                  <select
                    className="input w-full"
                    value={templateForm.recurrence_pattern}
                    onChange={(e) => setTemplateForm({ ...templateForm, recurrence_pattern: e.target.value })}
                    style={{ padding: '0.625rem 0.875rem' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Days</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          hasDay(day)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {dayLabels[day as keyof typeof dayLabels]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select the days this shift applies to</p>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.625rem 1.5rem' }}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <>
          <div className="modal-overlay" onClick={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}></div>
          <div className="modal" style={{ maxWidth: '36rem' }}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingAssignment ? 'Edit' : 'Create'} Assignment
                  </h3>
                  <p className="text-sm text-gray-500">Assign a shift to an employee</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment}>
              <div className="modal-content space-y-5" style={{ padding: '1.5rem' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    className="input w-full"
                    value={assignmentForm.user_id || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, user_id: Number(e.target.value) })}
                    required
                    style={{ padding: '0.625rem 0.875rem' }}
                  >
                    <option value="">Select Employee</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Template *</label>
                  <select
                    className="input w-full"
                    value={assignmentForm.shift_template_id || ''}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, shift_template_id: Number(e.target.value) })}
                    required
                    style={{ padding: '0.625rem 0.875rem' }}
                  >
                    <option value="">Select Template</option>
                    {templates.map(template => {
                      const hours = calculateHours(template.start_time, template.end_time, template.break_duration_minutes);
                      return (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.start_time?.substring(0, 5)} - {template.end_time?.substring(0, 5)}, {hours}h)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Effective From *</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={assignmentForm.effective_from}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, effective_from: e.target.value })}
                      required
                      style={{ padding: '0.625rem 0.875rem' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Effective To</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={assignmentForm.effective_to}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, effective_to: e.target.value })}
                      style={{ padding: '0.625rem 0.875rem' }}
                    />
                  </div>
                </div>
                {assignmentForm.effective_to && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 font-medium">Temporary Assignment</p>
                    <p className="text-xs text-amber-600 mt-0.5">This assignment will expire on {new Date(assignmentForm.effective_to).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowAssignmentModal(false); resetAssignmentForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.625rem 1.5rem' }}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Exception Modal */}
      {showExceptionModal && (
        <>
          <div className="modal-overlay" onClick={() => { setShowExceptionModal(false); resetExceptionForm(); }}></div>
          <div className="modal" style={{ maxWidth: '36rem' }}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingException ? 'Edit' : 'Create'} Shift Exception
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRecurringException ? 'Recurring schedule override for multiple dates' : 'One-time schedule override for a specific date'}
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowExceptionModal(false); resetExceptionForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content space-y-5" style={{ padding: '1.5rem' }}>
              {/* Recurring Mode Toggle */}
              {!editingException && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900">Bulk Exception Creation</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isRecurringException}
                        onChange={(e) => {
                          setIsRecurringException(e.target.checked);
                          if (e.target.checked) {
                            calculateBulkExceptionDates();
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isRecurringException ? 'Create exceptions for multiple dates at once' : 'Create exception for a single date'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                <select
                  className="input w-full"
                  value={exceptionForm.user_id || ''}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, user_id: Number(e.target.value) })}
                  required
                  style={{ padding: '0.625rem 0.875rem' }}
                >
                  <option value="">Select Employee</option>
                  {staffMembers.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              {!isRecurringException || editingException ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exception Date *</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={exceptionForm.exception_date}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, exception_date: e.target.value })}
                    required
                    style={{ padding: '0.625rem 0.875rem' }}
                  />
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Pattern</label>
                    <select
                      className="input w-full"
                      value={bulkExceptionConfig.recurrence_pattern}
                      onChange={(e) => {
                        const pattern = e.target.value as 'daily' | 'weekly' | 'custom';
                        setBulkExceptionConfig({ ...bulkExceptionConfig, recurrence_pattern: pattern });
                        if (pattern === 'daily') {
                          setBulkExceptionConfig({ ...bulkExceptionConfig, recurrence_days: daysOfWeek });
                        }
                      }}
                      style={{ padding: '0.625rem 0.875rem' }}
                    >
                      <option value="daily">Daily (Every day)</option>
                      <option value="weekly">Weekly (Select specific days)</option>
                    </select>
                  </div>

                  {bulkExceptionConfig.recurrence_pattern === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              toggleBulkExceptionDay(day);
                              calculateBulkExceptionDates();
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              hasBulkExceptionDay(day)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {dayLabels[day as keyof typeof dayLabels]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        className="input w-full"
                        value={bulkExceptionConfig.start_date}
                        onChange={(e) => {
                          setBulkExceptionConfig({ ...bulkExceptionConfig, start_date: e.target.value });
                          calculateBulkExceptionDates();
                        }}
                        required
                        style={{ padding: '0.625rem 0.875rem' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        className="input w-full"
                        value={bulkExceptionConfig.end_date}
                        onChange={(e) => {
                          setBulkExceptionConfig({ ...bulkExceptionConfig, end_date: e.target.value });
                          calculateBulkExceptionDates();
                        }}
                        required
                        style={{ padding: '0.625rem 0.875rem' }}
                      />
                    </div>
                  </div>

                  {bulkExceptionDates.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-900">
                          Will create {bulkExceptionDates.length} exception{bulkExceptionDates.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        From {new Date(bulkExceptionConfig.start_date).toLocaleDateString()} to {new Date(bulkExceptionConfig.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exception Type *</label>
                  <select
                    className="input w-full"
                    value={exceptionForm.exception_type_id || ''}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const selectedType = exceptionTypes.find(t => t.id === selectedId);
                      setExceptionForm({
                        ...exceptionForm,
                        exception_type_id: selectedId,
                        exception_type: selectedType?.code || 'special_schedule',
                        new_start_time: selectedType?.default_start_time || exceptionForm.new_start_time,
                        new_end_time: selectedType?.default_end_time || exceptionForm.new_end_time,
                        new_break_duration_minutes: selectedType?.default_break_duration || exceptionForm.new_break_duration_minutes
                      });
                    }}
                    required
                    style={{ padding: '0.625rem 0.875rem' }}
                  >
                    <option value="">Select Exception Type</option>
                    {exceptionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} {type.is_system ? '(System)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {exceptionForm.exception_type === 'late_start' && 'Employee will start later than their scheduled time'}
                    {exceptionForm.exception_type === 'early_release' && 'Employee will leave earlier than their scheduled time'}
                    {exceptionForm.exception_type === 'day_off' && 'Employee is not required to work on this date'}
                    {exceptionForm.exception_type === 'special_schedule' && 'Custom schedule for this specific date'}
                    {exceptionForm.exception_type === 'holiday_work' && 'Employee is scheduled to work on a holiday'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Start Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={exceptionForm.new_start_time}
                      onChange={(e) => setExceptionForm({ ...exceptionForm, new_start_time: e.target.value })}
                      required
                      style={{ padding: '0.625rem 0.875rem' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New End Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={exceptionForm.new_end_time}
                      onChange={(e) => setExceptionForm({ ...exceptionForm, new_end_time: e.target.value })}
                      required
                      style={{ padding: '0.625rem 0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={exceptionForm.new_break_duration_minutes}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, new_break_duration_minutes: Number(e.target.value) })}
                    min="0"
                    max="180"
                    style={{ padding: '0.625rem 0.875rem' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <textarea
                    className="input w-full"
                    value={exceptionForm.reason}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                    placeholder="Explain why this exception is needed..."
                    rows={3}
                    required
                    style={{ padding: '0.625rem 0.875rem', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="input w-full"
                    value={exceptionForm.status}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, status: e.target.value as any })}
                    style={{ padding: '0.625rem 0.875rem' }}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowExceptionModal(false); resetExceptionForm(); }}
                >
                  Cancel
                </button>
                {isRecurringException && !editingException ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={loading || bulkExceptionDates.length === 0}
                    onClick={handleCreateBulkExceptions}
                    style={{ padding: '0.625rem 1.5rem' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Create {bulkExceptionDates.length} Exception{bulkExceptionDates.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={editingException ? handleUpdateException : handleCreateException}
                    style={{ padding: '0.625rem 1.5rem' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {editingException ? 'Update Exception' : 'Create Exception'}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Exception Type Modal */}
      {showExceptionTypeModal && (
        <>
          <div className="modal-overlay" onClick={() => { setShowExceptionTypeModal(false); resetExceptionTypeForm(); }}></div>
          <div className="modal">
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingExceptionType ? 'Edit' : 'Create'} Exception Type
                  </h3>
                  <p className="text-sm text-gray-500">Define a custom exception type</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowExceptionTypeModal(false); resetExceptionTypeForm(); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingExceptionType ? handleUpdateExceptionType : handleCreateExceptionType}>
              <div className="modal-content space-y-4" style={{ padding: '1.5rem' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={exceptionTypeForm.name}
                    onChange={(e) => setExceptionTypeForm({ ...exceptionTypeForm, name: e.target.value })}
                    placeholder="e.g., Medical Appointment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={exceptionTypeForm.code}
                    onChange={(e) => setExceptionTypeForm({ ...exceptionTypeForm, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g., medical_appt"
                    pattern="[a-z_]+"
                    title="Use lowercase letters and underscores only"
                    required
                    disabled={!!editingExceptionType}
                  />
                  <p className="text-xs text-gray-500 mt-1">Lowercase letters and underscores only. Cannot be changed after creation.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="input w-full"
                    value={exceptionTypeForm.description}
                    onChange={(e) => setExceptionTypeForm({ ...exceptionTypeForm, description: e.target.value })}
                    placeholder="Describe when to use this exception type..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Start Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={exceptionTypeForm.default_start_time}
                      onChange={(e) => setExceptionTypeForm({ ...exceptionTypeForm, default_start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default End Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={exceptionTypeForm.default_end_time}
                      onChange={(e) => setExceptionTypeForm({ ...exceptionTypeForm, default_end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                  <select
                    className="input w-full"
                    value={exceptionTypeForm.color}
                    onChange={(e) => setExceptionTypeForm({ ...exceptionTypeForm, color: e.target.value })}
                  >
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
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowExceptionTypeModal(false); resetExceptionTypeForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {editingExceptionType ? 'Update Type' : 'Create Type'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ShiftSchedulingView;
