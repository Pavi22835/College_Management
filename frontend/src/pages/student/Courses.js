import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen, HiOutlineCalendar, HiOutlineClock, 
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineChartBar,
  HiOutlineChevronRight, HiOutlineSearch
} from 'react-icons/hi';
import studentApi  from '../../api/studentApi';
import './StudentCourses.css';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('in-progress');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'in-progress', label: 'In Progress', count: 0 },
    { id: 'completed', label: 'Completed', count: 0 },
    { id: 'all', label: 'All Courses', count: 0 }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getCourses();
      if (response.success) {
        setCourses(response.data);
        
        // Update tab counts
        const inProgress = response.data.filter(c => c.status === 'in-progress').length;
        const completed = response.data.filter(c => c.status === 'completed').length;
        tabs[0].count = inProgress;
        tabs[1].count = completed;
        tabs[2].count = response.data.length;
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesTab = activeTab === 'all' || course.status === activeTab;
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getProgressColor = (progress) => {
    if (progress >= 70) return '#10b981';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const deadlines = courses.filter(c => c.status === 'in-progress' && c.deadline);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="student-courses">
      {/* Header */}
      <div className="courses-header">
        <div>
          <h1 className="header-title">My Courses</h1>
          <p className="header-subtitle">Track and manage your academic progress</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-section">
        <div className="search-box">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header" style={{ borderLeftColor: course.color || '#3b82f6' }}>
                <div className="course-code-badge">{course.code}</div>
                <h3 className="course-title">{course.title}</h3>
                <div className="course-instructor">
                  <HiOutlineUser className="instructor-icon" />
                  <span>{course.instructor}</span>
                </div>
              </div>

              <div className="course-body">
                {/* Progress */}
                <div className="progress-block">
                  <div className="progress-row">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value" style={{ color: getProgressColor(course.progress) }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${course.progress}%`, 
                        backgroundColor: getProgressColor(course.progress) 
                      }}
                    />
                  </div>
                  <span className="progress-detail">
                    {course.completed}/{course.total} modules
                  </span>
                </div>

                {/* Metrics */}
                <div className="metrics-grid">
                  <div className="metric-item">
                    <HiOutlineAcademicCap className="metric-icon" />
                    <div>
                      <div className="metric-label">Credits</div>
                      <div className="metric-value">{course.credits}</div>
                    </div>
                  </div>
                  <div className="metric-item">
                    <HiOutlineChartBar className="metric-icon" />
                    <div>
                      <div className="metric-label">Grade</div>
                      <div className="metric-value">{course.grade}</div>
                    </div>
                  </div>
                  <div className="metric-item">
                    <HiOutlineClock className="metric-icon" />
                    <div>
                      <div className="metric-label">Attendance</div>
                      <div className="metric-value">{course.attendance}%</div>
                    </div>
                  </div>
                </div>

                {/* Next Class */}
                {course.nextClass && course.location && (
                  <div className="next-class-block">
                    <HiOutlineCalendar className="next-class-icon" />
                    <div>
                      <div className="next-class-label">Next Class</div>
                      <div className="next-class-info">
                        {course.nextClass} • {course.location}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="stats-row">
                  <span className="stat">
                    <HiOutlineBookOpen className="stat-icon" />
                    {course.materials || 0} Materials
                  </span>
                  <span className="stat">
                    <HiOutlineAcademicCap className="stat-icon" />
                    {course.assignments || 0} Assignments
                  </span>
                </div>

                {/* Deadline */}
                {course.status === 'in-progress' && course.deadline && (
                  <div className="deadline-block">
                    <HiOutlineClock className="deadline-icon" />
                    <span className="deadline-text">Due: {course.deadline}</span>
                  </div>
                )}

                {/* Action Button */}
                <button 
                  className="continue-btn"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  Continue Learning
                  <HiOutlineChevronRight />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-courses">No courses found</p>
        )}
      </div>

      {/* Upcoming Deadlines Widget */}
      {deadlines.length > 0 && (
        <div className="deadlines-widget">
          <h2 className="widget-title">Upcoming Deadlines</h2>
          <div className="deadlines-list">
            {deadlines.slice(0, 3).map(course => (
              <div key={course.id} className="deadline-item">
                <div className="deadline-course">
                  <div className="deadline-dot" style={{ backgroundColor: course.color || '#3b82f6' }} />
                  <div>
                    <div className="deadline-course-title">{course.title}</div>
                    <div className="deadline-course-code">{course.code}</div>
                  </div>
                </div>
                <div className="deadline-date">{course.deadline}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;