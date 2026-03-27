import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Users,
  Calendar,
  Award,
  BarChart3,
  MessageSquare,
  Clock,
  LogOut,
  ChevronRight,
  CheckCircle,
  Upload,
  Plus,
  Download,
  Settings,
  FileText,
  AlertCircle,
  RefreshCw,
  Bell,
  GraduationCap,
  Home,
  User
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
    student: { name: '', rollNo: '', course: '', semester: '', email: '' },
    stats: { totalCourses: 0, totalStudents: 0, todayAttendance: 0, averageAttendance: 0 },
    recentActivities: [],
    upcomingTasks: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await studentApi.getDashboard();
        if (response?.success && response?.data) {
          const data = response.data;
          setDashboardData({
            student: data.student || {
              name: user?.name || 'Ranjith Kumar',
              rollNo: 'CS2024001',
              course: 'Computer Science Engineering',
              semester: '6th Semester',
              email: 'ranjith.kumar@college.edu'
            },
            stats: data.stats || {
              totalCourses: 4,
              totalStudents: 128,
              todayAttendance: 85,
              averageAttendance: 78
            },
            recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : [
              { id: 1, title: 'Marked attendance for Data Structures', time: '2 hours ago' },
              { id: 2, title: 'Assignment submission deadline: Algorithms Quiz', time: 'Tomorrow, 5:00 PM' },
              { id: 3, title: 'Downloaded course materials for Database Systems', time: 'Yesterday' },
              { id: 4, title: 'Submitted Web Development Assignment', time: 'Yesterday' },
              { id: 5, title: 'New announcement: Mid-term exam schedule', time: '2 days ago' }
            ],
            upcomingTasks: Array.isArray(data.upcomingTasks) ? data.upcomingTasks : [
              { id: 1, title: 'Data Structures Assignment', dueDate: 'Tomorrow, 5:00 PM' },
              { id: 2, title: 'Algorithms Quiz', dueDate: 'Thursday, 10:00 AM' },
              { id: 3, title: 'Database Project Submission', dueDate: 'Friday, 3:00 PM' },
              { id: 4, title: 'Web Development Review', dueDate: 'Next Monday, 9:00 AM' }
            ]
          });
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, using demo data:', apiError);
      }
      
      setDashboardData({
        student: {
          name: user?.name || 'Ranjith Kumar',
          rollNo: 'CS2024001',
          course: 'Computer Science Engineering',
          semester: '6th Semester',
          email: 'ranjith.kumar@college.edu'
        },
        stats: {
          totalCourses: 4,
          totalStudents: 128,
          todayAttendance: 85,
          averageAttendance: 78
        },
        recentActivities: [
          { id: 1, title: 'Marked attendance for Data Structures', time: '2 hours ago' },
          { id: 2, title: 'Assignment submission deadline: Algorithms Quiz', time: 'Tomorrow, 5:00 PM' },
          { id: 3, title: 'Downloaded course materials for Database Systems', time: 'Yesterday' },
          { id: 4, title: 'Submitted Web Development Assignment', time: 'Yesterday' },
          { id: 5, title: 'New announcement: Mid-term exam schedule', time: '2 days ago' }
        ],
        upcomingTasks: [
          { id: 1, title: 'Data Structures Assignment', dueDate: 'Tomorrow, 5:00 PM' },
          { id: 2, title: 'Algorithms Quiz', dueDate: 'Thursday, 10:00 AM' },
          { id: 3, title: 'Database Project Submission', dueDate: 'Friday, 3:00 PM' },
          { id: 4, title: 'Web Development Review', dueDate: 'Next Monday, 9:00 AM' }
        ]
      });

    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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
        <button className="sd-retry-btn" onClick={fetchDashboardData}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Main Content */}
      <main className="sd-main-container">
        {/* Header Section */}
        <div className="sd-header-section">
          <h1 className="sd-greeting">
            {getGreeting()}, {dashboardData.student.name.split(' ')[0]}! 🎉
          </h1>
          <p className="sd-welcome-message">
            Welcome back to your student dashboard. Here's what's happening with your courses today.
          </p>
        </div>

        {/* Stats Cards - 4 Cards */}
        <div className="sd-stats-cards">
          <div className="sd-stat-card" onClick={() => navigate('/student/courses')}>
            <div className="sd-stat-icon blue">
              <BookOpen size={24} />
            </div>
            <div className="sd-stat-info">
              <span className="sd-stat-number">{dashboardData.stats.totalCourses}</span>
              <span className="sd-stat-label">TOTAL COURSES</span>
            </div>
          </div>

          <div className="sd-stat-card" onClick={() => navigate('/student/attendance')}>
            <div className="sd-stat-icon green">
              <Users size={24} />
            </div>
            <div className="sd-stat-info">
              <span className="sd-stat-number">{dashboardData.stats.totalStudents}</span>
              <span className="sd-stat-label">CLASSMATES</span>
            </div>
          </div>

          <div className="sd-stat-card" onClick={() => navigate('/student/attendance/today')}>
            <div className="sd-stat-icon orange">
              <Calendar size={24} />
            </div>
            <div className="sd-stat-info">
              <span className="sd-stat-number">{dashboardData.stats.todayAttendance}%</span>
              <span className="sd-stat-label">TODAY'S ATTENDANCE</span>
            </div>
          </div>

          <div className="sd-stat-card" onClick={() => navigate('/student/attendance')}>
            <div className="sd-stat-icon purple">
              <BarChart3 size={24} />
            </div>
            <div className="sd-stat-info">
              <span className="sd-stat-number">{dashboardData.stats.averageAttendance}%</span>
              <span className="sd-stat-label">AVERAGE ATTENDANCE</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="sd-quick-actions">
          <div className="sd-section-header">
            <h2>Quick Actions</h2>
            <p>Common tasks and shortcuts</p>
          </div>
          
          <div className="sd-actions-grid">
            <button className="sd-action-item" onClick={() => navigate('/student/attendance/mark')}>
              <div className="sd-action-icon">
                <CheckCircle size={20} />
              </div>
              <div className="sd-action-text">
                <span className="sd-action-title">Mark Attendance</span>
                <span className="sd-action-desc">Record student attendance</span>
              </div>
            </button>
            
            <button className="sd-action-item" onClick={() => navigate('/student/assignments')}>
              <div className="sd-action-icon">
                <FileText size={20} />
              </div>
              <div className="sd-action-text">
                <span className="sd-action-title">View Assignments</span>
                <span className="sd-action-desc">Check pending submissions</span>
              </div>
            </button>
            
            <button className="sd-action-item" onClick={() => navigate('/student/materials')}>
              <div className="sd-action-icon">
                <Download size={20} />
              </div>
              <div className="sd-action-text">
                <span className="sd-action-title">Download Materials</span>
                <span className="sd-action-desc">Access course resources</span>
              </div>
            </button>
            
            <button className="sd-action-item" onClick={() => navigate('/student/communication')}>
              <div className="sd-action-icon">
                <MessageSquare size={20} />
              </div>
              <div className="sd-action-text">
                <span className="sd-action-title">Send Message</span>
                <span className="sd-action-desc">Communicate with teachers</span>
              </div>
            </button>
            
            <button className="sd-action-item" onClick={() => navigate('/student/assignments/create')}>
              <div className="sd-action-icon">
                <Upload size={20} />
              </div>
              <div className="sd-action-text">
                <span className="sd-action-title">Submit Assignment</span>
                <span className="sd-action-desc">Upload your work</span>
              </div>
            </button>
            
            <button className="sd-action-item" onClick={() => navigate('/student/grades')}>
              <div className="sd-action-icon">
                <Award size={20} />
              </div>
              <div className="sd-action-text">
                <span className="sd-action-title">View Grades</span>
                <span className="sd-action-desc">Check your performance</span>
              </div>
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="sd-two-columns">
          {/* Recent Activities */}
          <div className="sd-activities-card">
            <div className="sd-card-header">
              <h3>Recent Activities</h3>
              <button className="sd-view-link" onClick={() => navigate('/student/activities')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="sd-activities-list">
              {dashboardData.recentActivities.map(activity => (
                <div key={activity.id} className="sd-activity-row">
                  <div className="sd-activity-details">
                    <span className="sd-activity-title">{activity.title}</span>
                    <span className="sd-activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="sd-tasks-card">
            <div className="sd-card-header">
              <h3>Upcoming Tasks</h3>
              <button className="sd-view-link" onClick={() => navigate('/student/tasks')}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="sd-tasks-list">
              {dashboardData.upcomingTasks.map(task => (
                <div key={task.id} className="sd-task-row">
                  <div className="sd-task-details">
                    <span className="sd-task-title">{task.title}</span>
                    <span className="sd-task-date">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;