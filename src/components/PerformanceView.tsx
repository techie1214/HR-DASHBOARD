// This component provides a comprehensive performance management dashboard
// It displays performance metrics, employee reviews, department statistics, and upcoming reviews

// Import Lucide React icons for UI elements
import { TrendingUp, Award, Target, Users, Star, Download, Filter } from "lucide-react";
// Import PerformanceMetrics component for charts
import { PerformanceMetrics } from "./PerformanceMetrics";

// Mock data for individual employee performance records
const performanceData = [
  { id: 1, name: "Sarah Johnson", department: "Engineering", lastReview: "Oct 15, 2025", score: 94, rating: "Excellent", goals: "8/10" },
  { id: 2, name: "Michael Chen", department: "Marketing", lastReview: "Oct 20, 2025", score: 88, rating: "Good", goals: "7/10" },
  { id: 3, name: "Emily Rodriguez", department: "Sales", lastReview: "Oct 10, 2025", score: 92, rating: "Excellent", goals: "9/10" },
  { id: 4, name: "David Kim", department: "Engineering", lastReview: "Oct 25, 2025", score: 85, rating: "Good", goals: "6/8" },
  { id: 5, name: "Jessica Taylor", department: "HR", lastReview: "Oct 5, 2025", score: 90, rating: "Excellent", goals: "8/10" },
  { id: 6, name: "Robert Wilson", department: "Finance", lastReview: "Oct 18, 2025", score: 78, rating: "Satisfactory", goals: "5/10" },
  { id: 7, name: "Amanda Brown", department: "Sales", lastReview: "Oct 22, 2025", score: 91, rating: "Excellent", goals: "9/10" },
  { id: 8, name: "James Martinez", department: "Engineering", lastReview: "Oct 12, 2025", score: 86, rating: "Good", goals: "7/10" },
];

// Mock data for department-level performance statistics
const departmentPerformance = [
  { department: "Engineering", avgScore: 88.5, employees: 64, topPerformers: 18 },
  { department: "Sales", avgScore: 91.5, employees: 42, topPerformers: 15 },
  { department: "Marketing", avgScore: 85.2, employees: 28, topPerformers: 8 },
  { department: "Finance", avgScore: 82.8, employees: 24, topPerformers: 6 },
  { department: "HR", avgScore: 89.3, employees: 16, topPerformers: 5 },
];

// Mock data for upcoming performance reviews
const upcomingReviews = [
  { name: "John Smith", department: "Engineering", scheduledDate: "Nov 10, 2025", type: "Quarterly" },
  { name: "Lisa Anderson", department: "Marketing", scheduledDate: "Nov 12, 2025", type: "Annual" },
  { name: "Tom Harris", department: "Sales", scheduledDate: "Nov 15, 2025", type: "Quarterly" },
  { name: "Rachel Green", department: "HR", scheduledDate: "Nov 18, 2025", type: "Mid-Year" },
];

