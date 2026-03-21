import React, { useState } from 'react';
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
  Clock,
  ChevronDown,
  ChevronRight,
  Star,
  UserCog as FacultyIcon,
  UserCheck as MentorIcon
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({
    staff: false
  });

  // DEBUG: Log the full user object to see what properties are available
  console.log('👤 Sidebar - Full user object:', user);
  console.log('👤 Sidebar - User role:', user?.role);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const role = user?.role?.toUpperCase();
    
    if (role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { 
          label: 'Staff', 
          icon: <UserCheck size={18} />,
          hasSubmenu: true,
          submenu: [
            { path: '/admin/staff/hod', label: 'Head of Department (HOD)', icon: <Star size={16} /> },
            { path: '/admin/staff/faculty', label: 'Faculty Member', icon: <FacultyIcon size={16} /> },
            { path: '/admin/staff/mentor', label: 'Mentor', icon: <MentorIcon size={16} /> },
            { path: '/admin/staff', label: 'All Staff', icon: <UserCheck size={16} /> }
          ]
        },
        { path: '/admin/students', label: 'Students', icon: <Users size={18} /> },
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

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className="nav-item-wrapper">
            {item.hasSubmenu ? (
              <>
                <button 
                  className={`nav-item ${openMenus.staff ? 'active' : ''}`}
                  onClick={() => toggleMenu('staff')}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-chevron">
                    {openMenus.staff ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </button>
                {openMenus.staff && (
                  <div className="submenu">
                    {item.submenu.map((subItem, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={subItem.path}
                        className={({ isActive }) => 
                          `submenu-item ${isActive ? 'active' : ''}`
                        }
                      >
                        <span className="submenu-icon">{subItem.icon}</span>
                        <span className="submenu-label">{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )}
          </div>
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