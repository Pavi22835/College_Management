import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiUsers, 
  FiBookOpen, 
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMessageSquare,
  FiUpload,
  FiDownload,
  FiPlusCircle,
  FiUserCheck,
  FiEdit2
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import staffApi from '../../api/staffApi';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      todayAttendance: 0,
      averageAttendance: 0
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getDashboardStats();
      
      if (response?.data?.stats) {
        setDashboardData({
          stats: response.data.stats,
          recentActivities: response.data.recentActivities || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      icon: <FiUserCheck size={20} />, 
      label: 'Mark Attendance', 
      desc: 'Record student attendance'
    },
    { 
      icon: <FiEdit2 size={20} />, 
      label: 'Grade Assignments', 
      desc: 'Grade student submissions'
    },
    { 
      icon: <FiUpload size={20} />, 
      label: 'Upload Materials', 
      desc: 'Share course materials'
    },
    { 
      icon: <FiMessageSquare size={20} />, 
      label: 'Send Message', 
      desc: 'Communicate with students'
    },
    { 
      icon: <FiPlusCircle size={20} />, 
      label: 'Create Assignment', 
      desc: 'Create new assignments'
    },
    { 
      icon: <FiDownload size={20} />, 
      label: 'Export Reports', 
      desc: 'Download reports'
    }
  ];

  const recentActivities = [
    { description: 'Marked attendance for CS101', time: '2 hours ago' },
    { description: 'Uploaded course materials for Mathematics', time: 'Yesterday' },
    { description: 'Graded 15 assignments', time: 'Yesterday' },
    { description: 'Created new assignment: Programming Basics', time: '2 days ago' }
  ];

  const upcomingTasks = [
    { title: 'Assignment submission deadline', date: 'Tomorrow, 5:00 PM', priority: 'high' },
    { title: 'Faculty meeting', date: 'Thursday, 10:00 AM', priority: 'medium' },
    { title: 'Review student progress', date: 'Friday, 3:00 PM', priority: 'low' }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Welcome Section */}
      <div className="welcome-card">
        <div className="welcome-text">
          <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Teacher'}! 👋</h1>
          <p>Welcome back to your teaching dashboard. Here's what's happening with your courses today.</p>
        </div>
        <div className="date-badge">
          <FiCalendar size={14} />
          <span>{formatDate()}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-icon">
            <FiBookOpen size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{dashboardData.stats.totalCourses}</span>
            <span className="stat-label">Total Courses</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <FiUsers size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{dashboardData.stats.totalStudents}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <FiCheckCircle size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{dashboardData.stats.todayAttendance}%</span>
            <span className="stat-label">Today's Attendance</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <FiTrendingUp size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{dashboardData.stats.averageAttendance}%</span>
            <span className="stat-label">Average Attendance</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Single Row */}
      <div className="actions-section">
        <div className="section-title">
          <h2>Quick Actions</h2>
          <p>Common tasks and shortcuts</p>
        </div>
        <div className="actions-row">
          {quickActions.map((action, idx) => (
            <div key={idx} className="action-card">
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-text">
                <h4>{action.label}</h4>
                <p>{action.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        {/* Recent Activities */}
        <div className="activities-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <button className="link-btn">View All</button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-details">
                  <p>{activity.description}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="tasks-card">
          <div className="card-header">
            <h3>Upcoming Tasks</h3>
            <button className="link-btn">View All</button>
          </div>
          <div className="tasks-list">
            {upcomingTasks.map((task, idx) => (
              <div key={idx} className="task-item">
                <div className={`priority-dot ${task.priority}`}></div>
                <div className="task-details">
                  <p>{task.title}</p>
                  <span>{task.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;