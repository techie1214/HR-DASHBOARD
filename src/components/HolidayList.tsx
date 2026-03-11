// src/components/HolidayList.tsx

import React, { useState, useEffect } from 'react';
import { holidayService, Holiday } from '../services/holidayService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import { useAuth } from '../AuthContext';
import { Calendar, Edit3, Trash2, Globe, Building2, Loader2 } from 'lucide-react';

interface HolidayListProps {
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (id: number) => void;
}

const HolidayList: React.FC<HolidayListProps> = ({ onEdit, onDelete }) => {
  const { hasPermission } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    branchId: '',
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: ''
  });

  // Fetch branches for filter dropdown
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch holidays when filters change
  useEffect(() => {
    fetchHolidays();
    
    // Listen for refresh events from parent
    const handleRefresh = () => fetchHolidays();
    window.addEventListener('holiday-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('holiday-refresh', handleRefresh);
    };
  }, [filters]);

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

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      
      // Build query params based on filters
      if (filters.branchId) {
        params.branchId = filters.branchId;
      }
      
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else if (filters.year) {
        // Default to year range
        params.startDate = `${filters.year}-01-01`;
        params.endDate = `${filters.year}-12-31`;
      }

      const response = await holidayService.getHolidays(params);

      if (response.success && response.data) {
        setHolidays(response.data.holidays || []);
      } else {
        setError(response.message || 'Failed to fetch holidays');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching holidays');
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return 'All Branches';
    const branch = branches.find(b => parseInt(b.id) === branchId);
    return branch?.name || 'Unknown Branch';
  };

  const getCategoryIcon = (branchId: number | null, isMandatory: boolean) => {
    if (!branchId) {
      return <Globe className="w-4 h-4 text-blue-600" />;
    }
    return isMandatory 
      ? <Building2 className="w-4 h-4 text-purple-600" />
      : <Calendar className="w-4 h-4 text-orange-600" />;
  };

  const getCategoryBadge = (branchId: number | null, isMandatory: boolean) => {
    if (!branchId) {
      return (
        <span className="badge badge-primary">
          Company-Wide
        </span>
      );
    }
    return isMandatory ? (
      <span className="badge badge-purple">
        Branch Mandatory
      </span>
    ) : (
      <span className="badge badge-secondary">
        Branch Optional
      </span>
    );
  };

  if (!hasPermission('holiday:read')) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Access Denied</h3>
            <p className="text-muted">You don't have permission to view holidays.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted">Loading holidays...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header with Filters */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-primary">Holidays</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter */}
            <select
              className="input input-sm"
              value={filters.branchId}
              onChange={(e) => setFilters({...filters, branchId: e.target.value})}
              disabled={loadingBranches}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              className="input input-sm"
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value, startDate: '', endDate: ''})}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input input-sm"
                placeholder="Start date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value, year: ''})}
              />
              <span className="text-muted">to</span>
              <input
                type="date"
                className="input input-sm"
                placeholder="End date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value, year: ''})}
              />
            </div>

            {/* Clear Filters */}
            {(filters.branchId || filters.startDate || filters.endDate) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFilters({
                  branchId: '',
                  year: new Date().getFullYear().toString(),
                  startDate: '',
                  endDate: ''
                })}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header-cell">Holiday Name</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Scope</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Description</th>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="text-muted">No holidays found for the selected filters.</p>
                </td>
              </tr>
            ) : (
              holidays.map((holiday) => (
                <tr key={holiday.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-50">
                        {getCategoryIcon(holiday.branch_id, holiday.is_mandatory)}
                      </div>
                      <div>
                        <div className="font-medium text-primary">{holiday.holiday_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm">
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="table-cell">
                    {getCategoryBadge(holiday.branch_id, holiday.is_mandatory)}
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-secondary">
                      {getBranchName(holiday.branch_id)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-secondary max-w-[200px] truncate block">
                      {holiday.description || '—'}
                    </span>
                  </td>
                  <td className="table-cell">
                    {holiday.is_mandatory ? (
                      <span className="badge badge-success badge-sm">
                        Mandatory
                      </span>
                    ) : (
                      <span className="badge badge-secondary badge-sm">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-2">
                      {hasPermission('holiday:update') && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onEdit && onEdit(holiday)}
                          title="Edit holiday"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('holiday:delete') && (
                        <button
                          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          onClick={() => onDelete && onDelete(holiday.id)}
                          title="Delete holiday"
                        >
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

      {/* Footer */}
      <div className="p-4 border-t flex justify-between items-center">
        <p className="text-sm text-muted">
          Showing {holidays.length} holiday{holidays.length !== 1 ? 's' : ''}
          {filters.branchId && ` for ${getBranchName(parseInt(filters.branchId))}`}
          {filters.year && ` in ${filters.year}`}
        </p>
        {holidays.length > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchHolidays}
          >
            Refresh
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default HolidayList;
