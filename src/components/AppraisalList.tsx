// src/components/AppraisalList.tsx

import React, { useState, useEffect } from 'react';
import { appraisalService, Appraisal } from '../services/appraisalService';
import { useAuth } from '../AuthContext';
import { User, Calendar, FileText, Edit3, Eye, CheckCircle, XCircle } from 'lucide-react';

interface AppraisalListProps {
  userId?: number;
  evaluatorId?: number;
  onEdit?: (appraisal: Appraisal) => void;
  onView?: (appraisal: Appraisal) => void;
}

const AppraisalList: React.FC<AppraisalListProps> = ({ userId, evaluatorId, onEdit, onView }) => {
  const { hasPermission, user } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    period: '',
    limit: 10,
    page: 1
  });

  useEffect(() => {
    fetchAppraisals();
  }, [filters, userId, evaluatorId]);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const params: any = {
        ...filters,
        ...(userId && { userId }),
        ...(evaluatorId && { evaluatorId })
      };

      const response = await appraisalService.getAppraisals(params);

      if (response.success && response.data) {
        setAppraisals(response.data.appraisals);
      } else {
        setError(response.message || 'Failed to fetch appraisals');
      }
    } catch (err) {
      setError('Error fetching appraisals');
      console.error('Error fetching appraisals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('appraisal:read')) {
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
          <h2 className="text-xl font-semibold">Appraisals</h2>
          <div className="flex space-x-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="input input-bordered"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="evaluated">Evaluated</option>
              <option value="completed">Completed</option>
            </select>
            <input
              type="month"
              value={filters.period}
              onChange={(e) => setFilters({...filters, period: e.target.value})}
              className="input input-bordered"
              placeholder="Period"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Evaluator</th>
              <th>Period</th>
              <th>Status</th>
              <th>Overall Score</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appraisals.map((appraisal) => (
              <tr key={appraisal.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Employee {appraisal.user_id}</div>
                    </div>
                  </div>
                </td>
                <td>Evaluator {appraisal.evaluator_id}</td>
                <td>{appraisal.period}</td>
                <td>
                  <span className={`badge ${
                    appraisal.status === 'completed' ? 'badge-success' :
                    appraisal.status === 'evaluated' ? 'badge-info' :
                    appraisal.status === 'submitted' ? 'badge-warning' :
                    appraisal.status === 'in_progress' ? 'badge-secondary' :
                    'badge-ghost'
                  }`}>
                    {appraisal.status}
                  </span>
                </td>
                <td>
                  {appraisal.overall_score ? `${appraisal.overall_score}%` : 'N/A'}
                </td>
                <td>
                  {new Date(appraisal.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div className="flex gap-2">
                    {(hasPermission('appraisal:update') &&
                      (appraisal.status === 'draft' || appraisal.status === 'in_progress' ||
                       appraisal.evaluator_id === user?.id)) && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onEdit && onEdit(appraisal)}
                      >
                        {appraisal.status === 'draft' || appraisal.status === 'in_progress' ? 
                          <Edit3 className="w-4 h-4" /> : 
                          <CheckCircle className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onView && onView(appraisal)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div>
          Showing {Math.min(filters.page * filters.limit, appraisals.length)} of {appraisals.length} results
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
            disabled={filters.page * filters.limit >= appraisals.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppraisalList;