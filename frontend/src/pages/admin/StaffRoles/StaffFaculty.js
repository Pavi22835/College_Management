import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Award
} from 'lucide-react';
import { staffApi } from '../../../api/adminApi';
import './StaffFaculty.css';

const StaffFaculty = () => {
  const [facultyStaff, setFacultyStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchFacultyStaff();
  }, []);

  // Filter staff based on search term
  useEffect(() => {
    let filtered = facultyStaff;

    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(staff => staff.department === departmentFilter);
    }

    if (designationFilter !== 'all') {
      filtered = filtered.filter(staff => staff.designation === designationFilter);
    }

    setFilteredStaff(filtered);
  }, [searchTerm, departmentFilter, designationFilter, facultyStaff]);

  const fetchFacultyStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAll();
      let staffData = [];
      if (response?.success && response?.data) {
        staffData = response.data;
      } else if (Array.isArray(response)) {
        staffData = response;
      }
      // Filter faculty members (exclude HODs and Mentors)
      const faculty = staffData.filter(staff => 
        staff.role === 'FACULTY' || 
        (staff.designation && 
         !staff.designation.toLowerCase().includes('head') &&
         !staff.designation.toLowerCase().includes('hod') &&
         !staff.designation.toLowerCase().includes('mentor'))
      );
      setFacultyStaff(faculty);
      setFilteredStaff(faculty);
    } catch (error) {
      console.error('Error fetching faculty staff:', error);
      setError('Failed to load faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFacultyStaff();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setDesignationFilter('all');
  };

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const depts = facultyStaff.map(s => s.department).filter(Boolean);
    return [...new Set(depts)].sort();
  };

  // Get unique designations for filter
  const getUniqueDesignations = () => {
    const designations = facultyStaff.map(s => s.designation).filter(Boolean);
    return [...new Set(designations)].sort();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Faculty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Faculty</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={handleRefresh}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const uniqueDepartments = getUniqueDepartments();
  const uniqueDesignations = getUniqueDesignations();

  return (
    <div className="staff-faculty">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Faculty Members
          </h1>
          <p className="page-description">Manage teaching faculty and their assignments</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-faculty" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Faculty</span>
            <span className="stat-value">{facultyStaff.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Departments</span>
            <span className="stat-value">{uniqueDepartments.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Designations</span>
            <span className="stat-value">{uniqueDesignations.length}</span>
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
            placeholder="Search faculty by name, email, department..."
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

        <div className="filter-dropdown">
          <Filter className="filter-icon" size={18} />
          <select
            className="filter-select"
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
          >
            <option value="all">All Designations</option>
            {uniqueDesignations.map(desig => (
              <option key={desig} value={desig}>{desig}</option>
            ))}
          </select>
          <ChevronDown className="select-chevron" size={16} />
        </div>
      </div>

      {/* Faculty Table */}
      <div className="table-container">
        <table className="faculty-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Courses</th>
              <th>Actions</th>
            </tr>
            </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((faculty) => (
                <tr key={faculty.id}>
                  <td>
                    <div className="staff-info">
                      <div className="staff-avatar">
                        {faculty.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="staff-name">{faculty.name}</div>
                        <div className="staff-email">{faculty.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="department-badge">{faculty.department}</span>
                  </td>
                  <td>
                    <span className="designation-badge">{faculty.designation}</span>
                  </td>
                  <td>
                    <span className="contact-info">
                      <Mail size={14} />
                      {faculty.email}
                    </span>
                  </td>
                  <td>
                    {faculty.phone ? (
                      <span className="contact-info">
                        <Phone size={14} />
                        {faculty.phone}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className="courses-count">{faculty.courses?.length || 0}</span>
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
                <td colSpan="7" className="empty-state">
                  {facultyStaff.length === 0 ? (
                    <>
                      <Users size={48} />
                      <h3>No Faculty Found</h3>
                      <p>Click "Add Faculty" to create a new faculty member.</p>
                    </>
                  ) : (
                    <>
                      <Search size={48} />
                      <h3>No Matching Faculty</h3>
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

export default StaffFaculty;