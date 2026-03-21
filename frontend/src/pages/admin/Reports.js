import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Download, 
  Upload,
  Users, 
  UserCheck, 
  BookOpen,
  TrendingUp,
  DownloadCloud,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  UserPlus,
  Award,
  GraduationCap,
  School,
  PieChart,
  Loader,
  FileSpreadsheet,
  X,
  Calendar
} from 'lucide-react';
import { 
  dashboardApi, 
  userApi, 
  studentApi, 
  staffApi, 
  attendanceApi,
  courseApi 
} from '../../api/adminApi';
import * as XLSX from 'xlsx';
import './Reports.css';

// Professional Column Chart Component
const ProfessionalColumnChart = ({ data }) => {
  const colors = {
    'Present': '#10b981',
    'Absent': '#ef4444',
    'Late': '#f59e0b'
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <AlertCircle size={24} color="#94a3b8" />
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="professional-chart">
      <div className="chart-header">
        <h3 className="chart-title">Attendance Overview</h3>
        <div className="chart-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: colors[item.label] }}></span>
              <span className="legend-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-body">
        <div className="bars-container">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-label">{item.label}</div>
              <div className="bar-wrapper">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${(item.value / maxValue) * 180}px`,
                    backgroundColor: colors[item.label]
                  }}
                >
                  <span className="bar-value">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-footer">
        <div className="total-badge">
          <span className="total-label">Total Students</span>
          <span className="total-value">{total}</span>
        </div>
      </div>

      <div className="stats-summary">
        {data.map((item, index) => (
          <div key={index} className="stat-box" >
            <div className="stat-box-label">{item.label}</div>
            <div className="stat-box-value">{item.value}</div>
            <div className="stat-box-percentage">
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Pie Chart Component
const SimplePieChart = ({ data, title }) => {
  const colors = ['#4361ee', '#f72585', '#4cc9f0', '#ff9e00', '#9c89b8', '#2ec4b6'];
  
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="pie-card">
        <h3 className="pie-title">{title}</h3>
        <div className="pie-empty">
          <AlertCircle size={24} color="#94a3b8" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const dataWithPercentage = sortedData.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  return (
    <div className="pie-card">
      <h3 className="pie-title">{title}</h3>
      
      <div className="pie-container">
        <div 
          className="pie-chart"
          style={{
            background: `conic-gradient(
              ${dataWithPercentage.map((item, index) => {
                const startAngle = dataWithPercentage
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.value / total * 360), 0);
                return `${item.color || colors[index % colors.length]} ${startAngle}deg ${startAngle + (item.value / total * 360)}deg`;
              }).join(', ')}
            )`
          }}
        >
          <div className="pie-center">
            <span className="pie-total">{total}</span>
            <span className="pie-total-label">Total</span>
          </div>
        </div>
      </div>

      <div className="pie-legend">
        {dataWithPercentage.map((item, index) => (
          <div key={index} className="legend-row">
            <div className="legend-left">
              <span className="legend-dot" style={{ backgroundColor: item.color || colors[index % colors.length] }}></span>
              <span className="legend-label">{item.label}</span>
            </div>
            <div className="legend-right">
              <span className="legend-value">{item.value}</span>
              <span className="legend-percentage">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, change, color = '#4361ee', loading }) => {
  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ backgroundColor: color }}>
        {loading ? <Loader size={20} className="spin" /> : <Icon size={20} color="white" />}
      </div>
      <div className="metric-content">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{loading ? '...' : value}</div>
        {change && !loading && (
          <div className="metric-change">{change}</div>
        )}
      </div>
    </div>
  );
};

// Activity Timeline Component
const ActivityTimeline = ({ activities, loading }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="timeline-card">
        <h3 className="timeline-title">Recent Activities</h3>
        <div className="timeline-loading">
          <Loader size={24} className="spin" />
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-card">
      <h3 className="timeline-title">Recent Activities</h3>
      <div className="timeline-list">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id || index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-action">{activity.description}</div>
                <div className="timeline-meta">
                  <span>{activity.user?.name || 'System'}</span>
                  <span>•</span>
                  <span>{formatTime(activity.createdAt || new Date())}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="timeline-empty">
            <p>No recent activities</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totals: {
      students: 0,
      teachers: 0,
      courses: 0,
      activeCourses: 0
    },
    recentActivities: []
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {
      students: 0,
      teachers: 0,
      admins: 0
    }
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [useSampleData, setUseSampleData] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [dateRange, setDateRange] = useState('Today');

  const fileInputRef = useRef(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all real data in parallel
      const [
        studentsResponse,
        teachersResponse,
        coursesResponse,
        usersResponse
      ] = await Promise.allSettled([
        studentApi.getAll(),
        staffApi.getAll(),
        courseApi.getAll(),
        userApi.getAll()
      ]);

      // Process students data
      let studentsData = [];
      if (studentsResponse.status === 'fulfilled') {
        studentsData = studentsResponse.value.data || studentsResponse.value || [];
        setStudents(studentsData);
        generateDepartmentStats(studentsData);
      } else {
        console.warn('Students fetch failed:', studentsResponse.reason);
      }

      // Process teachers data
      let teachersData = [];
      if (teachersResponse.status === 'fulfilled') {
        teachersData = teachersResponse.value.data || teachersResponse.value || [];
        setTeachers(teachersData);
      } else {
        console.warn('Teachers fetch failed:', teachersResponse.reason);
      }

      // Process courses data
      let coursesData = [];
      if (coursesResponse.status === 'fulfilled') {
        coursesData = coursesResponse.value.data || coursesResponse.value || [];
        setCourses(coursesData);
      } else {
        console.warn('Courses fetch failed:', coursesResponse.reason);
      }

      // Process users data
      let usersData = [];
      if (usersResponse.status === 'fulfilled') {
        usersData = usersResponse.value.data || usersResponse.value || [];
        console.log('📊 Users data from API:', usersData);
      } else {
        console.warn('Users fetch failed:', usersResponse.reason);
      }

      // Calculate user statistics from real data
      // Check both 'status' and 'isActive' properties
      const activeUsers = usersData.filter(u => {
        if (u.isActive !== undefined) return u.isActive === true;
        if (u.status !== undefined) return u.status === 'active';
        return true; // Default to active if not specified
      }).length;
      
      const inactiveUsers = usersData.filter(u => {
        if (u.isActive !== undefined) return u.isActive === false;
        if (u.status !== undefined) return u.status === 'inactive';
        return false; // Default to not inactive
      }).length;
      
      // Calculate role-based statistics
      const studentsCount = studentsData.length;
      const teachersCount = teachersData.length;
      const adminsCount = usersData.filter(u => {
        const role = (u.role || '').toLowerCase();
        return role === 'admin' || role === 'administrator';
      }).length;
      
      console.log('📊 User Stats Calculated:', {
        activeUsers,
        inactiveUsers,
        studentsCount,
        teachersCount,
        adminsCount,
        totalUsers: usersData.length
      });
      
      const updatedUserStats = {
        total: usersData.length || studentsCount + teachersCount + adminsCount,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: {
          students: studentsCount,
          teachers: teachersCount,
          admins: adminsCount
        }
      };
      setUserStats(updatedUserStats);

      // Calculate course statistics
      const activeCoursesCount = coursesData.filter(c => {
        const status = (c.status || '').toUpperCase();
        return status === 'ACTIVE';
      }).length;
      
      const updatedStats = {
        totals: {
          students: studentsCount,
          teachers: teachersCount,
          courses: coursesData.length,
          activeCourses: activeCoursesCount
        },
        recentActivities: generateRecentActivities(studentsData, teachersData, coursesData)
      };
      setStats(updatedStats);

      // Set attendance stats (will be updated with real data when available)
      setAttendanceStats([
        { label: 'Present', value: 85 },
        { label: 'Absent', value: 10 },
        { label: 'Late', value: 5 }
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate recent activities from actual data
  const generateRecentActivities = (studentsData, teachersData, coursesData) => {
    const activities = [];
    
    // Add student activities
    if (studentsData.length > 0) {
      const recentStudents = [...studentsData].slice(-5);
      recentStudents.forEach(student => {
        activities.push({
          id: `student-${student.id}`,
          description: `New student registered: ${student.name}`,
          user: { name: student.name },
          createdAt: new Date().toISOString()
        });
      });
    }
    
    // Add teacher activities
    if (teachersData.length > 0) {
      const recentTeachers = [...teachersData].slice(-3);
      recentTeachers.forEach(teacher => {
        activities.push({
          id: `teacher-${teacher.id}`,
          description: `Teacher added: ${teacher.name}`,
          user: { name: teacher.name },
          createdAt: new Date().toISOString()
        });
      });
    }
    
    // Add course activities
    if (coursesData.length > 0) {
      const recentCourses = [...coursesData].slice(-3);
      recentCourses.forEach(course => {
        activities.push({
          id: `course-${course.id}`,
          description: `New course created: ${course.name}`,
          user: { name: 'System' },
          createdAt: new Date().toISOString()
        });
      });
    }
    
    // Sort by date (most recent first) and take first 10
    return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  };

  useEffect(() => {
    fetchReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
  };

  const generateDepartmentStats = (studentsData) => {
    try {
      const deptCount = {};
      
      studentsData.forEach(student => {
        const dept = student.course || student.department || 'Undeclared';
        deptCount[dept] = (deptCount[dept] || 0) + 1;
      });

      const deptStats = Object.entries(deptCount)
        .map(([name, count]) => ({
          department: name,
          studentCount: count
        }))
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5);

      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error generating department stats:', error);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      let exportData = [];
      let sheetName = '';
      
      switch(selectedTab) {
        case 'overview':
          exportData = [
            { 'Metric': 'Total Students', 'Value': students.length },
            { 'Metric': 'Total Teachers', 'Value': teachers.length },
            { 'Metric': 'Total Courses', 'Value': courses.length },
            { 'Metric': 'Active Courses', 'Value': courses.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length },
            { 'Metric': 'Total Users', 'Value': userStats.total },
            { 'Metric': 'Active Users', 'Value': userStats.active },
            { 'Metric': 'Inactive Users', 'Value': userStats.inactive }
          ];
          sheetName = 'Overview';
          break;
        case 'students':
          exportData = students.map(s => ({
            'ID': s.id,
            'Name': s.name,
            'Roll No': s.rollNo || s.studentId,
            'Email': s.email,
            'Course': s.course || s.department,
            'Semester': s.semester,
            'Phone': s.phone || '',
            'Address': s.address || ''
          }));
          sheetName = 'Students';
          break;
        case 'teachers':
          exportData = teachers.map(t => ({
            'ID': t.id,
            'Name': t.name,
            'Email': t.email,
            'Department': t.department,
            'Designation': t.designation,
            'Employee ID': t.employeeId || t.staffId,
            'Phone': t.phone || '',
            'Qualification': t.qualification || ''
          }));
          sheetName = 'Teachers';
          break;
        case 'courses':
          exportData = courses.map(c => ({
            'Code': c.code,
            'Name': c.name,
            'Department': c.department,
            'Credits': c.credits,
            'Semester': c.semester,
            'Teacher': c.teacher || 'Not Assigned',
            'Schedule': c.schedule || '',
            'Status': c.status || 'ACTIVE'
          }));
          sheetName = 'Courses';
          break;
        case 'attendance':
          exportData = attendanceStats.map(a => ({
            'Status': a.label,
            'Count': a.value,
            'Percentage': `${((a.value / attendanceStats.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%`
          }));
          sheetName = 'Attendance';
          break;
        default:
          return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      if (exportData.length > 0) {
        const colWidths = Object.keys(exportData[0]).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        ws['!cols'] = colWidths;
      }
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${sheetName}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
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

  // Confirm import - add real data
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
        const errors = [];

        // Import based on selected tab
        for (const row of jsonData) {
          try {
            if (selectedTab === 'students') {
              const studentData = {
                name: String(row['Name'] || row['name'] || '').trim(),
                email: String(row['Email'] || row['email'] || '').trim(),
                rollNo: String(row['Roll No'] || row['rollNo'] || row['studentId'] || '').trim(),
                course: String(row['Course'] || row['course'] || '').trim(),
                semester: row['Semester'] || row['semester'] ? parseInt(row['Semester'] || row['semester']) : 1,
                phone: String(row['Phone'] || row['phone'] || '').trim(),
                address: String(row['Address'] || row['address'] || '').trim()
              };

              if (studentData.name && studentData.email) {
                const existingStudent = students.find(s => s.email === studentData.email);
                if (!existingStudent) {
                  await studentApi.createStudent(studentData);
                  imported++;
                } else {
                  skipped++;
                }
              } else {
                skipped++;
                errors.push(`Row: Missing required fields (Name or Email)`);
              }
            } 
            else if (selectedTab === 'teachers') {
              const teacherData = {
                name: String(row['Name'] || row['name'] || '').trim(),
                email: String(row['Email'] || row['email'] || '').trim(),
                department: String(row['Department'] || row['department'] || '').trim(),
                designation: String(row['Designation'] || row['designation'] || 'Teacher').trim(),
                employeeId: String(row['Employee ID'] || row['employeeId'] || row['staffId'] || '').trim(),
                phone: String(row['Phone'] || row['phone'] || '').trim(),
                qualification: String(row['Qualification'] || row['qualification'] || '').trim()
              };

              if (teacherData.name && teacherData.email) {
                const existingTeacher = teachers.find(t => t.email === teacherData.email);
                if (!existingTeacher) {
                  await staffApi.createStaff(teacherData);
                  imported++;
                } else {
                  skipped++;
                }
              } else {
                skipped++;
                errors.push(`Row: Missing required fields (Name or Email)`);
              }
            } 
            else if (selectedTab === 'courses') {
              const courseData = {
                code: String(row['Code'] || row['code'] || '').trim(),
                name: String(row['Name'] || row['name'] || '').trim(),
                department: String(row['Department'] || row['department'] || '').trim(),
                credits: parseInt(row['Credits'] || row['credits'] || 3),
                semester: row['Semester'] || row['semester'] ? parseInt(row['Semester'] || row['semester']) : 1,
                schedule: String(row['Schedule'] || row['schedule'] || '').trim(),
                description: String(row['Description'] || row['description'] || '').trim(),
                status: 'ACTIVE'
              };

              if (courseData.code && courseData.name) {
                const existingCourse = courses.find(c => c.code === courseData.code);
                if (!existingCourse) {
                  await courseApi.createCourse(courseData);
                  imported++;
                } else {
                  skipped++;
                }
              } else {
                skipped++;
                errors.push(`Row: Missing required fields (Code or Name)`);
              }
            }
          } catch (err) {
            skipped++;
            errors.push(`Row: ${err.message || 'Import failed'}`);
          }
        }

        // Show import result
        if (errors.length > 0) {
          alert(`Import completed!\n\n✅ Successfully imported: ${imported}\n⏭️ Skipped (already exist): ${skipped}\n\n⚠️ Issues: ${errors.length} rows had issues. Check console for details.`);
          console.warn('Import errors:', errors);
        } else {
          alert(`✅ Successfully imported ${imported} ${selectedTab}!${skipped > 0 ? `\n⏭️ Skipped ${skipped} existing records.` : ''}`);
        }
        
        setShowImportPreview(false);
        setImportFile(null);
        setImportPreview([]);
        setImportResult({ imported, skipped });
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Refresh all data
        await fetchReportData();
        
      } catch (err) {
        console.error('Error importing data:', err);
        alert('Failed to import data. Please check the file format.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  // Cancel import
  const cancelImport = () => {
    setShowImportPreview(false);
    setImportFile(null);
    setImportPreview([]);
    setImportError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sample Excel template based on current tab
  const downloadSampleTemplate = () => {
    let sampleData = [];
    let sheetName = '';
    
    switch(selectedTab) {
      case 'students':
        sampleData = [{
          'Name': 'John Doe',
          'Email': 'john.doe@example.com',
          'Roll No': '2024001',
          'Course': 'Computer Science',
          'Semester': 3,
          'Phone': '+1234567890',
          'Address': '123 Main St, City'
        }];
        sheetName = 'Student_Template';
        break;
      case 'teachers':
        sampleData = [{
          'Name': 'Jane Smith',
          'Email': 'jane.smith@example.com',
          'Department': 'Computer Science',
          'Designation': 'Professor',
          'Employee ID': 'TCH001',
          'Phone': '+1234567890',
          'Qualification': 'Ph.D. in Computer Science'
        }];
        sheetName = 'Teacher_Template';
        break;
      case 'courses':
        sampleData = [{
          'Code': 'CS101',
          'Name': 'Introduction to Programming',
          'Department': 'Computer Science',
          'Credits': 4,
          'Semester': 1,
          'Schedule': '10:00',
          'Description': 'Learn fundamentals of programming'
        }];
        sheetName = 'Course_Template';
        break;
      default:
        sampleData = [{
          'Metric': 'Example',
          'Value': 'Sample Data'
        }];
        sheetName = 'Template';
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    if (sampleData.length > 0) {
      const colWidths = Object.keys(sampleData[0]).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      ws['!cols'] = colWidths;
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${selectedTab}_import_template.xlsx`);
    setShowImportMenu(false);
  };

  // Prepare chart data
  const getUserDistributionData = () => {
    return [
      { label: 'Students', value: userStats?.byRole?.students || students.length || 0, color: '#4361ee' },
      { label: 'Teachers', value: userStats?.byRole?.teachers || teachers.length || 0, color: '#f72585' },
      { label: 'Admins', value: userStats?.byRole?.admins || 0, color: '#4cc9f0' }
    ].filter(item => item.value > 0);
  };

  const getUserStatusData = () => {
    return [
      { label: 'Active Users', value: userStats?.active || 0, color: '#4caf50' },
      { label: 'Inactive Users', value: userStats?.inactive || 0, color: '#f44336' }
    ].filter(item => item.value > 0);
  };

  const getDepartmentData = () => {
    if (departmentStats.length === 0) return [];
    
    const colors = ['#4361ee', '#f72585', '#4cc9f0', '#ff9e00', '#9c89b8'];
    
    return departmentStats.map((dept, index) => ({
      label: dept.department,
      value: dept.studentCount,
      color: colors[index % colors.length]
    }));
  };

  const getAttendanceData = () => {
    return attendanceStats;
  };

  if (loading && !refreshing) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="reports-light">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <h1 className="page-title">
            Reports & Analytics
          </h1>
          {useSampleData && (
            <span className="demo-badge">
              <Eye size={12} />
              Demo
            </span>
          )}
        </div>
        
        <div className="header-right">
          {/* Date Filter Dropdown */}
          <div className="date-filter-dropdown">
            <button 
              className="date-filter-btn"
              onClick={() => setShowDateFilter(!showDateFilter)}
            >
              <Calendar size={16} />
              <span>Date: {dateRange}</span>
              {showDateFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showDateFilter && (
              <div className="date-filter-menu">
                <div 
                  className={`date-filter-option ${dateRange === 'Today' ? 'selected' : ''}`}
                  onClick={() => {
                    setDateRange('Today');
                    setShowDateFilter(false);
                  }}
                >
                  Today
                </div>
                <div 
                  className={`date-filter-option ${dateRange === 'This Week' ? 'selected' : ''}`}
                  onClick={() => {
                    setDateRange('This Week');
                    setShowDateFilter(false);
                  }}
                >
                  This Week
                </div>
                <div 
                  className={`date-filter-option ${dateRange === 'This Month' ? 'selected' : ''}`}
                  onClick={() => {
                    setDateRange('This Month');
                    setShowDateFilter(false);
                  }}
                >
                  This Month
                </div>
                <div 
                  className={`date-filter-option ${dateRange === 'This Year' ? 'selected' : ''}`}
                  onClick={() => {
                    setDateRange('This Year');
                    setShowDateFilter(false);
                  }}
                >
                  This Year
                </div>
              </div>
            )}
          </div>

          {/* Import Button */}
          <div className="import-dropdown">
            <button 
              className="import-btn"
              onClick={() => setShowImportMenu(!showImportMenu)}
            >
              <Upload size={16} />
              Import {selectedTab === 'overview' ? 'Data' : selectedTab}
            </button>
            {showImportMenu && (
              <div className="import-menu">
                <div className="import-menu-body">
                  <button className="import-option" onClick={handleImportClick}>
                    <FileSpreadsheet size={16} />
                    <span>Upload Excel File</span>
                  </button>
                  <button className="import-option" onClick={downloadSampleTemplate}>
                    <Download size={16} />
                    <span>Download Template</span>
                  </button>
                </div>
                {importError && (
                  <div className="import-error">
                    {importError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button 
            className="export-btn-header"
            onClick={exportToExcel}
          >
            <DownloadCloud size={16} />
            Export Excel
          </button>

          <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="modal-overlay" onClick={cancelImport}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Preview - {selectedTab}</h2>
              <button className="close-btn" onClick={cancelImport}>
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
                Note: Records with existing email (for students/teachers) or code (for courses) will be automatically skipped.
              </p>
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

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          OVERVIEW
        </button>
        <button
          className={`tab-btn ${selectedTab === 'students' ? 'active' : ''}`}
          onClick={() => setSelectedTab('students')}
        >
          STUDENTS ({students.length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setSelectedTab('teachers')}
        >
          TEACHERS ({teachers.length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'courses' ? 'active' : ''}`}
          onClick={() => setSelectedTab('courses')}
        >
          COURSES ({courses.length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setSelectedTab('attendance')}
        >
          ATTENDANCE
        </button>
      </div>

      {/* Main Content */}
      <div className="reports-content">
        {selectedTab === 'overview' && (
          <>
            {/* Metrics Cards */}
            <div className="metrics-grid">
              <MetricCard 
                icon={Users} 
                label="TOTAL STUDENTS" 
                value={students.length || 0}
                change={`${teachers.length || 0} teachers`}
                color="#4361ee"
                loading={loading}
              />
              <MetricCard 
                icon={GraduationCap} 
                label="TOTAL TEACHERS" 
                value={teachers.length || 0}
                change={`${courses.length || 0} courses`}
                color="#4caf50"
                loading={loading}
              />
              <MetricCard 
                icon={BookOpen} 
                label="TOTAL COURSES" 
                value={courses.length || 0}
                change={`${courses.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length || 0} active`}
                color="#ff9800"
                loading={loading}
              />
              <MetricCard 
                icon={UserCheck} 
                label="ACTIVE USERS" 
                value={userStats.active || 0}
                change={`${userStats.inactive || 0} inactive`}
                color="#f72585"
                loading={loading}
              />
            </div>

            {/* Pie Charts Grid */}
            <div className="charts-grid">
              <SimplePieChart 
                data={getUserDistributionData()} 
                title="Users by Role"
              />
              <SimplePieChart 
                data={getUserStatusData()} 
                title="User Status"
              />
              <SimplePieChart 
                data={getDepartmentData()} 
                title="Students by Department"
              />
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
              <ActivityTimeline 
                activities={stats.recentActivities || []} 
                loading={loading}
              />
              
              <div className="summary-card">
                <h3 className="summary-title">Quick Summary</h3>
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="summary-label">Student-Teacher Ratio</span>
                    <span className="summary-value">
                      {teachers.length > 0 
                        ? `${(students.length / teachers.length).toFixed(1)}:1` 
                        : students.length > 0 ? `${students.length}:0` : 'N/A'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Course Completion</span>
                    <span className="summary-value">
                      {courses.length > 0 
                        ? `${((courses.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length || 0) / courses.length * 100).toFixed(1)}%` 
                        : '0%'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Active Courses</span>
                    <span className="summary-value">{courses.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Users</span>
                    <span className="summary-value">{userStats.total || students.length + teachers.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'students' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map(student => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.rollNo || student.studentId || '—'}</td>
                      <td>{student.email}</td>
                      <td>{student.course || student.department || '—'}</td>
                      <td>{student.semester || '—'}</td>
                      <td>{student.phone || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'teachers' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Employee ID</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td>{teacher.id}</td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.department}</td>
                      <td>{teacher.designation || 'Teacher'}</td>
                      <td>{teacher.employeeId || teacher.staffId || '—'}</td>
                      <td>{teacher.phone || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'courses' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th>Schedule</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map(course => (
                    <tr key={course.id}>
                      <td><span className="course-code">{course.code}</span></td>
                      <td>{course.name}</td>
                      <td>{course.department}</td>
                      <td>{course.credits}</td>
                      <td>{course.semester || '—'}</td>
                      <td>{course.schedule || '—'}</td>
                      <td>
                        <span className={`status-badge ${(course.status || '').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                          {course.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'attendance' && (
          <div className="attendance-section">
            <ProfessionalColumnChart data={getAttendanceData()} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;