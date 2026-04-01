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
  AlertCircle,
  Archive,
  RotateCcw
} from 'lucide-react';
import courseApi from '../../api/courseApi';
import { departmentApi } from '../../api/adminApi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminCourses.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [deletedCourses, setDeletedCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalDepartments: 0,
    totalCredits: 0,
    trashedCourses: 0
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
      setError('Please select at least one course');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to move ${selectedRows.length} course(s) to trash?`
      : `Are you sure you want to permanently delete ${selectedRows.length} course(s)? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      let successCount = 0;
      
      for (const id of selectedRows) {
        try {
          if (action === 'delete') {
            await courseApi.softDeleteCourse(id);
          } else if (action === 'permanent') {
            await courseApi.permanentDeleteCourse(id);
          }
          successCount++;
        } catch (err) {
          console.error(`Failed to ${action} course ${id}:`, err);
        }
      }
      
      setSuccessMessage(`Successfully ${action === 'delete' ? 'moved' : 'permanently deleted'} ${successCount} course(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedRows([]);
      setSelectAll(false);
      fetchData();
    } catch (err) {
      console.error(`Error during bulk ${action}:`, err);
      setError(`Failed to ${action} courses`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
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
    fetchDepartments();
    fetchTeachers();
  }, []);

  useEffect(() => {
    let filtered = activeTab === 'active' ? courses : deletedCourses;
    
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
  }, [searchTerm, departmentFilter, courses, deletedCourses, activeTab]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      let deptsData = [];
      if (response?.success && response?.data) {
        deptsData = response.data;
      } else if (Array.isArray(response)) {
        deptsData = response;
      }
      setDepartments(deptsData);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const teachersData = await courseApi.getTeachers();
      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const coursesData = await courseApi.getCourses();
      const trashedData = await courseApi.getTrashedCourses();
      
      setCourses(coursesData);
      setDeletedCourses(trashedData);
      setFilteredCourses(coursesData);

      const uniqueDepts = [...new Set(coursesData.map(c => c.department).filter(Boolean))];
      const totalCredits = coursesData.reduce((sum, c) => sum + (c.credits || 0), 0);
      
      setStats({
        totalCourses: coursesData.length,
        totalDepartments: uniqueDepts.length,
        totalCredits: totalCredits,
        trashedCourses: trashedData.length
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

  const handleSoftDelete = async (course) => {
    setSelectedCourse(course);
    setModalType('softDelete');
    setShowModal(true);
  };

  const confirmSoftDelete = async () => {
    try {
      setLoading(true);
      await courseApi.softDeleteCourse(selectedCourse.id);
      
      const updatedActive = courses.filter(c => c.id !== selectedCourse.id);
      const deletedCourseWithDate = {
        ...selectedCourse,
        deletedAt: new Date().toISOString()
      };
      
      setCourses(updatedActive);
      setDeletedCourses([deletedCourseWithDate, ...deletedCourses]);
      setFilteredCourses(updatedActive);
      
      setStats(prev => ({
        ...prev,
        totalCourses: prev.totalCourses - 1,
        trashedCourses: prev.trashedCourses + 1
      }));
      
      setSuccessMessage(`${selectedCourse.name} moved to trash successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('Error soft deleting course:', err);
      setError('Failed to move to trash: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (course) => {
    if (!window.confirm(`Are you sure you want to restore ${course.name}?`)) return;
    
    try {
      setLoading(true);
      await courseApi.restoreCourse(course.id);
      
      const updatedDeleted = deletedCourses.filter(c => c.id !== course.id);
      const restoredCourse = {
        ...course,
        deletedAt: null,
        restoredAt: new Date().toISOString()
      };
      
      setDeletedCourses(updatedDeleted);
      setCourses([restoredCourse, ...courses]);
      setFilteredCourses(activeTab === 'active' ? [restoredCourse, ...courses] : updatedDeleted);
      
      setStats(prev => ({
        ...prev,
        totalCourses: prev.totalCourses + 1,
        trashedCourses: prev.trashedCourses - 1
      }));
      
      setSuccessMessage(`${course.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error restoring course:', err);
      setError('Failed to restore: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (course) => {
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete ${course.name}? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      await courseApi.permanentDeleteCourse(course.id);
      
      const updatedDeleted = deletedCourses.filter(c => c.id !== course.id);
      setDeletedCourses(updatedDeleted);
      setFilteredCourses(updatedDeleted);
      
      setStats(prev => ({
        ...prev,
        trashedCourses: prev.trashedCourses - 1
      }));
      
      setSuccessMessage(`${course.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error permanently deleting course:', err);
      setError('Failed to permanently delete: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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

      const creditsNum = parseInt(formData.credits);
      if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 6) {
        setError('Credits must be a number between 1 and 6');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const courseData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        department: formData.department,
        credits: creditsNum,
        description: formData.description ? formData.description.trim() : null,
        semester: formData.semester && formData.semester !== '' ? parseInt(formData.semester) : null,
        teacherId: formData.teacherId && formData.teacherId !== '' ? parseInt(formData.teacherId) : null,
        schedule: formData.schedule && formData.schedule !== '' ? formData.schedule : null,
        room: null
      };

      console.log("📤 Sending course data:", JSON.stringify(courseData, null, 2));

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
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save course';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Not Assigned';
  };

  const activeDepartments = [...new Set(courses.map(c => c.department).filter(Boolean))];

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

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Courses List', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Courses: ${filteredCourses.length}`, 14, 36);

      const tableColumn = ['Code', 'Course Name', 'Department', 'Credits', 'Teacher', 'Schedule'];
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

  const triggerFileInput = () => {
    const fileInput = document.getElementById('excel-import-input');
    if (fileInput) fileInput.click();
  };

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
    event.target.value = '';
  };

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
        const existingCodes = new Set(courses.map(c => c.code));

        for (const row of jsonData) {
          const courseCode = row['Course Code'] || row['code'] || '';
          const courseName = row['Course Name'] || row['name'] || '';
          const department = row['Department'] || row['department'] || '';
          const credits = parseInt(row['Credits'] || row['credits'] || 0);
          
          if (existingCodes.has(courseCode) || !courseCode || !courseName || !department || !credits) {
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
        
        setSuccessMessage(`Import completed! Imported: ${imported} courses, Skipped: ${skipped} courses`);
        setTimeout(() => setSuccessMessage(''), 5000);
        setShowImportPreview(false);
        setShowImportMenu(false);
        setImportFile(null);
        setImportPreview([]);
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

  const downloadSampleTemplate = () => {
    const sampleData = [{
      'Course Code': 'CS101',
      'Course Name': 'Introduction to Computer Science',
      'Department': 'Computer Science',
      'Credits': 4,
      'Semester': 1,
      'Schedule': '10:00',
      'Description': 'Fundamental concepts of programming and computer science.'
    }];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Course Template');
    XLSX.writeFile(wb, 'course_import_template.xlsx');
    setShowImportMenu(false);
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
      <input
        type="file"
        id="excel-import-input"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {successMessage && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Course Management</h1>
          <p className="page-description">Manage course offerings and department assignments</p>
        </div>
        <div className="header-actions">
          <div className="import-dropdown">
            <button className="btn-import" onClick={() => setShowImportMenu(!showImportMenu)}>
              <Upload size={18} /><span>Import</span>
            </button>
            {showImportMenu && (
              <div className="import-menu">
                <div className="import-menu-body">
                  <button className="import-option" onClick={triggerFileInput}>
                    <FileSpreadsheet size={16} /><span>Excel File</span>
                  </button>
                  <button className="import-option" onClick={downloadSampleTemplate}>
                    <Download size={16} /><span>Download Template</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="export-dropdown">
            <button className="btn-export" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download size={18} /><span>Export</span>
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <div className="export-menu-body">
                  <button className="export-option" onClick={exportToExcel}>
                    <FileSpreadsheet size={16} /><span>Excel</span>
                  </button>
                  <button className="export-option" onClick={exportToPDF}>
                    <FileText size={16} /><span>PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            className={`btn-icon ${activeTab === 'deleted' ? 'active-trash' : ''}`} 
            onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')}
            title={activeTab === 'active' ? "View Trash" : "View Active Courses"}
          >
            <Archive size={18} />
            {stats.trashedCourses > 0 && <span className="badge-icon">{stats.trashedCourses}</span>}
          </button>

          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button className="btn-add-course" onClick={handleAdd}>
            <Plus size={20} /><span>Add Course</span>
          </button>
        </div>
      </div>

      {showImportPreview && (
        <div className="modal-overlay" onClick={() => setShowImportPreview(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Preview</h2>
              <button className="close-btn" onClick={() => setShowImportPreview(false)}><X size={18} /></button>
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
              <p className="import-note" style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                Note: Courses with existing course codes will be automatically skipped.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowImportPreview(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmImport}><Upload size={16} />Confirm Import</button>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><BookOpen size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TOTAL COURSES</span>
            <span className="stat-value">{stats.totalCourses}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Grid size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">DEPARTMENTS</span>
            <span className="stat-value">{stats.totalDepartments}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Archive size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TRASH</span>
            <span className="stat-value">{stats.trashedCourses}</span>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          <BookOpen size={16} /><span>Active Courses</span><span className="tab-count">{courses.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`} onClick={() => setActiveTab('deleted')}>
          <Trash2 size={16} /><span>Trash</span><span className="tab-count">{deletedCourses.length}</span>
        </button>
      </div>

      <div className="search-filter-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder={activeTab === 'active' ? "Search courses..." : "Search deleted courses..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <Filter className="filter-icon" size={18} />
          <select className="filter-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {activeDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <ChevronDown className="select-chevron" size={16} />
        </div>
      </div>

      {(searchTerm || departmentFilter !== 'all') && (
        <div className="results-summary">
          <span>Showing <strong>{filteredCourses.length}</strong> of <strong>{activeTab === 'active' ? courses.length : deletedCourses.length}</strong> courses</span>
          {filteredCourses.length !== (activeTab === 'active' ? courses.length : deletedCourses.length) && (
            <span className="filtered-indicator">(filtered)</span>
          )}
        </div>
      )}

      {selectedRows.length > 0 && (
        <div className="table-actions-bar">
          <span className="selected-count">{selectedRows.length} course(s) selected</span>
          <div className="bulk-actions">
            <button className="btn-bulk-delete" onClick={() => handleBulkAction('delete')} title="Move selected to trash">
              <Archive size={16} /> Move to Trash
            </button>
            {activeTab === 'deleted' && (
              <button className="btn-bulk-permanent-delete" onClick={() => handleBulkAction('permanent')} title="Permanently delete selected">
                <Trash2 size={16} /> Permanently Delete
              </button>
            )}
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
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
              currentItems.map((course) => {
                const isDeleted = activeTab === 'deleted';
                const deletedDate = course.deletedAt ? new Date(course.deletedAt).toLocaleDateString() : null;
                
                return (
                  <tr key={course.id} className={isDeleted ? 'deleted-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(course.id)}
                        onChange={() => handleRowSelect(course.id)}
                      />
                    </td>
                    <td className="col-code"><span className="course-code">{course.code}</span></td>
                    <td className="col-name">
                      <span className="course-name" title={course.name}>{course.name}</span>
                      {isDeleted && deletedDate && (
                        <div className="deleted-date">Deleted: {deletedDate}</div>
                      )}
                    </td>
                    <td className="col-dept">
                      <div className="department-wrapper">
                        <span className="department-dot" style={{ backgroundColor: getDepartmentColor(course.department) }}></span>
                        <span className="department-name" title={course.department}>{course.department}</span>
                      </div>
                    </td>
                    <td className="col-credits"><span className="credit-value">{course.credits}</span></td>
                    <td className="col-semester"><span className="semester-value">{course.semester || '—'}</span></td>
                    <td className="col-teacher"><span className="teacher-name">{getTeacherName(course.teacherId)}</span></td>
                    <td className="col-schedule"><span className="schedule-time">{course.schedule || '—'}</span></td>
                    <td className="col-desc">
                      <span className="description-text" title={course.description}>
                        {course.description && course.description.length > 20 ? `${course.description.substring(0, 20)}...` : course.description || '—'}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => handleView(course)} title="View"><Eye size={18} /></button>
                        {activeTab === 'active' ? (
                          <>
                            <button className="action-btn edit" onClick={() => handleEdit(course)} title="Edit"><Edit size={18} /></button>
                            <button className="action-btn delete" onClick={() => handleSoftDelete(course)} title="Move to Trash"><Archive size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestore(course)} title="Restore"><RotateCcw size={18} /></button>
                            <button className="action-btn permanent-delete" onClick={() => handlePermanentDelete(course)} title="Permanently Delete"><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                   </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="empty-state">
                  {activeTab === 'active' ? (
                    courses.length === 0 ? (
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
                    )
                  ) : (
                    <>
                      <Trash2 size={48} />
                      <h4>Trash is Empty</h4>
                      <p>No deleted courses found. Deleted courses will appear here for restoration.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredCourses.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>Show</span>
            <select value={itemsPerPage} onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
              setSelectedRows([]);
              setSelectAll(false);
            }} className="pagination-select">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="pagination-total">Total: {filteredCourses.length}</span>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={16} /> Prev</button>
            <span className="pagination-page">Page {currentPage} of {totalPages}</span>
            <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next <ChevronRight size={16} /></button>
            <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Course' : 'Edit Course'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g., CS101" required />
                  </div>
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Computer Science" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select name="department" value={formData.department} onChange={handleChange} required>
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id || dept.name} value={dept.name || dept}>
                          {dept.name || dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Teacher</label>
                    <select name="teacherId" value={formData.teacherId || ''} onChange={handleChange}>
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Credits *</label>
                    <input type="number" name="credits" value={formData.credits} onChange={handleChange} placeholder="e.g., 4" min="1" max="6" required />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <input type="number" name="semester" value={formData.semester || ''} onChange={handleChange} placeholder="e.g., 3" min="1" max="8" />
                  </div>
                </div>
                <div className="form-group">
                  <label><Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Schedule</label>
                  <input type="time" name="schedule" value={formData.schedule || ''} onChange={handleChange} className="time-input" />
                  <small className="schedule-hint">Select class time (optional)</small>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter course description" rows="3" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} />{modalType === 'add' ? 'Add Course' : 'Update Course'}</button>
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
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-group"><label>Code:</label><span>{selectedCourse.code}</span></div>
              <div className="detail-group"><label>Name:</label><span>{selectedCourse.name}</span>{selectedCourse.deletedAt && (<p className="deleted-info">Deleted on: {new Date(selectedCourse.deletedAt).toLocaleString()}</p>)}</div>
              <div className="detail-group"><label>Department:</label><span>{selectedCourse.department}</span></div>
              <div className="detail-group"><label>Credits:</label><span>{selectedCourse.credits}</span></div>
              <div className="detail-group"><label>Semester:</label><span>{selectedCourse.semester || '—'}</span></div>
              <div className="detail-group"><label>Teacher:</label><span>{getTeacherName(selectedCourse.teacherId)}</span></div>
              <div className="detail-group"><label>Schedule:</label><span>{selectedCourse.schedule || '—'}</span></div>
              <div className="detail-group"><label>Description:</label><span>{selectedCourse.description || '—'}</span></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              {selectedCourse.deletedAt ? (
                <button className="btn-primary" onClick={() => { setShowModal(false); handleRestore(selectedCourse); }}><RotateCcw size={16} />Restore Course</button>
              ) : (
                <button className="btn-primary" onClick={() => { setShowModal(false); handleEdit(selectedCourse); }}><Edit size={16} />Edit</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {modalType === 'softDelete' && selectedCourse && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Move to Trash</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body text-center">
              <div className="delete-icon warning"><Archive size={48} /></div>
              <p className="delete-message">Are you sure you want to move <strong>{selectedCourse.name}</strong> to trash?</p>
              <p className="delete-warning">You can restore this course from trash later.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-warning" onClick={confirmSoftDelete}><Archive size={16} />Move to Trash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedCourse && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Course</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body text-center">
              <p>Are you sure you want to delete <strong>{selectedCourse.name}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}><Trash2 size={16} />Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;