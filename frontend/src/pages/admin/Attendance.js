import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  X
} from 'lucide-react';
import attendanceApi from '../../api/attendanceApi';
import { courseApi, departmentApi } from '../../api/adminApi';
import studentApi from '../../api/studentApi';
import staffApi from '../../api/staffApi';  // Changed from teacherApi to staffApi
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminAttendance.css';

const AdminAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageAttendance: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAttendanceData();
      fetchAttendanceStats();
    }
  }, [selectedDate, selectedCourse, selectedDepartment]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [coursesRes, deptsRes, studentsRes, teachersRes] = await Promise.allSettled([
        courseApi.getAll(),
        departmentApi.getAll(),
        studentApi.getAll(),
        staffApi.getStaff()  // Changed from teacherApi to staffApi
      ]);

      // Process courses
      if (coursesRes.status === 'fulfilled') {
        const coursesData = coursesRes.value.data || coursesRes.value;
        setCourses(coursesData || []);
      }

      // Process departments
      if (deptsRes.status === 'fulfilled') {
        const deptsData = deptsRes.value.data || deptsRes.value;
        setDepartments(deptsData || []);
      }

      // Process students
      if (studentsRes.status === 'fulfilled') {
        const studentsData = studentsRes.value.data || studentsRes.value;
        setStudents(studentsData || []);
      }

      // Process teachers
      if (teachersRes.status === 'fulfilled') {
        const teachersData = teachersRes.value.data || teachersRes.value;
        setTeachers(teachersData || []);
      }

      // Fetch initial attendance data
      await fetchAttendanceData();
      await fetchAttendanceStats();

    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setRefreshing(true);
      
      // Prepare params for getAllAttendance
      const params = {
        date: selectedDate,
        limit: 1000 // Get all records for the selected date
      };
      
      // Add course filter if selected
      if (selectedCourse !== 'all') {
        params.courseId = selectedCourse;
      }

      // Call the API - using getAllAttendance from your api
      const response = await attendanceApi.getAllAttendance(params);
      
      // Handle different response structures
      let records = [];
      if (response?.data) {
        records = response.data;
      } else if (Array.isArray(response)) {
        records = response;
      } else if (response?.records) {
        records = response.records;
      }

      // Filter by department if needed (client-side filtering since API might not support it)
      if (selectedDepartment !== 'all' && records.length > 0) {
        records = records.filter(record => 
          record.department === selectedDepartment || 
          record.course?.department === selectedDepartment
        );
      }

      setAttendanceData(records);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data');
      setAttendanceData([]);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      // Prepare params for getAttendanceStats
      const params = {};
      if (selectedCourse !== 'all') {
        params.courseId = selectedCourse;
      }
      if (selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }

      const response = await attendanceApi.getAttendanceStats(params);
      
      if (response?.data) {
        // Calculate stats from response
        const statsData = response.data;
        
        // Get today's stats from the response
        const todayStats = statsData.summary?.today || {};
        const overallStats = statsData.summary?.overall || {};
        
        setStats({
          totalStudents: statsData.totalStudents || students.length || 0,
          presentToday: todayStats.present || 0,
          absentToday: todayStats.absent || 0,
          lateToday: todayStats.late || 0,
          averageAttendance: overallStats.average || 0,
          totalCourses: statsData.totalCourses || courses.length || 0
        });

        // Set course stats if available
        if (statsData.courseStats) {
          setCourseStats(statsData.courseStats);
        }
      } else {
        // Use calculated stats from students
        setStats({
          totalStudents: students.length || 0,
          presentToday: 0,
          absentToday: 0,
          lateToday: 0,
          averageAttendance: 0,
          totalCourses: courses.length || 0
        });
      }
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      if (selectedCourse === 'all') {
        alert('Please select a specific course to mark attendance');
        return;
      }

      const response = await attendanceApi.markSingleAttendance(
        parseInt(selectedCourse),
        selectedDate,
        studentId,
        status
      );

      if (response?.success) {
        // Refresh data
        await fetchAttendanceData();
        await fetchAttendanceStats();
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance');
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
    fetchAttendanceStats();
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = filteredData.map(record => ({
        'Roll No': record.rollNo || '',
        'Student Name': record.studentName || '',
        'Course': record.courseName || '',
        'Department': record.department || '',
        'Status': record.status || '',
        'Time': formatTime(record.time)
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      XLSX.writeFile(wb, `attendance_${selectedDate}.xlsx`);
      
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export to Excel');
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Attendance Report', 14, 22);
      doc.setFontSize(11);
      doc.text(`Date: ${selectedDate}`, 14, 30);
      doc.text(`Total Records: ${filteredData.length}`, 14, 36);

      // Prepare table data
      const tableColumn = [
        'Roll No', 
        'Student Name', 
        'Course', 
        'Department', 
        'Status', 
        'Time'
      ];
      
      const tableRows = filteredData.map(record => [
        record.rollNo || '',
        record.studentName || '',
        record.courseName || '',
        record.department || '',
        record.status || '',
        formatTime(record.time)
      ]);

      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`attendance_${selectedDate}.pdf`);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Failed to export to PDF');
    }
  };

  // Handle file import
  const handleFileImport = (event) => {
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
        
        setImportPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
        setShowImportPreview(true);
      } catch (err) {
        console.error('Error reading file:', err);
        alert('Failed to read file. Please make sure it\'s a valid Excel file.');
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Import each attendance record
          for (const row of jsonData) {
            const attendanceData = {
              studentId: row['Student ID'] || row['studentId'] || '',
              courseId: row['Course ID'] || row['courseId'] || '',
              date: row['Date'] || row['date'] || selectedDate,
              status: row['Status'] || row['status'] || 'PRESENT',
              time: row['Time'] || row['time'] || new Date().toISOString()
            };

            if (attendanceData.studentId && attendanceData.courseId) {
              await attendanceApi.markSingleAttendance(
                parseInt(attendanceData.courseId),
                attendanceData.date,
                parseInt(attendanceData.studentId),
                attendanceData.status
              );
            }
          }

          alert(`Successfully imported ${jsonData.length} attendance records!`);
          setShowImportPreview(false);
          setShowImportMenu(false);
          setImportFile(null);
          fetchAttendanceData();
          fetchAttendanceStats();
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

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Student ID': '1',
        'Student Name': 'John Doe',
        'Course ID': '101',
        'Course Name': 'Computer Science',
        'Date': selectedDate,
        'Status': 'PRESENT',
        'Time': '09:00 AM'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'attendance_import_template.xlsx');
  };

  // Format attendance data for display with real student data
  const formatAttendanceRecord = (record) => {
    // Find student from our students list
    const student = students.find(s => s.id === record.studentId);
    
    return {
      id: record.id,
      studentId: record.studentId,
      studentName: record.student?.user?.name || record.student?.name || student?.name || record.studentName,
      rollNo: record.student?.rollNo || student?.rollNo || record.rollNo,
      courseId: record.courseId,
      courseName: record.course?.name || record.courseName,
      courseCode: record.course?.code || record.courseCode,
      department: record.course?.department || record.department,
      status: record.status,
      time: record.createdAt || record.time,
      date: record.date
    };
  };

  // Filter data based on search
  const filteredData = attendanceData
    .map(record => formatAttendanceRecord(record))
    .filter(record => {
      const matchesSearch = 
        (record.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.rollNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.studentId?.toString() || '').includes(searchTerm);
      return matchesSearch;
    });

  // Calculate summary
  const summary = {
    present: filteredData.filter(r => r.status === 'PRESENT').length,
    absent: filteredData.filter(r => r.status === 'ABSENT').length,
    late: filteredData.filter(r => r.status === 'LATE').length,
    total: filteredData.length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return '#10b981';
      case 'ABSENT': return '#ef4444';
      case 'LATE': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PRESENT': return <CheckCircle size={14} />;
      case 'ABSENT': return <XCircle size={14} />;
      case 'LATE': return <Clock size={14} />;
      default: return null;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timestamp;
    }
  };

  // Get attendance status options from API
  const statusOptions = attendanceApi.getAttendanceStatuses();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="header-title">Attendance Management</h1>
          <p className="header-subtitle">
            {selectedDate} • {filteredData.length} records found • {students.length} Students • {teachers.length} Teachers
          </p>
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
                  <label className="import-option">
                    <FileSpreadsheet size={16} />
                    <span>Excel</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileImport}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button className="import-option" onClick={downloadSampleTemplate}>
                    <Download size={16} />
                    <span>Template</span>
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

          <button 
            className="refresh-btn" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
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
                      {Object.keys(importPreview[0] || {}).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-icon blue">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{students.length || 0}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{stats.presentToday || 0}</span>
            <span className="stat-percent">
              {students.length > 0 
                ? Math.round(((stats.presentToday || 0) / students.length) * 100) 
                : 0}%
            </span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon red">
            <XCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Absent Today</span>
            <span className="stat-value">{stats.absentToday || 0}</span>
            <span className="stat-percent">
              {students.length > 0 
                ? Math.round(((stats.absentToday || 0) / students.length) * 100) 
                : 0}%
            </span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon orange">
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Avg Attendance</span>
            <span className="stat-value">{stats.averageAttendance || 0}%</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <Calendar className="filter-icon" size={18} />
          <input 
            type="date" 
            className="filter-input" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="filter-group">
          <Filter className="filter-icon" size={18} />
          <select 
            className="filter-select" 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses ({courses.length})</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <Filter className="filter-icon" size={18} />
          <select 
            className="filter-select" 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name || dept.code}>
                {dept.name || dept.code}
              </option>
            ))}
          </select>
        </div>
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name, roll no..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-row">
        <div className="summary-card present">
          <div className="summary-icon">
            <CheckCircle size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Present</span>
            <span className="summary-value">{summary.present}</span>
            <span className="summary-percent">
              {summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="summary-card absent">
          <div className="summary-icon">
            <XCircle size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Absent</span>
            <span className="summary-value">{summary.absent}</span>
            <span className="summary-percent">
              {summary.total > 0 ? Math.round((summary.absent / summary.total) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="summary-card late">
          <div className="summary-icon">
            <Clock size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Late</span>
            <span className="summary-value">{summary.late}</span>
            <span className="summary-percent">
              {summary.total > 0 ? Math.round((summary.late / summary.total) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="summary-card total">
          <div className="summary-icon">
            <Users size={24} />
          </div>
          <div className="summary-details">
            <span className="summary-label">Total</span>
            <span className="summary-value">{summary.total}</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>ROLL NO</th>
              <th style={{ width: '200px' }}>STUDENT NAME</th>
              <th style={{ width: '200px' }}>COURSE</th>
              <th style={{ width: '150px' }}>DEPARTMENT</th>
              <th style={{ width: '120px' }}>STATUS</th>
              <th style={{ width: '100px' }}>TIME</th>
              <th style={{ width: '150px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record, index) => (
                <tr key={record.id || index}>
                  <td className="roll-cell">{record.rollNo || '-'}</td>
                  <td className="name-cell">{record.studentName || '-'}</td>
                  <td>{record.courseName || '-'}</td>
                  <td>{record.department || '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status?.toLowerCase()}`}>
                      {getStatusIcon(record.status)}
                      <span>{record.status || '-'}</span>
                    </span>
                  </td>
                  <td className="time-cell">{formatTime(record.time)}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn present" 
                      onClick={() => handleMarkAttendance(record.studentId, 'PRESENT')}
                      title="Mark Present"
                      disabled={selectedCourse === 'all'}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      className="action-btn absent" 
                      onClick={() => handleMarkAttendance(record.studentId, 'ABSENT')}
                      title="Mark Absent"
                      disabled={selectedCourse === 'all'}
                    >
                      <XCircle size={16} />
                    </button>
                    <button 
                      className="action-btn late" 
                      onClick={() => handleMarkAttendance(record.studentId, 'LATE')}
                      title="Mark Late"
                      disabled={selectedCourse === 'all'}
                    >
                      <Clock size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <AlertCircle size={24} />
                  <p>No attendance records found for {selectedDate}</p>
                  {selectedCourse === 'all' && (
                    <p className="hint-text">Select a specific course to mark attendance</p>
                  )}
                  <button className="refresh-small-btn" onClick={handleRefresh}>
                    Refresh
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Course-wise Summary */}
      {courseStats.length > 0 && (
        <div className="course-summary">
          <h3 className="summary-title">Course-wise Attendance</h3>
          <div className="course-grid">
            {courseStats.slice(0, expandedCourse ? courseStats.length : 4).map((course, index) => {
              const percentage = attendanceApi.calculateAttendancePercentage(
                course.present || 0, 
                course.total || 0
              );
              const color = attendanceApi.getAttendanceColor(percentage);
              
              return (
                <div key={index} className="course-card">
                  <div className="course-header">
                    <span className="course-name">{course.courseName}</span>
                    <span className="course-code">{course.courseCode}</span>
                  </div>
                  <div className="course-stats">
                    <div>
                      <span className="stat-label-sm">Present</span>
                      <span className="stat-value-sm green">{course.present || 0}</span>
                    </div>
                    <div>
                      <span className="stat-label-sm">Total</span>
                      <span className="stat-value-sm blue">{course.total || 0}</span>
                    </div>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                  <div className="course-footer">
                    <span className="attendance-rate" style={{ color }}>
                      {percentage}% attendance
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {courseStats.length > 4 && (
            <button 
              className="view-more-btn"
              onClick={() => setExpandedCourse(!expandedCourse)}
            >
              {expandedCourse ? 'Show Less' : `View All (${courseStats.length} Courses)`}
              {expandedCourse ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;