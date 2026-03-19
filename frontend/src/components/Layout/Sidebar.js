import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  UserCog,
  Building2,
  BarChart3,
  LogOut,
  GraduationCap,
  Award,
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // DEBUG: Log the full user object to see what properties are available
  console.log('👤 Sidebar - Full user object:', user);
  console.log('👤 Sidebar - User role:', user?.role);

  // Get menu items based on user role
  const getMenuItems = () => {
    const role = user?.role?.toUpperCase();
    
    if (role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/admin/students', label: 'Students', icon: <Users size={18} /> },
        { path: '/admin/staff', label: 'Staff', icon: <UserCheck size={18} /> },
        { path: '/admin/courses', label: 'Courses', icon: <BookOpen size={18} /> },
        { path: '/admin/attendance', label: 'Attendance', icon: <Calendar size={18} /> },
        { path: '/admin/users', label: 'User Management', icon: <UserCog size={18} /> },
        { path: '/admin/departments', label: 'Departments', icon: <Building2 size={18} /> },
        { path: '/admin/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
      ];
    } 
    else if (role === 'STAFF') {
      return [
        { path: '/staff/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/staff/courses', label: 'My Courses', icon: <BookOpen size={18} /> },
        { path: '/staff/students', label: 'My Students', icon: <Users size={18} /> },
        { path: '/staff/attendance', label: 'Attendance', icon: <Calendar size={18} /> },
        { path: '/staff/grading', label: 'Grading', icon: <Award size={18} /> },
        { path: '/staff/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
        { path: '/staff/communication', label: 'Communication', icon: <MessageSquare size={18} /> },
      ];
    }
    else if (role === 'STUDENT') {
      return [
        { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/student/courses', label: 'My Courses', icon: <BookOpen size={18} /> },
        { path: '/student/attendance', label: 'Attendance', icon: <Calendar size={18} /> },
        { path: '/student/assignments', label: 'Assignments', icon: <FileText size={18} /> },
        { path: '/student/grades', label: 'My Grades', icon: <Award size={18} /> },
        { path: '/student/schedule', label: 'Schedule', icon: <Clock size={18} /> },
      ];
    }
    
    return [];
  };

  // Helper function to get portal title
  const getPortalTitle = () => {
    const role = user?.role?.toUpperCase();
    
    if (role === 'ADMIN') return 'Admin Portal';
    if (role === 'TEACHER') return 'Teacher Portal';
    if (role === 'STUDENT') return 'Student Portal';
    return 'Portal';
  };

  const menuItems = getMenuItems();
  const portalTitle = getPortalTitle();

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h1>{portalTitle}</h1>
      </div>

      {/* USER INFO SECTION COMPLETELY REMOVED - NO NAMES FOR ANY ROLE */}

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
