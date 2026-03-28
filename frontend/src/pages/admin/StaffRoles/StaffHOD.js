import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  Building2,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  EyeOff,
  Lock,
  Archive,
  RotateCcw,
  Users
} from 'lucide-react';
import { staffApi } from '../../../api/adminApi';
import './StaffHOD.css';

const StaffHOD = () => {
  const [hodStaff, setHodStaff] = useState([]);
  const [deletedStaff, setDeletedStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'deleted'
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
    appointedDate: ''
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

  // Designation options for HOD
  const designationOptions = [
    "Head of Department",
    "Professor & Head",
    "Associate Professor & Head",
    "Assistant Professor & Head"
  ];

  useEffect(() => {
    fetchHODStaff();
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

  // Filter staff based on search term, department, and active tab
  useEffect(() => {
    let filtered = activeTab === 'active' ? hodStaff : deletedStaff;

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
  }, [searchTerm, departmentFilter, hodStaff, deletedStaff, activeTab]);

  const fetchHODStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffApi.getAll();
      
      let staffData = [];
      if (response?.success && response?.data) {
        staffData = response.data;
      } else if (Array.isArray(response)) {
        staffData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        staffData = response.data;
      }
      
      // Filter HODs - active and deleted
      const allHODs = staffData.filter(staff => 
        staff.staffRole === 'HOD' ||
        staff.designation?.toLowerCase().includes('head') || 
        staff.designation?.toLowerCase().includes('hod')
      );
      
      // Separate active and deleted (check both isDeleted and status fields)
      const active = allHODs.filter(staff => staff.isDeleted !== true && staff.status !== 'deleted');
      const deleted = allHODs.filter(staff => staff.isDeleted === true || staff.status === 'deleted');
      
      setHodStaff(active);
      setDeletedStaff(deleted);
      setFilteredStaff(active);
    } catch (error) {
      console.error('Error fetching HOD staff:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to load HOD data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchHODStaff();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      phone: '',
      employeeId: '',
      appointedDate: ''
    });
    setDepartmentSearchTerm('');
    setShowPassword(false);
    setSelectedStaff(null);
    setModalType('add');
    setShowModal(true);
    setError(null);
  };

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
      appointedDate: staff.appointedDate || staff.createdAt?.split('T')[0] || ''
    });
    setDepartmentSearchTerm(staff.department || '');
    setShowPassword(false);
    setModalType('edit');
    setShowModal(true);
    setError(null);
  };

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
        // Fallback: use update method with isDeleted flag
        await staffApi.update(selectedStaff.id, { ...selectedStaff, isDeleted: true, status: 'deleted' });
      }
      setSuccessMessage(`${selectedStaff.name} moved to trash successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchHODStaff();
    } catch (err) {
      console.error('Error soft deleting staff:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete HOD';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Restore from trash
  const handleRestore = async (staff) => {
    if (!window.confirm(`Are you sure you want to restore ${staff.name}?`)) return;
    
    try {
      if (staffApi.restore) {
        await staffApi.restore(staff.id);
      } else {
        // Fallback: use update method to remove isDeleted flag
        await staffApi.update(staff.id, { ...staff, isDeleted: false, status: 'active' });
      }
      setSuccessMessage(`${staff.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchHODStaff();
    } catch (err) {
      console.error('Error restoring staff:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to restore HOD';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (staff) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${staff.name}? This action cannot be undone.`)) return;
    
    try {
      if (staffApi.permanentDelete) {
        await staffApi.permanentDelete(staff.id);
      } else {
        // Fallback: use delete method
        await staffApi.delete(staff.id);
      }
      setSuccessMessage(`${staff.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchHODStaff();
    } catch (err) {
      console.error('Error permanently deleting staff:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to permanently delete HOD';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDepartmentSelect = (dept) => {
    setFormData(prev => ({
      ...prev,
      department: dept
    }));
    setDepartmentSearchTerm(dept);
    setShowDepartmentDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!formData.name || !formData.email || !formData.department || !formData.designation) {
        alert('Please fill in all required fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      if (modalType === 'add' && (!formData.password || formData.password.length < 6)) {
        alert('Password is required and must be at least 6 characters');
        return;
      }

      const staffData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        designation: formData.designation,
        staffRole: 'HOD',
        phone: formData.phone || null,
        employeeId: formData.employeeId || null,
        appointedDate: formData.appointedDate || null,
        isActive: true,
        status: 'active'
      };

      if (modalType === 'add') {
        staffData.password = formData.password;
        await staffApi.create(staffData);
        setSuccessMessage(`✅ HOD "${formData.name}" added successfully!`);
      } else if (modalType === 'edit') {
        await staffApi.update(selectedStaff.id, staffData);
        setSuccessMessage(`✅ HOD "${formData.name}" updated successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchHODStaff();
    } catch (err) {
      console.error('❌ Error saving HOD:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save HOD';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const getUniqueDepartments = () => {
    const allStaff = [...hodStaff, ...deletedStaff];
    const depts = allStaff.map(s => s.department).filter(Boolean);
    return [...new Set(depts)].sort();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading HODs...</p>
      </div>
    );
  }

  if (error && !hodStaff.length && !deletedStaff.length) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading HODs</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={handleRefresh}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const uniqueDepartments = getUniqueDepartments();

  return (
    <div className="staff-hod">
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Head of Departments (HOD)</h1>
          <p className="page-description">Manage department heads and their responsibilities</p>
        </div>
        <div className="header-actions">
          {/* Trash icon near refresh */}
          <button 
            className={`btn-icon ${activeTab === 'deleted' ? 'active-trash' : ''}`} 
            onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')}
            title={activeTab === 'active' ? "View Trash" : "View Active HODs"}
          >
            <Archive size={18} />
          </button>
          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-hod" onClick={handleAdd}>
            <Plus size={20} />
            <span>Add HOD</span>
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
            <span className="stat-label">Active HODs</span>
            <span className="stat-value">{hodStaff.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Departments</span>
            <span className="stat-value">{uniqueDepartments.length}</span>
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
      </div>

      {/* Tabs - Now optional since we have trash icon */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Users size={16} />
          <span>Active HODs</span>
          <span className="tab-count">{hodStaff.length}</span>
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
            placeholder={activeTab === 'active' ? "Search HOD by name, email, department..." : "Search deleted HODs..."}
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

      {/* HOD Table */}
      <div className="table-container">
        <table className="hod-table">
          <thead>
            <tr>
              <th>HOD Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((hod) => (
                <tr key={hod.id} className={activeTab === 'deleted' ? 'deleted-row' : ''}>
                  <td>
                    <div className="staff-info">
                      <div className="staff-avatar">
                        {hod.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="staff-name">{hod.name}</div>
                        <div className="staff-email">{hod.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{hod.department}</td>
                  <td>
                    <span className="contact-info">
                      <Mail size={14} />
                      {hod.email}
                    </span>
                  </td>
                  <td>
                    {hod.phone ? (
                      <span className="contact-info">
                        <Phone size={14} />
                        {hod.phone}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {hod.appointedDate || hod.createdAt ? 
                      new Date(hod.appointedDate || hod.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn view" onClick={() => handleView(hod)} title="View">
                        <Eye size={18} />
                      </button>
                      {activeTab === 'active' ? (
                        <>
                          <button className="action-btn edit" onClick={() => handleEdit(hod)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleSoftDelete(hod)} title="Move to Trash">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="action-btn restore" onClick={() => handleRestore(hod)} title="Restore">
                            <RotateCcw size={18} />
                          </button>
                          <button className="action-btn permanent-delete" onClick={() => handlePermanentDelete(hod)} title="Permanently Delete">
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
                <td colSpan="6" className="empty-state">
                  {activeTab === 'active' ? (
                    hodStaff.length === 0 ? (
                      <>
                        <UserCheck size={48} />
                        <h3>No HODs Found</h3>
                        <p>Click "Add HOD" to assign a department head.</p>
                        <button className="btn-primary" onClick={handleAdd}>
                          <Plus size={16} /> Add HOD
                        </button>
                      </>
                    ) : (
                      <>
                        <Search size={48} />
                        <h3>No Matching HODs</h3>
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
                      <p>No deleted HODs found.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit HOD Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New HOD' : 'Edit HOD'}</h2>
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
                      placeholder="Enter HOD name"
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
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password (min 6 characters)"
                          required
                          autoComplete="new-password"
                        />
                        <Lock className="password-lock-icon" size={18} />
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
                        placeholder="e.g., HOD001"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                )}

                {modalType === 'edit' && (
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="e.g., HOD001"
                      autoComplete="off"
                    />
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
                    <label>Appointed Date</label>
                    <input
                      type="date"
                      name="appointedDate"
                      value={formData.appointedDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {modalType === 'add' && (
                  <div className="info-note">
                    <CheckCircle size={16} />
                    <span>Staff will be created with HOD role and ACTIVE status</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {modalType === 'add' ? 'Add HOD' : 'Update HOD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View HOD Modal */}
      {modalType === 'view' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>HOD Details</h2>
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
                  <span className="detail-label">Appointed Date</span>
                  <span className="detail-value">
                    {selectedStaff.appointedDate ? new Date(selectedStaff.appointedDate).toLocaleDateString() : '—'}
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
                  Edit HOD
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
              <p className="delete-warning">You can restore this HOD from trash later.</p>
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

export default StaffHOD;