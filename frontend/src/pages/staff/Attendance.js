import React, { useState, useEffect } from 'react';
import { FiCalendar, FiSave, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import staffApi from '../../api/staffApi';
import attendanceApi from '../../api/attendanceApi';
import './StaffAttendance.css';

const StaffAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Checkbox selection states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionStatus, setBulkActionStatus] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0
  });

  // Fetch courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await staffApi.getCourses();
        
        let coursesData = [];
        if (response?.data && Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (Array.isArray(response)) {
          coursesData = response;
        } else if (response?.success && response?.data && Array.isArray(response.data)) {
          coursesData = response.data;
        }
        
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id.toString());
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);

  // Fetch students when course or date changes
  useEffect(() => {
    if (selectedCourse) {
      const loadStudents = async () => {
        try {
          setRefreshing(true);
          setError(null);
          
          const response = await attendanceApi.getCourseAttendance(selectedCourse, selectedDate);
          
          let studentsData = [];
          let attendanceMap = {};
          
          if (response?.success && response?.data) {
            const data = response.data;
            studentsData = data.students || [];
            
            studentsData.forEach(student => {
              let status = 'absent';
              if (student.status === 'PRESENT') status = 'present';
              else if (student.status === 'ABSENT') status = 'absent';
              else if (student.status === 'LATE') status = 'late';
              else if (student.status === 'NOT_MARKED') status = 'absent';
              attendanceMap[student.id] = status;
            });
          } else if (Array.isArray(response)) {
            studentsData = response;
            studentsData.forEach(student => {
              attendanceMap[student.id] = student.attendanceStatus || 'absent';
            });
          } else if (response?.data?.students) {
            studentsData = response.data.students;
            studentsData.forEach(student => {
              let status = 'absent';
              if (student.status === 'PRESENT') status = 'present';
              else if (student.status === 'ABSENT') status = 'absent';
              else if (student.status === 'LATE') status = 'late';
              attendanceMap[student.id] = status;
            });
          }
          
          setStudents(studentsData);
          setStudentAttendance(attendanceMap);
          
          const total = studentsData.length;
          const present = Object.values(attendanceMap).filter(s => s === 'present').length;
          const absent = Object.values(attendanceMap).filter(s => s === 'absent').length;
          const late = Object.values(attendanceMap).filter(s => s === 'late').length;
          
          setStats({
            total,
            present,
            absent,
            late,
            attendanceRate: total ? Math.round((present / total) * 100) : 0
          });
          
          // Fetch course stats
          const statsResponse = await attendanceApi.getTeacherAttendanceStats();
          if (statsResponse?.success && statsResponse?.data) {
            const byCourse = statsResponse.data.byCourse || [];
            const currentCourseStat = byCourse.find(c => c.courseId === parseInt(selectedCourse));
            if (currentCourseStat) {
              setStats(prev => ({
                ...prev,
                present: currentCourseStat.present || prev.present,
                absent: currentCourseStat.absent || prev.absent,
                late: currentCourseStat.late || prev.late,
                attendanceRate: currentCourseStat.attendancePercentage || prev.attendanceRate
              }));
            }
          }
          
        } catch (error) {
          console.error('Error fetching students:', error);
          setError('Failed to load students. Please try again.');
        } finally {
          setRefreshing(false);
        }
      };
      
      loadStudents();
    }
  }, [selectedCourse, selectedDate]);

  // Reset pagination and selections when data changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedStudents([]);
    setSelectAll(false);
  }, [students, selectedCourse, selectedDate]);

  const toggleAttendance = (studentId, status) => {
    const newAttendance = {
      ...studentAttendance,
      [studentId]: status
    };
    setStudentAttendance(newAttendance);
    
    // Remove from selected if it was selected
    setSelectedStudents(prev => prev.filter(id => id !== studentId));
    
    // Update stats
    const total = students.length;
    const present = Object.values(newAttendance).filter(s => s === 'present').length;
    const absent = Object.values(newAttendance).filter(s => s === 'absent').length;
    const late = Object.values(newAttendance).filter(s => s === 'late').length;
    
    setStats({
      total,
      present,
      absent,
      late,
      attendanceRate: total ? Math.round((present / total) * 100) : 0
    });
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
      setSelectAll(false);
    } else {
      const currentPageStudentIds = currentStudents.map(s => s.id);
      setSelectedStudents(currentPageStudentIds);
      setSelectAll(true);
    }
  };

  const handleBulkStatusChange = (status) => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    
    const newAttendance = { ...studentAttendance };
    selectedStudents.forEach(studentId => {
      newAttendance[studentId] = status;
    });
    setStudentAttendance(newAttendance);
    
    // Update stats
    const total = students.length;
    const present = Object.values(newAttendance).filter(s => s === 'present').length;
    const absent = Object.values(newAttendance).filter(s => s === 'absent').length;
    const late = Object.values(newAttendance).filter(s => s === 'late').length;
    
    setStats({
      total,
      present,
      absent,
      late,
      attendanceRate: total ? Math.round((present / total) * 100) : 0
    });
    
    setBulkActionStatus(status);
    setTimeout(() => setBulkActionStatus(null), 2000);
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    if (students.length === 0) {
      setError('No students to mark attendance for');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const records = Object.entries(studentAttendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status: status.toUpperCase()
      }));
      
      const response = await attendanceApi.markAttendance(
        parseInt(selectedCourse),
        selectedDate,
        records,
        true
      );
      
      if (response?.success) {
        setLastSaved(new Date());
        
        // Refresh data
        const refreshResponse = await attendanceApi.getCourseAttendance(selectedCourse, selectedDate);
        if (refreshResponse?.success && refreshResponse?.data) {
          const studentsData = refreshResponse.data.students || [];
          const attendanceMap = {};
          studentsData.forEach(student => {
            let status = 'absent';
            if (student.status === 'PRESENT') status = 'present';
            else if (student.status === 'ABSENT') status = 'absent';
            else if (student.status === 'LATE') status = 'late';
            attendanceMap[student.id] = status;
          });
          setStudents(studentsData);
          setStudentAttendance(attendanceMap);
        }
        
        setSelectedStudents([]);
        setSelectAll(false);
        
        alert(response.message || `Attendance saved successfully for ${records.length} students`);
      } else {
        throw new Error(response?.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save attendance';
      setError(errorMsg);
      alert('Failed to save attendance: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Update selectAll when current page selection changes
  useEffect(() => {
    const currentPageStudentIds = currentStudents.map(s => s.id);
    const allSelected = currentPageStudentIds.length > 0 && 
      currentPageStudentIds.every(id => selectedStudents.includes(id));
    setSelectAll(allSelected);
  }, [selectedStudents, currentStudents]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedStudents([]);
      setSelectAll(false);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedStudents([]);
      setSelectAll(false);
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
      case 'present': return <FiCheckCircle size={14} />;
      case 'absent': return <FiXCircle size={14} />;
      case 'late': return <FiClock size={14} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      default: return 'Absent';
    }
  };

  const currentCourse = courses.find(c => c.id === parseInt(selectedCourse));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
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
        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          <FiRefreshCw className={refreshing ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {bulkActionStatus && (
        <div className="bulk-success-message">
          <FiCheckCircle size={16} />
          <span>Bulk marked as {bulkActionStatus.toUpperCase()} for {selectedStudents.length} students</span>
        </div>
      )}

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
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
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
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedCourse ? (
        <>
          <div className="attendance-stats">
            <div className="stat-card total">
              <span className="stat-label">Total Students</span>
              <span className="stat-value">{stats.total || students.length}</span>
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

          {/* Bulk Actions Bar */}
          {selectedStudents.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-selected-count">{selectedStudents.length} student(s) selected</span>
              <div className="bulk-actions-buttons">
                <button 
                  className="bulk-action-btn present"
                  onClick={() => handleBulkStatusChange('present')}
                >
                  <FiCheckCircle size={14} /> Mark Present
                </button>
                <button 
                  className="bulk-action-btn absent"
                  onClick={() => handleBulkStatusChange('absent')}
                >
                  <FiXCircle size={14} /> Mark Absent
                </button>
                <button 
                  className="bulk-action-btn late"
                  onClick={() => handleBulkStatusChange('late')}
                >
                  <FiClock size={14} /> Mark Late
                </button>
              </div>
            </div>
          )}

          <div className="attendance-table-container">
            {refreshing ? (
              <div className="loading-overlay">
                <div className="loading-spinner-small"></div>
                <p>Loading students...</p>
              </div>
            ) : (
              <>
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={currentStudents.length === 0}
                        />
                      </th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length > 0 ? (
                      currentStudents.map(student => (
                        <tr key={student.id} className={selectedStudents.includes(student.id) ? 'selected-row' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelect(student.id)}
                            />
                          </td>
                          <td className="roll-no">{student.rollNo || '-'}</td>
                          <td className="student-name">{student.name}</td>
                          <td className="student-email">{student.email || '-'}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ 
                                background: `${getStatusColor(studentAttendance[student.id])}15`,
                                color: getStatusColor(studentAttendance[student.id]),
                                border: `1px solid ${getStatusColor(studentAttendance[student.id])}20`
                              }}
                            >
                              {getStatusBadge(studentAttendance[student.id])}
                              <span className="status-text">
                                {getStatusText(studentAttendance[student.id])}
                              </span>
                            </span>
                          </td>
                          <td>
                            <div className="status-actions">
                              <button 
                                className={`status-btn present ${studentAttendance[student.id] === 'present' ? 'active' : ''}`}
                                onClick={() => toggleAttendance(student.id, 'present')}
                                title="Mark Present"
                              >
                                <FiCheckCircle size={16} /> Present
                              </button>
                              <button 
                                className={`status-btn absent ${studentAttendance[student.id] === 'absent' ? 'active' : ''}`}
                                onClick={() => toggleAttendance(student.id, 'absent')}
                                title="Mark Absent"
                              >
                                <FiXCircle size={16} /> Absent
                              </button>
                              <button 
                                className={`status-btn late ${studentAttendance[student.id] === 'late' ? 'active' : ''}`}
                                onClick={() => toggleAttendance(student.id, 'late')}
                                title="Mark Late"
                              >
                                <FiClock size={16} /> Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-students">
                          <div className="empty-state">
                            <p>No students enrolled in this course</p>
                            <p className="hint">Please select a different course or add students to this course</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {students.length > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <span>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, students.length)} of {students.length} entries
                      </span>
                      <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                          setSelectedStudents([]);
                          setSelectAll(false);
                        }}
                        className="pagination-select"
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                      </select>
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                      >
                        <FiChevronLeft size={16} /> Previous
                      </button>
                      <span className="pagination-page">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="attendance-footer">
            <div className="footer-left">
              <button 
                className="save-attendance-btn" 
                onClick={handleSave}
                disabled={saving || !selectedCourse || students.length === 0}
              >
                <FiSave /> {saving ? 'Saving...' : 'Save Attendance'}
              </button>
              {lastSaved && (
                <span className="last-saved">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="footer-stats">
              <span>Present: <strong className="present-count">{stats.present}</strong></span>
              <span>Absent: <strong className="absent-count">{stats.absent}</strong></span>
              <span>Late: <strong className="late-count">{stats.late}</strong></span>
              <span>Total: <strong>{stats.total || students.length}</strong></span>
            </div>
          </div>
        </>
      ) : (
        <div className="no-course-selected">
          <div className="empty-state">
            <p>Please select a course to take attendance</p>
            {courses.length === 0 && (
              <p className="hint">No courses found. Please contact administrator.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;