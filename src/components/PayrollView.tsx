// src/components/PayrollView.tsx

import React, { useState } from 'react';
import PayrollRunsList from './PayrollRunsList';
import {
  payrollService,
  PayrollRun
} from '../services/payrollService';
import { User, DollarSign, Calendar, FileText, Download, Plus, Edit3, Eye } from 'lucide-react';

const PayrollView = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPayrollRun, setEditingPayrollRun] = useState<PayrollRun | null>(null);
  
  // Form states
  const [runName, setRunName] = useState('');
  const [payPeriod, setPayPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setRunName('');
    setPayPeriod('');
    setStartDate('');
    setEndDate('');
  };

  const handleCreatePayrollRun = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newPayrollRun = {
        run_name: runName,
        pay_period: payPeriod,
        start_date: startDate,
        end_date: endDate,
        status: 'draft',
        total_employees: 0,
        total_amount: 0
      };

      const response = await payrollService.createPayrollRun({run_name: newPayrollRun.run_name, pay_period: newPayrollRun.pay_period, start_date: newPayrollRun.start_date, end_date: newPayrollRun.end_date, status: newPayrollRun.status});

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error creating payroll run:', err);
    }
  };

  const handleUpdatePayrollRun = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPayrollRun) return;

    try {
      const updatedPayrollRun = {
        ...editingPayrollRun,
        run_name: runName,
        pay_period: payPeriod,
        start_date: startDate,
        end_date: endDate
      };

      const response = await payrollService.updatePayrollRun(editingPayrollRun.id, {run_name: updatedPayrollRun.run_name, pay_period: updatedPayrollRun.pay_period, start_date: updatedPayrollRun.start_date, end_date: updatedPayrollRun.end_date});

      if (response.success) {
        setShowEditForm(false);
        setEditingPayrollRun(null);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error updating payroll run:', err);
    }
  };

  const startEditing = (payrollRun: PayrollRun) => {
    setEditingPayrollRun(payrollRun);
    setRunName(payrollRun.run_name);
    setPayPeriod(payrollRun.pay_period);
    setStartDate(payrollRun.start_date);
    setEndDate(payrollRun.end_date);
    setShowEditForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Action buttons section */}
      <div className="flex items-center justify-end gap-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Payroll Run
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Total Employees</p>
              <h3 className="text-2xl font-bold">142</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Total Payroll</p>
              <h3 className="text-2xl font-bold">$245,670</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Active Runs</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Pending Approvals</p>
              <h3 className="text-2xl font-bold">7</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Payroll Run Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Payroll Run</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePayrollRun} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Run Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pay Period</label>
                  <input
                    type="month"
                    className="input input-bordered w-full"
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Payroll Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payroll Run Modal */}
      {showEditForm && editingPayrollRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Payroll Run: {editingPayrollRun.run_name}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPayrollRun(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePayrollRun} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Run Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pay Period</label>
                  <input
                    type="month"
                    className="input input-bordered w-full"
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPayrollRun(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Payroll Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Runs List */}
      <div>
        <PayrollRunsList 
          onEdit={startEditing}
          onView={(payrollRun) => console.log('View payroll run:', payrollRun)}
        />
      </div>
    </div>
  );
};

export default PayrollView;