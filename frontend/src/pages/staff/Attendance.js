import React, { useState, useEffect } from 'react';
import { FiCalendar, FiFilter, FiSave, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import staffApi  from '../../api/staffApi';
import './StaffAttendance.css';

const StaffAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await staffApi.getCourses();
      if (response.success) {
        setCourses(response.data);
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getCourseStudents(selectedCourse, selectedDate);
      if (response.success) {
        setStudents(response.data.students || []);
        
        // Initialize attendance from existing records or defaults
        const initialAttendance = {};
        response.data.students.forEach(student => {
          initialAttendance[student.id] = student.attendanceStatus || 'present';
        });
        setStudentAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId, status) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const attendanceData = {
        courseId: selectedCourse,
        date: selectedDate,
        records: Object.entries(studentAttendance).map(([studentId, status]) => ({
          studentId: parseInt(studentId),
          status: status.toUpperCase()
        }))
      };
      
      const response = await staffApi.markAttendance(attendanceData);
      if (response.success) {
        setLastSaved(new Date());
        alert('Attendance saved successfully!');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return <FiCheckCircle />;
      case 'absent': return <FiXCircle />;
      case 'late': return <FiClock />;
      default: return null;
    }
  };

  const calculateStats = () => {
    const total = students.length;
    const present = Object.values(studentAttendance).filter(s => s === 'present').length;
    const absent = Object.values(studentAttendance).filter(s => s === 'absent').length;
    const late = Object.values(studentAttendance).filter(s => s === 'late').length;
    return { total, present, absent, late, attendanceRate: total ? Math.round((present/total)*100) : 0 };
  };

  const stats = calculateStats();
  const currentCourse = courses.find(c => c.id === parseInt(selectedCourse));

  if (loading && selectedCourse) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="teacher-attendance">
      <div className="page-header">
        <div>
          <h1 className="page-title">Take Attendance</h1>
          <p className="page-subtitle">Mark and manage student attendance</p>
        </div>
      </div>

      <div className="attendance-controls">
        <div className="control-group">
          <div className="control-item">
            <label>Course</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ borderColor: currentCourse?.color || '#3b82f6' }}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="control-item">
            <label>Date</label>
            <div className="date-input">
              <FiCalendar className="input-icon" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="filter-btn">
          <FiFilter /> Filters
        </button>
      </div>

      {selectedCourse ? (
        <>
          <div className="attendance-stats">
            <div className="stat-card total">
              <span className="stat-label">Total Students</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card present">
              <span className="stat-label">Present</span>
              <span className="stat-value">{stats.present}</span>
              <span className="stat-percentage">{stats.attendanceRate}%</span>
            </div>
            <div className="stat-card absent">
              <span className="stat-label">Absent</span>
              <span className="stat-value">{stats.absent}</span>
            </div>
            <div className="stat-card late">
              <span className="stat-label">Late</span>
              <span className="stat-value">{stats.late}</span>
            </div>
          </div>

          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map(student => (
                    <tr key={student.id}>
                      <td className="roll-no">{student.rollNo}</td>
                      <td className="student-name">{student.name}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ 
                            background: `${getStatusColor(studentAttendance[student.id])}15`,
                            color: getStatusColor(studentAttendance[student.id]),
                            borderColor: getStatusColor(studentAttendance[student.id])
                          }}
                        >
                          {getStatusBadge(studentAttendance[student.id])}
                          <span className="status-text">
                            {studentAttendance[student.id]?.charAt(0).toUpperCase() + 
                             studentAttendance[student.id]?.slice(1)}
                          </span>
                        </span>
                      </td>
                      <td>
                        <div className="status-actions">
                          <button 
                            className={`status-btn present ${studentAttendance[student.id] === 'present' ? 'active' : ''}`}
                            onClick={() => toggleAttendance(student.id, 'present')}
                          >
                            <FiCheckCircle /> Present
                          </button>
                          <button 
                            className={`status-btn absent ${studentAttendance[student.id] === 'absent' ? 'active' : ''}`}
                            onClick={() => toggleAttendance(student.id, 'absent')}
                          >
                            <FiXCircle /> Absent
                          </button>
                          <button 
                            className={`status-btn late ${studentAttendance[student.id] === 'late' ? 'active' : ''}`}
                            onClick={() => toggleAttendance(student.id, 'late')}
                          >
                            <FiClock /> Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-students">
                      No students enrolled in this course
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="attendance-footer">
            <button 
              className="save-attendance-btn" 
              onClick={handleSave}
              disabled={saving || !selectedCourse}
            >
              <FiSave /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
            <div className="last-saved">
              {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
            </div>
          </div>
        </>
      ) : (
        <div className="no-course-selected">
          <p>Please select a course to take attendance</p>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
