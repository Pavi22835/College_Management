import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  User, 
  ChevronDown,
  FileText,
  Shield,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import './TopNavbar.css';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Get user role directly from user object
  const getUserRole = () => {
    const role = user?.role?.toUpperCase();
    console.log('User role:', role);
    return role;
  };

  const isAdmin = getUserRole() === 'ADMIN';
  const isTeacher = getUserRole() === 'STAFF';
  const isStudent = getUserRole() === 'STUDENT';

  console.log('isAdmin:', isAdmin);
  console.log('isTeacher:', isTeacher);
  console.log('isStudent:', isStudent);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = () => {
    if (isAdmin) return 'ADMIN';
    if (isTeacher) return 'TEACHER';
    if (isStudent) return 'STUDENT';
    return 'USER';
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield size={12} />;
    if (isTeacher) return <BookOpen size={12} />;
    if (isStudent) return <GraduationCap size={12} />;
    return <User size={12} />;
  };

  const getRoleTitle = () => {
    if (isAdmin) return 'Administrator';
    if (isTeacher) return 'Teacher';
    if (isStudent) return 'Student';
    return 'User';
  };

  // FIXED: Get role-specific profile URL based on actual role
  const getProfileUrl = () => {
    const role = getUserRole();
    console.log('Getting profile URL for role:', role);
    
    if (role === 'ADMIN') {
      return '/admin/profile';
    }
    if (role === 'STAFF') {
      return '/staff/profile';
    }
    if (role === 'STUDENT') {
      return '/student/profile';
    }
    return '/profile';
  };

  const handleProfileClick = () => {
    const profileUrl = getProfileUrl();
    console.log('Navigating to profile:', profileUrl);
    navigate(profileUrl);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="top-navbar">
      <div className="navbar-right">
        <div className="profile-wrapper" ref={profileRef}>
          <button 
            className="profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="profile-initials">
              {getInitials(user?.name)}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'User'}</span>
              <span className="profile-role">
                {getRoleIcon()}
                {getRoleDisplay()}
              </span>
            </div>
            <ChevronDown className={`profile-arrow ${isProfileOpen ? 'open' : ''}`} size={16} />
          </button>

          {isProfileOpen && (
            <div className="profile-panel">
              <div className="panel-header">
                <div className="panel-initials">
                  {getInitials(user?.name)}
                </div>
                <div className="panel-details">
                  <span className="panel-name">{user?.name || 'User'}</span>
                  <span className="panel-role">{getRoleTitle()}</span>
                </div>
              </div>

              <div className="panel-menu">
                <button className="panel-item" onClick={handleProfileClick}>
                  <User size={16} className="panel-icon" />
                  <div className="panel-item-content">
                    <span className="panel-item-title">My Profile</span>
                    <span className="panel-item-desc">View and edit your profile</span>
                  </div>
                </button>

                {isTeacher && (
                  <button className="panel-item" onClick={() => { navigate('/staff/reports'); setIsProfileOpen(false); }}>
                    <FileText size={16} className="panel-icon" />
                    <div className="panel-item-content">
                      <span className="panel-item-title">Class Reports</span>
                      <span className="panel-item-desc">View your class reports</span>
                    </div>
                  </button>
                )}

                {isStudent && (
                  <button className="panel-item" onClick={() => { navigate('/student/grades'); setIsProfileOpen(false); }}>
                    <FileText size={16} className="panel-icon" />
                    <div className="panel-item-content">
                      <span className="panel-item-title">My Grades</span>
                      <span className="panel-item-desc">View your academic progress</span>
                    </div>
                  </button>
                )}

                <div className="panel-divider"></div>

                <button className="panel-item logout" onClick={logout}>
                  <LogOut size={16} className="panel-icon" />
                  <div className="panel-item-content">
                    <span className="panel-item-title">Logout</span>
                    <span className="panel-item-desc">Sign out of your account</span>
                  </div>
                </button>
              </div>

              <div className="panel-footer">
                <span className="panel-version">Version 1.0.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;