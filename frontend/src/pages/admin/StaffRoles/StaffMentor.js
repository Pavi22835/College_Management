import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  Users as StudentsIcon,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Star
} from 'lucide-react';
import { staffApi } from '../../../api/adminApi';
import './StaffMentor.css';

const StaffMentor = () => {
  const [mentorStaff, setMentorStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMentorStaff();
  }, []);

  // Filter staff based on search term
  useEffect(() => {
    let filtered = mentorStaff;

    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(staff => staff.department === departmentFilter);
    }

    setFilteredStaff(filtered);
  }, [searchTerm, departmentFilter, mentorStaff]);

  const fetchMentorStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAll();
      let staffData = [];
      if (response?.success && response?.data) {
        staffData = response.data;
      } else if (Array.isArray(response)) {
        staffData = response;
      }
      // Filter mentors
      const mentors = staffData.filter(staff => 
        staff.role === 'MENTOR' || 
        staff.designation?.toLowerCase().includes('mentor')
      );
      setMentorStaff(mentors);
      setFilteredStaff(mentors);
    } catch (error) {
      console.error('Error fetching mentor staff:', error);
      setError('Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMentorStaff();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const depts = mentorStaff.map(s => s.department).filter(Boolean);
    return [...new Set(depts)].sort();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Mentors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Mentors</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={handleRefresh}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const uniqueDepartments = getUniqueDepartments();

  return (
    <div className="staff-mentor">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Mentors
          </h1>
          <p className="page-description">Manage student mentors and their assigned students</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-mentor">
            <Plus size={20} />
            <span>Add Mentor</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Mentors</span>
            <span className="stat-value">{mentorStaff.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <StudentsIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">—</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg Rating</span>
            <span className="stat-value">—</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search mentor by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-dropdown">
          <Filter className="filter-icon" size={18} />
          <select
            className="filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <ChevronDown className="select-chevron" size={16} />
        </div>
      </div>

      {/* Mentor Table */}
      <div className="table-container">
        <table className="mentor-table">
          <thead>
            <tr>
              <th>Mentor Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Students Assigned</th>
              <th>Actions</th>
            </tr>
            </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((mentor) => (
                <tr key={mentor.id}>
                  <td>
                    <div className="staff-info">
                      <div className="staff-avatar">
                        {mentor.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="staff-name">{mentor.name}</div>
                        <div className="staff-email">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="department-badge">{mentor.department}</span>
                  </td>
                  <td>
                    <span className="contact-info">
                      <Mail size={14} />
                      {mentor.email}
                    </span>
                  </td>
                  <td>
                    {mentor.phone ? (
                      <span className="contact-info">
                        <Phone size={14} />
                        {mentor.phone}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className="students-count">{mentor.studentsCount || 0}</span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn view" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="action-btn edit" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="action-btn delete" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  {mentorStaff.length === 0 ? (
                    <>
                      <UserCheck size={48} />
                      <h3>No Mentors Found</h3>
                      <p>Click "Add Mentor" to assign a mentor.</p>
                    </>
                  ) : (
                    <>
                      <Search size={48} />
                      <h3>No Matching Mentors</h3>
                      <p>Try adjusting your search criteria.</p>
                      <button className="btn-secondary" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffMentor;