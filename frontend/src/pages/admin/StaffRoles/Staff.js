import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Briefcase,
  Hash,
  Award,
  X,
  Save,
  Users,
  GraduationCap,
  FileSpreadsheet,
  FileText,
  DownloadCloud,
  UploadCloud,
  MapPin,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Lock,
  EyeOff,
  Archive,
  RotateCcw
} from 'lucide-react';
import { staffApi, userApi } from '../../../api/adminApi';
import * as XLSX from 'xlsx';
import './AdminStaff.css';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [deletedStaff, setDeletedStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importError, setImportError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const departmentSearchRef = useRef(null);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalDepartments: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    trashedStaff: 0
  });

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    phone: '',
    employeeId: '',
    address: ''
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

  // Designation options
  const designationOptions = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Senior Lecturer",
    "Lecturer",
    "Teaching Assistant"
  ];

  useEffect(() => {
    fetchStaff();
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

  // Filter staff based on search term, department, and status
  useEffect(() => {
    let filtered = activeTab === 'active' ? staff : deletedStaff;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.department === departmentFilter
      );
    }

    // Apply status filter (only for active tab)
    if (activeTab === 'active' && statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(member => {
        const active = member.user?.isActive !== false;
        return active === isActive;
      });
    }

    setFilteredStaff(filtered);
  }, [searchTerm, departmentFilter, statusFilter, staff, deletedStaff, activeTab]);

  const fetchStaff = async () => {
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

      // Separate active and deleted staff
      const active = staffData.filter(member => member.isDeleted !== true && member.status !== 'deleted');
      const deleted = staffData.filter(member => member.isDeleted === true || member.status === 'deleted');
      
      // Sort staff by ID in ascending order
      const sortedActive = [...active].sort((a, b) => (a.id || 0) - (b.id || 0));
      const sortedDeleted = [...deleted].sort((a, b) => (a.id || 0) - (b.id || 0));
      
      // Ensure each staff has user.isActive defaulting to true if not set
      const normalizedActive = sortedActive.map(member => ({
        ...member,
        user: {
          ...member.user,
          isActive: member.user?.isActive !== false
        }
      }));
      
      const normalizedDeleted = sortedDeleted.map(member => ({
        ...member,
        user: {
          ...member.user,
          isActive: false
        }
      }));
      
      setStaff(normalizedActive);
      setDeletedStaff(normalizedDeleted);
      setFilteredStaff(normalizedActive);

      const uniqueDepts = [...new Set(staffData.map(t => t.department).filter(Boolean))];
      const activeStaff = normalizedActive.filter(t => t.user?.isActive !== false).length;
      const inactiveStaff = normalizedActive.filter(t => t.user?.isActive === false).length;
      
      setStats({
        totalStaff: normalizedActive.length,
        totalDepartments: uniqueDepts.length,
        activeStaff: activeStaff,
        inactiveStaff: inactiveStaff,
        trashedStaff: normalizedDeleted.length
      });

    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  // Soft Delete - Move to trash
  const handleSoftDelete = async (member) => {
    setSelectedStaff(member);
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
      fetchStaff();
    } catch (err) {
      console.error('Error soft deleting staff:', err);
      alert('Failed to move to trash');
    }
  };

  // Restore from trash
  const handleRestore = async (member) => {
    if (!window.confirm(`Are you sure you want to restore ${member.name}?`)) return;
    
    try {
      if (staffApi.restore) {
        await staffApi.restore(member.id);
      } else {
        await staffApi.update(member.id, { ...member, isDeleted: false, status: 'active' });
      }
      setSuccessMessage(`${member.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStaff();
    } catch (err) {
      console.error('Error restoring staff:', err);
      alert('Failed to restore');
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${member.name}? This action cannot be undone.`)) return;
    
    try {
      if (staffApi.permanentDelete) {
        await staffApi.permanentDelete(member.id);
      } else {
        await staffApi.delete(member.id);
      }
      setSuccessMessage(`${member.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStaff();
    } catch (err) {
      console.error('Error permanently deleting staff:', err);
      alert('Failed to permanently delete');
    }
  };

  // Toggle staff active status (sync with user management)
  const handleToggleStatus = async (member) => {
    try {
      const currentStatus = member.user?.isActive !== false;
      const newStatus = !currentStatus;
      
      if (newStatus) {
        await userApi.activate(member.userId || member.id);
        setSuccessMessage(`${member.name} activated successfully`);
      } else {
        await userApi.deactivate(member.userId || member.id);
        setSuccessMessage(`${member.name} deactivated successfully`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStaff();
    } catch (err) {
      console.error('Error toggling staff status:', err);
      alert('Failed to update staff status');
    }
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
      address: ''
    });
    setDepartmentSearchTerm('');
    setShowPassword(false);
    setSelectedStaff(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (member) => {
    setSelectedStaff(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '',
      department: member.department || '',
      designation: member.designation || '',
      phone: member.phone || '',
      employeeId: member.employeeId || '',
      address: member.address || ''
    });
    setDepartmentSearchTerm(member.department || '');
    setShowPassword(false);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (member) => {
    setSelectedStaff(member);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (member) => {
    setSelectedStaff(member);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await staffApi.delete(selectedStaff.id);
      setSuccessMessage(`${selectedStaff.name} deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Failed to delete staff');
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
      if (!formData.name || !formData.email || !formData.department || !formData.designation) {
        alert('Please fill in all required fields');
        return;
      }

      const staffData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone || null,
        employeeId: formData.employeeId || null,
        address: formData.address || null
      };

      if (modalType === 'add') {
        if (!formData.password) {
          alert('Password is required for new staff');
          return;
        }
        staffData.password = formData.password;
        await staffApi.create(staffData);
        setSuccessMessage(`✅ Staff "${formData.name}" added successfully with ACTIVE status!`);
      } else if (modalType === 'edit') {
        await staffApi.update(selectedStaff.id, staffData);
        setSuccessMessage(`✅ Staff "${formData.name}" updated successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Error saving staff:', err);
      alert(err.message || 'Failed to save staff');
    }
  };

  const handleRefresh = () => {
    fetchStaff();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setStatusFilter('all');
  };

  const getUniqueDepartments = () => {
    const allStaff = [...staff, ...deletedStaff];
    const depts = allStaff.map(t => t.department).filter(Boolean);
    return [...new Set(depts)].sort();
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = filteredStaff.map(member => ({
        'ID': member.id || '',
        'Name': member.name || '',
        'Email': member.email || '',
        'Department': member.department || '',
        'Designation': member.designation || '',
        'Phone': member.phone || '',
        'Employee ID': member.employeeId || '',
        'Address': member.address || '',
        'Status': member.user?.isActive !== false ? 'Active' : 'Inactive'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      ws['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, 
        { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'staff');
      XLSX.writeFile(wb, `staff_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export to Excel');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setImportError('No file selected');
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setImportError('Please upload only Excel files (.xlsx or .xls)');
      setShowImportMenu(false);
      event.target.value = '';
      return;
    }

    setImportError('');
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setImportError('The Excel file is empty');
          setShowImportMenu(false);
          event.target.value = '';
          return;
        }

        setImportPreview(jsonData.slice(0, 5));
        setShowImportPreview(true);
        setShowImportMenu(false);
      } catch (err) {
        console.error('Error reading file:', err);
        setImportError('Failed to read file. Please make sure it\'s a valid Excel file.');
        setShowImportMenu(false);
        event.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = async () => {
    try {
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const existingResponse = await staffApi.getAll();
          let existingStaff = [];
          if (existingResponse?.success && existingResponse?.data) {
            existingStaff = existingResponse.data;
          } else if (Array.isArray(existingResponse)) {
            existingStaff = existingResponse;
          }

          const existingEmails = new Set(existingStaff.map(s => s.email?.toLowerCase()));
          const existingEmpIds = new Set(existingStaff.map(s => s.employeeId).filter(Boolean));

          let newCount = 0;
          let skippedCount = 0;
          let errorCount = 0;
          const newStaff = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNumber = i + 2;

            try {
              const name = String(row['Name'] || row['name'] || '').trim();
              const email = String(row['Email'] || row['email'] || '').trim().toLowerCase();
              const department = String(row['Department'] || row['department'] || '').trim();
              const designation = String(row['Designation'] || row['designation'] || '').trim();
              const phone = String(row['Phone'] || row['phone'] || '').trim();
              const employeeId = String(row['Employee ID'] || row['employeeId'] || '').trim();
              const address = String(row['Address'] || row['address'] || '').trim();

              if (!name || !email || !department || !designation) {
                errorCount++;
                continue;
              }

              if (existingEmails.has(email)) {
                skippedCount++;
                continue;
              }

              if (employeeId && existingEmpIds.has(employeeId)) {
                errorCount++;
                continue;
              }

              newStaff.push({
                name,
                email,
                password: 'Welcome@123',
                department,
                designation,
                phone: phone || null,
                employeeId: employeeId || null,
                address: address || null
              });
              newCount++;
              
            } catch (err) {
              errorCount++;
            }
          }

          if (newCount === 0) {
            alert(`No new staff to import.\n${skippedCount} already exist.\n${errorCount} errors.`);
            setShowImportPreview(false);
            setImportFile(null);
            setLoading(false);
            return;
          }

          if (!window.confirm(`Found ${newCount} new staff to import.\nProceed?`)) {
            setLoading(false);
            return;
          }

          let importedCount = 0;
          for (const staff of newStaff) {
            try {
              await staffApi.create(staff);
              importedCount++;
            } catch (err) {
              console.error(`Failed to import ${staff.email}:`, err);
            }
          }

          alert(`✅ Successfully imported ${importedCount} staff members!`);
          
          setShowImportPreview(false);
          setImportFile(null);
          setImportPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          fetchStaff();
          
        } catch (err) {
          console.error('Import error:', err);
          alert('Failed to process import');
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsBinaryString(importFile);
      
    } catch (err) {
      console.error('File reader error:', err);
      alert('Failed to read file');
      setLoading(false);
    }
  };

  const cancelImport = () => {
    setShowImportPreview(false);
    setImportFile(null);
    setImportPreview([]);
    setImportError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Name': 'John Doe',
        'Email': 'john.doe@example.com',
        'Department': 'Computer Science',
        'Designation': 'Professor',
        'Phone': '9876543210',
        'Employee ID': 'STF001',
        'Address': '123 Main Street, City, State'
      },
      {
        'Name': 'Jane Smith',
        'Email': 'jane.smith@example.com',
        'Department': 'Mathematics',
        'Designation': 'Associate Professor',
        'Phone': '9876543211',
        'Employee ID': 'STF002',
        'Address': '456 Oak Avenue, City, State'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    ws['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, 
      { wch: 15 }, { wch: 12 }, { wch: 30 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'staff_import_template.xlsx');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading staff...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Staff</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={handleRefresh}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const uniqueDepartments = getUniqueDepartments();

  return (
    <div className="admin-staff">
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {successMessage && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Staff</h1>
          <p className="page-description">Manage staff records and assignments</p>
        </div>
        
        <div className="header-right">
          <div className="import-dropdown">
            <button className="btn-import" onClick={() => setShowImportMenu(!showImportMenu)}>
              <Upload size={18} />
              <span>Import Excel</span>
            </button>
            {showImportMenu && (
              <div className="import-menu">
                <div className="import-menu-body">
                  <button className="import-option" onClick={handleImportClick}>
                    <FileSpreadsheet size={16} />
                    <span>Upload Excel</span>
                  </button>
                  <button className="import-option" onClick={downloadSampleTemplate}>
                    <Download size={16} />
                    <span>Download Template</span>
                  </button>
                </div>
                {importError && <div className="import-error">{importError}</div>}
              </div>
            )}
          </div>

          <button className="btn-export" onClick={exportToExcel}>
            <DownloadCloud size={18} />
            <span>Export Excel</span>
          </button>

          <button className="btn-icon" onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')} title="Trash">
            <Archive size={18} />
          </button>
          
          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
          
          <button className="btn-add-staff" onClick={handleAdd}>
            <Plus size={20} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="modal-overlay" onClick={cancelImport}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Preview</h2>
              <button className="close-btn" onClick={cancelImport}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p className="import-preview-info">Found {importPreview.length} records to import. Preview of first 5 rows:</p>
              <div className="import-preview-table">
                <table>
                  <thead>
                    <tr>
                      {importPreview.length > 0 && Object.keys(importPreview[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelImport}>Cancel</button>
              <button className="btn-primary" onClick={confirmImport}><Upload size={16} />Confirm Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">ACTIVE STAFF</span>
            <span className="stat-value">{stats.activeStaff}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Briefcase size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">DEPARTMENTS</span>
            <span className="stat-value">{stats.totalDepartments}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">INACTIVE STAFF</span>
            <span className="stat-value">{stats.inactiveStaff}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gray"><Archive size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TRASH</span>
            <span className="stat-value">{stats.trashedStaff}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          <Users size={16} /><span>Active Staff</span><span className="tab-count">{staff.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`} onClick={() => setActiveTab('deleted')}>
          <Archive size={16} /><span>Trash</span><span className="tab-count">{deletedStaff.length}</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder={activeTab === 'active' ? "Search staff by name, email, department..." : "Search deleted staff..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}><X size={16} /></button>}
        </div>

        <div className="filter-dropdown">
          <Filter className="filter-icon" size={18} />
          <select className="filter-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <ChevronDown className="select-chevron" size={16} />
        </div>

        {activeTab === 'active' && (
          <div className="filter-dropdown">
            <Filter className="filter-icon" size={18} />
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="select-chevron" size={16} />
          </div>
        )}
      </div>
      
      {/* Staff Table */}
      <div className="table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>STAFF</th>
              <th>DEPARTMENT</th>
              <th>DESIGNATION</th>
              <th>EMPLOYEE ID</th>
              <th>CONTACT</th>
              <th>ADDRESS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((member) => {
                const isActive = member.user?.isActive !== false;
                return (
                  <tr key={member.id} className={activeTab === 'deleted' ? 'deleted-row' : ''}>
                    <td><span className="staff-id">{member.id}</span></td>
                    <td>
                      <div className="staff-info">
                        <div className="staff-avatar">{member.name?.charAt(0).toUpperCase()}</div>
                        <div className="staff-details">
                          <div className="staff-name">{member.name}</div>
                          <div className="staff-email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="department-badge">{member.department}</span></td>
                    <td><span className="designation-text">{member.designation}</span></td>
                    <td><span className="employee-id">{member.employeeId || '—'}</span></td>
                    <td>{member.phone ? <span className="contact-info"><Phone size={14} />{member.phone}</span> : '—'}</td>
                    <td className="address-text" title={member.address}>
                      {member.address ? (member.address.length > 25 ? member.address.substring(0, 25) + '...' : member.address) : '—'}
                    </td>
                    <td>
                      {activeTab === 'active' ? (
                        <button className={`status-toggle ${isActive ? 'active' : 'inactive'}`} onClick={() => handleToggleStatus(member)}>
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      ) : (
                        <span className="status-toggle inactive">DELETED</span>
                      )}
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="action-btn view" onClick={() => handleView(member)} title="View"><Eye size={18} /></button>
                        {activeTab === 'active' ? (
                          <>
                            <button className="action-btn edit" onClick={() => handleEdit(member)} title="Edit"><Edit size={18} /></button>
                            <button className="action-btn delete" onClick={() => handleSoftDelete(member)} title="Move to Trash"><Trash2 size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestore(member)} title="Restore"><RotateCcw size={18} /></button>
                            <button className="action-btn permanent-delete" onClick={() => handlePermanentDelete(member)} title="Permanently Delete"><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="empty-state">
                  {activeTab === 'active' ? (
                    staff.length === 0 ? (
                      <><Users size={48} /><h3>No Staff Found</h3><p>Click "Add Staff" to create your first staff record.</p><button className="btn-primary" onClick={handleAdd}><Plus size={16} /> Add Staff</button></>
                    ) : (
                      <><Search size={48} /><h3>No Matching Staff</h3><p>Try adjusting your search criteria.</p><button className="btn-secondary" onClick={clearFilters}>Clear Filters</button></>
                    )
                  ) : (
                    <><Archive size={48} /><h3>Trash is Empty</h3><p>No deleted staff found.</p></>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Staff Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Staff' : 'Edit Staff'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter staff name" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" required autoComplete="off" />
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
                        <button type="button" className="password-eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="e.g., STF001" autoComplete="off" />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group" ref={departmentSearchRef}>
                    <label>Department *</label>
                    <div className="searchable-select">
                      <div className="searchable-select-input" onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}>
                        <input
                          type="text"
                          placeholder="Search and select department"
                          value={departmentSearchTerm}
                          onChange={(e) => { setDepartmentSearchTerm(e.target.value); setShowDepartmentDropdown(true); }}
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
                            <input type="text" placeholder="Search departments..." value={departmentSearchTerm} onChange={(e) => setDepartmentSearchTerm(e.target.value)} autoFocus />
                          </div>
                          <div className="dropdown-options">
                            {filteredDepartments.length > 0 ? (
                              filteredDepartments.map(dept => (
                                <div key={dept} className={`dropdown-option ${formData.department === dept ? 'selected' : ''}`} onClick={() => handleDepartmentSelect(dept)}>
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
                    <select name="designation" value={formData.designation} onChange={handleChange} required>
                      <option value="">Select Designation</option>
                      {designationOptions.map(desig => <option key={desig} value={desig}>{desig}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" autoComplete="off" />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" rows="3" className="address-textarea" />
                </div>

                {modalType === 'add' && (
                  <div className="info-note">
                    <CheckCircle size={16} />
                    <span>Staff will be created with ACTIVE status by default</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} />{modalType === 'add' ? 'Add Staff' : 'Update Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {modalType === 'view' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Staff Details</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar">{selectedStaff.name?.charAt(0).toUpperCase()}</div>
                <div className="profile-info"><h3>{selectedStaff.name}</h3><p>{selectedStaff.email}</p></div>
              </div>
              <div className="details-grid">
                <div className="detail-item"><span className="detail-label">Department</span><span className="detail-value">{selectedStaff.department}</span></div>
                <div className="detail-item"><span className="detail-label">Designation</span><span className="detail-value">{selectedStaff.designation}</span></div>
                <div className="detail-item"><span className="detail-label">Employee ID</span><span className="detail-value">{selectedStaff.employeeId || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-value">{selectedStaff.phone || '—'}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Address</span><span className="detail-value address-value">{selectedStaff.address || '—'}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              {!selectedStaff.isDeleted && <button className="btn-primary" onClick={() => { setShowModal(false); handleEdit(selectedStaff); }}><Edit size={16} />Edit Staff</button>}
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {modalType === 'softDelete' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Move to Trash</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body text-center">
              <div className="delete-icon"><Archive size={48} /></div>
              <p className="delete-message">Are you sure you want to move <strong>{selectedStaff.name}</strong> to trash?</p>
              <p className="delete-warning">You can restore this staff from trash later.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-warning" onClick={confirmSoftDelete}><Archive size={16} />Move to Trash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Staff</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body text-center">
              <div className="delete-icon"><Trash2 size={48} /></div>
              <p className="delete-message">Are you sure you want to delete <strong>{selectedStaff.name}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}><Trash2 size={16} />Delete Staff</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;