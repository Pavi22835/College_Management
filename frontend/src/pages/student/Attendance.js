import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FiCalendar, FiFilter } from 'react-icons/fi';
import studentApi from '../../api/studentApi';
import './StudentAttendance.css';

const StudentAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    overall: 0,
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });
  const [courseStats, setCourseStats] = useState([]);
  const [courses, setCourses] = useState([{ id: 'all', name: 'All Courses' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const months = [
    { id: 'all', name: 'All Months' },
    { id: '2024-03', name: 'March 2024' },
    { id: '2024-02', name: 'February 2024' },
    { id: '2024-01', name: 'January 2024' },
  ];

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedCourse]);

  const safeGetCourseName = (course) => {
    if (!course) return 'Unknown Course';
    if (typeof course === 'string') return course;
    if (typeof course === 'object') {
      return course.name || course.courseName || course.title || 'Unknown Course';
    }
    return String(course);
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare params
      const params = {};
      if (selectedMonth !== 'all') {
        params.month = selectedMonth;
      }
      if (selectedCourse !== 'all') {
        params.courseId = selectedCourse;
      }
      
      // Fetch real attendance data from API
      const response = await studentApi.getAttendance(params);
      
      console.log('Attendance API Response:', response);
      
      // Process the response based on your backend structure
      let records = [];
      let statsData = {};
      let courseStatsData = [];
      let coursesData = [];
      
      if (response?.success && response?.data) {
        // If response has success flag
        records = response.data.records || response.data.attendances || [];
        statsData = response.data.stats || response.data.summary || {};
        courseStatsData = response.data.courseStats || response.data.byCourse || [];
        coursesData = response.data.courses || [];
      } else if (response?.records) {
        // If response has records directly
        records = response.records;
        statsData = response.stats || {};
        courseStatsData = response.courseStats || [];
      } else if (Array.isArray(response)) {
        // If response is an array directly
        records = response;
      } else if (response?.data && Array.isArray(response.data)) {
        records = response.data;
      }
      
      // Calculate stats if not provided
      if (records.length > 0 && (!statsData.present && !statsData.overall)) {
        const present = records.filter(r => r.status?.toLowerCase() === 'present').length;
        const absent = records.filter(r => r.status?.toLowerCase() === 'absent').length;
        const late = records.filter(r => r.status?.toLowerCase() === 'late').length;
        const total = records.length;
        
        statsData = {
          overall: total > 0 ? Math.round((present / total) * 100) : 0,
          present: present,
          absent: absent,
          late: late,
          total: total
        };
      }
      
      // Process course stats if not provided
      if (courseStatsData.length === 0 && records.length > 0) {
        const courseMap = new Map();
        records.forEach(record => {
          const courseName = safeGetCourseName(record.course || record.courseName);
          if (!courseMap.has(courseName)) {
            courseMap.set(courseName, { total: 0, present: 0 });
          }
          const courseStat = courseMap.get(courseName);
          courseStat.total++;
          if (record.status?.toLowerCase() === 'present') {
            courseStat.present++;
          }
        });
        
        courseStatsData = Array.from(courseMap.entries()).map(([name, data]) => ({
          name: name,
          attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
          total: data.total,
          present: data.present
        }));
      }
      
      // Process courses for filter dropdown
      if (coursesData.length === 0 && records.length > 0) {
        const uniqueCourses = new Set();
        records.forEach(record => {
          const courseName = safeGetCourseName(record.course || record.courseName);
          if (courseName && courseName !== 'Unknown Course') {
            uniqueCourses.add(courseName);
          }
        });
        coursesData = Array.from(uniqueCourses).map((name, index) => ({
          id: index + 1,
          name: name
        }));
      }
      
      // Format attendance records for display
      const formattedRecords = records.map(record => ({
        date: record.date ? new Date(record.date).toLocaleDateString() : '-',
        course: safeGetCourseName(record.course || record.courseName),
        time: record.time ? new Date(record.time).toLocaleTimeString() : (record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : '-'),
        status: record.status || 'present'
      }));
      
      setAttendanceData(formattedRecords);
      setStats({
        overall: statsData.overall || statsData.attendancePercentage || 0,
        present: statsData.present || 0,
        absent: statsData.absent || 0,
        late: statsData.late || 0,
        total: statsData.total || records.length
      });
      setCourseStats(courseStatsData);
      
      // Update courses dropdown
      if (coursesData.length > 0) {
        const courseOptions = [
          { id: 'all', name: 'All Courses' },
          ...coursesData.map(c => ({ 
            id: c.id, 
            name: safeGetCourseName(c.name)
          }))
        ];
        setCourses(courseOptions);
      }
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to load attendance data. Please try again.');
      
      // Fallback demo data for testing when API fails
      setAttendanceData([
        { date: '2024-03-15', course: 'Data Structures', time: '09:00 AM', status: 'present' },
        { date: '2024-03-14', course: 'Algorithms', time: '10:00 AM', status: 'present' },
        { date: '2024-03-13', course: 'Database Systems', time: '11:00 AM', status: 'late' },
        { date: '2024-03-12', course: 'Web Development', time: '09:00 AM', status: 'present' },
        { date: '2024-03-11', course: 'Cloud Computing', time: '10:00 AM', status: 'absent' },
      ]);
      setStats({
        overall: 85,
        present: 45,
        absent: 5,
        late: 3,
        total: 53
      });
      setCourseStats([
        { name: 'Data Structures', attendance: 92 },
        { name: 'Algorithms', attendance: 88 },
        { name: 'Database Systems', attendance: 78 },
        { name: 'Web Development', attendance: 85 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return <CheckCircle size={16} />;
      case 'absent': return <XCircle size={16} />;
      case 'late': return <Clock size={16} />;
      default: return null;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return 'present';
      case 'absent': return 'absent';
      case 'late': return 'late';
      default: return '';
    }
  };

  const getWeekBadgeClass = (percentage) => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="student-attendance">
      <h1 className="page-title">My Attendance</h1>
      <p className="page-subtitle">Track your attendance records</p>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchAttendanceData}>Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Overall</span>
            <span className="stat-value">{stats.overall}%</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.overall}%`, backgroundColor: stats.overall >= 75 ? '#10b981' : stats.overall >= 60 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Present</span>
            <span className="stat-value">{stats.present}</span>
            <span className="stat-unit">days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Absent</span>
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-unit">days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Late</span>
            <span className="stat-value">{stats.late}</span>
            <span className="stat-unit">days</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="filter-item">
            <FiCalendar className="filter-icon" />
            <select 
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map(month => (
                <option key={month.id} value={month.id}>{month.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <FiFilter className="filter-icon" />
            <select 
              className="filter-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {safeGetCourseName(course.name)}
                </option>
              ))}
            </select>
          </div>
          <button className="refresh-btn" onClick={fetchAttendanceData}>
            Refresh
          </button>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot present"></span> Present
          </span>
          <span className="legend-item">
            <span className="legend-dot absent"></span> Absent
          </span>
          <span className="legend-item">
            <span className="legend-dot late"></span> Late
          </span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length > 0 ? (
              attendanceData.map((record, index) => (
                <tr key={index}>
                  <td className="date-cell">{record.date}</td>
                  <td>
                    <span className="course-badge">{record.course}</span>
                  </td>
                  <td className="time-cell">{record.time}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase() : '-'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Course-wise Attendance</h3>
          <div className="course-stats">
            {courseStats.length > 0 ? (
              courseStats.map((course, index) => {
                const attendancePercent = typeof course.attendance === 'number' ? course.attendance : (course.percentage || 0);
                const courseName = safeGetCourseName(course.name);
                
                return (
                  <div key={index} className="course-stat-item">
                    <span className="course-stat-name">{courseName}</span>
                    <div className="course-stat-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${attendancePercent}%`,
                            backgroundColor: attendancePercent >= 75 ? '#10b981' : attendancePercent >= 60 ? '#f59e0b' : '#ef4444'
                          }} 
                        />
                      </div>
                      <span className="course-stat-value">{attendancePercent}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-data">No course data available</p>
            )}
          </div>
        </div>

        <div className="summary-card">
          <h3>Monthly Summary</h3>
          <div className="monthly-stats">
            <div className="month-stat-item">
              <span className="month-stat-label">Total Days</span>
              <span className="month-stat-badge excellent">{stats.total}</span>
            </div>
            <div className="month-stat-item">
              <span className="month-stat-label">Present</span>
              <span className="month-stat-badge excellent">{stats.present}</span>
            </div>
            <div className="month-stat-item">
              <span className="month-stat-label">Absent</span>
              <span className="month-stat-badge average">{stats.absent}</span>
            </div>
            <div className="month-stat-item">
              <span className="month-stat-label">Late</span>
              <span className="month-stat-badge average">{stats.late}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;