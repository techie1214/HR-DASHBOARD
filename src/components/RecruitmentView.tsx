// This component provides a comprehensive recruitment management dashboard
// It displays job openings, candidate pipeline, and recruitment metrics

// Import Lucide React icons for UI elements
import { UserPlus, Briefcase, Users, TrendingUp, Filter, Plus, Mail, Phone } from "lucide-react";

// Mock data for current job openings
const jobOpenings = [
  { id: 1, title: "Senior Software Engineer", department: "Engineering", location: "Remote", type: "Full-time", applicants: 45, status: "Active", posted: "Oct 20, 2025" },
  { id: 2, title: "Product Manager", department: "Product", location: "San Francisco", type: "Full-time", applicants: 32, status: "Active", posted: "Oct 25, 2025" },
  { id: 3, title: "UX Designer", department: "Design", location: "New York", type: "Full-time", applicants: 28, status: "Active", posted: "Nov 1, 2025" },
  { id: 4, title: "Marketing Specialist", department: "Marketing", location: "Remote", type: "Contract", applicants: 18, status: "Active", posted: "Oct 15, 2025" },
  { id: 5, title: "Data Analyst", department: "Analytics", location: "Chicago", type: "Full-time", applicants: 22, status: "Closed", posted: "Oct 5, 2025" },
];

// Mock data for candidates in the recruitment pipeline
const candidates = [
  { id: 1, name: "Alex Thompson", position: "Senior Software Engineer", experience: "8 years", email: "alex.t@email.com", phone: "+1 555-0101", stage: "Interview", rating: 4.5 },
  { id: 2, name: "Maria Garcia", position: "Product Manager", experience: "6 years", email: "maria.g@email.com", phone: "+1 555-0102", stage: "Screening", rating: 4.2 },
  { id: 3, name: "Kevin Zhang", position: "UX Designer", experience: "5 years", email: "kevin.z@email.com", phone: "+1 555-0103", stage: "Offer", rating: 4.8 },
  { id: 4, name: "Sophie Martin", position: "Marketing Specialist", experience: "4 years", email: "sophie.m@email.com", phone: "+1 555-0104", stage: "Interview", rating: 4.0 },
  { id: 5, name: "Daniel Lee", position: "Data Analyst", experience: "3 years", email: "daniel.l@email.com", phone: "+1 555-0105", stage: "Assessment", rating: 4.3 },
];

// Mock data for monthly recruitment performance metrics
const recruitmentMetrics = [
  { month: "Oct 2025", applications: 245, interviewed: 68, hired: 12 },
  { month: "Sep 2025", applications: 198, interviewed: 54, hired: 9 },
  { month: "Aug 2025", applications: 223, interviewed: 62, hired: 11 },
];

