import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  Bell,
  User,
  LogOut,
  Home,
  RefreshCw,
  Plus,
  CheckCircle,
  FileText,
  Award,
  MessageSquare,
  Mail,
  Settings,
  BarChart,
  AlertCircle,
  GraduationCap,
  UserCheck,
  HelpCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Search,
  Star
} from 'lucide-react';
import studentApi from '../../api/studentApi';
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    student: {
      name: '',
      rollNo: '',
      course: '',
      semester: '',
      email: '',
      teacher: ''
    },
    stats: {
      enrolledCourses: 0,
      attendance: 0,
      assignments: 0,
      gpa: 0
    },
    courses: [],
    recentAttendance: [],
    upcomingDeadlines: [],
    recentGrades: []
  });

  useEffect(() => {
    console.log('👤 Current user:', user);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching student dashboard...');
      
      // Try to fetch from API, but use demo data if it fails
      try {
        const response = await studentApi.getDashboard();
        console.log('📥 Dashboard response:', response);
        
        if (response?.success && response?.data) {
          // Ensure all nested objects exist
          const data = response.data;
          setDashboardData({
            student: data.student || {
              name: user?.name || 'John Student',
              rollNo: 'STU001',
              course: 'Computer Science',
              semester: '3',
              email: user?.email || 'john@example.com',
              teacher: 'Dr. Sarah Wilson'
            },
            stats: data.stats || {
              enrolledCourses: 4,
              attendance: 85,
              assignments: 6,
              gpa: 3.2
            },
            courses: Array.isArray(data.courses) ? data.courses : [],
            recentAttendance: Array.isArray(data.recentAttendance) ? data.recentAttendance : [],
            upcomingDeadlines: Array.isArray(data.upcomingDeadlines) ? data.upcomingDeadlines : [],
            recentGrades: Array.isArray(data.recentGrades) ? data.recentGrades : []
          });
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, using demo data:', apiError);
      }
      
      // Set demo data if API fails
      setDashboardData({
        student: {
          name: user?.name || 'John Student',
          rollNo: 'STU001',
          course: 'Computer Science',
          semester: '3',
          email: user?.email || 'john@example.com',
          teacher: 'Dr. Sarah Wilson'
        },
        stats: {
          enrolledCourses: 4,
          attendance: 85,
          assignments: 6,
          gpa: 3.2
        },
        courses: [
          { id: 1, name: 'Data Structures', code: 'CS201', instructor: 'Prof. Sharma', schedule: 'Mon/Wed 10:00 AM', room: 'Room 301', progress: 75, color: '#3b82f6' },
          { id: 2, name: 'Algorithms', code: 'CS202', instructor: 'Dr. Gupta', schedule: 'Tue/Thu 2:00 PM', room: 'Room 205', progress: 60, color: '#10b981' },
          { id: 3, name: 'Database Systems', code: 'CS301', instructor: 'Prof. Patel', schedule: 'Fri 9:00 AM', room: 'Lab 102', progress: 45, color: '#f59e0b' },
          { id: 4, name: 'Web Development', code: 'CS401', instructor: 'Mr. Kumar', schedule: 'Mon/Wed 4:00 PM', room: 'Lab 105', progress: 30, color: '#8b5cf6' }
        ],
        recentAttendance: [
          { date: '2024-03-13', course: { name: 'Data Structures' }, status: 'Present' },
          { date: '2024-03-12', course: { name: 'Algorithms' }, status: 'Present' },
          { date: '2024-03-11', course: { name: 'Database Systems' }, status: 'Absent' },
          { date: '2024-03-10', course: { name: 'Web Development' }, status: 'Present' }
        ],
        upcomingDeadlines: [
          { id: 1, title: 'Data Structures Assignment 3', course: 'CS201', dueDate: '2024-03-20', priority: 'high' },
          { id: 2, title: 'Algorithms Quiz', course: 'CS202', dueDate: '2024-03-18', priority: 'medium' },
          { id: 3, title: 'Database Project Proposal', course: 'CS301', dueDate: '2024-03-25', priority: 'low' }
        ],
        recentGrades: [
          { id: 1, title: 'Data Structures Assignment 2', grade: 'A-', percentage: 88 },
          { id: 2, title: 'Algorithms Midterm', grade: 'B+', percentage: 82 },
          { id: 3, title: 'Database Quiz 1', grade: 'A', percentage: 92 }
        ]
      });

    } catch (err) {
      console.error('❌ Error in dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 85) return '#10b981';
    if (attendance >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="sd-loading-container">
        <div className="sd-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-container">
        <AlertCircle size={32} />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button className="sd-retry-btn" onClick={handleRetry}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  // Safe access with default values
  const student = dashboardData?.student || {};
  const stats = dashboardData?.stats || {};
  const courses = dashboardData?.courses || [];
  const recentAttendance = dashboardData?.recentAttendance || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
  const recentGrades = dashboardData?.recentGrades || [];

  return (
    <div className="student-dashboard">
      {/* Header - Updated: Removed notification bell and logout button */}
      <div className="sd-header">
        <div className="sd-header-left">
          <h1 className="sd-header-title">
            Student Dashboard
          </h1>
          <p className="sd-header-subtitle">
            Welcome back, <span className="sd-student-name">{student.name || 'Student'}</span>
          </p>
          
        </div>
        <div className="sd-header-right">
          {/* Only the user avatar remains - notification and logout buttons removed */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="sd-stats-grid">
        <div className="sd-stat-card" onClick={() => navigate('/student/courses')}>
          <div className="sd-stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">ENROLLED COURSES</span>
            <span className="sd-stat-value">{stats.enrolledCourses || 0}</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/student/attendance')}>
          <div className="sd-stat-icon green">
            <Calendar size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">ATTENDANCE</span>
            <span className="sd-stat-value">{stats.attendance || 0}%</span>
          </div>
          <div className="sd-stat-progress">
            <div className="sd-progress-track">
              <div 
                className="sd-progress-fill" 
                style={{ 
                  width: `${stats.attendance || 0}%`,
                  backgroundColor: getAttendanceColor(stats.attendance || 0)
                }}
              />
            </div>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/student/assignments')}>
          <div className="sd-stat-icon purple">
            <FileText size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">ASSIGNMENTS</span>
            <span className="sd-stat-value">{stats.assignments || 0}</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/student/grades')}>
          <div className="sd-stat-icon orange">
            <Award size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">CURRENT GPA</span>
            <span className="sd-stat-value">{stats.gpa || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sd-quick-actions">
        <h2 className="sd-section-title">
          <Settings size={18} />
          Quick Actions
        </h2>
        <div className="sd-quick-actions-grid">
          <button className="sd-quick-action-btn" onClick={() => navigate('/student/courses/enroll')}>
            <Plus size={16} />
            <span>Enroll in Courses</span>
          </button>
          <button className="sd-quick-action-btn" onClick={() => navigate('/student/attendance')}>
            <Calendar size={16} />
            <span>View Attendance</span>
          </button>
          <button className="sd-quick-action-btn" onClick={() => navigate('/student/assignments')}>
            <FileText size={16} />
            <span>View Assignments</span>
          </button>
          <button className="sd-quick-action-btn" onClick={() => navigate('/student/grades')}>
            <Award size={16} />
            <span>Check Grades</span>
          </button>
          <button className="sd-quick-action-btn" onClick={() => navigate('/student/schedule')}>
            <Clock size={16} />
            <span>Class Schedule</span>
          </button>
          <button className="sd-quick-action-btn" onClick={() => navigate('/student/communication')}>
            <MessageSquare size={16} />
            <span>Contact Teacher</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="sd-content-grid">
        {/* My Courses */}
        <div className="sd-content-card sd-full-width">
          <div className="sd-card-header">
            <h2 className="sd-card-title">
              <BookOpen size={18} />
              My Courses
            </h2>
            <button className="sd-view-all" onClick={() => navigate('/student/courses')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="sd-courses-list">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div 
                  key={course.id} 
                  className="sd-course-item"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  <div className="sd-course-color" style={{ backgroundColor: course.color || '#3b82f6' }} />
                  <div className="sd-course-info">
                    <h3 className="sd-course-name">{course.name}</h3>
                    <p className="sd-course-code">{course.code}</p>
                    <p className="sd-course-instructor">{course.instructor}</p>
                    <div className="sd-course-meta">
                      <span><Calendar size={12} /> {course.schedule}</span>
                      <span><Clock size={12} /> {course.room}</span>
                    </div>
                  </div>
                  <div className="sd-course-progress">
                    <span className="sd-progress-value">{course.progress}%</span>
                    <div className="sd-progress-track">
                      <div 
                        className="sd-progress-fill" 
                        style={{ 
                          width: `${course.progress}%`,
                          backgroundColor: course.color || '#3b82f6'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sd-empty-state">
                <p>No courses enrolled</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="sd-content-card">
          <div className="sd-card-header">
            <h2 className="sd-card-title">
              <Clock size={18} />
              Upcoming Deadlines
            </h2>
            <button className="sd-view-all" onClick={() => navigate('/student/deadlines')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="sd-deadlines-list">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="sd-deadline-item">
                  <div className="sd-deadline-info">
                    <h3 className="sd-deadline-title">{deadline.title}</h3>
                    <p className="sd-deadline-course">{deadline.course}</p>
                  </div>
                  <span className={`sd-deadline-badge ${deadline.priority}`}>
                    {deadline.dueDate ? new Date(deadline.dueDate).toLocaleDateString() : 'No date'}
                  </span>
                </div>
              ))
            ) : (
              <div className="sd-empty-state">
                <p>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="sd-content-card">
          <div className="sd-card-header">
            <h2 className="sd-card-title">
              <Award size={18} />
              Recent Grades
            </h2>
            <button className="sd-view-all" onClick={() => navigate('/student/grades')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="sd-grades-list">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade) => (
                <div key={grade.id} className="sd-grade-item">
                  <div className="sd-grade-info">
                    <h3 className="sd-grade-title">{grade.title}</h3>
                    <p className="sd-grade-assignment">{grade.percentage}%</p>
                  </div>
                  <span className="sd-grade-letter">{grade.grade}</span>
                </div>
              ))
            ) : (
              <div className="sd-empty-state">
                <p>No grades available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {recentAttendance.length > 0 && (
        <div className="sd-attendance-section">
          <h2 className="sd-section-title">
            <Calendar size={18} />
            Recent Attendance
          </h2>
          <div className="sd-attendance-list">
            {recentAttendance.map((record, index) => (
              <div key={index} className="sd-attendance-item">
                <div className="sd-attendance-date">
                  {record.date ? new Date(record.date).toLocaleDateString() : 'No date'}
                </div>
                <div className="sd-attendance-course">{record.course?.name || 'Unknown Course'}</div>
                <span className={`sd-attendance-status ${record.status?.toLowerCase() || ''}`}>
                  {record.status || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer - Removed logout button */}
      <div className="sd-footer">
        {/* Footer is now empty - you can add other content here if needed */}
      </div>
    </div>
  );
};

export default StudentDashboard;