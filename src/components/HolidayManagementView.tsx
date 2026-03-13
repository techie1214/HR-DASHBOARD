// src/components/HolidayManagementView.tsx
// Redesigned according to design system

import React, { useState, useEffect } from 'react';
import HolidayList from './HolidayList';
import {
  holidayService,
  Holiday,
  CreateHolidayRequest
} from '../services/holidayService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import { Calendar, Plus, X, Loader2 } from 'lucide-react';

const HolidayManagementView = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Form states
  const [holidayName, setHolidayName] = useState('');
  const [date, setDate] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
    fetchHolidays();

    const handleRefresh = () => fetchHolidays();
    window.addEventListener('holiday-refresh', handleRefresh);

    return () => {
      window.removeEventListener('holiday-refresh', handleRefresh);
    };
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoadingHolidays(true);
      const response = await holidayService.getHolidays();
      if (response.success && response.data) {
        setHolidays(response.data.holidays || []);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await getAllBranches();
      if (response.success && response.branches) {
        setBranches(response.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const resetForm = () => {
    setHolidayName('');
    setDate('');
    setBranchId('');
    setIsMandatory(true);
    setDescription('');
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newHoliday: CreateHolidayRequest = {
        holiday_name: holidayName,
        date: new Date(date).toISOString(),
        branch_id: branchId ? parseInt(branchId) : null,
        is_mandatory: isMandatory,
        description: description || null
      };

      const response = await holidayService.createHoliday(newHoliday);

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        window.dispatchEvent(new CustomEvent('holiday-refresh'));
      }
    } catch (error) {
      console.error('Error creating holiday:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .hm-wrap * {
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        .hm-wrap {
          --brand: #1e40af;
          --brand-light: #eff6ff;
          --brand-mid: #bfdbfe;
          --success: #10b981;
          --success-bg: #ecfdf5;
          --warn: #f59e0b;
          --warn-bg: #fffbeb;
          --danger: #ef4444;
          --danger-bg: #fef2f2;
          --surface: #ffffff;
          --surface-2: #f8fafc;
          --border: #e2e8f0;
          --border-strong: #cbd5e1;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --radius: 10px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
          --shadow: 0 4px 12px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04);
          background: var(--surface-2);
          padding: 2rem;
          min-height: 100vh;
        }

        .hm-header {
          margin-bottom: 2rem;
        }
        .hm-header h1 {
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0 0 0.25rem;
        }
        .hm-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .hm-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.9rem;
          border-radius: 7px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .hm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .hm-btn-outline {
          background: var(--surface);
          border-color: var(--border-strong);
          color: var(--text-secondary);
        }
        .hm-btn-outline:hover:not(:disabled) {
          background: var(--surface-2);
          border-color: #94a3b8;
          color: var(--text-primary);
        }
        .hm-btn-primary {
          background: var(--brand);
          border-color: var(--brand);
          color: #fff;
        }
        .hm-btn-primary:hover:not(:disabled) {
          background: #1e3a8a;
          border-color: #1e3a8a;
        }
        .hm-btn-sm { padding: 0.35rem 0.7rem; font-size: 0.775rem; }

        .hm-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }

        .hm-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        .hm-modal {
          background: var(--surface);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 32rem;
          max-height: 90vh;
          overflow-y: auto;
        }
        .hm-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .hm-modal-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .hm-modal-body {
          padding: 1.5rem;
        }
        .hm-modal-footer {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .hm-field {
          margin-bottom: 1.25rem;
        }
        .hm-field:last-child {
          margin-bottom: 0;
        }
        .hm-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .hm-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-strong);
          border-radius: 7px;
          font-size: 0.8125rem;
          color: var(--text-primary);
          background: var(--surface);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .hm-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(30,64,175,0.1);
        }
        .hm-textarea {
          min-height: 6rem;
          resize: vertical;
        }
        .hm-checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .hm-checkbox {
          width: 1rem;
          height: 1rem;
          border-radius: 4px;
          border: 1.5px solid var(--border-strong);
          cursor: pointer;
          accent-color: var(--brand);
        }
        .hm-checkbox-label {
          font-size: 0.8125rem;
          color: var(--text-primary);
        }
      `}</style>

      <div className="hm-wrap">
        <div className="hm-header">
          <h1>Holiday Management</h1>
          <p>Manage company holidays and non-working days</p>
        </div>

        <div className="hm-panel">
          <HolidayList />
        </div>

        <button
          className="hm-btn hm-btn-primary"
          onClick={() => setShowCreateForm(true)}
          style={{ marginTop: '1rem' }}
        >
          <Plus size={16} />
          Create Holiday
        </button>

        {/* Create Modal */}
        {showCreateForm && (
          <div className="hm-modal-overlay" onClick={() => { setShowCreateForm(false); resetForm(); }}>
            <div className="hm-modal" onClick={e => e.stopPropagation()}>
              <div className="hm-modal-header">
                <h3>Create Holiday</h3>
                <button
                  className="hm-btn hm-btn-outline hm-btn-sm"
                  onClick={() => { setShowCreateForm(false); resetForm(); }}
                  style={{ width: '2rem', height: '2rem', padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreateHoliday}>
                <div className="hm-modal-body">
                  <div className="hm-field">
                    <label htmlFor="holidayName">Holiday Name *</label>
                    <input
                      type="text"
                      id="holidayName"
                      className="hm-input"
                      value={holidayName}
                      onChange={e => setHolidayName(e.target.value)}
                      placeholder="e.g., New Year's Day"
                      required
                    />
                  </div>

                  <div className="hm-field">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      className="hm-input"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="hm-field">
                    <label htmlFor="branch">Branch (Optional)</label>
                    <select
                      id="branch"
                      className="hm-input"
                      value={branchId}
                      onChange={e => setBranchId(e.target.value)}
                    >
                      <option value="">All Branches</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hm-field">
                    <label className="hm-checkbox-wrapper">
                      <input
                        type="checkbox"
                        className="hm-checkbox"
                        checked={isMandatory}
                        onChange={e => setIsMandatory(e.target.checked)}
                      />
                      <span className="hm-checkbox-label">Mandatory Holiday</span>
                    </label>
                  </div>

                  <div className="hm-field">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      className="hm-input hm-textarea"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <div className="hm-modal-footer">
                  <button
                    type="button"
                    className="hm-btn hm-btn-outline"
                    onClick={() => { setShowCreateForm(false); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="hm-btn hm-btn-primary"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Create Holiday
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HolidayManagementView;
