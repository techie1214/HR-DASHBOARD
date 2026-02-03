// src/components/KPIList.tsx

import React, { useState, useEffect } from 'react';
import { kpiService, KPI } from '../services/kpiService';
import { useAuth } from '../AuthContext';
import { Target, Edit3, Trash2, Eye } from 'lucide-react';

interface KPIListProps {
  onEdit?: (kpi: KPI) => void;
  onDelete?: (id: number) => void;
}

const KPIList: React.FC<KPIListProps> = ({ onEdit, onDelete }) => {
  const { hasPermission } = useAuth();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    isActive: true,
    limit: 10,
    page: 1
  });

  useEffect(() => {
    fetchKPIs();
  }, [filters]);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const params: any = {
        isActive: filters.isActive
      };

      const response = await kpiService.getKPIs(params);

      if (response.success && response.data) {
        setKpis(response.data.kpis);
      } else {
        setError(response.message || 'Failed to fetch KPIs');
      }
    } catch (err) {
      setError('Error fetching KPIs');
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('kpi:read')) {
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
          <h2 className="text-xl font-semibold">Key Performance Indicators (KPIs)</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isActive}
                onChange={(e) => setFilters({...filters, isActive: e.target.checked})}
                className="checkbox checkbox-primary"
              />
              <span className="ml-2">Active Only</span>
            </label>
            {hasPermission('kpi:create') && (
              <button
                className="btn btn-primary"
                onClick={() => onEdit && onEdit({} as KPI)}
              >
                Add KPI
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
              <th>Description</th>
              <th>Target Value</th>
              <th>Unit</th>
              <th>Weight</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => (
              <tr key={kpi.id}>
                <td>{kpi.name}</td>
                <td>{kpi.description}</td>
                <td>{kpi.target_value}</td>
                <td>{kpi.unit_of_measurement}</td>
                <td>{kpi.weight}%</td>
                <td>{kpi.frequency}</td>
                <td>
                  <span className={`badge ${kpi.is_active ? 'badge-success' : 'badge-error'}`}>
                    {kpi.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    {hasPermission('kpi:update') && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onEdit && onEdit(kpi)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('kpi:delete') && (
                      <button
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => onDelete && onDelete(kpi.id)}
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
          Showing {Math.min(filters.page * filters.limit, kpis.length)} of {kpis.length} results
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
            disabled={filters.page * filters.limit >= kpis.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIList;