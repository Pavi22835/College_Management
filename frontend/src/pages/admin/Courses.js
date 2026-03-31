import React, { useState, useEffect } from 'react';
import { 
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Grid,
  X,
  Save,
  Filter,
  ChevronDown,
  LogOut,
  Lock,
  Sun,
  Cloud,
  MoreVertical,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  DownloadCloud,
  UploadCloud,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import courseApi from '../../api/courseApi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminCourses.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 34, condition: 'sunny' });
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalDepartments: 0,
    totalCredits: 0
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    teacherId: '',
    department: '',
    credits: '',
    semester: '',
    schedule: '',
    description: ''
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchTerm, departmentFilter]);

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

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      setError('Please select at least one course');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} course(s)? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      let successCount = 0;
      
      for (const id of selectedRows) {
        try {
          await courseApi.deleteCourse(id);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete course ${id}:`, err);
        }
      }
      
      setSuccessMessage(`Successfully deleted ${successCount} course(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedRows([]);
      setSelectAll(false);
      fetchData();
    } catch (err) {
      console.error('Error during bulk delete:', err);
      setError('Failed to delete courses');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }).toLowerCase();
  };

  // Department color mapping
  const getDepartmentColor = (dept) => {
    const colors = {
      'English': '#3b82f6',
      'Physics': '#10b981',
      'Mathematics': '#f59e0b',
      'Computer Science': '#8b5cf6',
      'Chemistry': '#ef4444',
      'Biology': '#06b6d4',
      'History': '#ec4899',
      'Economics': '#14b8a6',
      'default': '#64748b'
    };
    
    if (!dept) return colors.default;
    
    for (const [key, color] of Object.entries(colors)) {
      if (dept.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return colors.default;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(course => 
        course.department === departmentFilter
      );
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, departmentFilter, courses]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, teachersRes] = await Promise.all([
        courseApi.getCourses(),
        courseApi.getTeachers()
      ]);

      let coursesData = [];
      if (coursesRes?.success && coursesRes?.data) {
        coursesData = coursesRes.data;
      } else if (Array.isArray(coursesRes)) {
        coursesData = coursesRes;
      }

      let teachersData = [];
      if (teachersRes?.success && teachersRes?.data) {
        teachersData = teachersRes.data;
      } else if (Array.isArray(teachersRes)) {
        teachersData = teachersRes;
      }

      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setTeachers(teachersData);

      const uniqueDepts = [...new Set(coursesData.map(c => c.department).filter(Boolean))];
      const totalCredits = coursesData.reduce((sum, c) => sum + (c.credits || 0), 0);
      
      setStats({
        totalCourses: coursesData.length,
        totalDepartments: uniqueDepts.length,
        totalCredits
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      code: '',
      name: '',
      teacherId: '',
      department: '',
      credits: '',
      semester: '',
      schedule: '',
      description: ''
    });
    setSelectedCourse(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      teacherId: course.teacherId || '',
      department: course.department || '',
      credits: course.credits || '',
      semester: course.semester || '',
      schedule: course.schedule || '',
      description: course.description || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await courseApi.deleteCourse(selectedCourse.id);
      setSuccessMessage(`${selectedCourse.name} deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
      setTimeout(() => setError(null), 3000);
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
      if (!formData.code || !formData.name || !formData.department || !formData.credits) {
        setError('Please fill in all required fields');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const courseData = {
        code: formData.code,
        name: formData.name,
        department: formData.department,
        credits: parseInt(formData.credits),
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
        semester: formData.semester ? parseInt(formData.semester) : null,
        schedule: formData.schedule || null,
        description: formData.description || null
      };

      if (modalType === 'add') {
        await courseApi.createCourse(courseData);
        setSuccessMessage('Course added successfully!');
      } else if (modalType === 'edit') {
        await courseApi.updateCourse(selectedCourse.id, courseData);
        setSuccessMessage('Course updated successfully!');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save course');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Not Assigned';
  };

  const departments = [...new Set(courses.map(c => c.department).filter(Boolean))];

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = currentItems.map(course => ({
        'Course Code': course.code || '',
        'Course Name': course.name || '',
        'Department': course.department || '',
        'Credits': course.credits || '',
        'Semester': course.semester || '',
        'Teacher': getTeacherName(course.teacherId),
        'Schedule': course.schedule || '',
        'Description': course.description || ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Courses');
      XLSX.writeFile(wb, `courses_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export to Excel');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Courses List', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Courses: ${filteredCourses.length}`, 14, 36);

      const tableColumn = [
        'Code', 
        'Course Name', 
        'Department', 
        'Credits', 
        'Teacher', 
        'Schedule'
      ];
      
      const tableRows = currentItems.map(course => [
        course.code || '',
        course.name || '',
        course.department || '',
        course.credits || '',
        getTeacherName(course.teacherId),
        course.schedule || ''
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] }
      });

      doc.save(`courses_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Failed to export to PDF');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    const fileInput = document.getElementById('excel-import-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
          setError('The file is empty!');
          setTimeout(() => setError(null), 3000);
          return;
        }
        
        setImportPreview(jsonData.slice(0, 5));
        setShowImportPreview(true);
      } catch (err) {
        console.error('Error reading file:', err);
        setError('Failed to read file. Please make sure it\'s a valid Excel file.');
        setTimeout(() => setError(null), 3000);
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Confirm import - skip existing courses
  const confirmImport = async () => {
    if (!importFile) return;
    
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let imported = 0;
        let skipped = 0;
        const skippedCourses = [];

        // Get existing course codes for duplicate checking
        const existingCodes = new Set(courses.map(c => c.code));

        // Import each course, skip if already exists
        for (const row of jsonData) {
          const courseCode = row['Course Code'] || row['code'] || '';
          const courseName = row['Course Name'] || row['name'] || '';
          const department = row['Department'] || row['department'] || '';
          const credits = parseInt(row['Credits'] || row['credits'] || 0);
          
          // Skip if course already exists
          if (existingCodes.has(courseCode)) {
            skipped++;
            skippedCourses.push(courseCode);
            continue;
          }
          
          // Skip if required fields are missing
          if (!courseCode || !courseName || !department || !credits) {
            skipped++;
            continue;
          }

          const courseData = {
            code: courseCode,
            name: courseName,
            department: department,
            credits: credits,
            semester: row['Semester'] || row['semester'] ? parseInt(row['Semester'] || row['semester']) : null,
            schedule: row['Schedule'] || row['schedule'] || '',
            description: row['Description'] || row['description'] || '',
            teacherId: null
          };

          try {
            await courseApi.createCourse(courseData);
            imported++;
          } catch (err) {
            console.error('Error importing course:', courseCode, err);
            skipped++;
          }
        }

        setImportResult({
          imported,
          skipped,
          skippedCourses: skippedCourses.slice(0, 10)
        });
        
        setSuccessMessage(`Import completed! Imported: ${imported} courses, Skipped: ${skipped} courses`);
        setTimeout(() => setSuccessMessage(''), 5000);
        
        setShowImportPreview(false);
        setShowImportMenu(false);
        setImportFile(null);
        setImportPreview([]);
        
        // Refresh the data
        await fetchData();
        
      } catch (err) {
        console.error('Error importing data:', err);
        setError('Failed to import data. Please check the file format.');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Course Code': 'CS101',
        'Course Name': 'Introduction to Computer Science',
        'Department': 'Computer Science',
        'Credits': 4,
        'Semester': 1,
        'Schedule': '10:00',
        'Description': 'Fundamental concepts of programming and computer science.'
      },
      {
        'Course Code': 'MATH201',
        'Course Name': 'Calculus I',
        'Department': 'Mathematics',
        'Credits': 3,
        'Semester': 1,
        'Schedule': '09:00',
        'Description': 'Limits, derivatives, and integrals.'
      },
      {
        'Course Code': 'PHYS101',
        'Course Name': 'Physics Fundamentals',
        'Department': 'Physics',
        'Credits': 4,
        'Semester': 1,
        'Schedule': '14:00',
        'Description': 'Introduction to mechanics and thermodynamics.'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    ws['!cols'] = [
      { wch: 15 }, // Course Code
      { wch: 30 }, // Course Name
      { wch: 20 }, // Department
      { wch: 10 }, // Credits
      { wch: 10 }, // Semester
      { wch: 12 }, // Schedule
      { wch: 40 }  // Description
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Course Template');
    XLSX.writeFile(wb, 'course_import_template.xlsx');
    
    setShowImportMenu(false);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Courses</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchData}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      {/* Hidden file input */}
      <input
        type="file"
        id="excel-import-input"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            Course Management
          </h1>
          <p className="page-description">Manage course offerings and department assignments</p>
        </div>
        <div className="header-actions">
          {/* Import Button with Text */}
          <div className="import-dropdown">
            <button 
              className="btn-import"
              onClick={() => setShowImportMenu(!showImportMenu)}
            >
              <Upload size={18} />
              <span>Import</span>
            </button>
            {showImportMenu && (
              <div className="import-menu">
                <div className="import-menu-body">
                  <button 
                    className="import-option" 
                    onClick={triggerFileInput}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Excel File</span>
                  </button>
                  <button className="import-option" onClick={downloadSampleTemplate}>
                    <Download size={16} />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Button with Text */}
          <div className="export-dropdown">
            <button 
              className="btn-export"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={18} />
              <span>Export</span>
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

          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-course" onClick={handleAdd}>
            <Plus size={20} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="modal-overlay" onClick={() => setShowImportPreview(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Preview</h2>
              <button className="close-btn" onClick={() => setShowImportPreview(false)}>
                <X size={18} />
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
              <p className="import-note" style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                Note: Courses with existing course codes will be automatically skipped.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowImportPreview(false)}>
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
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">TOTAL COURSES</span>
            <span className="stat-value">{stats.totalCourses}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Grid size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">DEPARTMENTS</span>
            <span className="stat-value">{stats.totalDepartments}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">TOTAL CREDITS</span>
            <span className="stat-value">{stats.totalCredits}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <Filter className="filter-icon" size={18} />
          <select 
            className="filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <ChevronDown className="select-chevron" size={16} />
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || departmentFilter !== 'all') && (
        <div className="results-summary">
          <span>
            Showing <strong>{filteredCourses.length}</strong> of <strong>{courses.length}</strong> courses
          </span>
          {filteredCourses.length !== courses.length && (
            <span className="filtered-indicator">(filtered)</span>
          )}
        </div>
      )}

      {/* Table Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="table-actions-bar">
          <span className="selected-count">{selectedRows.length} course(s) selected</span>
          <div className="bulk-actions">
            <button className="btn-bulk-delete" onClick={handleBulkDelete} title="Delete selected courses">
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th className="col-code">CODE</th>
              <th className="col-name">COURSE NAME</th>
              <th className="col-dept">DEPARTMENT</th>
              <th className="col-credits">CREDITS</th>
              <th className="col-semester">SEM</th>
              <th className="col-teacher">TEACHER</th>
              <th className="col-schedule">SCHEDULE</th>
              <th className="col-desc">DESCRIPTION</th>
              <th className="col-actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((course) => (
                <tr key={course.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(course.id)}
                      onChange={() => handleRowSelect(course.id)}
                    />
                  </td>
                  <td className="col-code">
                    <span className="course-code">{course.code}</span>
                  </td>
                  <td className="col-name">
                    <span className="course-name" title={course.name}>
                      {course.name}
                    </span>
                  </td>
                  <td className="col-dept">
                    <div className="department-wrapper">
                      <span 
                        className="department-dot" 
                        style={{ backgroundColor: getDepartmentColor(course.department) }}
                      ></span>
                      <span className="department-name" title={course.department}>
                        {course.department}
                      </span>
                    </div>
                  </td>
                  <td className="col-credits">
                    <span className="credit-value">{course.credits}</span>
                  </td>
                  <td className="col-semester">
                    <span className="semester-value">{course.semester || '—'}</span>
                  </td>
                  <td className="col-teacher">
                    <span className="teacher-name" title={getTeacherName(course.teacherId)}>
                      {getTeacherName(course.teacherId)}
                    </span>
                  </td>
                  <td className="col-schedule">
                    <span className="schedule-time" title={course.schedule}>
                      {course.schedule || '—'}
                    </span>
                  </td>
                  <td className="col-desc">
                    <span className="description-text" title={course.description}>
                      {course.description && course.description.length > 20 
                        ? `${course.description.substring(0, 20)}...` 
                        : course.description || '—'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleView(course)} title="View">
                        <Eye size={18} />
                      </button>
                      <button className="action-btn edit" onClick={() => handleEdit(course)} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(course)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="empty-state">
                  {courses.length === 0 ? (
                    <>
                      <BookOpen size={48} />
                      <h4>No Courses Found</h4>
                      <p>Click "Add Course" to create your first course.</p>
                    </>
                  ) : (
                    <>
                      <Search size={48} />
                      <h4>No Matching Courses</h4>
                      <p>Try adjusting your search criteria.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredCourses.length > 0 && (
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
              Total: {filteredCourses.length}
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

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Course' : 'Edit Course'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., CS101"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Teacher</label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleChange}
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Credits *</label>
                    <input
                      type="number"
                      name="credits"
                      value={formData.credits}
                      onChange={handleChange}
                      placeholder="e.g., 4"
                      min="1"
                      max="6"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      placeholder="e.g., 3"
                      min="1"
                      max="8"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Schedule
                  </label>
                  <input
                    type="time"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    className="time-input"
                  />
                  <small className="schedule-hint">Select class time</small>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter course description"
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {modalType === 'add' ? 'Add Course' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalType === 'view' && selectedCourse && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Course Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Code:</label>
                <span>{selectedCourse.code}</span>
              </div>
              <div className="detail-group">
                <label>Name:</label>
                <span>{selectedCourse.name}</span>
              </div>
              <div className="detail-group">
                <label>Department:</label>
                <span>{selectedCourse.department}</span>
              </div>
              <div className="detail-group">
                <label>Credits:</label>
                <span>{selectedCourse.credits}</span>
              </div>
              <div className="detail-group">
                <label>Semester:</label>
                <span>{selectedCourse.semester || '—'}</span>
              </div>
              <div className="detail-group">
                <label>Teacher:</label>
                <span>{getTeacherName(selectedCourse.teacherId)}</span>
              </div>
              <div className="detail-group">
                <label>Schedule:</label>
                <span>{selectedCourse.schedule || '—'}</span>
              </div>
              <div className="detail-group">
                <label>Description:</label>
                <span>{selectedCourse.description || '—'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => {
                setShowModal(false);
                handleEdit(selectedCourse);
              }}>
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedCourse && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Course</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body text-center">
              <p>Are you sure you want to delete <strong>{selectedCourse.name}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;