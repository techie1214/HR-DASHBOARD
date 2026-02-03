// src/components/HolidayList.tsx

import React, { useState, useEffect } from 'react';
import { holidayService, Holiday } from '../services/holidayService';
import { useAuth } from '../AuthContext';
import { Calendar, Edit3, Trash2, Globe, Building, Users } from 'lucide-react';

interface HolidayListProps {
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (id: number) => void;
}

const HolidayList: React.FC<HolidayListProps> = ({ onEdit, onDelete }) => {
  const { hasPermission } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    category: '',
    limit: 10,
    page: 1
  });

  useEffect(() => {
    fetchHolidays();
  }, [filters]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const params: any = {
        ...filters
      };

      const response = await holidayService.getHolidays(params);

      if (response.success && response.data) {
        setHolidays(response.data.holidays);
      } else {
        setError(response.message || 'Failed to fetch holidays');
      }
    } catch (err) {
      setError('Error fetching holidays');
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('holiday:read')) {
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
          <h2 className="text-xl font-semibold">Holidays</h2>
          <div className="flex space-x-4">
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="input input-bordered"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="input input-bordered"
            >
              <option value="">All Categories</option>
              <option value="national">National</option>
              <option value="regional">Regional</option>
              <option value="religious">Religious</option>
              <option value="company">Company</option>
            </select>
            {hasPermission('holiday:create') && (
              <button
                className="btn btn-primary"
                onClick={() => onEdit && onEdit({} as Holiday)}
              >
                Add Holiday
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Recurring</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      {holiday.category === 'national' && <Globe className="w-4 h-4 text-blue-600" />}
                      {holiday.category === 'regional' && <Building className="w-4 h-4 text-blue-600" />}
                      {holiday.category === 'religious' && <Users className="w-4 h-4 text-blue-600" />}
                      {holiday.category === 'company' && <Calendar className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{holiday.name}</div>
                    </div>
                  </div>
                </td>
                <td>{new Date(holiday.date).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge-secondary">
                    {holiday.category.charAt(0).toUpperCase() + holiday.category.slice(1)}
                  </span>
                </td>
                <td>{holiday.description}</td>
                <td>
                  {holiday.is_recurring ? (
                    <span className="badge badge-success">Yes</span>
                  ) : (
                    <span className="badge badge-error">No</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-2">
                    {hasPermission('holiday:update') && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onEdit && onEdit(holiday)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('holiday:delete') && (
                      <button
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => onDelete && onDelete(holiday.id)}
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
          Showing {Math.min(filters.page * filters.limit, holidays.length)} of {holidays.length} results
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
            disabled={filters.page * filters.limit >= holidays.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayList;