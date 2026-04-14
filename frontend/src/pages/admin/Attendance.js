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
import staffApi from '../../api/staffApi';
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
  const [markingAttendance, setMarkingAttendance] = useState(false);

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
      
      // Fetch courses
      const coursesRes = await courseApi.getAll();
      let coursesData = [];
      if (coursesRes?.success && coursesRes?.data) {
        coursesData = coursesRes.data;
      } else if (Array.isArray(coursesRes)) {
        coursesData = coursesRes;
      } else if (coursesRes?.data && Array.isArray(coursesRes.data)) {
        coursesData = coursesRes.data;
      }
      setCourses(coursesData);

      // Fetch departments
      const deptsRes = await departmentApi.getAll();
      let deptsData = [];
      if (deptsRes?.success && deptsRes?.data) {
        deptsData = deptsRes.data;
      } else if (Array.isArray(deptsRes)) {
        deptsData = deptsRes;
      } else if (deptsRes?.data && Array.isArray(deptsRes.data)) {
        deptsData = deptsRes.data;
      }
      setDepartments(deptsData);

      // Fetch students
      const studentsRes = await studentApi.getStudents();
      let studentsData = [];
      if (studentsRes?.success && studentsRes?.data) {
        studentsData = studentsRes.data;
      } else if (Array.isArray(studentsRes)) {
        studentsData = studentsRes;
      } else if (studentsRes?.data && Array.isArray(studentsRes.data)) {
        studentsData = studentsRes.data;
      }
      
      // Enhance student data with user info
      const enhancedStudents = studentsData.map(s => ({
        ...s,
        name: s.user?.name || s.name,
        email: s.user?.email || s.email
      }));
      setStudents(enhancedStudents);

      // Fetch teachers/staff
      const teachersRes = await staffApi.getStaff();
      let teachersData = [];
      if (teachersRes?.success && teachersRes?.data) {
        teachersData = teachersRes.data;
      } else if (Array.isArray(teachersRes)) {
        teachersData = teachersRes;
      }
      setTeachers(teachersData);

      // Set initial stats
      setStats(prev => ({
        ...prev,
        totalStudents: enhancedStudents.length,
        totalCourses: coursesData.length
      }));

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
      
      const params = {
        date: selectedDate,
        limit: 1000
      };
      
      if (selectedCourse !== 'all') {
        params.courseId = parseInt(selectedCourse);
      }

      const response = await attendanceApi.getAllAttendance(params);
      
      let records = [];
      if (response?.data && Array.isArray(response.data)) {
        records = response.data;
      } else if (Array.isArray(response)) {
        records = response;
      } else if (response?.records && Array.isArray(response.records)) {
        records = response.records;
      }

      // Filter by department if needed
      if (selectedDepartment !== 'all' && records.length > 0) {
        records = records.filter(record => {
          const course = courses.find(c => c.id === record.courseId);
          return course?.department === selectedDepartment || 
                 record.course?.department === selectedDepartment ||
                 record.department === selectedDepartment;
        });
      }

      setAttendanceData(records);
      
      // Calculate stats directly from records
      const presentCount = records.filter(r => r.status === 'PRESENT').length;
      const absentCount = records.filter(r => r.status === 'ABSENT').length;
      const lateCount = records.filter(r => r.status === 'LATE').length;
      
      console.log('📊 Direct Stats from Records:', { presentCount, absentCount, lateCount, total: records.length });
      
      setStats(prev => ({
        ...prev,
        presentToday: presentCount,
        absentToday: absentCount,
        lateToday: lateCount
      }));
      
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
      const params = {};
      if (selectedCourse !== 'all') {
        params.courseId = parseInt(selectedCourse);
      }
      if (selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }

      const response = await attendanceApi.getAttendanceStats(params);
      console.log('📊 Attendance Stats Response:', response);
      
      if (response?.data) {
        const statsData = response.data;
        console.log('📊 Stats Data:', statsData);
        console.log('📊 Daily Stats:', statsData.dailyStats);
        console.log('📊 Selected Date:', selectedDate);
        
        // Calculate today's stats from attendance data directly
        const todayRecords = attendanceData.filter(r => {
          const recordDate = r.date ? new Date(r.date).toISOString().split('T')[0] : null;
          return recordDate === selectedDate;
        });
        
        const presentCount = todayRecords.filter(r => r.status === 'PRESENT').length;
        const absentCount = todayRecords.filter(r => r.status === 'ABSENT').length;
        const lateCount = todayRecords.filter(r => r.status === 'LATE').length;
        
        console.log('📊 Calculated Stats:', { presentCount, absentCount, lateCount, todayRecords: todayRecords.length });
        
        setStats({
          totalStudents: students.length,
          presentToday: presentCount,
          absentToday: absentCount,
          lateToday: lateCount,
          averageAttendance: statsData.overallAverage || 0,
          totalCourses: courses.length
        });

        // Calculate course-wise stats from attendance records
        const courseStatsMap = new Map();
        
        for (const record of attendanceData) {
          const course = courses.find(c => c.id === record.courseId);
          if (!course) continue;
          
          if (!courseStatsMap.has(course.id)) {
            courseStatsMap.set(course.id, {
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              present: 0,
              absent: 0,
              late: 0,
              total: 0
            });
          }
          
          const courseStat = courseStatsMap.get(course.id);
          if (record.status === 'PRESENT') courseStat.present++;
          else if (record.status === 'ABSENT') courseStat.absent++;
          else if (record.status === 'LATE') courseStat.late++;
          courseStat.total++;
        }
        
        setCourseStats(Array.from(courseStatsMap.values()));
      }
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    if (selectedCourse === 'all') {
      alert('Please select a specific course to mark attendance');
      return;
    }

    if (markingAttendance) return;
    
    try {
      setMarkingAttendance(true);
      
      const response = await attendanceApi.markSingleAttendance(
        parseInt(selectedCourse),
        selectedDate,
        studentId,
        status
      );

      if (response?.success || response?.data) {
        // Refresh data
        await fetchAttendanceData();
        await fetchAttendanceStats();
        
        // Show success feedback
        const statusText = status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Late';
        alert(`Marked ${statusText} successfully!`);
      } else {
        alert('Failed to mark attendance: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to mark attendance: ' + (err.response?.data?.message || err.message));
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
    fetchAttendanceStats();
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredData.map(record => ({
        'Roll No': record.rollNo || '',
        'Student Name': record.studentName || '',
        'Course': record.courseName || '',
        'Course Code': record.courseCode || '',
        'Department': record.department || '',
        'Status': record.status || '',
        'Date': record.date || selectedDate,
        'Time': formatTime(record.time)
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      XLSX.writeFile(wb, `attendance_${selectedDate}.xlsx`);
      
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export to Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Attendance Report', 14, 22);
      doc.setFontSize(11);
      doc.text(`Date: ${selectedDate}`, 14, 30);
      doc.text(`Course: ${selectedCourse === 'all' ? 'All Courses' : courses.find(c => c.id == selectedCourse)?.name || 'Selected'}`, 14, 36);
      doc.text(`Total Records: ${filteredData.length}`, 14, 42);

      const tableColumn = ['Roll No', 'Student Name', 'Course', 'Status', 'Time'];
      const tableRows = filteredData.map(record => [
        record.rollNo || '',
        record.studentName || '',
        record.courseName || '',
        record.status || '',
        formatTime(record.time)
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
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
        
        setImportPreview(jsonData.slice(0, 5));
        setShowImportPreview(true);
      } catch (err) {
        console.error('Error reading file:', err);
        alert('Failed to read file. Please make sure it\'s a valid Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = async () => {
    if (!importFile) return;
    
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

          let successCount = 0;
          let errorCount = 0;

          for (const row of jsonData) {
            const studentId = row['Student ID'] || row['studentId'];
            const courseId = row['Course ID'] || row['courseId'];
            const date = row['Date'] || row['date'] || selectedDate;
            const status = (row['Status'] || row['status'] || 'PRESENT').toUpperCase();
            const time = row['Time'] || row['time'];

            if (studentId && courseId) {
              try {
                await attendanceApi.markSingleAttendance(
                  parseInt(courseId),
                  date,
                  parseInt(studentId),
                  status,
                  time
                );
                successCount++;
              } catch (err) {
                errorCount++;
                console.error('Error importing record:', err);
              }
            } else {
              errorCount++;
            }
          }

          alert(`Import completed!\nSuccess: ${successCount}\nFailed: ${errorCount}`);
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

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Student ID': 1,
        'Student Name': 'John Doe',
        'Course ID': 101,
        'Course Name': 'Computer Science',
        'Date': selectedDate,
        'Status': 'PRESENT',
        'Time': new Date().toLocaleTimeString()
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'attendance_import_template.xlsx');
    setShowImportMenu(false);
  };

  const formatAttendanceRecord = (record) => {
    // Try to get from students array first, then fallback to nested student object from API
    const student = students.find(s => s.id === record.studentId) || record.student;
    const course = courses.find(c => c.id === record.courseId) || record.course;
    
    return {
      id: record.id,
      studentId: record.studentId,
      studentName: student?.user?.name || student?.name || record.studentName || 'Unknown',
      rollNo: student?.rollNo || record.rollNo || '-',
      courseId: record.courseId,
      courseName: course?.name || record.courseName || 'Unknown',
      courseCode: course?.code || record.courseCode || '-',
      department: course?.department || record.department || '-',
      status: record.status || 'ABSENT',
      time: record.markedAt || record.createdAt || record.time,
      date: record.date || selectedDate
    };
  };

  const filteredData = attendanceData
    .map(record => formatAttendanceRecord(record))
    .filter(record => {
      const matchesSearch = 
        (record.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.rollNo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

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

  if (loading && !refreshing) {
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
            {selectedDate} • {filteredData.length} records found • {students.length} Students • {courses.length} Courses
          </p>
        </div>
        <div className="header-actions">
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
                <table className="preview-table">
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
                          <td key={i}>{String(value)}</td>
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
            <span className="stat-value">{students.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{stats.presentToday}</span>
            <span className="stat-percent">
              {students.length > 0 
                ? Math.round((stats.presentToday / students.length) * 100) 
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
            <span className="stat-value">{stats.absentToday}</span>
            <span className="stat-percent">
              {students.length > 0 
                ? Math.round((stats.absentToday / students.length) * 100) 
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
            <span className="stat-value">{Math.round(stats.averageAttendance)}%</span>
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
            <span className="summary-label">Total Records</span>
            <span className="summary-value">{summary.total}</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ROLL NO</th>
              <th>STUDENT NAME</th>
              <th>COURSE</th>
              <th>DEPARTMENT</th>
              <th>STATUS</th>
              <th>TIME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record, index) => (
                <tr key={record.id || index}>
                  <td className="roll-cell">{record.rollNo}</td>
                  <td className="name-cell">{record.studentName}</td>
                  <td>{record.courseName}</td>
                  <td>{record.department}</td>
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
                      disabled={selectedCourse === 'all' || markingAttendance}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      className="action-btn absent" 
                      onClick={() => handleMarkAttendance(record.studentId, 'ABSENT')}
                      title="Mark Absent"
                      disabled={selectedCourse === 'all' || markingAttendance}
                    >
                      <XCircle size={16} />
                    </button>
                    <button 
                      className="action-btn late" 
                      onClick={() => handleMarkAttendance(record.studentId, 'LATE')}
                      title="Mark Late"
                      disabled={selectedCourse === 'all' || markingAttendance}
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
              const total = course.present + course.absent + course.late;
              const percentage = total > 0 ? Math.round((course.present / total) * 100) : 0;
              const color = percentage >= 75 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
              
              return (
                <div key={index} className="course-card">
                  <div className="course-header">
                    <span className="course-name">{course.courseName}</span>
                    <span className="course-code">{course.courseCode}</span>
                  </div>
                  <div className="course-stats">
                    <div>
                      <span className="stat-label-sm">Present</span>
                      <span className="stat-value-sm green">{course.present}</span>
                    </div>
                    <div>
                      <span className="stat-label-sm">Total</span>
                      <span className="stat-value-sm blue">{total}</span>
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