// src/components/KPIView.tsx

import React, { useState } from 'react';
import KPIList from './KPIList';
import {
  kpiService,
  KPI
} from '../services/kpiService';
import { Target, Edit3, Trash2, Plus, TrendingUp } from 'lucide-react';

const KPIView: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [weight, setWeight] = useState(0);
  const [frequency, setFrequency] = useState('monthly');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTargetValue('');
    setUnitOfMeasurement('');
    setWeight(0);
    setFrequency('monthly');
    setIsActive(true);
  };

  const handleCreateKPI = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newKPI = {
        name,
        description,
        target_value: targetValue,
        unit_of_measurement: unitOfMeasurement,
        weight,
        frequency,
        is_active: isActive
      };

      const response = await kpiService.createKPI({name: newKPI.name, description: newKPI.description, target_value: newKPI.target_value, unit_of_measurement: newKPI.unit_of_measurement, weight: newKPI.weight, frequency: newKPI.frequency, is_active: newKPI.is_active});

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error creating KPI:', err);
    }
  };

  const handleUpdateKPI = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingKPI) return;

    try {
      const updatedKPI = {
        ...editingKPI,
        name,
        description,
        target_value: targetValue,
        unit_of_measurement: unitOfMeasurement,
        weight,
        frequency,
        is_active: isActive
      };

      const response = await kpiService.updateKPI(editingKPI.id, {name: updatedKPI.name, description: updatedKPI.description, target_value: updatedKPI.target_value, unit_of_measurement: updatedKPI.unit_of_measurement, weight: updatedKPI.weight, frequency: updatedKPI.frequency, is_active: updatedKPI.is_active});

      if (response.success) {
        setShowEditForm(false);
        setEditingKPI(null);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error updating KPI:', err);
    }
  };

  const handleDeleteKPI = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this KPI?')) {
      try {
        const response = await kpiService.deleteKPI(id);

        if (response.success) {
          // In a real app, we would refresh the list
        }
      } catch (err) {
        console.error('Error deleting KPI:', err);
      }
    }
  };

  const startEditing = (kpi: KPI) => {
    setEditingKPI(kpi);
    setName(kpi.name);
    setDescription(kpi.description);
    setTargetValue(kpi.target_value);
    setUnitOfMeasurement(kpi.unit_of_measurement);
    setWeight(kpi.weight);
    setFrequency(kpi.frequency);
    setIsActive(kpi.is_active);
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
          New KPI
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Total KPIs</p>
              <h3 className="text-2xl font-bold">32</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Active KPIs</p>
              <h3 className="text-2xl font-bold">28</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Avg. Achievement</p>
              <h3 className="text-2xl font-bold">78%</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Top Performer</p>
              <h3 className="text-2xl font-bold">Sarah J.</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create KPI Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New KPI</h3>
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

            <form onSubmit={handleCreateKPI} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">KPI Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={unitOfMeasurement}
                    onChange={(e) => setUnitOfMeasurement(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="input input-bordered w-full"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (%)</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    className="input input-bordered w-full"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="ml-2">Active</span>
                  </label>
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
                  Create KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit KPI Modal */}
      {showEditForm && editingKPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit KPI: {editingKPI.name}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingKPI(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateKPI} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">KPI Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={unitOfMeasurement}
                    onChange={(e) => setUnitOfMeasurement(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="input input-bordered w-full"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (%)</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    className="input input-bordered w-full"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="ml-2">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingKPI(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPIs List */}
      <div>
        <KPIList 
          onEdit={startEditing}
          onDelete={handleDeleteKPI}
        />
      </div>
    </div>
  );
};

export default KPIView;