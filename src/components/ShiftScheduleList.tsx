// src/components/ShiftScheduleList.tsx

import React, { useState, useEffect } from 'react';
import { shiftSchedulingService, ShiftSchedule } from '../services/shiftSchedulingService';
import { useAuth } from '../AuthContext';
import { Calendar, Clock, User, Edit3, Trash2, Users } from 'lucide-react';

interface ShiftScheduleListProps {
  onEdit?: (shift: ShiftSchedule) => void;
  onDelete?: (id: number) => void;
}

const ShiftScheduleList: React.FC<ShiftScheduleListProps> = ({ onEdit, onDelete }) => {
  const { hasPermission } = useAuth();
  const [shifts, setShifts] = useState<ShiftSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date: '',
    department: '',
    limit: 10,
    page: 1
  });

  useEffect(() => {
    fetchShifts();
  }, [filters]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const params: any = {
        ...filters
      };

      const response = await shiftSchedulingService.getShiftSchedules(params);

      if (response.success && response.data) {
        setShifts(response.data.shiftSchedules);
      } else {
        setError(response.message || 'Failed to fetch shifts');
      }
    } catch (err) {
      setError('Error fetching shifts');
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('shift:read')) {
    return <div>Access denied</div>;
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="alert alert-error">Error: {error}</div>;

  return (
    <div className="card">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Shift Schedules</h2>
          <div className="flex space-x-4">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="input input-bordered"
              placeholder="Date"
            />
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="input input-bordered"
            >
              <option value="">All Departments</option>
              <option value="sales">Sales</option>
              <option value="technical">Technical</option>
              <option value="solar">Solar</option>
              <option value="logistics">Logistics</option>
              <option value="audit">Audit</option>
              <option value="hr">HR</option>
              <option value="rms">RMS</option>
              <option value="digital_media">Digital Media</option>
            </select>
            {hasPermission('shift:create') && (
              <button
                className="btn btn-primary"
                onClick={() => onEdit && onEdit({} as ShiftSchedule)}
              >
                Add Shift
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Shift</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Employee {shift.employee_id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{shift.shift_type}</span>
                  </div>
                </td>
                <td>{new Date(shift.date).toLocaleDateString()}</td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td>{shift.department}</td>
                <td>
                  <span className={`badge ${
                    shift.status === 'confirmed' ? 'badge-success' :
                    shift.status === 'pending' ? 'badge-warning' :
                    'badge-error'
                  }`}>
                    {shift.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    {hasPermission('shift:update') && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onEdit && onEdit(shift)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('shift:delete') && (
                      <button
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => onDelete && onDelete(shift.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div>
          Showing {Math.min(filters.page * filters.limit, shifts.length)} of {shifts.length} results
        </div>
        <div className="flex space-x-2">
          <button
            className="btn btn-sm"
            onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
            disabled={filters.page <= 1}
          >
            Previous
          </button>
          <button
            className="btn btn-sm"
            onClick={() => setFilters({...filters, page: filters.page + 1})}
            disabled={filters.page * filters.limit >= shifts.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftScheduleList;