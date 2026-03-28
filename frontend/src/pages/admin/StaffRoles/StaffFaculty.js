import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Save,
  CheckCircle,
  AlertCircle,
  Lock,
  EyeOff,
  Archive,
  RotateCcw
} from 'lucide-react';
import { staffApi } from '../../../api/adminApi';
import './StaffFaculty.css';

const StaffFaculty = () => {
  const [facultyStaff, setFacultyStaff] = useState([]);
  const [deletedStaff, setDeletedStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const departmentSearchRef = useRef(null);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    phone: '',
    employeeId: '',
    address: '',
    qualification: '',
    joiningDate: ''
  });

  // Department options
  const departmentOptions = [
    "Computer Science",
    "Computer Science and Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Electronics and Communication Engineering",
    "Civil Engineering",
    "Electrical and Electronics Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Commerce",
    "Business Administration"
  ];

  // Filter departments based on search term
  const filteredDepartments = departmentOptions.filter(dept =>
    dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  // Designation options for Faculty
  const designationOptions = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Senior Lecturer",
    "Lecturer",
    "Teaching Assistant"
  ];

  useEffect(() => {
    fetchFacultyStaff();
  }, []);

  // Click outside handler for department dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentSearchRef.current && !departmentSearchRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter staff based on search term
  useEffect(() => {
    let filtered = activeTab === 'active' ? facultyStaff : deletedStaff;

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
  }, [searchTerm, departmentFilter, designationFilter, facultyStaff, deletedStaff, activeTab]);

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
      const allFaculty = staffData.filter(staff => 
        staff.staffRole === 'FACULTY' || 
        (staff.designation && 
         !staff.designation.toLowerCase().includes('head') &&
         !staff.designation.toLowerCase().includes('hod') &&
         !staff.designation.toLowerCase().includes('mentor'))
      );
      
      const active = allFaculty.filter(staff => staff.isDeleted !== true && staff.status !== 'deleted');
      const deleted = allFaculty.filter(staff => staff.isDeleted === true || staff.status === 'deleted');
      
      setFacultyStaff(active);
      setDeletedStaff(deleted);
      setFilteredStaff(active);
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

  // Handle Add button click
  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      phone: '',
      employeeId: '',
      address: '',
      qualification: '',
      joiningDate: ''
    });
    setDepartmentSearchTerm('');
    setShowPassword(false);
    setSelectedStaff(null);
    setModalType('add');
    setShowModal(true);
  };

  // Handle Edit button click
  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      password: '',
      department: staff.department || '',
      designation: staff.designation || '',
      phone: staff.phone || '',
      employeeId: staff.employeeId || '',
      address: staff.address || '',
      qualification: staff.qualification || '',
      joiningDate: staff.joiningDate?.split('T')[0] || ''
    });
    setDepartmentSearchTerm(staff.department || '');
    setShowPassword(false);
    setModalType('edit');
    setShowModal(true);
  };

  // Handle View button click
  const handleView = (staff) => {
    setSelectedStaff(staff);
    setModalType('view');
    setShowModal(true);
  };

  // Soft Delete - Move to trash
  const handleSoftDelete = async (staff) => {
    setSelectedStaff(staff);
    setModalType('softDelete');
    setShowModal(true);
  };

  // Confirm Soft Delete
  const confirmSoftDelete = async () => {
    try {
      if (staffApi.softDelete) {
        await staffApi.softDelete(selectedStaff.id);
      } else {
        await staffApi.update(selectedStaff.id, { ...selectedStaff, isDeleted: true, status: 'deleted' });
      }
      setSuccessMessage(`${selectedStaff.name} moved to trash successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchFacultyStaff();
    } catch (err) {
      console.error('Error soft deleting staff:', err);
      alert('Failed to move to trash');
    }
  };

  // Restore from trash
  const handleRestore = async (staff) => {
    if (!window.confirm(`Are you sure you want to restore ${staff.name}?`)) return;
    
    try {
      if (staffApi.restore) {
        await staffApi.restore(staff.id);
      } else {
        await staffApi.update(staff.id, { ...staff, isDeleted: false, status: 'active' });
      }
      setSuccessMessage(`${staff.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchFacultyStaff();
    } catch (err) {
      console.error('Error restoring staff:', err);
      alert('Failed to restore');
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (staff) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${staff.name}? This action cannot be undone.`)) return;
    
    try {
      if (staffApi.permanentDelete) {
        await staffApi.permanentDelete(staff.id);
      } else {
        await staffApi.delete(staff.id);
      }
      setSuccessMessage(`${staff.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchFacultyStaff();
    } catch (err) {
      console.error('Error permanently deleting staff:', err);
      alert('Failed to permanently delete');
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle department selection from searchable dropdown
  const handleDepartmentSelect = (dept) => {
    setFormData(prev => ({
      ...prev,
      department: dept
    }));
    setDepartmentSearchTerm(dept);
    setShowDepartmentDropdown(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.department || !formData.designation) {
        alert('Please fill in all required fields');
        return;
      }

      const staffData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        designation: formData.designation,
        staffRole: 'FACULTY',
        phone: formData.phone || null,
        employeeId: formData.employeeId || null,
        address: formData.address || null,
        qualification: formData.qualification || null,
        joiningDate: formData.joiningDate || null
      };

      if (modalType === 'add') {
        if (!formData.password) {
          alert('Password is required for new staff');
          return;
        }
        staffData.password = formData.password;
        await staffApi.create(staffData);
        setSuccessMessage(`✅ Faculty "${formData.name}" added successfully!`);
      } else if (modalType === 'edit') {
        await staffApi.update(selectedStaff.id, staffData);
        setSuccessMessage(`✅ Faculty "${formData.name}" updated successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchFacultyStaff();
    } catch (err) {
      console.error('Error saving faculty:', err);
      alert(err.message || 'Failed to save faculty');
    }
  };

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const allStaff = [...facultyStaff, ...deletedStaff];
    const depts = allStaff.map(s => s.department).filter(Boolean);
    return [...new Set(depts)].sort();
  };

  // Get unique designations for filter
  const getUniqueDesignations = () => {
    const allStaff = [...facultyStaff, ...deletedStaff];
    const designations = allStaff.map(s => s.designation).filter(Boolean);
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
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Members</h1>
          <p className="page-description">Manage teaching faculty and their assignments</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-icon ${activeTab === 'deleted' ? 'active-trash' : ''}`} 
            onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')}
            title={activeTab === 'active' ? "View Trash" : "View Active Faculty"}
          >
            <Archive size={18} />
          </button>
          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-faculty" onClick={handleAdd}>
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
            <span className="stat-label">Active Faculty</span>
            <span className="stat-value">{facultyStaff.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Archive size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Trash</span>
            <span className="stat-value">{deletedStaff.length}</span>
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
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Users size={16} />
          <span>Active Faculty</span>
          <span className="tab-count">{facultyStaff.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`}
          onClick={() => setActiveTab('deleted')}
        >
          <Archive size={16} />
          <span>Trash</span>
          <span className="tab-count">{deletedStaff.length}</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder={activeTab === 'active' ? "Search faculty by name, email, department..." : "Search deleted faculty..."}
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
                <tr key={faculty.id} className={activeTab === 'deleted' ? 'deleted-row' : ''}>
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
                      <button className="action-btn view" onClick={() => handleView(faculty)} title="View">
                        <Eye size={18} />
                      </button>
                      {activeTab === 'active' ? (
                        <>
                          <button className="action-btn edit" onClick={() => handleEdit(faculty)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleSoftDelete(faculty)} title="Move to Trash">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="action-btn restore" onClick={() => handleRestore(faculty)} title="Restore">
                            <RotateCcw size={18} />
                          </button>
                          <button className="action-btn permanent-delete" onClick={() => handlePermanentDelete(faculty)} title="Permanently Delete">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  {activeTab === 'active' ? (
                    facultyStaff.length === 0 ? (
                      <>
                        <Users size={48} />
                        <h3>No Faculty Found</h3>
                        <p>Click "Add Faculty" to create a new faculty member.</p>
                        <button className="btn-primary" onClick={handleAdd}>
                          <Plus size={16} /> Add Faculty
                        </button>
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
                    )
                  ) : (
                    <>
                      <Archive size={48} />
                      <h3>Trash is Empty</h3>
                      <p>No deleted faculty found.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Faculty Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Faculty' : 'Edit Faculty'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter faculty name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {modalType === 'add' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password *</label>
                      <div className="password-field-wrapper">
                        <Lock className="password-lock-icon" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password (min 6 characters)"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-eye-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="e.g., FAC001"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group" ref={departmentSearchRef}>
                    <label>Department *</label>
                    <div className="searchable-select">
                      <div 
                        className="searchable-select-input"
                        onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                      >
                        <input
                          type="text"
                          placeholder="Search and select department"
                          value={departmentSearchTerm}
                          onChange={(e) => {
                            setDepartmentSearchTerm(e.target.value);
                            setShowDepartmentDropdown(true);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          required
                          autoComplete="off"
                        />
                        <ChevronDown size={16} className="select-arrow" />
                      </div>
                      {showDepartmentDropdown && (
                        <div className="searchable-select-dropdown">
                          <div className="dropdown-search">
                            <Search size={14} />
                            <input
                              type="text"
                              placeholder="Search departments..."
                              value={departmentSearchTerm}
                              onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                              autoFocus
                              autoComplete="off"
                            />
                          </div>
                          <div className="dropdown-options">
                            {filteredDepartments.length > 0 ? (
                              filteredDepartments.map(dept => (
                                <div
                                  key={dept}
                                  className={`dropdown-option ${formData.department === dept ? 'selected' : ''}`}
                                  onClick={() => handleDepartmentSelect(dept)}
                                >
                                  {dept}
                                  {formData.department === dept && <CheckCircle size={14} />}
                                </div>
                              ))
                            ) : (
                              <div className="dropdown-no-results">No departments found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Designation *</label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Designation</option>
                      {designationOptions.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label>Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g., Ph.D., M.Tech"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <div style={{ height: '38px' }}></div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    rows="3"
                    className="address-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {modalType === 'add' ? 'Add Faculty' : 'Update Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Faculty Modal */}
      {modalType === 'view' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Faculty Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar">
                  {selectedStaff.name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{selectedStaff.name}</h3>
                  <p>{selectedStaff.email}</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{selectedStaff.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Designation</span>
                  <span className="detail-value">{selectedStaff.designation}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Employee ID</span>
                  <span className="detail-value">{selectedStaff.employeeId || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedStaff.phone || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Qualification</span>
                  <span className="detail-value">{selectedStaff.qualification || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joining Date</span>
                  <span className="detail-value">
                    {selectedStaff.joiningDate ? new Date(selectedStaff.joiningDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Address</span>
                  <span className="detail-value address-value">
                    {selectedStaff.address || '—'}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Courses Teaching</span>
                  <span className="detail-value">
                    {selectedStaff.courses?.length || 0} courses
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              {!selectedStaff.isDeleted && (
                <button className="btn-primary" onClick={() => {
                  setShowModal(false);
                  handleEdit(selectedStaff);
                }}>
                  <Edit size={16} />
                  Edit Faculty
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {modalType === 'softDelete' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Move to Trash</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body text-center">
              <div className="delete-icon">
                <Archive size={48} />
              </div>
              <p className="delete-message">
                Are you sure you want to move <strong>{selectedStaff.name}</strong> to trash?
              </p>
              <p className="delete-warning">You can restore this faculty from trash later.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-warning" onClick={confirmSoftDelete}>
                <Archive size={16} />
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffFaculty;