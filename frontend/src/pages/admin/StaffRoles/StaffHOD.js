import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { staffApi } from '../../../api/adminApi';
import './StaffHOD.css';

const StaffHOD = () => {
  const [hodStaff, setHodStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form data for add/edit - REMOVED address field
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

  // Filter staff based on search term and department
  useEffect(() => {
    let filtered = hodStaff;

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
  }, [searchTerm, departmentFilter, hodStaff]);

  const fetchHODStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffApi.getAll();
      console.log('📊 API Response:', response);
      
      let staffData = [];
      if (response?.success && response?.data) {
        staffData = response.data;
      } else if (Array.isArray(response)) {
        staffData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        staffData = response.data;
      }
      
      console.log('📊 All staff data:', staffData);
      
      // Filter only HODs - check both staffRole and designation
      const hods = staffData.filter(staff => 
        staff.staffRole === 'HOD' ||
        staff.designation?.toLowerCase().includes('head') || 
        staff.designation?.toLowerCase().includes('hod')
      );
      
      console.log('📊 Filtered HODs:', hods);
      
      setHodStaff(hods);
      setFilteredStaff(hods);
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
      appointedDate: ''
    });
    setSelectedStaff(null);
    setModalType('add');
    setShowModal(true);
    setError(null);
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
      appointedDate: staff.appointedDate || staff.createdAt?.split('T')[0] || ''
    });
    setModalType('edit');
    setShowModal(true);
    setError(null);
  };

  // Handle View button click
  const handleView = (staff) => {
    setSelectedStaff(staff);
    setModalType('view');
    setShowModal(true);
  };

  // Handle Delete button click
  const handleDelete = (staff) => {
    setSelectedStaff(staff);
    setModalType('delete');
    setShowModal(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      await staffApi.delete(selectedStaff.id);
      setSuccessMessage(`${selectedStaff.name} deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchHODStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to delete staff: ${errorMsg}`);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submit - REMOVED address field
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!formData.name || !formData.email || !formData.department || !formData.designation) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Validate password for new staff
      if (modalType === 'add' && (!formData.password || formData.password.length < 6)) {
        alert('Password is required and must be at least 6 characters');
        return;
      }

      // Prepare staff data with HOD role - REMOVED address
      const staffData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        designation: formData.designation,
        staffRole: 'HOD',
        phone: formData.phone || null,
        employeeId: formData.employeeId || null,
        appointedDate: formData.appointedDate || null
      };

      console.log('📤 Submitting HOD data:', staffData);

      let response;
      if (modalType === 'add') {
        staffData.password = formData.password;
        response = await staffApi.create(staffData);
        setSuccessMessage(`✅ HOD "${formData.name}" added successfully!`);
      } else if (modalType === 'edit') {
        response = await staffApi.update(selectedStaff.id, staffData);
        setSuccessMessage(`✅ HOD "${formData.name}" updated successfully!`);
      }
      
      console.log('✅ Response:', response);
      
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

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const depts = hodStaff.map(s => s.department).filter(Boolean);
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

  if (error && !hodStaff.length) {
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
      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message" style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#166534' }}>
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Head of Departments (HOD)
          </h1>
          <p className="page-description">Manage department heads and their responsibilities</p>
        </div>
        <div className="header-actions">
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
            <span className="stat-label">Total HODs</span>
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
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search HOD by name, email, department..."
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
                <tr key={hod.id}>
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
                      <button className="action-btn edit" onClick={() => handleEdit(hod)} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(hod)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  {hodStaff.length === 0 ? (
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
                    />
                  </div>
                </div>

                {modalType === 'add' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password (min 6 characters)"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="e.g., HOD001"
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
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
                  <div className="form-group" style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="#166534" />
                      <span style={{ color: '#166534', fontSize: '13px', fontWeight: '500' }}>
                        Staff will be created with HOD role and ACTIVE status
                      </span>
                    </div>
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
              <button className="btn-primary" onClick={() => {
                setShowModal(false);
                handleEdit(selectedStaff);
              }}>
                <Edit size={16} />
                Edit HOD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete HOD</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body text-center">
              <div className="delete-icon">
                <Trash2 size={48} />
              </div>
              <p className="delete-message">
                Are you sure you want to delete <strong>{selectedStaff.name}</strong>?
              </p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                <Trash2 size={16} />
                Delete HOD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHOD;