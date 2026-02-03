// src/components/HolidayManagementView.tsx

import React, { useState } from 'react';
import HolidayList from './HolidayList';
import {
  holidayService,
  Holiday
} from '../services/holidayService';
import { Calendar, Edit3, Trash2, Plus, Globe, Building, Users } from 'lucide-react';

const HolidayManagementView = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('national');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);

  const resetForm = () => {
    setName('');
    setDate('');
    setCategory('national');
    setDescription('');
    setIsRecurring(true);
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newHoliday = {
        name,
        date,
        category,
        description,
        is_recurring: isRecurring
      };

      const response = await holidayService.createHoliday({name: newHoliday.name, date: newHoliday.date, category: newHoliday.category, description: newHoliday.description, is_recurring: newHoliday.is_recurring});

      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error creating holiday:', err);
    }
  };

  const handleUpdateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingHoliday) return;

    try {
      const updatedHoliday = {
        ...editingHoliday,
        name,
        date,
        category,
        description,
        is_recurring: isRecurring
      };

      const response = await holidayService.updateHoliday(editingHoliday.id, {name: updatedHoliday.name, date: updatedHoliday.date, category: updatedHoliday.category, description: updatedHoliday.description, is_recurring: updatedHoliday.is_recurring});

      if (response.success) {
        setShowEditForm(false);
        setEditingHoliday(null);
        resetForm();
        // In a real app, we would refresh the list
      }
    } catch (err) {
      console.error('Error updating holiday:', err);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await holidayService.deleteHoliday(id);

        if (response.success) {
          // In a real app, we would refresh the list
        }
      } catch (err) {
        console.error('Error deleting holiday:', err);
      }
    }
  };

  const startEditing = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setName(holiday.name);
    setDate(holiday.date);
    setCategory(holiday.category);
    setDescription(holiday.description);
    setIsRecurring(holiday.is_recurring);
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
          Add Holiday
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Total Holidays</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">National Holidays</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Company Holidays</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted">Recurring</p>
              <h3 className="text-2xl font-bold">8</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Holiday Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Holiday</h3>
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

            <form onSubmit={handleCreateHoliday} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Holiday Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="input input-bordered w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="national">National</option>
                    <option value="regional">Regional</option>
                    <option value="religious">Religious</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recurring</label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recurring"
                        className="radio radio-primary"
                        checked={isRecurring}
                        onChange={() => setIsRecurring(true)}
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recurring"
                        className="radio radio-primary"
                        checked={!isRecurring}
                        onChange={() => setIsRecurring(false)}
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
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
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditForm && editingHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Holiday: {editingHoliday.name}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingHoliday(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateHoliday} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Holiday Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="input input-bordered w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="national">National</option>
                    <option value="regional">Regional</option>
                    <option value="religious">Religious</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recurring</label>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recurring"
                        className="radio radio-primary"
                        checked={isRecurring}
                        onChange={() => setIsRecurring(true)}
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recurring"
                        className="radio radio-primary"
                        checked={!isRecurring}
                        onChange={() => setIsRecurring(false)}
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
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
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingHoliday(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holidays List */}
      <div>
        <HolidayList 
          onEdit={startEditing}
          onDelete={handleDeleteHoliday}
        />
      </div>
    </div>
  );
};

export default HolidayManagementView;