// Main component function for recruitment view
export default function RecruitmentView() {
  // Main render return
  return (
    // Main container with vertical spacing
    <div className="space-y-6">
      {/* Header Section with action buttons */}
      <div className="flex items-center justify-end">
        {/* Action buttons for filtering and posting jobs */}
        <div className="flex items-center gap-3">
          {/* Filter button */}
          <button className="btn btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          {/* Post new job button */}
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Active Job Openings Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-blue">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Active Job Openings</p>
            <h3 className="mt-1">24</h3>
            <p className="text-muted mt-1">Across all departments</p>
          </div>
        </div>

        {/* Total Applicants Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-green">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Total Applicants</p>
            <h3 className="mt-1">245</h3>
            <p className="text-muted mt-1">This month</p>
          </div>
        </div>

        {/* Interviews Scheduled Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-orange">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Interviews Scheduled</p>
            <h3 className="mt-1">32</h3>
            <p className="text-muted mt-1">Next 2 weeks</p>
          </div>
        </div>

        {/* Average Time to Hire Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="icon-wrapper bg-purple">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-muted">Avg Time to Hire</p>
            <h3 className="mt-1">28 days</h3>
            <p className="text-muted mt-1">-3 days improvement</p>
          </div>
        </div>
      </div>

      {/* Job Openings Table */}
      <div className="card">
        {/* Table header with title and status filters */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3>Job Openings</h3>
              <p className="text-muted">Current open positions</p>
            </div>
            {/* Status filter buttons */}
            <div className="flex items-center gap-2">
              <button className="btn btn-sm btn-outline">Active</button>
              <button className="btn btn-sm btn-outline">Closed</button>
            </div>
          </div>
        </div>
        {/* Table container with horizontal scroll */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            {/* Table header */}
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Applicants</th>
                <th className="table-header-cell">Posted</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            {/* Table body with job openings data */}
            <tbody>
              {/* Map through job openings to create table rows */}
              {jobOpenings.map((job) => (
                <tr key={job.id} className="table-row">
                  {/* Job title cell */}
                  <td className="table-cell">
                    <p style={{ fontWeight: 500 }}>{job.title}</p>
                  </td>
                  {/* Department cell */}
                  <td className="table-cell">{job.department}</td>
                  {/* Location cell */}
                  <td className="table-cell">{job.location}</td>
                  {/* Job type cell */}
                  <td className="table-cell">{job.type}</td>
                  {/* Number of applicants badge */}
                  <td className="table-cell">
                    <span className="badge badge-default">{job.applicants}</span>
                  </td>
                  {/* Posted date */}
                  <td className="table-cell">{job.posted}</td>
                  {/* Status badge with color coding */}
                  <td className="table-cell">
                    <span className={`badge`} style={{
                      // Color coding: green for Active, gray for Closed
                      backgroundColor: job.status === 'Active' ? '#16a34a' : '#94a3b8',
                      color: '#ffffff'
                    }}>
                      {job.status}
                    </span>
                  </td>
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

      {/* Candidates Table */}
      <div className="card">
        {/* Table header with title and view all button */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3>Active Candidates</h3>
              <p className="text-muted">Candidates in the recruitment pipeline</p>
            </div>
            {/* View all candidates button */}
            <button className="btn btn-sm btn-primary">View All Candidates</button>
          </div>
        </div>
        {/* Table container with horizontal scroll */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            {/* Table header */}
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Candidate</th>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Experience</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Stage</th>
                <th className="table-header-cell">Rating</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            {/* Table body with candidates data */}
            <tbody>
              {/* Map through candidates to create table rows */}
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="table-row">
                  {/* Candidate information cell */}
                  <td className="table-cell">
                    <div className="employee-info">
                      {/* Candidate avatar with initials */}
                      <div className="avatar">{candidate.name.split(' ').map(n => n[0]).join('')}</div>
                      {/* Candidate name */}
                      <div className="employee-details">
                        <span className="employee-name">{candidate.name}</span>
                      </div>
                    </div>
                  </td>
                  {/* Position applied for */}
                  <td className="table-cell">{candidate.position}</td>
                  {/* Years of experience */}
                  <td className="table-cell">{candidate.experience}</td>
                  {/* Contact information */}
                  <td className="table-cell">
                    <div className="flex flex-col gap-1">
                      {/* Email with mail icon */}
                      <div className="flex items-center gap-2 text-muted">
                        <Mail className="w-3 h-3" />
                        <span>{candidate.email}</span>
                      </div>
                      {/* Phone with phone icon */}
                      <div className="flex items-center gap-2 text-muted">
                        <Phone className="w-3 h-3" />
                        <span>{candidate.phone}</span>
                      </div>
                    </div>
                  </td>
                  {/* Recruitment stage badge with color coding */}
                  <td className="table-cell">
                    <span className="badge" style={{
                      // Color coding based on stage: green for Offer, blue for Interview, purple for Assessment, orange for Screening
                      backgroundColor:
                        candidate.stage === 'Offer' ? '#16a34a' :
                        candidate.stage === 'Interview' ? '#3b82f6' :
                        candidate.stage === 'Assessment' ? '#9333ea' :
                        '#f59e0b',
                      color: '#ffffff'
                    }}>
                      {candidate.stage}
                    </span>
                  </td>
                  {/* Candidate rating out of 5.0 */}
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <span style={{ fontWeight: 500 }}>{candidate.rating}</span>
                      <span className="text-muted">/5.0</span>
                    </div>
                  </td>
                  {/* Actions button */}
                  <td className="table-cell right">
                    <button className="btn btn-sm btn-ghost">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruitment Metrics Section */}
      <div className="card">
        {/* Section header */}
        <div className="p-6 border-b">
          <h3>Recruitment Metrics</h3>
          <p className="text-muted">Monthly recruitment performance</p>
        </div>
        {/* Metrics display */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Map through recruitment metrics */}
            {recruitmentMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                {/* Month display */}
                <div>
                  <p style={{ fontWeight: 500 }}>{metric.month}</p>
                </div>
                {/* Metrics data */}
                <div className="flex items-center gap-8">
                  {/* Applications count */}
                  <div className="text-right">
                    <p className="text-muted">Applications</p>
                    <p style={{ fontWeight: 500, fontSize: '1.25rem' }}>{metric.applications}</p>
                  </div>
                  {/* Interviewed count */}
                  <div className="text-right">
                    <p className="text-muted">Interviewed</p>
                    <p style={{ fontWeight: 500, fontSize: '1.25rem' }}>{metric.interviewed}</p>
                  </div>
                  {/* Hired count with green color */}
                  <div className="text-right">
                    <p className="text-muted">Hired</p>
                    <p style={{ fontWeight: 500, fontSize: '1.25rem', color: '#16a34a' }}>{metric.hired}</p>
                  </div>
                  {/* Conversion rate calculation */}
                  <div className="text-right">
                    <p className="text-muted">Conversion Rate</p>
                    <p style={{ fontWeight: 500 }}>{((metric.hired / metric.applications) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
