// src/components/AppraisalView.tsx

import React, { useState } from 'react';
import AppraisalList from './AppraisalList';
import {
  appraisalService,
  Appraisal
} from '../services/appraisalService';
import { User, Calendar, FileText, Edit3, Eye, CheckCircle, Plus, Users } from 'lucide-react';

const AppraisalView: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAppraisal, setEditingAppraisal] = useState<Appraisal | null>(null);
  
  // Form states
  const [period, setPeriod] = useState('');
  const [userId, setUserId] = useState('');
  const [evaluatorId, setEvaluatorId] = useState('');
  const [status, setStatus] = useState('draft');

  const resetForm = () => {
    setPeriod('');
    setUserId('');
    setEvaluatorId('');
    setStatus('draft');
  };

  const handleCreateAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newAppraisal = {
        period,
        user_id: parseInt(userId),
        evaluator_id: parseInt(evaluatorId),
        status,
        overall_score: 0
      };

      const response = await appraisalService.createAppraisal({template_id: newAppraisal.template_id, user_id: newAppraisal.user_id, evaluator_id: newAppraisal.evaluator_id, period: newAppraisal.period});

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error creating appraisal:', err);
    }
  };

  const handleUpdateAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAppraisal) return;

    try {
      const updatedAppraisal = {
        ...editingAppraisal,
        period,
        user_id: parseInt(userId),
        evaluator_id: parseInt(evaluatorId),
        status
      };

      const response = await appraisalService.updateAppraisal(editingAppraisal.id, {status: updatedAppraisal.status, overall_score: updatedAppraisal.overall_score, evaluator_notes: updatedAppraisal.evaluator_notes, employee_self_assessment: updatedAppraisal.employee_self_assessment});

      if (response.success) {
        setShowEditForm(false);
        setEditingAppraisal(null);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error updating appraisal:', err);
    }
  };

  const startEditing = (appraisal: Appraisal) => {
    setEditingAppraisal(appraisal);
    setPeriod(appraisal.period);
    setUserId(appraisal.user_id.toString());
    setEvaluatorId(appraisal.evaluator_id.toString());
    setStatus(appraisal.status);
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
          New Appraisal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Active Appraisals</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Completed This Month</p>
              <h3 className="text-2xl font-bold">18</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Average Score</p>
              <h3 className="text-2xl font-bold">82%</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Pending Reviews</p>
              <h3 className="text-2xl font-bold">6</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Appraisal Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Appraisal</h3>
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

            <form onSubmit={handleCreateAppraisal} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Appraisal Period</label>
                  <input
                    type="month"
                    className="input input-bordered w-full"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Evaluator ID</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={evaluatorId}
                    onChange={(e) => setEvaluatorId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input input-bordered w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="evaluated">Evaluated</option>
                    <option value="completed">Completed</option>
                  </select>
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
                  Create Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appraisal Modal */}
      {showEditForm && editingAppraisal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Appraisal: {editingAppraisal.period}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAppraisal(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateAppraisal} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Appraisal Period</label>
                  <input
                    type="month"
                    className="input input-bordered w-full"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Evaluator ID</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={evaluatorId}
                    onChange={(e) => setEvaluatorId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input input-bordered w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="evaluated">Evaluated</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingAppraisal(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appraisals List */}
      <div>
        <AppraisalList 
          onEdit={startEditing}
          onView={(appraisal) => console.log('View appraisal:', appraisal)}
        />
      </div>
    </div>
  );
};

export default AppraisalView;