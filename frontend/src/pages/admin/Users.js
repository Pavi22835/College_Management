import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { userApi } from '../../api/adminApi';
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll(roleFilter, statusFilter);
      setUsers(Array.isArray(data) ? data : []);
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

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = users.map(user => ({
        'ID': user.id || '',
        'Email': user.email || '',
        'Name': user.name || '',
        'Role': user.role || '',
        'Status': user.isActive ? 'ACTIVE' : 'INACTIVE',
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
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
      
      // Add title
      doc.setFontSize(18);
      doc.text('Users List', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Users: ${users.length}`, 14, 36);

      // Prepare table data
      const tableColumn = [
        'ID', 
        'Name', 
        'Email', 
        'Role', 
        'Status', 
        'Last Login'
      ];
      
      const tableRows = users.map(user => [
        user.id || '',
        user.name || '',
        user.email || '',
        user.role || '',
        user.isActive ? 'ACTIVE' : 'INACTIVE',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ]);

      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 0, 0] }
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

  return (
    <div className="user-management">
      {/* Header */}
      <div className="um-header">
        <h1>
          User Management
        </h1>
      </div>

      {/* Stats Cards - Clean & Simple */}
      {stats && (
        <div className="um-stats-grid">
          <div className="um-stat-card">
            <div className="stat-icon blue"><UsersIcon size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.total || 13}</span>
            </div>
          </div>
          <div className="um-stat-card">
            <div className="stat-icon green"><BookOpen size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Enrolled Courses</span>
              <span className="stat-value">{stats.byRole?.students || 7}</span>
            </div>
          </div>
          <div className="um-stat-card">
            <div className="stat-icon purple"><UserCheck size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{stats.active || 7}</span>
            </div>
          </div>
          <div className="um-stat-card">
            <div className="stat-icon gray"><UserCog size={24} /></div>
            <div className="stat-content">
              <span className="stat-label">Inactive Users</span>
              <span className="stat-value">{stats.inactive || 5}</span>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="um-success-message">{successMessage}</div>
      )}

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
            <option value="TEACHER">Teacher</option>
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

      {/* Users Table */}
      <div className="um-table-wrapper">
        <table className="um-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>EMAIL</th>
              <th>NAME</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>LAST LOGIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'um-row-inactive' : ''}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>
                    <span className={`um-role-badge um-role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`um-status-badge um-status-${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="um-actions">
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
                      RESET PASS
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="um-text-center">No users found</td>
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