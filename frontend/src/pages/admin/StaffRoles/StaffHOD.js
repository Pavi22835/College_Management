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
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchTerm, departmentFilter, activeTab]);

  // Handle individual row selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      let newSelected;
      if (prev.includes(id)) {
        newSelected = prev.filter(rowId => rowId !== id);
      } else {
        newSelected = [...prev, id];
      }
      return newSelected;
    });
  };

  // Update selectAll when selectedRows changes
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every(item => selectedRows.includes(item.id));
      if (allSelected !== selectAll) {
        setSelectAll(allSelected);
      }
    } else {
      if (selectAll) setSelectAll(false);
    }
  }, [selectedRows, currentItems]);

  // Handle select all checkbox click
  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allIds = currentItems.map(item => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  // Handle bulk delete/move to trash
  const handleBulkAction = async (action) => {
    if (selectedRows.length === 0) {
      setError('Please select at least one HOD');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to move ${selectedRows.length} HOD(s) to trash?`
      : `Are you sure you want to permanently delete ${selectedRows.length} HOD(s)? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      let successCount = 0;
      
      for (const id of selectedRows) {
        try {
          if (action === 'delete') {
            await staffApi.delete(id);
          } else if (action === 'permanent') {
            await staffApi.permanentDelete(id);
          }
          successCount++;
        } catch (err) {
          console.error(`Failed to ${action} HOD ${id}:`, err);
        }
      }
      
      setSuccessMessage(`Successfully ${action === 'delete' ? 'moved' : 'permanently deleted'} ${successCount} HOD(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedRows([]);
      setSelectAll(false);
      fetchHODStaff();
    } catch (err) {
      console.error(`Error during bulk ${action}:`, err);
      setError(`Failed to ${action} HODs`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

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
      
      // Separate active and deleted based on deletedAt field (from your backend)
      const active = allHODs.filter(staff => !staff.deletedAt);
      const deleted = allHODs.filter(staff => staff.deletedAt);
      
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
      setLoading(true);
      // Call delete API (soft delete)
      await staffApi.delete(selectedStaff.id);
      
      // Update local state
      const updatedActive = hodStaff.filter(s => s.id !== selectedStaff.id);
      const deletedStaffWithDate = {
        ...selectedStaff,
        deletedAt: new Date().toISOString()
      };
      
      setHodStaff(updatedActive);
      setDeletedStaff([deletedStaffWithDate, ...deletedStaff]);
      setFilteredStaff(updatedActive);
      
      setSuccessMessage(`${selectedStaff.name} moved to trash successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('Error soft deleting staff:', err);
      setError('Failed to move to trash: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Restore from trash
  const handleRestore = async (staff) => {
    if (!window.confirm(`Are you sure you want to restore ${staff.name}?`)) return;
    
    try {
      setLoading(true);
      
      // Call restore API
      await staffApi.restore(staff.id);
      
      // Update local state
      const updatedDeleted = deletedStaff.filter(s => s.id !== staff.id);
      const restoredStaff = {
        ...staff,
        deletedAt: null,
        restoredAt: new Date().toISOString()
      };
      
      setDeletedStaff(updatedDeleted);
      setHodStaff([restoredStaff, ...hodStaff]);
      setFilteredStaff(activeTab === 'active' ? [restoredStaff, ...hodStaff] : updatedDeleted);
      
      setSuccessMessage(`${staff.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error restoring staff:', err);
      setError('Failed to restore: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (staff) => {
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete ${staff.name}? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      
      // Call permanent delete API
      await staffApi.permanentDelete(staff.id);
      
      // Update local state
      const updatedDeleted = deletedStaff.filter(s => s.id !== staff.id);
      setDeletedStaff(updatedDeleted);
      setFilteredStaff(updatedDeleted);
      
      setSuccessMessage(`${staff.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error permanently deleting staff:', err);
      setError('Failed to permanently delete: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
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
        setError('Please fill in all required fields');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setTimeout(() => setError(null), 3000);
        return;
      }

      if (modalType === 'add' && (!formData.password || formData.password.length < 6)) {
        setError('Password is required and must be at least 6 characters');
        setTimeout(() => setError(null), 3000);
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
        appointedDate: formData.appointedDate || null
      };

      if (modalType === 'add') {
        staffData.password = formData.password;
        const response = await staffApi.create(staffData);
        
        // Add to local state
        const newStaff = {
          ...response.data,
          ...staffData,
          id: response.data?.id || Date.now()
        };
        setHodStaff([newStaff, ...hodStaff]);
        setFilteredStaff([newStaff, ...filteredStaff]);
        
        setSuccessMessage(`✅ HOD "${formData.name}" added successfully!`);
      } else if (modalType === 'edit') {
        await staffApi.update(selectedStaff.id, staffData);
        
        // Update local state
        const updatedStaff = hodStaff.map(s => 
          s.id === selectedStaff.id ? { ...s, ...staffData } : s
        );
        setHodStaff(updatedStaff);
        setFilteredStaff(updatedStaff);
        
        setSuccessMessage(`✅ HOD "${formData.name}" updated successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('❌ Error saving HOD:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save HOD';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
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
          <AlertTriangle size={16} />
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
          {/* Trash icon with badge */}
          <button 
            className={`btn-icon ${activeTab === 'deleted' ? 'active-trash' : ''}`} 
            onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')}
            title={activeTab === 'active' ? "View Trash" : "View Active HODs"}
          >
            <Archive size={18} />
            {deletedStaff.length > 0 && <span className="badge-icon">{deletedStaff.length}</span>}
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

      {/* Tabs */}
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
          <Trash2 size={16} />
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

      {/* Table Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="table-actions-bar">
          <span className="selected-count">{selectedRows.length} HOD(s) selected</span>
          <div className="bulk-actions">
            <button 
              className="btn-bulk-delete" 
              onClick={() => handleBulkAction('delete')}
              title="Move selected to trash"
            >
              <Archive size={16} /> Move to Trash
            </button>
            {activeTab === 'deleted' && (
              <button 
                className="btn-bulk-permanent-delete" 
                onClick={() => handleBulkAction('permanent')}
                title="Permanently delete selected"
              >
                <Trash2 size={16} /> Permanently Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* HOD Table */}
      <div className="table-container">
        <table className="hod-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th>HOD Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((hod) => {
                const isDeleted = activeTab === 'deleted';
                const deletedDate = hod.deletedAt ? new Date(hod.deletedAt).toLocaleDateString() : null;
                
                return (
                  <tr key={hod.id} className={isDeleted ? 'deleted-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(hod.id)}
                        onChange={() => handleRowSelect(hod.id)}
                      />
                    </td>
                    <td>
                      <div className="staff-info">
                        <div className="staff-avatar">
                          {hod.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="staff-name">{hod.name}</div>
                          <div className="staff-email">{hod.email}</div>
                          {isDeleted && deletedDate && (
                            <div className="deleted-date">Deleted: {deletedDate}</div>
                          )}
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
                        <button className="action-btn view" onClick={() => handleView(hod)} title="View Details">
                          <Eye size={18} />
                        </button>
                        {activeTab === 'active' ? (
                          <>
                            <button className="action-btn edit" onClick={() => handleEdit(hod)} title="Edit HOD">
                              <Edit size={18} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleSoftDelete(hod)} title="Move to Trash">
                              <Archive size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestore(hod)} title="Restore HOD">
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
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
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
                      <Trash2 size={48} />
                      <h3>Trash is Empty</h3>
                      <p>No deleted HODs found. Deleted HODs will appear here for restoration.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStaff.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>Show</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
                setSelectedRows([]);
                setSelectAll(false);
              }}
              className="pagination-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="pagination-total">
              Total: {filteredStaff.length}
            </span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="pagination-page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={16} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}

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
                          placeholder="Enter password"
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
                  {selectedStaff.deletedAt && (
                    <p className="deleted-info">Deleted on: {new Date(selectedStaff.deletedAt).toLocaleString()}</p>
                  )}
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
              {selectedStaff.deletedAt ? (
                <button className="btn-primary" onClick={() => {
                  setShowModal(false);
                  handleRestore(selectedStaff);
                }}>
                  <RotateCcw size={16} />
                  Restore HOD
                </button>
              ) : (
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
              <div className="delete-icon warning">
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