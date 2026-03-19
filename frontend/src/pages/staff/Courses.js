import React, { useState, useEffect } from 'react';
import { 
  FiBookOpen, 
  FiUsers, 
  FiClock, 
  FiCalendar,
  FiChevronRight,
  FiUser,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiSearch,
  FiFilter,
  FiGrid,
  FiLayers
} from 'react-icons/fi';
import staffApi from '../../api/staffApi';
import { useAuth } from '../../context/AuthContext';
import './StaffCourses.css';

const StaffCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    completedCourses: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch both courses and dashboard stats in parallel
      const [coursesResponse, statsResponse] = await Promise.all([
        staffApi.getCourses().catch(err => {
          console.warn('Courses fetch failed:', err);
          return { data: [] };
        }),
        staffApi.getDashboardStats().catch(err => {
          console.warn('Stats fetch failed:', err);
          return { data: { stats: { totalCourses: 0, totalStudents: 0, averageAttendance: 0 } } };
        })
      ]);
      
      let coursesData = [];
      if (coursesResponse.data && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data;
      } else if (Array.isArray(coursesResponse)) {
        coursesData = coursesResponse;
      }

      // Get stats from dashboard endpoint (includes all students: direct + enrolled)
      let dashboardStats = {
        totalCourses: coursesData.length,
        totalStudents: 0,
        averageProgress: 0,
        completedCourses: 0
      };

      if (statsResponse?.data?.stats) {
        dashboardStats = {
          totalCourses: statsResponse.data.stats.totalCourses || coursesData.length,
          totalStudents: statsResponse.data.stats.totalStudents || 0,
          averageProgress: coursesData.length > 0 
            ? Math.round(coursesData.reduce((sum, course) => sum + (course.progress || 0), 0) / coursesData.length)
            : 0,
          completedCourses: coursesData.filter(c => c.progress === 100).length
        };
      }

      setStats(dashboardStats);
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getSemesterIcon = (semester) => {
    const icons = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ'];
    return icons[semester - 1] || semester;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="tc-teacher-courses">
      {/* Header Section - Fixed icon alignment */}
      <div className="tc-page-header">
        <div className="tc-header-left">
          <div className="tc-header-icon">
            <FiBookOpen />
          </div>
          <div>
            <h1 className="tc-page-title">My Courses</h1>
            <p className="tc-page-description">
              Manage and track your academic courses
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Clean cards matching My Students */}
      <div className="tc-stats-grid">
        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.totalCourses}</span>
          <span className="tc-stat-label">ACTIVE COURSES</span>
        </div>

        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.totalStudents}</span>
          <span className="tc-stat-label">STUDENTS</span>
        </div>

        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.averageProgress}%</span>
          <span className="tc-stat-label">AVG PROGRESS</span>
        </div>

        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.completedCourses}</span>
          <span className="tc-stat-label">COMPLETED</span>
        </div>
      </div>

      {/* Search and Filter Bar - with smaller filter card */}
      <div className="tc-search-filter-bar">
        <div className="tc-search-box">
          <FiSearch className="tc-search-icon" />
          <input
            type="text"
            placeholder="Search courses by name, code, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tc-search-input"
          />
        </div>
        <div className="tc-filter-group tc-compact-filter">
          <FiFilter className="tc-filter-icon" />
          <select className="tc-filter-select tc-compact-select">
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="tc-courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="tc-course-card">
              <div className="tc-course-header">
                <div className="tc-course-title">
                  <h3>{course.name}</h3>
                  <span className="tc-course-code">{course.code}</span>
                </div>
                <div className="tc-semester-badge tc-compact-badge">
                  <FiLayers />
                  <span>Sem {course.semester}</span>
                </div>
              </div>

              <div className="tc-course-metadata">
                <div className="tc-metadata-item">
                  <FiUsers />
                  <span>{course.studentsCount || 0} Students</span>
                </div>
                <div className="tc-metadata-item">
                  <FiClock />
                  <span>{course.schedule || 'Schedule TBD'}</span>
                </div>
                <div className="tc-metadata-item">
                  <FiCalendar />
                  <span>{course.room || 'Room TBD'}</span>
                </div>
              </div>

              <div className="tc-course-progress">
                <div className="tc-progress-header">
                  <span>Course Progress</span>
                  <span className="tc-progress-percentage">{course.progress || 0}%</span>
                </div>
                <div className="tc-progress-track">
                  <div 
                    className="tc-progress-fill" 
                    style={{ 
                      width: `${course.progress || 0}%`,
                      backgroundColor: getProgressColor(course.progress || 0)
                    }}
                  />
                </div>
              </div>

              <div className="tc-course-footer">
                <div className="tc-footer-stats">
                  <span>📊 {course.attendance || 0}% Attendance</span>
                  <span>📝 {course.assignments || 0} Assignments</span>
                </div>
                <button 
                  className="tc-view-details-btn"
                  onClick={() => setSelectedCourse(course)}
                >
                  View Details
                  <FiChevronRight />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="tc-empty-state">
            <FiBookOpen size={64} />
            <h3>No Courses Found</h3>
            <p>No courses match your search criteria or you haven't been assigned any courses yet.</p>
            {searchTerm && (
              <button className="tc-btn-clear" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedCourse.name}</h2>
                <p className="course-code">{selectedCourse.code}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedCourse(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <FiLayers />
                  <div>
                    <label>Semester</label>
                    <span>{selectedCourse.semester}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiUsers />
                  <div>
                    <label>Enrolled Students</label>
                    <span>{selectedCourse.studentsCount || 0}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiClock />
                  <div>
                    <label>Schedule</label>
                    <span>{selectedCourse.schedule || 'Not scheduled'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiCalendar />
                  <div>
                    <label>Room</label>
                    <span>{selectedCourse.room || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              <div className="progress-detail">
                <h4>Course Progress</h4>
                <div className="progress-large">
                  <div 
                    className="progress-fill-large" 
                    style={{ 
                      width: `${selectedCourse.progress || 0}%`,
                      backgroundColor: getProgressColor(selectedCourse.progress || 0)
                    }}
                  />
                  <span className="progress-text">{selectedCourse.progress || 0}% Complete</span>
                </div>
              </div>

              <div className="students-preview">
                <h4>Recent Students</h4>
                {selectedCourse.students?.length > 0 ? (
                  <div className="student-list">
                    {selectedCourse.students.slice(0, 3).map(student => (
                      <div key={student.id} className="student-item">
                        <div className="student-avatar-small">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="student-name">{student.name}</p>
                          <p className="student-roll">{student.rollNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-students">No students enrolled yet</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedCourse(null)}>
                Close
              </button>
              <button className="btn-primary">
                Manage Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCourses;
