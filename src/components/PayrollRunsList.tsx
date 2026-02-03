// src/components/PayrollRunsList.tsx

import React, { useState, useEffect } from 'react';
import {
  payrollService,
  PayrollRun
} from '../services/payrollService';
import { useAuth } from '../AuthContext';
import { Eye, Edit3, FileText, Download } from 'lucide-react';

interface PayrollRunsListProps {
  onEdit?: (payrollRun: PayrollRun) => void;
  onView?: (payrollRun: PayrollRun) => void;
}

const PayrollRunsList: React.FC<PayrollRunsListProps> = ({ onEdit, onView }) => {
  const { hasPermission } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    payPeriod: '',
    limit: 10,
    page: 1
  });

  useEffect(() => {
    fetchPayrollRuns();
  }, [filters]);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      const params: any = {
        ...filters
      };

      const response = await payrollService.getPayrollRuns(params);

      if (response.success && response.data) {
        setPayrollRuns(response.data.payrollRuns);
      } else {
        setError(response.message || 'Failed to fetch payroll runs');
      }
    } catch (err) {
      setError('Error fetching payroll runs');
      console.error('Error fetching payroll runs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('payroll:read')) {
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
          <h2 className="text-xl font-semibold">Payroll Runs</h2>
          <div className="flex space-x-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="input input-bordered"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="month"
              value={filters.payPeriod}
              onChange={(e) => setFilters({...filters, payPeriod: e.target.value})}
              className="input input-bordered"
              placeholder="Pay Period"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Run Name</th>
              <th>Pay Period</th>
              <th>Status</th>
              <th>Employees</th>
              <th>Total Amount</th>
              <th>Processed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((run) => (
              <tr key={run.id}>
                <td>{run.run_name}</td>
                <td>{run.pay_period}</td>
                <td>
                  <span className={`badge ${
                    run.status === 'completed' ? 'badge-success' :
                    run.status === 'processing' ? 'badge-warning' :
                    run.status === 'failed' ? 'badge-error' :
                    'badge-info'
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td>{run.total_employees}</td>
                <td>${run.total_amount.toLocaleString()}</td>
                <td>
                  {run.processed_at ? new Date(run.processed_at).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  <div className="flex gap-2">
                    {hasPermission('payroll:update') && run.status === 'draft' && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onEdit && onEdit(run)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onView && onView(run)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="btn btn-sm btn-outline">
                      <Download className="w-4 h-4" />
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
          Showing {Math.min(filters.page * filters.limit, payrollRuns.length)} of {payrollRuns.length} results
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
            disabled={filters.page * filters.limit >= payrollRuns.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollRunsList;