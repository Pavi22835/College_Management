import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FiCalendar, FiFilter } from 'react-icons/fi';
import  studentApi  from '../../api/studentApi';
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
  const [loading, setLoading] = useState(true);

  const months = [
    { id: 'all', name: 'All Months' },
    { id: '2024-03', name: 'March 2024' },
    { id: '2024-02', name: 'February 2024' },
    { id: '2024-01', name: 'January 2024' },
  ];

  const courses = [
    { id: 'all', name: 'All Courses' },
  ];

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedCourse]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const params = {
        month: selectedMonth !== 'all' ? selectedMonth : undefined,
        courseId: selectedCourse !== 'all' ? selectedCourse : undefined
      };
      
      const response = await studentApi.getAttendance(params);
      if (response.success) {
        setAttendanceData(response.data.records || []);
        setStats(response.data.stats || {});
        setCourseStats(response.data.courseStats || []);
        
        // Update courses list
        if (response.data.courses) {
          courses.push(...response.data.courses.map(c => ({ id: c.id, name: c.name })));
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
                <div className="progress-fill" style={{ width: `${stats.overall}%` }} />
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
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
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
                  <td><span className="course-badge">{record.course}</span></td>
                  <td className="time-cell">{record.time}</td>
                  <td>
                    <span className={`status-badge ${record.status?.toLowerCase()}`}>
                      {getStatusIcon(record.status)}
                      {record.status?.charAt(0).toUpperCase() + record.status?.slice(1).toLowerCase()}
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
              courseStats.map((course, index) => (
                <div key={index} className="course-stat-item">
                  <span className="course-stat-name">{course.name}</span>
                  <div className="course-stat-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.attendance}%` }} />
                    </div>
                    <span className="course-stat-value">{course.attendance}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No course data available</p>
            )}
          </div>
        </div>

        <div className="summary-card">
          <h3>Monthly Summary</h3>
          <div className="monthly-stats">
            <div className="month-stat-item">
              <span className="month-stat-label">Week 1</span>
              <span className="month-stat-badge excellent">95%</span>
            </div>
            <div className="month-stat-item">
              <span className="month-stat-label">Week 2</span>
              <span className="month-stat-badge excellent">90%</span>
            </div>
            <div className="month-stat-item">
              <span className="month-stat-label">Week 3</span>
              <span className="month-stat-badge average">82%</span>
            </div>
            <div className="month-stat-item">
              <span className="month-stat-label">Week 4</span>
              <span className="month-stat-badge average">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;