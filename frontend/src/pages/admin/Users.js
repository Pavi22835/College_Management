import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users as UsersIcon, 
  UserCheck, 
  UserCog, 
  GraduationCap,
  BookOpen,
  RefreshCw,
  Filter,
  X,
  Check,
  Key,
  Eye,
  EyeOff,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Briefcase
} from 'lucide-react';
import { userApi, staffApi, studentApi } from '../../api/adminApi';
import Spinner from '../../components/common/Spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Users.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Debug: Log available roles
  useEffect(() => {
    if (users.length > 0) {
      const roles = [...new Set(users.map(u => u.role))];
      console.log('📊 Available roles in users:', roles);
      console.log('📊 Users with role TEACHER:', users.filter(u => u.role === 'TEACHER').length);
      console.log('📊 Users with role STAFF:', users.filter(u => u.role === 'STAFF').length);
      console.log('📊 Users with role STUDENT:', users.filter(u => u.role === 'STUDENT').length);
      console.log('📊 Users with role ADMIN:', users.filter(u => u.role === 'ADMIN').length);
    }
  }, [users]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter, statusFilter]);

  // Filter users based on search term and role filter
  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    
    // Apply role filter - Check for both 'TEACHER' and 'STAFF' values
    if (roleFilter) {
      if (roleFilter === 'TEACHER' || roleFilter === 'STAFF') {
        // Filter for STAFF/Teacher role - check both possible values
        filtered = filtered.filter(user => 
          user.role === 'TEACHER' || user.role === 'STAFF'
        );
      } else {
        filtered = filtered.filter(user => user.role === roleFilter);
      }
    }
    
    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.isActive === true);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => user.isActive === false);
      }
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.id?.toString().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower) ||
        user.course?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll(roleFilter, statusFilter);
      const usersData = Array.isArray(data) ? data : [];
      
      // Enhance user data with role-specific information
      const enhancedUsers = await Promise.all(usersData.map(async (user) => {
        // Check for STAFF/Teacher role (both 'TEACHER' and 'STAFF')
        if (user.role === 'TEACHER' || user.role === 'STAFF') {
          try {
            const staffData = await staffApi.getAll();
            const staffList = Array.isArray(staffData) ? staffData : (staffData?.data || []);
            const staffInfo = staffList.find(s => s.userId === user.id || s.email === user.email);
            if (staffInfo) {
              return {
                ...user,
                department: staffInfo.department,
                designation: staffInfo.designation,
                employeeId: staffInfo.employeeId
              };
            }
          } catch (err) {
            console.error('Error fetching staff details:', err);
          }
        } else if (user.role === 'STUDENT') {
          try {
            const studentsData = await studentApi.getAll();
            const studentsList = Array.isArray(studentsData) ? studentsData : (studentsData?.data || []);
            const studentInfo = studentsList.find(s => s.userId === user.id || s.email === user.email);
            if (studentInfo) {
              return {
                ...user,
                course: studentInfo.course,
                semester: studentInfo.semester,
                rollNo: studentInfo.rollNo
              };
            }
          } catch (err) {
            console.error('Error fetching student details:', err);
          }
        }
        return user;
      }));
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await userApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback stats based on current users
      const total = users.length;
      const students = users.filter(u => u.role === 'STUDENT').length;
      const staff = users.filter(u => u.role === 'TEACHER' || u.role === 'STAFF').length;
      const admins = users.filter(u => u.role === 'ADMIN').length;
      const active = users.filter(u => u.isActive).length;
      const inactive = users.filter(u => !u.isActive).length;
      setStats({ total, students, staff, admins, active, inactive });
    }
  };

  const handleActivate = async (userId) => {
    try {
      const response = await userApi.activate(userId);
      if (response.success) {
        setSuccessMessage(`User activated successfully`);
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user');
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      const response = await userApi.deactivate(userId);
      if (response.success) {
        setSuccessMessage(`User deactivated successfully`);
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user');
    }
  };

  const handleResetPassword = async () => {
    try {
      setResetError('');
      if (!newPassword || newPassword.length < 6) {
        setResetError('Password must be at least 6 characters');
        return;
      }

      const response = await userApi.resetPassword(selectedUser.id, newPassword);
      if (response.success) {
        setSuccessMessage(`Password reset successfully for ${selectedUser.name}`);
        setShowResetPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setResetError(error.response?.data?.message || 'Error resetting password');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter('');
    setStatusFilter('');
    setSearchTerm('');
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = filteredUsers.map(user => ({
        'ID': user.id || '',
        'Email': user.email || '',
        'Name': user.name || '',
        'Role': (user.role === 'TEACHER' || user.role === 'STAFF') ? 'STAFF' : user.role || '',
        'Status': user.isActive ? 'ACTIVE' : 'INACTIVE',
        'Department': user.department || user.course || '—',
        'Designation': user.designation || '—',
        'Course': user.course || '—',
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      ws['!cols'] = [
        { wch: 5 },   // ID
        { wch: 25 },  // Email
        { wch: 20 },  // Name
        { wch: 12 },  // Role
        { wch: 10 },  // Status
        { wch: 20 },  // Department
        { wch: 18 },  // Designation
        { wch: 20 },  // Course
        { wch: 12 }   // Last Login
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export to Excel');
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Users List', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Users: ${filteredUsers.length}`, 14, 36);

      const tableColumn = [
        'ID', 
        'Name', 
        'Email', 
        'Role', 
        'Status', 
        'Department'
      ];
      
      const tableRows = filteredUsers.map(user => [
        user.id || '',
        user.name || '',
        user.email || '',
        (user.role === 'TEACHER' || user.role === 'STAFF') ? 'STAFF' : user.role || '',
        user.isActive ? 'ACTIVE' : 'INACTIVE',
        user.department || user.course || '—'
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`users_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Failed to export to PDF');
    }
  };

  if (loading && !users.length) {
    return <Spinner />;
  }

  // Calculate counts for cards
  const totalUsers = users.length;
  const studentsCount = users.filter(u => u.role === 'STUDENT').length;
  const staffCount = users.filter(u => u.role === 'TEACHER' || u.role === 'STAFF').length;
  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  return (
    <div className="user-management">
      {/* Header */}
      <div className="um-header">
        <h1>User Management</h1>
        <p className="um-description">Manage system users and their access permissions</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="um-success-message">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stats Cards - 5 Cards */}
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="stat-icon blue"><UsersIcon size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{totalUsers}</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="stat-icon green"><GraduationCap size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Students</span>
            <span className="stat-value">{studentsCount}</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="stat-icon purple"><Briefcase size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Staff</span>
            <span className="stat-value">{staffCount}</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="stat-icon success"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="stat-icon danger"><XCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Inactive Users</span>
            <span className="stat-value">{inactiveCount}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="um-search-bar">
        <div className="um-search-wrapper">
          <Search className="um-search-icon" size={18} />
          <input
            type="text"
            className="um-search-input"
            placeholder="Search by name, email, ID, role, department, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="um-search-clear" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters and Export */}
      <div className="um-filters">
        <div className="um-filter-group">
          <span className="um-filter-label">Role:</span>
          <select 
            className="um-filter-select"
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="um-filter-group">
          <span className="um-filter-label">Status:</span>
          <select 
            className="um-filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {(searchTerm || roleFilter || statusFilter) && (
          <button className="um-btn um-btn-outline" onClick={clearFilters}>
            <X size={14} />
            Clear Filters
          </button>
        )}

        <button className="um-btn um-btn-outline" onClick={() => fetchUsers()}>
          <RefreshCw size={14} />
          Refresh
        </button>

        {/* Export Dropdown */}
        <div className="export-dropdown">
          <button 
            className="um-btn um-btn-outline"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={14} />
            Export
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <div className="export-menu-body">
                <button className="export-option" onClick={exportToExcel}>
                  <FileSpreadsheet size={16} />
                  <span>Excel</span>
                </button>
                <button className="export-option" onClick={exportToPDF}>
                  <FileText size={16} />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="um-results-count">
          Found <strong>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'user' : 'users'} matching "{searchTerm}"
        </div>
      )}

      {/* Active Filters Display */}
      {roleFilter && (
        <div className="um-active-filters">
          <span className="um-active-filter">
            Role: {roleFilter === 'STAFF' ? 'Staff' : roleFilter}
            <button onClick={() => setRoleFilter('')}>
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {/* Users Table */}
      <div className="um-table-wrapper">
        <table className="um-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>EMAIL</th>
              <th>NAME</th>
              <th>ROLE</th>
              <th>DEPARTMENT/COURSE</th>
              <th>STATUS</th>
              <th>LAST LOGIN</th>
              <th>ACTIONS</th>
            </tr>
            </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const displayRole = (user.role === 'TEACHER' || user.role === 'STAFF') ? 'STAFF' : user.role;
                const departmentOrCourse = user.department || user.course || '—';
                
                return (
                  <tr key={user.id} className={!user.isActive ? 'um-row-inactive' : ''}>
                    <td className="um-id-cell">{user.id}</td>
                    <td className="um-email-cell">{user.email}</td>
                    <td className="um-name-cell">{user.name}</td>
                    <td className="um-role-cell">
                      <span className={`um-role-badge um-role-${(user.role === 'TEACHER' || user.role === 'STAFF') ? 'staff' : user.role?.toLowerCase()}`}>
                        {displayRole}
                      </span>
                    </td>
                    <td className="um-dept-cell">
                      <span className="dept-text" title={departmentOrCourse}>
                        {departmentOrCourse}
                      </span>
                    </td>
                    <td className="um-status-cell">
                      <span className={`um-status-badge um-status-${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="um-login-cell">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="um-actions-cell">
                      <div className="um-action-buttons">
                        {user.isActive ? (
                          <button
                            className="um-btn um-btn-warning um-btn-sm"
                            onClick={() => handleDeactivate(user.id)}
                          >
                            DEACTIVATE
                          </button>
                        ) : (
                          <button
                            className="um-btn um-btn-success um-btn-sm"
                            onClick={() => handleActivate(user.id)}
                          >
                            ACTIVATE
                          </button>
                        )}
                        <button
                          className="um-btn um-btn-info um-btn-sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordModal(true);
                          }}
                        >
                          <Key size={12} />
                          RESET
                        </button>
                      </div>
                    </td>
                   </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="um-text-center">
                  {searchTerm || roleFilter || statusFilter ? (
                    <>
                      <Search size={32} />
                      <p>No users match your search criteria.</p>
                      <button className="um-btn um-btn-outline" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <UsersIcon size={32} />
                      <p>No users found.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="um-modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h2>Reset Password</h2>
              <button className="um-modal-close" onClick={() => setShowResetPasswordModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="um-modal-body">
              <p><strong>User:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {(selectedUser.role === 'TEACHER' || selectedUser.role === 'STAFF') ? 'STAFF' : selectedUser.role}</p>
              
              {resetError && <div className="um-error-message">{resetError}</div>}
              
              <div className="um-form-group">
                <label>New Password:</label>
                <div className="um-password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="um-form-control"
                  />
                  <button
                    type="button"
                    className="um-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="um-modal-footer">
              <button
                className="um-btn um-btn-secondary"
                onClick={() => setShowResetPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                className="um-btn um-btn-primary"
                onClick={handleResetPassword}
              >
                <Key size={14} />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;