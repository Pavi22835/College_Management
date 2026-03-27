import React, { useState } from 'react';
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiChevronRight,
  FiAward
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import './StaffReports.css';

const StaffReports = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Demo data for Attendance Statistics
  const attendanceData = [
    { month: 'Jan', present: 85, absent: 15, total: 100 },
    { month: 'Feb', present: 88, absent: 12, total: 100 },
    { month: 'Mar', present: 82, absent: 18, total: 100 },
    { month: 'Apr', present: 90, absent: 10, total: 100 },
    { month: 'May', present: 86, absent: 14, total: 100 },
    { month: 'Jun', present: 92, absent: 8, total: 100 },
    { month: 'Jul', present: 89, absent: 11, total: 100 },
    { month: 'Aug', present: 87, absent: 13, total: 100 }
  ];

  // Demo data for Course Performance
  const coursePerformanceData = [
    { name: 'Data Structures', students: 45, avgGrade: 85, completion: 78 },
    { name: 'Algorithms', students: 42, avgGrade: 82, completion: 72 },
    { name: 'Database Systems', students: 38, avgGrade: 88, completion: 85 },
    { name: 'Web Development', students: 35, avgGrade: 79, completion: 68 },
    { name: 'Cloud Computing', students: 30, avgGrade: 84, completion: 70 }
  ];

  // Demo data for Grade Distribution (Pie Chart)
  const gradeDistributionData = [
    { name: 'A+ (90-100)', value: 15, color: '#10b981' },
    { name: 'A (80-89)', value: 25, color: '#3b82f6' },
    { name: 'B+ (70-79)', value: 30, color: '#f59e0b' },
    { name: 'B (60-69)', value: 18, color: '#8b5cf6' },
    { name: 'C (50-59)', value: 8, color: '#ec4899' },
    { name: 'F (Below 50)', value: 4, color: '#ef4444' }
  ];

  // Demo data for Weekly Attendance Trend
  const weeklyAttendanceData = [
    { week: 'Week 1', 'CS101': 92, 'CS102': 88, 'CS103': 85 },
    { week: 'Week 2', 'CS101': 90, 'CS102': 85, 'CS103': 82 },
    { week: 'Week 3', 'CS101': 88, 'CS102': 86, 'CS103': 84 },
    { week: 'Week 4', 'CS101': 91, 'CS102': 89, 'CS103': 86 },
    { week: 'Week 5', 'CS101': 89, 'CS102': 87, 'CS103': 83 },
    { week: 'Week 6', 'CS101': 93, 'CS102': 90, 'CS103': 87 }
  ];

  // Demo data for Student Progress Distribution
  const studentProgressData = [
    { range: '0-20%', count: 3 },
    { range: '21-40%', count: 8 },
    { range: '41-60%', count: 25 },
    { range: '61-80%', count: 42 },
    { range: '81-100%', count: 22 }
  ];

  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'cs101', name: 'Data Structures' },
    { id: 'cs102', name: 'Algorithms' },
    { id: 'cs103', name: 'Database Systems' }
  ];

  const handleExportReport = () => {
    const exportData = {
      attendanceData,
      coursePerformanceData,
      gradeDistributionData,
      generatedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `report_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="staff-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-left">
          <div className="reports-header-icon">
            <FiBarChart2 size={28} />
          </div>
          <div>
            <h1 className="reports-title">Reports & Analytics</h1>
            <p className="reports-description">Track course completion, attendance statistics, and student performance</p>
          </div>
        </div>
        <div className="reports-header-right">
          <button className="btn-export" onClick={handleExportReport}>
            <FiDownload size={18} />
            <span>Export Report</span>
          </button>
          <button className="btn-refresh" onClick={() => window.location.reload()}>
            <FiRefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiUsers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">245</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <FiBookOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">5</span>
            <span className="stat-label">Active Courses</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <FiTrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">84.6%</span>
            <span className="stat-label">Avg Attendance</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <FiAward size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">82.3%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FiCalendar size={16} />
          <span>Attendance Statistics</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <FiBarChart2 size={16} />
          <span>Course Performance</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          <FiPieChart size={16} />
          <span>Grade Distribution</span>
        </button>
      </div>

      {/* Course Filter */}
      <div className="course-filter">
        <label>Select Course:</label>
        <select 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="course-select"
        >
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      {/* Charts Container */}
      <div className="charts-container">
        {/* Attendance Statistics Tab */}
        {activeTab === 'attendance' && (
          <>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Monthly Attendance Trend</h3>
                <p>Student attendance percentage over the months</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={attendanceData}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="present" 
                      stroke="#10b981" 
                      fill="url(#colorPresent)" 
                      name="Present (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Weekly Attendance by Course</h3>
                <p>Attendance trends across different courses</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weeklyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="CS101" stroke="#3b82f6" strokeWidth={2} name="Data Structures" />
                    <Line type="monotone" dataKey="CS102" stroke="#f59e0b" strokeWidth={2} name="Algorithms" />
                    <Line type="monotone" dataKey="CS103" stroke="#10b981" strokeWidth={2} name="Database Systems" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Student Progress Distribution</h3>
                <p>Distribution of students by progress percentage</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" name="Number of Students" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Course Performance Tab */}
        {activeTab === 'performance' && (
          <>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Course Completion Rate</h3>
                <p>Percentage of students who completed each course</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={coursePerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value) => [`${value}%`, 'Completion Rate']}
                    />
                    <Bar 
                      dataKey="completion" 
                      fill="#10b981" 
                      name="Completion Rate (%)" 
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Average Grade by Course</h3>
                <p>Student performance across different courses</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={coursePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#64748b" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value) => [`${value}%`, 'Average Grade']}
                    />
                    <Bar dataKey="avgGrade" fill="#3b82f6" name="Average Grade (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Student Enrollment by Course</h3>
                <p>Number of students enrolled in each course</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={coursePerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="students" fill="#f59e0b" name="Number of Students" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Grade Distribution Tab */}
        {activeTab === 'grades' && (
          <>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Grade Distribution</h3>
                <p>Overall grade distribution across all courses</p>
              </div>
              <div className="chart-row">
                <div className="chart-wrapper-half">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={gradeDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {gradeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="stats-summary-half">
                  <h4>Grade Summary</h4>
                  <div className="grade-stats-list">
                    {gradeDistributionData.map((grade, index) => (
                      <div key={index} className="grade-stat-item">
                        <div className="grade-color" style={{ backgroundColor: grade.color }}></div>
                        <span className="grade-name">{grade.name}</span>
                        <span className="grade-value">{grade.value} students</span>
                        <span className="grade-percentage">{((grade.value / 100) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="grade-summary-total">
                    <span>Total Students: 100</span>
                    <span className="passing-rate">Passing Rate: 96%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Grade Comparison by Course</h3>
                <p>Average grade comparison across different courses</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={coursePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#64748b" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value) => [`${value}%`, 'Average Grade']}
                    />
                    <Bar dataKey="avgGrade" fill="#8b5cf6" name="Average Grade (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffReports;