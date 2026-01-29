// This component provides a comprehensive employee directory view
// It displays employee statistics, department distribution, and a searchable employee table

// Import Lucide React icons for UI elements
import { UserPlus, Download, Filter, Search } from "lucide-react";
// Import EmployeeTable component for displaying employee data
import { EmployeeTable } from "./EmployeeTable";
// Import DepartmentChart component for department visualization
import { DepartmentChart } from "./DepartmentChart";
// Import data functions for employee statistics
import { getDepartmentStats, getTotalEmployeeCount, getActiveEmployeeCount } from "../data/staffData";

// Main component function for employees view
export function EmployeesView() {
  // Get department statistics for breakdown display
  const departmentStats = getDepartmentStats();
  // Get total employee count
  const totalEmployees = getTotalEmployeeCount();
  // Get active employee count
  const activeEmployees = getActiveEmployeeCount();

  // Main render return
  return (
    // Main container with vertical spacing
    <div className="space-y-6">
      {/* Header Section with action buttons */}
      <div className="flex items-center justify-end">
        {/* Action buttons for export and adding employees */}
        <div className="flex items-center gap-3">
          {/* Export button */}
          <button className="btn btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          {/* Add employee button */}
          <button className="btn btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="card p-6">
        {/* Flex container for search input and filter button */}
        <div className="flex items-center gap-4">
          {/* Search input with icon */}
          <div className="input-wrapper flex-1">
            <div className="input-icon">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, department..."
              className="input input-with-icon"
            />
          </div>
          {/* Advanced filters button */}
          <button className="btn btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Total Employees Card */}
        <div className="card p-6">
          <div>
            <p className="text-muted">Total Employees</p>
            <h3 className="mt-1">{totalEmployees}</h3>
            <p className="text-muted mt-1">All staff members</p>
          </div>
        </div>

        {/* Active Employees Card */}
        <div className="card p-6">
          <div>
            <p className="text-muted">Active</p>
            <h3 className="mt-1">{activeEmployees}</h3>
            {/* Calculate and display percentage of active employees */}
            <p className="text-muted mt-1">{totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}% of total</p>
          </div>
        </div>

        {/* Departments Count Card */}
        <div className="card p-6">
          <div>
            <p className="text-muted">Departments</p>
            <h3 className="mt-1">{departmentStats.length}</h3>
            <p className="text-muted mt-1">Active departments</p>
          </div>
        </div>

        {/* Average Employees per Department Card */}
        <div className="card p-6">
          <div>
            <p className="text-muted">Avg per Dept</p>
            {/* Calculate average employees per department */}
            <h3 className="mt-1">{departmentStats.length > 0 ? (totalEmployees / departmentStats.length).toFixed(1) : 0}</h3>
            <p className="text-muted mt-1">Employees per department</p>
          </div>
        </div>
      </div>

      {/* Department Distribution Section */}
      <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
        {/* Department Chart Component */}
        <DepartmentChart />

        {/* Department Breakdown Card */}
        <div className="card">
          {/* Card header */}
          <div className="p-6 border-b">
            <h3>Department Breakdown</h3>
            <p className="text-muted">Employee count by department</p>
          </div>
          {/* Card content with department list */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Map over department stats to display each department */}
              {departmentStats.map((dept, index) => (
                <div key={index}>
                  {/* Department name and count/percentage */}
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontWeight: 500 }}>{dept.name}</span>
                    <span className="text-muted">{dept.count} employees ({dept.percentage}%)</span>
                  </div>
                  {/* Progress bar showing department size */}
                  <div className="w-full bg-gray rounded-full" style={{ height: '8px' }}>
                    <div
                      className="bg-blue rounded-full"
                      style={{
                        height: '8px',
                        // Scale percentage for visual representation (multiplied by 3.5 for better visibility)
                        width: `${dept.percentage * 3.5}%`,
                        transition: 'width 0.3s' // Smooth transition animation
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table Component */}
      <EmployeeTable />
    </div>
  );
}
