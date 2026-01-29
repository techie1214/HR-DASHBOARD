// This component provides a comprehensive reports and analytics dashboard
// It allows users to generate, view, and manage various HR reports

// Import Lucide React icons for UI elements
import { FileText, Download, Calendar, TrendingUp, Users, Clock, DollarSign, Award } from "lucide-react";

// Mock data for available report templates
const reportTemplates = [
  { id: 1, name: "Employee Attendance Report", description: "Monthly attendance summary for all employees", icon: Clock, lastGenerated: "Nov 1, 2025", category: "Attendance" },
  { id: 2, name: "Performance Analytics", description: "Quarterly performance review statistics", icon: TrendingUp, lastGenerated: "Oct 31, 2025", category: "Performance" },
  { id: 3, name: "Headcount Report", description: "Current employee count by department", icon: Users, lastGenerated: "Nov 5, 2025", category: "Workforce" },
  { id: 4, name: "Leave Balance Report", description: "Employee leave balances and utilization", icon: Calendar, lastGenerated: "Nov 3, 2025", category: "Leave" },
  { id: 5, name: "Payroll Summary", description: "Monthly payroll expenses by department", icon: DollarSign, lastGenerated: "Oct 30, 2025", category: "Finance" },
  { id: 6, name: "Recruitment Metrics", description: "Hiring pipeline and conversion rates", icon: Award, lastGenerated: "Nov 2, 2025", category: "Recruitment" },
];

// Mock data for recently generated reports
const recentReports = [
  { id: 1, name: "Q4 2025 Performance Review", generatedBy: "Admin User", date: "Nov 4, 2025", size: "2.4 MB", type: "PDF" },
  { id: 2, name: "October Attendance Summary", generatedBy: "HR Manager", date: "Nov 1, 2025", size: "1.8 MB", type: "Excel" },
  { id: 3, name: "Department Headcount Oct 2025", generatedBy: "Admin User", date: "Oct 31, 2025", size: "890 KB", type: "PDF" },
  { id: 4, name: "Leave Balance Report", generatedBy: "HR Manager", date: "Oct 28, 2025", size: "1.2 MB", type: "Excel" },
  { id: 5, name: "Recruitment Analytics Q3", generatedBy: "Recruitment Lead", date: "Oct 25, 2025", size: "3.1 MB", type: "PDF" },
];

// Mock data for scheduled automated reports
const scheduledReports = [
  { id: 1, name: "Monthly Attendance Report", frequency: "Monthly", nextRun: "Dec 1, 2025", recipients: 3 },
  { id: 2, name: "Quarterly Performance Summary", frequency: "Quarterly", nextRun: "Jan 1, 2026", recipients: 5 },
  { id: 3, name: "Weekly Headcount Update", frequency: "Weekly", nextRun: "Nov 12, 2025", recipients: 2 },
];

