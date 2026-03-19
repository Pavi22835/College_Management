import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiMail, 
  FiPhone, 
  FiUser,
  FiRefreshCw,
  FiBookOpen,
  FiUserCheck,
  FiDownload
} from 'react-icons/fi';
import staffApi from '../../api/staffApi';
import { useAuth } from '../../context/AuthContext';
import './StaffStudents.css';

const StaffStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherInfo, setTeacherInfo] = useState({
    name: '',
    id: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      setTeacherInfo({
        name: user?.name || 'Teacher',
        id: user?.id || '',
        department: user?.department || 'Department'
      });
    }
    fetchAssignedStudents();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching students assigned to teacher...');
      
      const response = await staffApi.getStudents();
      
      console.log('📥 API Response:', response);
      
      let studentsData = [];
      
      if (response) {
        if (Array.isArray(response)) {
          studentsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (response.students && Array.isArray(response.students)) {
          studentsData = response.students;
        }
      }
      
      console.log(`✅ Found ${studentsData.length} students assigned to you`);
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
    } catch (err) {
      console.error('❌ Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    alert(`Student Details:
Name: ${student.name}
Roll No: ${student.rollNo}
Email: ${student.email}
Course: ${student.course || 'Not assigned'}
Semester: ${student.semester || 'N/A'}
Phone: ${student.phone || 'N/A'}`);
  };

  const handleEmailStudent = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleCallStudent = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleRefresh = () => {
    fetchAssignedStudents();
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Name', 'Roll No', 'Course', 'Semester', 'Attendance', 'Email', 'Phone'];
    const csvData = filteredStudents.map(s => [
      s.name,
      s.rollNo,
      s.course,
      `Sem ${s.semester || 1}`,
      `${s.attendance || 0}%`,
      s.email,
      s.phone || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
  };

  const getAttendanceColor = (attendance) => {
    if (!attendance) return '#94a3b8';
    if (attendance >= 85) return '#10b981';
    if (attendance >= 75) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Students</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={handleRefresh}>
          <FiRefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="teacher-students">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiUserCheck size={20} />
            My Students
          </h1>
          <p className="page-description">
            <span className="teacher-badge">{teacherInfo.name}</span>
            <span>{teacherInfo.department} Department</span>
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            <FiDownload size={14} />
            Export
          </button>
          <button className="btn-refresh" onClick={handleRefresh} title="Refresh data">
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUser size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Assigned Students</span>
            <span className="stat-value">{students.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiBookOpen size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Courses Teaching</span>
            <span className="stat-value">
              {[...new Set(students.map(s => s.course))].filter(Boolean).length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, roll no, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FiUser className="filter-icon" />
          <select className="filter-select" defaultValue="all">
            <option value="all">All Courses</option>
            {[...new Set(students.map(s => s.course))].filter(Boolean).map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Attendance</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-info">
                      <div className="student-avatar">
                        {student.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="roll-no">{student.rollNo}</span>
                  </td>
                  <td>
                    <span className="course-badge">
                      {student.course || 'Not assigned'}
                    </span>
                  </td>
                  <td>
                    <span className="semester-badge">
                      Sem {student.semester || 1}
                    </span>
                  </td>
                  <td>
                    <div className="attendance-cell">
                      <div className="attendance-bar">
                        <div 
                          className="attendance-fill" 
                          style={{ 
                            width: `${student.attendance || 0}%`,
                            backgroundColor: getAttendanceColor(student.attendance)
                          }}
                        />
                      </div>
                      <span className="attendance-value">
                        {student.attendance || 0}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-actions">
                      {student.email && (
                        <button 
                          className="contact-btn" 
                          onClick={() => handleEmailStudent(student.email)}
                          title={`Email ${student.email}`}
                        >
                          <FiMail size={14} />
                        </button>
                      )}
                      {student.phone && (
                        <button 
                          className="contact-btn" 
                          onClick={() => handleCallStudent(student.phone)}
                          title={`Call ${student.phone}`}
                        >
                          <FiPhone size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn" 
                        onClick={() => handleViewStudent(student)}
                        title="View Details"
                      >
                        <FiEye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <FiUser size={32} />
                  <h3>No Students Assigned</h3>
                  <p>You don't have any students assigned to you yet.</p>
                  <p className="empty-hint">
                    Students will appear here once an admin assigns them to your courses.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer/Pagination */}
      {filteredStudents.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
      )}
    </div>
  );
};

export default StaffStudents;
