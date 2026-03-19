import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  Settings, 
  User, 
  ChevronDown,
  FileText,
  Bell,
  HelpCircle,
  Shield,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import './TopNavbar.css';

const TopNavbar = () => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role-specific display name
  const getRoleDisplay = () => {
    if (isAdmin) return 'ADMIN';
    if (isTeacher) return 'TEACHER';
    if (isStudent) return 'STUDENT';
    return 'USER';
  };

  // Get role-specific icon
  const getRoleIcon = () => {
    if (isAdmin) return <Shield size={12} />;
    if (isTeacher) return <BookOpen size={12} />;
    if (isStudent) return <GraduationCap size={12} />;
    return <User size={12} />;
  };

  // Get role-specific full title for panel
  const getRoleTitle = () => {
    if (isAdmin) return 'Administrator';
    if (isTeacher) return 'Teacher';
    if (isStudent) return 'Student';
    return 'User';
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
      {/* Right Section - Icons and Profile Only */}
      <div className="navbar-right">
        {/* Notification Bell */}
        <div className="notification-wrapper">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
        </div>

        {/* User Profile - Shows LOGGED IN USER's info */}
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

          {/* Profile Dropdown Panel - Shows LOGGED IN USER's details */}
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
                <button className="panel-item" onClick={() => navigate('/profile')}>
                  <User size={16} className="panel-icon" />
                  <div className="panel-item-content">
                    <span className="panel-item-title">My Profile</span>
                    <span className="panel-item-desc">View and edit your profile</span>
                  </div>
                </button>

                <button className="panel-item" onClick={() => navigate('/settings')}>
                  <Settings size={16} className="panel-icon" />
                  <div className="panel-item-content">
                    <span className="panel-item-title">Settings</span>
                    <span className="panel-item-desc">Account preferences</span>
                  </div>
                </button>

                {isAdmin && (
                  <button className="panel-item" onClick={() => navigate('/admin/logs')}>
                    <FileText size={16} className="panel-icon" />
                    <div className="panel-item-content">
                      <span className="panel-item-title">System Logs</span>
                      <span className="panel-item-desc">View system activity</span>
                    </div>
                  </button>
                )}

                {isTeacher && (
                  <button className="panel-item" onClick={() => navigate('/teacher/reports')}>
                    <FileText size={16} className="panel-icon" />
                    <div className="panel-item-content">
                      <span className="panel-item-title">Class Reports</span>
                      <span className="panel-item-desc">View your class reports</span>
                    </div>
                  </button>
                )}

                {isStudent && (
                  <button className="panel-item" onClick={() => navigate('/student/grades')}>
                    <FileText size={16} className="panel-icon" />
                    <div className="panel-item-content">
                      <span className="panel-item-title">My Grades</span>
                      <span className="panel-item-desc">View your academic progress</span>
                    </div>
                  </button>
                )}

                <button className="panel-item" onClick={() => navigate('/help')}>
                  <HelpCircle size={16} className="panel-icon" />
                  <div className="panel-item-content">
                    <span className="panel-item-title">Help & Support</span>
                    <span className="panel-item-desc">Get help with the system</span>
                  </div>
                </button>

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