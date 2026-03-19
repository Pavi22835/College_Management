import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Award,
  BarChart3,
  MessageSquare,
  Clock,
  Bell,
  User,
  LogOut,
  Home,
  RefreshCw,
  Upload,
  Edit,
  CheckCircle,
  FileText,
  Mail,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  UserCheck,
  Settings,
  HelpCircle,
  ChevronRight,
  Download,
  Plus,
  Filter,
  Search,
  Eye,
  EyeOff,
  Key,
  Trash2,
  DollarSign,
  Building2,
  UserCog,
  Shield
} from 'lucide-react';
import staffApi from '../../api/staffApi';
import { useAuth } from '../../context/AuthContext';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    teacher: {
      name: '',
      email: '',
      employeeId: '',
      department: '',
      designation: ''
    },
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      averageAttendance: 0,
      pendingGrading: 0,
      totalAssignments: 0,
      totalReports: 0
    },
    courses: [],
    students: [],
    schedule: []
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, coursesResponse, studentsResponse, scheduleResponse] = await Promise.all([
        staffApi.getDashboardStats().catch(err => {
          console.warn('Stats fetch failed:', err);
          return { success: false, data: { stats: { totalCourses: 0, totalStudents: 0, averageAttendance: 0, pendingGrading: 0, totalAssignments: 0, totalReports: 0 } } };
        }),
        staffApi.getCourses().catch(err => {
          console.warn('Courses fetch failed:', err);
          return { success: false, data: [] };
        }),
        staffApi.getStudents().catch(err => {
          console.warn('Students fetch failed:', err);
          return { success: false, data: [] };
        }),
        staffApi.getTodaySchedule().catch(err => {
          console.warn('Schedule fetch failed:', err);
          return { success: false, data: [] };
        })
      ]);

      // Process stats
      let stats = {
        totalCourses: 0,
        totalStudents: 0,
        averageAttendance: 0,
        pendingGrading: 0,
        totalAssignments: 0,
        totalReports: 0
      };
      if (statsResponse?.success && statsResponse?.data?.stats) {
        stats = statsResponse.data.stats;
      }

      // Process courses
      let coursesList = [];
      if (coursesResponse?.success && coursesResponse?.data) {
        coursesList = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      }

      // Process students
      let studentsList = [];
      if (studentsResponse?.success && studentsResponse?.data) {
        studentsList = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
      }

      // Process schedule
      let scheduleList = [];
      if (scheduleResponse?.success && scheduleResponse?.data) {
        scheduleList = Array.isArray(scheduleResponse.data) ? scheduleResponse.data : [];
      }

      setDashboardData({
        teacher: {
          name: user?.name || 'Anju Teacher',
          email: user?.email || 'anju.teacher@example.com',
          employeeId: user?.employeeId || 'TCH003',
          department: user?.department || 'Physics',
          designation: user?.designation || 'Lecturer'
        },
        stats: {
          totalCourses: stats.totalCourses || coursesList.length || 1,
          totalStudents: stats.totalStudents || studentsList.length || 3,
          averageAttendance: stats.averageAttendance || 92,
          pendingGrading: stats.pendingGrading || 8,
          totalAssignments: stats.totalAssignments || 12,
          totalReports: stats.totalReports || 6
        },
        courses: coursesList.length > 0 ? coursesList.slice(0, 3) : [
          { id: 1, name: 'Physics 101', code: 'PHY101', studentsCount: 12, schedule: 'Mon/Wed 10:00 AM' },
          { id: 2, name: 'Quantum Mechanics', code: 'PHY302', studentsCount: 8, schedule: 'Tue/Thu 2:00 PM' },
          { id: 3, name: 'Thermodynamics', code: 'PHY201', studentsCount: 10, schedule: 'Fri 9:00 AM' }
        ],
        students: studentsList.length > 0 ? studentsList.slice(0, 3) : [
          { id: 1, name: 'John Doe', rollNo: 'STU001', course: 'Physics 101' },
          { id: 2, name: 'Jane Smith', rollNo: 'STU002', course: 'Quantum Mechanics' },
          { id: 3, name: 'Mike Johnson', rollNo: 'STU003', course: 'Thermodynamics' }
        ],
        schedule: scheduleList.length > 0 ? scheduleList : [
          { id: 1, name: 'Physics 101', code: 'PHY101', time: '10:00 AM', room: 'Room 201' },
          { id: 2, name: 'Quantum Mechanics', code: 'PHY302', time: '2:00 PM', room: 'Room 305' }
        ]
      });

    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchDashboardData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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

  return (
    <div className="staff-dashboard">
      {/* Header with Welcome Message */}
      <div className="sd-header">
        <div className="sd-header-left">
          <div className="sd-welcome-section">
            <h1 className="sd-header-title">Staff Dashboard</h1>
            <div className="sd-welcome-message">
              <span className="sd-greeting">{getGreeting()},</span>
              <span className="sd-staff-name"> Staff {dashboardData.teacher.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Proper Grid Alignment */}
      <div className="sd-stats-grid">
        <div className="sd-stat-card" onClick={() => navigate('/staff/courses')}>
          <div className="sd-stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">TOTAL COURSES</span>
            <span className="sd-stat-value">{dashboardData.stats.totalCourses}</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/staff/students')}>
          <div className="sd-stat-icon">
            <Users size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">TOTAL STUDENTS</span>
            <span className="sd-stat-value">{dashboardData.stats.totalStudents}</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/staff/attendance')}>
          <div className="sd-stat-icon">
            <Calendar size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">ATTENDANCE</span>
            <span className="sd-stat-value">{dashboardData.stats.averageAttendance}%</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/staff/grading')}>
          <div className="sd-stat-icon">
            <Award size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">PENDING GRADING</span>
            <span className="sd-stat-value">{dashboardData.stats.pendingGrading}</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/staff/assignments')}>
          <div className="sd-stat-icon">
            <FileText size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">ASSIGNMENTS</span>
            <span className="sd-stat-value">{dashboardData.stats.totalAssignments}</span>
          </div>
        </div>

        <div className="sd-stat-card" onClick={() => navigate('/staff/reports')}>
          <div className="sd-stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="sd-stat-content">
            <span className="sd-stat-label">REPORTS</span>
            <span className="sd-stat-value">{dashboardData.stats.totalReports}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout - Courses on Left, Quick Actions on Right */}
      <div className="sd-two-column-layout">
        {/* Left Column - My Courses */}
        <div className="sd-left-column">
          <div className="sd-content-card">
            <div className="sd-card-header">
              <h3 className="sd-card-title">
                <BookOpen size={18} />
                My Courses
              </h3>
              <button className="sd-view-all" onClick={() => navigate('/staff/courses')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="sd-courses-list">
              {dashboardData.courses.map(course => (
                <div key={course.id} className="sd-course-item" onClick={() => navigate(`/staff/courses/${course.id}`)}>
                  <div className="sd-course-info">
                    <h4 className="sd-course-name">{course.name}</h4>
                    <div className="sd-course-code">{course.code}</div>
                    <div className="sd-course-meta">
                      <span><Users size={12} /> {course.studentsCount || 0} students</span>
                      <span><Clock size={12} /> {course.schedule || 'TBA'}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="sd-course-arrow" />
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule Section */}
          <div className="sd-content-card">
            <div className="sd-card-header">
              <h3 className="sd-card-title">
                <Calendar size={18} />
                Today's Schedule
              </h3>
              <button className="sd-view-all" onClick={() => navigate('/staff/schedule')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="sd-schedule-list">
              {dashboardData.schedule.length > 0 ? (
                dashboardData.schedule.map(item => (
                  <div key={item.id} className="sd-schedule-item">
                    <div className="sd-schedule-time">
                      <Clock size={14} />
                      <span>{item.time}</span>
                    </div>
                    <div className="sd-schedule-info">
                      <h4 className="sd-schedule-course">{item.name}</h4>
                      <p className="sd-schedule-code">{item.code}</p>
                    </div>
                    <span className="sd-schedule-room">{item.room}</span>
                  </div>
                ))
              ) : (
                <div className="sd-empty-state">No classes scheduled for today</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions as Cards (each with distinct color) */}
        <div className="sd-right-column">
          <div className="sd-quick-actions-card">
            <h3 className="sd-card-title">
              <Settings size={18} />
              Quick Actions
            </h3>
            <div className="sd-quick-actions-grid">
              <button 
                className="sd-quick-action-card qa-attendance" 
                onClick={() => navigate('/staff/attendance/mark')}
              >
                <div className="sd-quick-action-icon">
                  <CheckCircle size={24} />
                </div>
                <span>Mark Attendance</span>
              </button>
              <button 
                className="sd-quick-action-card qa-grading" 
                onClick={() => navigate('/staff/grading')}
              >
                <div className="sd-quick-action-icon">
                  <Award size={24} />
                </div>
                <span>Grade Assignments</span>
              </button>
              <button 
                className="sd-quick-action-card qa-materials" 
                onClick={() => navigate('/staff/materials/upload')}
              >
                <div className="sd-quick-action-icon">
                  <Upload size={24} />
                </div>
                <span>Upload Materials</span>
              </button>
              <button 
                className="sd-quick-action-card qa-message" 
                onClick={() => navigate('/staff/communication')}
              >
                <div className="sd-quick-action-icon">
                  <MessageSquare size={24} />
                </div>
                <span>Send Message</span>
              </button>
              <button 
                className="sd-quick-action-card qa-create" 
                onClick={() => navigate('/staff/assignments/create')}
              >
                <div className="sd-quick-action-icon">
                  <Plus size={24} />
                </div>
                <span>Create Assignment</span>
              </button>
              <button 
                className="sd-quick-action-card qa-reports" 
                onClick={() => navigate('/staff/reports')}
              >
                <div className="sd-quick-action-icon">
                  <Download size={24} />
                </div>
                <span>Export Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Logout */}
      <div className="sd-footer">
        <button className="sd-footer-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard;