// Main component function for reports view
export default function ReportsView() {
  // Main render return
  return (
    // Main container with vertical spacing
    <div className="space-y-6">
      {/* Header Section with title and custom report button */}
      <div className="flex items-center justify-between">
        {/* Custom report creation button */}
        <button className="btn btn-primary">
          <FileText className="w-4 h-4 mr-2" />
          Custom Report
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Total Reports Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-blue">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Total Reports</p>
            <h3 className="mt-1">156</h3>
            <p className="text-muted mt-1">Generated this year</p>
          </div>
        </div>

        {/* Scheduled Reports Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-green">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Scheduled Reports</p>
            <h3 className="mt-1">12</h3>
            <p className="text-muted mt-1">Active schedules</p>
          </div>
        </div>

        {/* Downloads Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-orange">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Downloads</p>
            <h3 className="mt-1">342</h3>
            <p className="text-muted mt-1">This month</p>
          </div>
        </div>

        {/* Most Popular Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-purple">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Most Popular</p>
            <h3 className="mt-1">Attendance</h3>
            <p className="text-muted mt-1">42 downloads</p>
          </div>
        </div>
      </div>

      {/* Report Templates Section */}
      <div className="card">
        {/* Section header */}
        <div className="p-6 border-b">
          <h3>Report Templates</h3>
          <p className="text-muted">Pre-configured reports ready to generate</p>
        </div>
        {/* Templates grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
            {/* Map through report templates */}
            {reportTemplates.map((template) => {
              // Dynamically assign the icon component
              const Icon = template.icon;
              return (
                // Individual template card
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    {/* Template icon */}
                    <div className="icon-wrapper bg-blue" style={{ width: '3rem', height: '3rem' }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {/* Template details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {/* Template name and description */}
                          <p style={{ fontWeight: 500 }}>{template.name}</p>
                          <p className="text-muted">{template.description}</p>
                        </div>
                        {/* Category badge */}
                        <span className="badge badge-secondary">{template.category}</span>
                      </div>
                      {/* Last generated date and generate button */}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-muted">Last: {template.lastGenerated}</p>
                        <button className="btn btn-sm btn-primary">
                          <Download className="w-3 h-3 mr-1" />
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card">
        {/* Table header with title and view all button */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3>Recent Reports</h3>
              <p className="text-muted">Recently generated reports</p>
            </div>
            {/* View all reports button */}
            <button className="btn btn-sm btn-outline">View All</button>
          </div>
        </div>
        {/* Table container with horizontal scroll */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            {/* Table header */}
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Report Name</th>
                <th className="table-header-cell">Generated By</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Size</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            {/* Table body with recent reports data */}
            <tbody>
              {/* Map through recent reports */}
              {recentReports.map((report) => (
                <tr key={report.id} className="table-row">
                  {/* Report name with file icon */}
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted" />
                      <span style={{ fontWeight: 500 }}>{report.name}</span>
                    </div>
                  </td>
                  {/* Generated by user */}
                  <td className="table-cell">{report.generatedBy}</td>
                  {/* Generation date */}
                  <td className="table-cell">{report.date}</td>
                  {/* File type badge */}
                  <td className="table-cell">
                    <span className="badge badge-secondary">{report.type}</span>
                  </td>
                  {/* File size */}
                  <td className="table-cell">{report.size}</td>
                  {/* Download action button */}
                  <td className="table-cell right">
                    <button className="btn btn-sm btn-ghost">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Reports Section */}
      <div className="card">
        {/* Section header with new schedule button */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3>Scheduled Reports</h3>
              <p className="text-muted">Automated report generation</p>
            </div>
            {/* Create new schedule button */}
            <button className="btn btn-sm btn-primary">
              <Calendar className="w-3 h-3 mr-1" />
              New Schedule
            </button>
          </div>
        </div>
        {/* Scheduled reports list */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3">
            {/* Map through scheduled reports */}
            {scheduledReports.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                {/* Schedule information */}
                <div className="flex items-center gap-3">
                  {/* Calendar icon */}
                  <div className="icon-wrapper bg-purple" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    {/* Schedule name and next run date */}
                    <p style={{ fontWeight: 500 }}>{schedule.name}</p>
                    <p className="text-muted">Next run: {schedule.nextRun}</p>
                  </div>
                </div>
                {/* Schedule details and edit button */}
                <div className="flex items-center gap-4">
                  {/* Frequency information */}
                  <div className="text-right">
                    <p className="text-muted">Frequency</p>
                    <p style={{ fontWeight: 500 }}>{schedule.frequency}</p>
                  </div>
                  {/* Recipients count */}
                  <div className="text-right">
                    <p className="text-muted">Recipients</p>
                    <p style={{ fontWeight: 500 }}>{schedule.recipients}</p>
                  </div>
                  {/* Edit schedule button */}
                  <button className="btn btn-sm btn-outline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Export Options Section */}
      <div className="card">
        {/* Section header */}
        <div className="p-6 border-b">
          <h3>Bulk Export</h3>
          <p className="text-muted">Export multiple reports at once</p>
        </div>
        {/* Export configuration */}
        <div className="p-6">
          <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
            {/* Data selection options */}
            <div className="p-4 border rounded-lg">
              <h3 className="mb-4">Export Options</h3>
              <div className="space-y-3">
                {/* Employee data checkbox */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>Employee Data</span>
                </label>
                {/* Attendance records checkbox */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>Attendance Records</span>
                </label>
                {/* Leave history checkbox */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>Leave History</span>
                </label>
                {/* Performance reviews checkbox */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span>Performance Reviews</span>
                </label>
              </div>
            </div>
            {/* Format selection options */}
            <div className="p-4 border rounded-lg">
              <h3 className="mb-4">Format</h3>
              <div className="space-y-3">
                {/* PDF format radio button */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="format" defaultChecked />
                  <span>PDF Document</span>
                </label>
                {/* Excel format radio button */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="format" />
                  <span>Excel Spreadsheet</span>
                </label>
                {/* CSV format radio button */}
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="format" />
                  <span>CSV File</span>
                </label>
              </div>
              {/* Export selected button */}
              <button className="btn btn-primary w-full mt-4">
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
