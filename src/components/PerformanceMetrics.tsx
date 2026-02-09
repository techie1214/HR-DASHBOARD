// This component renders a bar chart displaying department performance and satisfaction metrics
// It uses Recharts library to visualize comparative data across different departments

// Import Recharts components for bar chart visualization
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sample data for department performance and satisfaction scores
// Each object represents a department with performance and satisfaction metrics
const data = [
  { department: "Engineering", performance: 88, satisfaction: 92 },
  { department: "Sales", performance: 94, satisfaction: 87 },
  { department: "Marketing", performance: 85, satisfaction: 90 },
  { department: "HR", performance: 91, satisfaction: 95 },
  { department: "Finance", performance: 89, satisfaction: 88 },
  { department: "Operations", performance: 87, satisfaction: 86 },
];

// Main component function for performance metrics
const PerformanceMetrics = () => {
  // Main render return
  return (
    // Card container with padding
    <div className="card p-6">
      {/* Chart title */}
      <h3 className="mb-4">Department Performance & Satisfaction</h3>
      {/* Responsive container for chart responsiveness */}
      <ResponsiveContainer width="100%" height={300}>
        {/* Bar chart component from Recharts */}
        <BarChart data={data}>
          {/* Grid lines for better readability */}
          <CartesianGrid strokeDasharray="3 3" />
          {/* X-axis showing department names */}
          <XAxis dataKey="department" />
          {/* Y-axis for score values */}
          <YAxis />
          {/* Tooltip for hover information */}
          <Tooltip />
          {/* Legend to identify the bars */}
          <Legend />
          {/* Performance score bar - blue color */}
          <Bar dataKey="performance" fill="#3b82f6" name="Performance Score" />
          {/* Satisfaction score bar - green color */}
          <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceMetrics;
