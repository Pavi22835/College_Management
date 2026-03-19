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
  FileText,
  FileSpreadsheet,
  Hash,
  Calendar,
  MapPin,
  Award,
  UserCheck,
  X,
  Save,
  Users,
  GraduationCap,
  Filter,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  DownloadCloud,
  UploadCloud
} from 'lucide-react';
import studentApi from '../../api/studentApi';
import staffApi from '../../api/staffApi';
import courseApi from '../../api/courseApi';
import * as XLSX from 'xlsx';
import './Students.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importError, setImportError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0
  });

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    enrollmentNo: '',
    phone: '',
    address: '',
    admissionYear: '',
    age: '',
    gender: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        studentApi.getStudents(),
        staffApi.getStaff(),
        courseApi.getCourses()
      ]);

      let studentsData = [];
      if (studentsRes?.success && studentsRes?.data) {
        studentsData = studentsRes.data;
      } else if (Array.isArray(studentsRes)) {
        studentsData = studentsRes;
      }

      let teachersData = [];
      if (teachersRes?.success && teachersRes?.data) {
        teachersData = teachersRes.data;
      } else if (Array.isArray(teachersRes)) {
        teachersData = teachersRes;
      }

      let coursesData = [];
      if (coursesRes?.success && coursesRes?.data) {
        coursesData = coursesRes.data;
      } else if (Array.isArray(coursesRes)) {
        coursesData = coursesRes;
      }

      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);

      const uniqueCourses = [...new Set(studentsData.map(s => s.course).filter(Boolean))];
      setStats({
        totalStudents: studentsData.length,
        totalCourses: uniqueCourses.length,
        activeStudents: studentsData.filter(s => s.user?.isActive !== false).length
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      rollNo: '',
      enrollmentNo: '',
      phone: '',
      address: '',
      admissionYear: '',
      age: '',
      gender: ''
    });
    setSelectedStudent(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      rollNo: student.rollNo || '',
      enrollmentNo: student.enrollmentNo || '',
      phone: student.phone || '',
      address: student.address || '',
      admissionYear: student.admissionYear || '',
      age: student.age || '',
      gender: student.gender || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await studentApi.deleteStudent(selectedStudent.id);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.rollNo) {
        alert('Please fill in all required fields');
        return;
      }

      const studentData = {
        name: formData.name,
        email: formData.email,
        rollNo: formData.rollNo,
        enrollmentNo: formData.enrollmentNo || null,
        phone: formData.phone || null,
        address: formData.address || null,
        admissionYear: formData.admissionYear || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null
      };

      if (modalType === 'add') {
        await studentApi.createStudent(studentData);
        alert('Student added successfully!');
      } else if (modalType === 'edit') {
        await studentApi.updateStudent(selectedStudent.id, studentData);
        alert('Student updated successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving student:', err);
      alert(err.message || 'Failed to save student');
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  // Export to Excel only
  const exportToExcel = () => {
    try {
      const exportData = filteredStudents.map(student => ({
        'Name': student.name || '',
        'Email': student.email || '',
        'Roll No': student.rollNo || '',
        'Enrollment No': student.enrollmentNo || '',
        'Phone': student.phone || '',
        'Address': student.address || '',
        'Admission Year': student.admissionYear || '',
        'Age': student.age || '',
        'Gender': student.gender || ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths for better readability
      ws['!cols'] = [
        { wch: 20 }, // Name
        { wch: 25 }, // Email
        { wch: 12 }, // Roll No
        { wch: 15 }, // Enrollment No
        { wch: 15 }, // Phone
        { wch: 30 }, // Address
        { wch: 15 }, // Admission Year
        { wch: 8 },  // Age
        { wch: 10 }  // Gender
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export to Excel');
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  // Handle file import (Excel only)
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setImportError('No file selected');
      return;
    }

    // Check if file is Excel
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setImportError('Please upload only Excel files (.xlsx or .xls)');
      setShowImportMenu(false);
      // Clear the file input
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
        
        // Convert to JSON with raw values to preserve types
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: true
        });
        
        // Get headers from first row
        const headers = jsonData[0] || [];
        // Get data rows (skip header)
        const rows = jsonData.slice(1) || [];
        
        // Convert rows to objects with headers as keys
        const formattedData = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            if (header) {
              obj[header] = row[index] !== undefined ? row[index] : '';
            }
          });
          return obj;
        }).filter(row => Object.keys(row).length > 0); // Remove empty rows
        
        if (formattedData.length === 0) {
          setImportError('The Excel file is empty');
          setShowImportMenu(false);
          event.target.value = '';
          return;
        }

        setImportPreview(formattedData.slice(0, 5)); // Show first 5 rows as preview
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

  // Confirm import
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
          
          // Convert to JSON with raw values
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: true
          });
          
          // Get headers from first row
          const headers = jsonData[0] || [];
          // Get data rows (skip header)
          const rows = jsonData.slice(1) || [];

          let successCount = 0;
          let errorCount = 0;
          const errors = [];

          // Import each student
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            
            try {
              // Create object from row using headers
              const rowData = {};
              headers.forEach((header, index) => {
                if (header) {
                  rowData[header] = row[index] !== undefined ? row[index] : '';
                }
              });

              // Convert all values to appropriate types
              const studentData = {
                name: String(rowData['Name'] || rowData['name'] || '').trim(),
                email: String(rowData['Email'] || rowData['email'] || '').trim(),
                // Convert rollNo to string to prevent integer errors
                rollNo: String(rowData['Roll No'] || rowData['rollNo'] || rowData['rollno'] || '').trim(),
                // Convert enrollmentNo to string
                enrollmentNo: String(rowData['Enrollment No'] || rowData['enrollmentNo'] || '').trim() || null,
                // Convert phone to string
                phone: String(rowData['Phone'] || rowData['phone'] || '').trim() || null,
                // Convert address to string
                address: String(rowData['Address'] || rowData['address'] || '').trim() || null,
                // Convert admissionYear to string
                admissionYear: String(rowData['Admission Year'] || rowData['admissionYear'] || '').trim() || null,
                // Convert age to number if it exists
                age: rowData['Age'] || rowData['age'] ? parseInt(String(rowData['Age'] || rowData['age'])) : null,
                // Convert gender to string
                gender: String(rowData['Gender'] || rowData['gender'] || '').trim() || null
              };

              // Validate required fields
              if (!studentData.name) {
                errorCount++;
                errors.push(`Row ${i + 2}: Name is required`);
                continue;
              }
              
              if (!studentData.email) {
                errorCount++;
                errors.push(`Row ${i + 2}: Email is required`);
                continue;
              }
              
              if (!studentData.email.includes('@')) {
                errorCount++;
                errors.push(`Row ${i + 2}: Invalid email format - must contain @`);
                continue;
              }
              
              if (!studentData.rollNo) {
                errorCount++;
                errors.push(`Row ${i + 2}: Roll No is required`);
                continue;
              }

              // Create the student
              await studentApi.createStudent(studentData);
              successCount++;
              
            } catch (err) {
              console.error('Error importing row:', err, row);
              errorCount++;
              errors.push(`Row ${i + 2}: ${err.message || 'Unknown error'}`);
            }
          }

          if (errors.length > 0) {
            console.warn('Import errors:', errors);
            alert(`Import completed with issues:\n✅ Successfully imported: ${successCount} students\n❌ Failed: ${errorCount} students\n\nPlease check console for details.`);
          } else {
            alert(`✅ Successfully imported ${successCount} students!`);
          }

          setShowImportPreview(false);
          setImportFile(null);
          setImportPreview([]);
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fetchData();
        } catch (err) {
          console.error('Error importing data:', err);
          alert('Failed to import data. Please check the file format.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(importFile);
    } catch (err) {
      console.error('Error importing file:', err);
      alert('Failed to import file');
      setLoading(false);
    }
  };

  // Cancel import
  const cancelImport = () => {
    setShowImportPreview(false);
    setImportFile(null);
    setImportPreview([]);
    setImportError('');
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Name': 'John Doe',
        'Email': 'john.doe@example.com',
        'Roll No': '2024001',  // Stored as string with quotes in Excel
        'Enrollment No': 'ENR001',
        'Phone': '9876543210',
        'Address': '123 Main St',
        'Admission Year': '2023',
        'Age': 20,
        'Gender': 'Male'
      },
      {
        'Name': 'Jane Smith',
        'Email': 'jane.smith@example.com',
        'Roll No': '2024002',  // Stored as string with quotes in Excel
        'Enrollment No': 'ENR002',
        'Phone': '9876543211',
        'Address': '456 Oak Ave',
        'Admission Year': '2023',
        'Age': 21,
        'Gender': 'Female'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 12 }, // Roll No
      { wch: 15 }, // Enrollment No
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 15 }, // Admission Year
      { wch: 8 },  // Age
      { wch: 10 }  // Gender
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Students</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={handleRefresh}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-students">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Student Management
          </h1>
          <p className="page-description">Manage student records</p>
        </div>
        <div className="header-actions">
          {/* Import Button - Excel Only */}
          <div className="import-dropdown">
            <button 
              className="btn-import"
              onClick={() => setShowImportMenu(!showImportMenu)}
            >
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
                {importError && (
                  <div className="import-error" style={{ padding: '8px 12px', color: '#ef4444', fontSize: '12px', borderTop: '1px solid #e2e8f0' }}>
                    {importError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Button - Excel Only */}
          <button 
            className="btn-export"
            onClick={exportToExcel}
          >
            <Download size={18} />
            <span>Export Excel</span>
          </button>

          <button className="btn-icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-student" onClick={handleAdd}>
            <Plus size={20} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="modal-overlay" onClick={cancelImport}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Preview</h2>
              <button className="close-btn" onClick={cancelImport}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="import-preview-info">
                Found {importPreview.length} records to import. Preview of first 5 rows:
              </p>
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
              <button className="btn-secondary" onClick={cancelImport}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmImport}>
                <Upload size={16} />
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{stats.totalStudents}</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Students</span>
            <span className="stat-value">{stats.activeStudents}</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">
            <User size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Inactive Students</span>
            <span className="stat-value">{stats.totalStudents - stats.activeStudents}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-filter-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, roll no, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {searchTerm && (
          <div className="active-filters">
            {searchTerm && (
              <span className="active-filter-tag">
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              </span>
            )}
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-info">
                      <div className="student-avatar">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="roll-badge">{student.rollNo}</span>
                  </td>
                  <td>
                    {student.phone ? (
                      <span className="contact-info">
                        <Phone size={14} />
                        {student.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn view" onClick={() => handleView(student)} title="View">
                        <Eye size={18} />
                      </button>
                      <button className="action-btn edit" onClick={() => handleEdit(student)} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(student)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">
                  {students.length === 0 ? (
                    <>
                      <Users size={48} />
                      <h3>No Students Found</h3>
                      <p>Click "Add Student" to create your first student record.</p>
                      <button className="btn-primary" onClick={handleAdd}>
                        <Plus size={16} /> Add Student
                      </button>
                    </>
                  ) : (
                    <>
                      <Search size={48} />
                      <h3>No Matching Students</h3>
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

      {/* Add/Edit Student Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Student' : 'Edit Student'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter student name"
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

                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter age"
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Academic Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Roll Number *</label>
                      <input
                        type="text"
                        name="rollNo"
                        value={formData.rollNo}
                        onChange={handleChange}
                        placeholder="Enter roll number"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Enrollment Number</label>
                      <input
                        type="text"
                        name="enrollmentNo"
                        value={formData.enrollmentNo}
                        onChange={handleChange}
                        placeholder="Enter enrollment number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Admission Year</label>
                    <input
                      type="text"
                      name="admissionYear"
                      value={formData.admissionYear}
                      onChange={handleChange}
                      placeholder="e.g., 2023"
                    />
                  </div>
                </div>

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
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {modalType === 'add' ? 'Add Student' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {modalType === 'view' && selectedStudent && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar">
                  {selectedStudent.name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{selectedStudent.name}</h3>
                  <p>{selectedStudent.email}</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Roll No</span>
                  <span className="detail-value">{selectedStudent.rollNo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Enrollment No</span>
                  <span className="detail-value">{selectedStudent.enrollmentNo || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Admission Year</span>
                  <span className="detail-value">{selectedStudent.admissionYear || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedStudent.phone || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age</span>
                  <span className="detail-value">{selectedStudent.age || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{selectedStudent.gender || '—'}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{selectedStudent.address || '—'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => {
                setShowModal(false);
                handleEdit(selectedStudent);
              }}>
                <Edit size={16} />
                Edit Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedStudent && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Student</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body text-center">
              <div className="delete-icon">
                <Trash2 size={48} />
              </div>
              <p className="delete-message">
                Are you sure you want to delete <strong>{selectedStudent.name}</strong>?
              </p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                <Trash2 size={16} />
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;