// Main component function for performance view
export default function PerformanceView() {
  // Main render return
  return (
    // Main container with vertical spacing
    <div className="space-y-6">
      {/* Header Section with title and action buttons */}
      <div className="flex items-center justify-between">
        {/* Action buttons for filtering and exporting */}
        <div className="flex items-center gap-3">
          {/* Filter button */}
          <button className="btn btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          {/* Export report button */}
          <button className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Average Performance Score Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-blue">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Avg Performance Score</p>
            <h3 className="mt-1">87.5%</h3>
            <p className="text-muted mt-1">+3.2% from last quarter</p>
          </div>
        </div>

        {/* Top Performers Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-green">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Top Performers</p>
            <h3 className="mt-1">52</h3>
            <p className="text-muted mt-1">21% of total employees</p>
          </div>
        </div>

        {/* Goals Completed Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-orange">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Goals Completed</p>
            <h3 className="mt-1">186 / 240</h3>
            <p className="text-muted mt-1">77.5% completion rate</p>
          </div>
        </div>

        {/* Reviews Due Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-purple">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Reviews Due</p>
            <h3 className="mt-1">24</h3>
            <p className="text-muted mt-1">This month</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics Chart Component */}
      <PerformanceMetrics />

      {/* Employee Performance Table */}
      <div className="card">
        {/* Table header with title and schedule button */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3>Employee Performance</h3>
              <p className="text-muted">Recent performance review scores</p>
            </div>
            <button className="btn btn-sm btn-primary">Schedule Review</button>
          </div>
        </div>
        {/* Table container with horizontal scroll */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            {/* Table header */}
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Last Review</th>
                <th className="table-header-cell">Score</th>
                <th className="table-header-cell">Rating</th>
                <th className="table-header-cell">Goals</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            {/* Table body with employee data */}
            <tbody>
              {/* Map through performance data to create table rows */}
              {performanceData.map((employee) => (
                <tr key={employee.id} className="table-row">
                  {/* Employee information cell */}
                  <td className="table-cell">
                    <div className="employee-info">
                      {/* Employee avatar with initials */}
                      <div className="avatar">{employee.name.split(' ').map(n => n[0]).join('')}</div>
                      {/* Employee name */}
                      <div className="employee-details">
                        <span className="employee-name">{employee.name}</span>
                      </div>
                    </div>
                  </td>
                  {/* Department cell */}
                  <td className="table-cell">{employee.department}</td>
                  {/* Last review date */}
                  <td className="table-cell">{employee.lastReview}</td>
                  {/* Performance score with progress bar */}
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 500 }}>{employee.score}%</span>
                      {/* Progress bar with color coding based on score */}
                      <div className="w-full bg-gray rounded-full" style={{ height: '4px', width: '60px' }}>
                        <div
                          className="bg-blue rounded-full"
                          style={{
                            height: '4px',
                            width: `${employee.score}%`,
                            // Color coding: green for >=90, blue for >=80, orange for <80
                            backgroundColor: employee.score >= 90 ? '#16a34a' : employee.score >= 80 ? '#3b82f6' : '#f59e0b'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  {/* Performance rating badge */}
                  <td className="table-cell">
                    <span className="badge" style={{
                      // Color coding based on rating
                      backgroundColor: employee.rating === 'Excellent' ? '#16a34a' :
                                     employee.rating === 'Good' ? '#3b82f6' :
                                     '#f59e0b',
                      color: '#ffffff'
                    }}>
                      {employee.rating}
                    </span>
                  </td>
                  {/* Goals completion */}
                  <td className="table-cell">{employee.goals}</td>
                  {/* Actions button */}
                  <td className="table-cell right">
                    <button className="btn btn-sm btn-ghost">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Performance Overview */}
      <div className="card">
        {/* Section header */}
        <div className="p-6 border-b">
          <h3>Department Performance Overview</h3>
          <p className="text-muted">Average performance scores by department</p>
        </div>
        {/* Department performance cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Map through department performance data */}
            {departmentPerformance.map((dept, index) => (
              <div key={index} className="p-4 border rounded-lg">
                {/* Department header with stats */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontWeight: 500 }}>{dept.department}</p>
                    <p className="text-muted">{dept.employees} employees</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Average score display */}
                    <div className="text-right">
                      <p className="text-muted">Avg Score</p>
                      <p style={{ fontWeight: 500, fontSize: '1.25rem' }}>{dept.avgScore}%</p>
                    </div>
                    {/* Top performers count */}
                    <div className="text-right">
                      <p className="text-muted">Top Performers</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-green" style={{ fill: '#16a34a' }} />
                        <span style={{ fontWeight: 500 }}>{dept.topPerformers}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Performance progress bar */}
                <div className="w-full bg-gray rounded-full" style={{ height: '8px' }}>
                  <div
                    className="rounded-full"
                    style={{
                      height: '8px',
                      width: `${dept.avgScore}%`,
                      // Color coding based on average score
                      backgroundColor: dept.avgScore >= 90 ? '#16a34a' : dept.avgScore >= 80 ? '#3b82f6' : '#f59e0b',
                      transition: 'width 0.3s'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Reviews Section */}
      <div className="card">
        {/* Section header */}
        <div className="p-6 border-b">
          <h3>Upcoming Reviews</h3>
          <p className="text-muted">Scheduled performance reviews</p>
        </div>
        {/* Upcoming reviews list */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3">
            {/* Map through upcoming reviews */}
            {upcomingReviews.map((review, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                {/* Employee information */}
                <div className="flex items-center gap-3">
                  {/* Avatar with initials */}
                  <div className="avatar">{review.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <p style={{ fontWeight: 500 }}>{review.name}</p>
                    <p className="text-muted">{review.department}</p>
                  </div>
                </div>
                {/* Review details and actions */}
                <div className="flex items-center gap-4">
                  {/* Scheduled date */}
                  <div className="text-right">
                    <p className="text-muted">Scheduled</p>
                    <p style={{ fontWeight: 500 }}>{review.scheduledDate}</p>
                  </div>
                  {/* Review type badge */}
                  <span className="badge badge-default">{review.type}</span>
                  {/* Reschedule button */}
                  <button className="btn btn-sm btn-outline">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
