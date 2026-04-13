import React, { useState, useEffect, useRef } from 'react';
import { 
  FiBookOpen, 
  FiUsers, 
  FiClock, 
  FiCalendar,
  FiChevronRight,
  FiChevronLeft,
  FiUser,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiSearch,
  FiFilter,
  FiGrid,
  FiLayers,
  FiDownload,
  FiUpload,
  FiFileText,
  FiVideo,
  FiLink,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiUserPlus,
  FiUserMinus,
  FiEye,
  FiMail,
  FiPhone,
  FiStar,
  FiPlay,
  FiBookmark,
  FiThumbsUp,
  FiMessageSquare,
  FiExternalLink,
  FiInfo,
  FiPaperclip,
  FiFile,
  FiImage,
  FiHash,
  FiChevronDown,
  FiFolder,
  FiList,
  FiGrid as FiGridIcon,
  FiMenu,
  FiMoreVertical,
  FiCopy,
  FiMove,
  FiBarChart
} from 'react-icons/fi';
import staffApi from '../../api/staffApi';
import courseApi from '../../api/courseApi';
import studentApi from '../../api/studentApi';
import { departmentApi, batchApi } from '../../api/adminApi';
import { DEPARTMENTS } from '../../constants/departments';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './StaffCourses.css';

const StaffCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showStudentAssignmentModal, setShowStudentAssignmentModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    semester: '',
    department: '',
    description: '',
    batch: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [batchFilter, setBatchFilter] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentBatchFilter, setStudentBatchFilter] = useState('');
  const [batchList, setBatchList] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [manageSearchTerm, setManageSearchTerm] = useState('');
  const [manageActiveTab, setManageActiveTab] = useState('enrolled');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    completedCourses: 0
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Searchable department dropdown states
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const departmentSearchRef = useRef(null);

  const filteredDepartments = departments.filter(dept =>
    dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentSearchRef.current && !departmentSearchRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchAvailableStudentsFromAPI();
    fetchDepartments();
    updateBatchList();
  }, []);

  useEffect(() => {
    updateBatchList();
  }, [courses, availableStudents]);

  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (batchFilter) {
      filtered = filtered.filter(course => course.batch === batchFilter);
    }
    
    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchTerm, batchFilter, courses]);

  const updateBatchList = async () => {
    try {
      setBatchLoading(true);
      
      let batches = await studentApi.getTeacherStudentBatches();
      
      if (batches && Array.isArray(batches) && batches.length > 0) {
        const sortedBatches = batches.sort((a, b) => {
          const yearA = parseInt(a.split('-')[0]);
          const yearB = parseInt(b.split('-')[0]);
          return yearB - yearA;
        });
        setBatchList(sortedBatches);
        return;
      }
      
      const response = await studentApi.getTeacherStudents();
      let studentsData = [];
      
      if (response?.success && response?.data) {
        studentsData = response.data;
      } else if (Array.isArray(response)) {
        studentsData = response;
      }
      
      const uniqueBatches = [...new Set(
        studentsData
          .map(student => student.batch)
          .filter(batch => batch && batch.trim() !== '')
      )];
      
      if (uniqueBatches.length > 0) {
        const sortedBatches = uniqueBatches.sort((a, b) => {
          const yearA = parseInt(a.split('-')[0]);
          const yearB = parseInt(b.split('-')[0]);
          return yearB - yearA;
        });
        setBatchList(sortedBatches);
      } else {
        setBatchList([]);
      }
    } catch (error) {
      console.error('Error updating batch list:', error);
      setBatchList([]);
    } finally {
      setBatchLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setDepartments(DEPARTMENTS);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const [coursesResponse, statsResponse] = await Promise.all([
        staffApi.getCourses().catch(err => {
          console.warn('Courses fetch failed:', err);
          return { data: [] };
        }),
        staffApi.getDashboardStats().catch(err => {
          console.warn('Stats fetch failed:', err);
          return { data: { stats: { totalCourses: 0, totalStudents: 0, averageAttendance: 0 } } };
        })
      ]);
      
      let coursesData = [];
      if (coursesResponse?.data && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data;
      } else if (Array.isArray(coursesResponse)) {
        coursesData = coursesResponse;
      }

      const enhancedCourses = coursesData.map(course => ({
        ...course,
        batch: course.batch || '',
        materials: course.materials || [],
        syllabus: course.syllabus || '',
        students: course.students || [],
        assignments: course.assignments || 0,
        progress: course.progress || 0,
        attendance: course.attendance || 0,
        studentsCount: course.studentsCount || 0,
        lessons: (course.lessons || []).map(lesson => ({
          ...lesson,
          subjects: lesson.subjects || []
        }))
      }));

      const courseBatches = [...new Set(enhancedCourses.map(c => c.batch).filter(Boolean))];
      if (courseBatches.length > 0) {
        setBatchList(prev => [...new Set([...prev, ...courseBatches])].sort());
      }

      let dashboardStats = {
        totalCourses: enhancedCourses.length,
        totalStudents: 0,
        averageProgress: 0,
        completedCourses: 0
      };

      if (statsResponse?.data?.stats) {
        dashboardStats = {
          totalCourses: statsResponse.data.stats.totalCourses || enhancedCourses.length,
          totalStudents: statsResponse.data.stats.totalStudents || 0,
          averageProgress: enhancedCourses.length > 0 
            ? Math.round(enhancedCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enhancedCourses.length)
            : 0,
          completedCourses: enhancedCourses.filter(c => c.progress === 100).length
        };
      }

      setStats(dashboardStats);
      setCourses(enhancedCourses);
      setFilteredCourses(enhancedCourses);
      await updateBatchList();
    } catch (error) {
      console.error('Error fetching courses:', error);
      setErrorMessage('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudentsFromAPI = async () => {
    try {
      const response = await studentApi.getTeacherStudents();
      let studentsData = [];
      if (response?.success && response?.data) {
        studentsData = response.data;
      } else if (Array.isArray(response)) {
        studentsData = response;
      }
      
      const enhancedStudents = studentsData.map(student => ({
        ...student,
        attendance: student.attendance || Math.floor(Math.random() * 30) + 70,
        progress: student.progress || Math.floor(Math.random() * 100),
        grade: ['A+', 'A', 'A-', 'B+', 'B', 'B-'][Math.floor(Math.random() * 6)]
      }));
      
      setAvailableStudents(enhancedStudents);
      await updateBatchList();
    } catch (error) {
      console.error('Error fetching students from API:', error);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await courseApi.getEnrolledStudents(courseId);
      let enrolledStudents = [];
      if (response?.data && Array.isArray(response.data)) {
        enrolledStudents = response.data;
      } else if (Array.isArray(response)) {
        enrolledStudents = response;
      }
      
      const enhancedEnrolled = enrolledStudents.map(student => ({
        ...student,
        attendance: student.attendance || Math.floor(Math.random() * 30) + 70,
        progress: student.progress || Math.floor(Math.random() * 100),
        grade: student.grade || ['A+', 'A', 'A-', 'B+', 'B', 'B-'][Math.floor(Math.random() * 6)]
      }));
      
      setCourseStudents(enhancedEnrolled);
      
      const enrolledIds = new Set(enhancedEnrolled.map(s => s.id));
      const available = availableStudents.filter(s => !enrolledIds.has(s.id));
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error fetching course students:', error);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code || !newCourse.semester || !newCourse.department) {
      setErrorMessage('Please fill in required fields (Name, Code, Semester, Department)');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const createdCourse = await staffApi.createCourse({
        name: newCourse.name,
        code: newCourse.code,
        semester: parseInt(newCourse.semester),
        department: newCourse.department,
        batch: newCourse.batch || null,
        description: newCourse.description || '',
        credits: 3
      });

      const courseToAdd = {
        ...createdCourse,
        progress: 0,
        attendance: 0,
        studentsCount: 0,
        assignments: 0,
        materials: [],
        syllabus: '',
        lessons: []
      };

      setCourses([courseToAdd, ...courses]);
      setFilteredCourses([courseToAdd, ...filteredCourses]);
      
      if (newCourse.batch && !batchList.includes(newCourse.batch)) {
        setBatchList([...batchList, newCourse.batch].sort());
      }
      
      setStats({
        ...stats,
        totalCourses: stats.totalCourses + 1
      });
      
      setSuccessMessage('Course created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setNewCourse({
        name: '',
        code: '',
        semester: '',
        department: '',
        description: '',
        batch: ''
      });
      setDepartmentSearchTerm('');
      setShowAddCourseModal(false);
      
    } catch (error) {
      console.error('Error adding course:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to add course';
      setErrorMessage(`Failed to add course: ${errorMsg}`);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDepartmentSelect = (dept) => {
    setNewCourse({...newCourse, department: dept});
    setDepartmentSearchTerm(dept);
    setShowDepartmentDropdown(false);
  };

  const openStudentAssignment = async (course) => {
    setSelectedCourse(course);
    setSelectedStudents([]);
    setStudentBatchFilter('');
    setManageSearchTerm('');
    setManageActiveTab('enrolled');
    
    try {
      await fetchCourseStudents(course.id);
      setShowStudentAssignmentModal(true);
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setErrorMessage('Failed to load students');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const assignStudents = async () => {
    if (selectedStudents.length === 0) {
      setErrorMessage('Please select at least one student');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    try {
      await courseApi.assignStudents(selectedCourse.id, selectedStudents);
      setSuccessMessage(`Successfully assigned ${selectedStudents.length} students to ${selectedCourse.name}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchCourseStudents(selectedCourse.id);
      setSelectedStudents([]);
      fetchCourses();
    } catch (err) {
      console.error('Error assigning students:', err);
      setErrorMessage('Failed to assign students');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const removeStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this course?`)) return;
    
    try {
      await courseApi.removeStudent(selectedCourse.id, studentId);
      setSuccessMessage(`Student removed from course`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchCourseStudents(selectedCourse.id);
      fetchCourses();
    } catch (err) {
      console.error('Error removing student:', err);
      setErrorMessage('Failed to remove student');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getFilteredManageStudents = () => {
    let students = manageActiveTab === 'enrolled' ? courseStudents : availableStudents;
    
    if (studentBatchFilter) {
      students = students.filter(s => s.batch === studentBatchFilter);
    }
    
    if (manageSearchTerm) {
      students = students.filter(s => 
        s.name?.toLowerCase().includes(manageSearchTerm.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(manageSearchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(manageSearchTerm.toLowerCase())
      );
    }
    
    return students;
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Navigate to course detail page when card is clicked
  const handleCourseCardClick = (course) => {
    navigate(`/staff/courses/${course.id}`);
  };

  if (loading) {
    return (
      <div className="tc-loading-container">
        <div className="tc-loading-spinner"></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="tc-teacher-courses">
      {successMessage && (
        <div className="success-message">
          <FiCheck size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          <FiAlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="tc-page-header">
        <div className="tc-header-left">
          <div className="tc-header-icon">
            <FiBookOpen />
          </div>
          <div>
            <h1 className="tc-page-title">My Courses</h1>
            <p className="tc-page-description">Manage and track your academic courses</p>
          </div>
        </div>
        <div className="tc-header-right">
          <button className="tc-add-course-btn" onClick={() => setShowAddCourseModal(true)}>
            <FiPlus size={18} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      <div className="tc-stats-grid">
        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.totalCourses}</span>
          <span className="tc-stat-label">ACTIVE COURSES</span>
        </div>
        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.totalStudents}</span>
          <span className="tc-stat-label">TOTAL STUDENTS</span>
        </div>
        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.averageProgress}%</span>
          <span className="tc-stat-label">AVG PROGRESS</span>
        </div>
        <div className="tc-stat-card">
          <span className="tc-stat-value">{stats.completedCourses}</span>
          <span className="tc-stat-label">COMPLETED</span>
        </div>
      </div>

      <div className="tc-search-filter-bar">
        <div className="tc-search-box">
          <FiSearch className="tc-search-icon" />
          <input
            type="text"
            placeholder="Search courses by name, code, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tc-search-input"
          />
        </div>
        <div className="tc-filter-group">
          <FiHash className="filter-icon" />
          <select 
            className="tc-filter-select"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            disabled={batchLoading}
          >
            <option value="">
              {batchLoading ? 'Loading batches...' : 'All Batches'}
            </option>
            {batchList.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
          <FiChevronRight className="filter-chevron" />
        </div>
        <div className="tc-filter-group">
          <FiLayers className="filter-icon" />
          <select className="tc-filter-select" defaultValue="all">
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
          <FiChevronRight className="filter-chevron" />
        </div>
      </div>

      {/* Courses Grid - Card Layout - Clickable Cards */}
      <div className="tc-courses-grid">
        {currentCourses.length > 0 ? (
          currentCourses.map((course) => (
            <div 
              key={course.id} 
              className="tc-course-card"
              onClick={() => handleCourseCardClick(course)}
            >
              <div className="tc-course-header">
                <div className="tc-course-title">
                  <h3>{course.name}</h3>
                  <span className="tc-course-code">{course.code}</span>
                </div>
                <div className="tc-semester-badge">
                  <FiLayers />
                  <span>Sem {course.semester}</span>
                </div>
              </div>
              
              {course.batch && (
                <div className="tc-course-batch">
                  <FiHash size={12} />
                  <span className="batch-badge">{course.batch}</span>
                </div>
              )}

              <div className="tc-course-metadata">
                <div className="tc-metadata-item">
                  <FiUsers />
                  <span>{course.studentsCount || 0} Students</span>
                </div>
                <div className="tc-metadata-item">
                  <FiBookOpen />
                  <span>{course.department}</span>
                </div>
              </div>

              <div className="tc-course-progress">
                <div className="tc-progress-header">
                  <span>Course Progress</span>
                  <span className="tc-progress-percentage">{course.progress || 0}%</span>
                </div>
                <div className="tc-progress-track">
                  <div className="tc-progress-fill" style={{ width: `${course.progress || 0}%`, backgroundColor: getProgressColor(course.progress || 0) }} />
                </div>
              </div>

              <div className="view-course-btn-card">
                <FiEye size={14} />
                View Details
              </div>
            </div>
          ))
        ) : (
          <div className="tc-empty-state">
            <FiBookOpen size={48} />
            <h3>No Courses Found</h3>
            <p>No courses match your search criteria or you haven't been assigned any courses yet.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCourses.length)} of {filteredCourses.length} entries
            </span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="pagination-select"
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <FiChevronLeft size={14} /> Previous
            </button>
            <span className="pagination-page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="modal-overlay" onClick={() => setShowAddCourseModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Course</h2>
              <button className="close-btn" onClick={() => setShowAddCourseModal(false)}><FiX size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Data Structures"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., CS301"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="form-group" ref={departmentSearchRef}>
                  <label>Department *</label>
                  <div className="searchable-select">
                    <div 
                      className="searchable-select-input"
                      onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                    >
                      <input
                        type="text"
                        placeholder="Search and select department..."
                        value={departmentSearchTerm}
                        onChange={(e) => {
                          setDepartmentSearchTerm(e.target.value);
                          setShowDepartmentDropdown(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        required
                      />
                      <FiChevronDown size={16} className="select-arrow" />
                    </div>
                    {showDepartmentDropdown && (
                      <div className="searchable-select-dropdown">
                        <div className="dropdown-search">
                          <FiSearch size={14} />
                          <input
                            type="text"
                            placeholder="Search departments..."
                            value={departmentSearchTerm}
                            onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="dropdown-options">
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map(dept => (
                              <div
                                key={dept}
                                className={`dropdown-option ${newCourse.department === dept ? 'selected' : ''}`}
                                onClick={() => handleDepartmentSelect(dept)}
                              >
                                {dept}
                                {newCourse.department === dept && <FiCheck size={14} />}
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">No departments found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <small className="form-hint-text">Searchable dropdown with all departments</small>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Batch (from student data)</label>
                  <select
                    value={newCourse.batch}
                    onChange={(e) => setNewCourse({...newCourse, batch: e.target.value})}
                    disabled={batchLoading}
                  >
                    <option value="">
                      {batchLoading ? 'Loading batches...' : 'Select Batch'}
                    </option>
                    {batchList.length > 0 ? (
                      batchList.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))
                    ) : !batchLoading && (
                      <option value="" disabled>No batches yet (add students with batch values first)</option>
                    )}
                  </select>
                  <small className="form-hint-text">
                    {batchList.length > 0 
                      ? `Showing ${batchList.length} batch(es) from student data` 
                      : 'Add students with batch values to see them here'}
                  </small>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  placeholder="Enter course description..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                />
              </div>
              <div className="form-hint">
                <FiAlertCircle size={14} />
                <span>Fields marked with * are required.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddCourseModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddCourse}><FiPlus size={16} />Create Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Assignment Modal */}
      {showStudentAssignmentModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowStudentAssignmentModal(false)}>
          <div className="manage-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Manage Students</h2>
                <p className="course-subtitle">{selectedCourse.name} • {selectedCourse.code}</p>
              </div>
              <button className="close-btn" onClick={() => setShowStudentAssignmentModal(false)}><FiX size={20} /></button>
            </div>
            <div className="stats-bar">
              <div className="stat-badge"><FiUsers size={14} /><span>Enrolled: {courseStudents.length}</span></div>
              <div className="stat-badge"><FiUserPlus size={14} /><span>Available: {availableStudents.length}</span></div>
              {selectedStudents.length > 0 && <div className="stat-badge selected"><FiCheck size={14} /><span>{selectedStudents.length} Selected</span></div>}
            </div>
            
            <div className="manage-tabs">
              <button className={`manage-tab-btn ${manageActiveTab === 'enrolled' ? 'active' : ''}`} onClick={() => { setManageActiveTab('enrolled'); setManageSearchTerm(''); setStudentBatchFilter(''); setSelectedStudents([]); }}>
                <FiUsers size={14} /><span>Enrolled Students</span><span className="tab-count">{courseStudents.length}</span>
              </button>
              <button className={`manage-tab-btn ${manageActiveTab === 'available' ? 'active' : ''}`} onClick={() => { setManageActiveTab('available'); setManageSearchTerm(''); setStudentBatchFilter(''); setSelectedStudents([]); }}>
                <FiUserPlus size={14} /><span>Available Students</span><span className="tab-count">{availableStudents.length}</span>
              </button>
            </div>
            
            <div className="manage-filters-bar">
              <div className="manage-search-bar">
                <FiSearch size={16} />
                <input type="text" placeholder={`Search ${manageActiveTab === 'enrolled' ? 'enrolled' : 'available'} students...`} value={manageSearchTerm} onChange={(e) => setManageSearchTerm(e.target.value)} />
              </div>
              
              <div className="manage-batch-filter">
                <FiHash size={14} />
                <select value={studentBatchFilter} onChange={(e) => setStudentBatchFilter(e.target.value)} disabled={batchLoading}>
                  <option value="">
                    {batchLoading ? 'Loading batches...' : 'All Batches'}
                  </option>
                  {batchList.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {manageActiveTab === 'available' && getFilteredManageStudents().length > 0 && (
              <div className="bulk-actions">
                <button className="bulk-btn" onClick={() => { const filtered = getFilteredManageStudents(); setSelectedStudents(filtered.map(s => s.id)); }}>
                  <FiCheck size={12} />Select All
                </button>
                <button className="bulk-btn" onClick={() => setSelectedStudents([])}>Clear</button>
              </div>
            )}
            
            <div className="manage-students-list">
              {getFilteredManageStudents().length === 0 ? (
                <div className="empty-students-state"><FiUsers size={48} /><h4>No students found</h4><p>{manageActiveTab === 'enrolled' ? 'No students enrolled in this course.' : 'No available students matching criteria.'}</p></div>
              ) : (
                getFilteredManageStudents().map(student => (
                  <div key={student.id} className={`manage-student-row ${selectedStudents.includes(student.id) ? 'selected' : ''}`}>
                    {manageActiveTab === 'available' && <div className="student-checkbox"><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudentSelection(student.id)} /></div>}
                    <div className="student-avatar">{student.name?.charAt(0).toUpperCase()}</div>
                    <div className="student-info">
                      <div className="student-name-row">
                        <span className="student-fullname">{student.name}</span>
                        <span className="student-rollno">{student.rollNo}</span>
                      </div>
                      <div className="student-details-row">
                        <span><FiMail size={12} />{student.email}</span>
                        {student.batch && <span><FiHash size={12} />{student.batch}</span>}
                      </div>
                      <div className="student-stats-row">
                        <span><FiTrendingUp size={12} />Attendance: {student.attendance || 0}%</span>
                        <span><FiBookOpen size={12} />Progress: {student.progress || 0}%</span>
                      </div>
                    </div>
                    <div className="student-actions">
                      {manageActiveTab === 'enrolled' ? 
                        <button className="remove-btn" onClick={() => removeStudent(student.id, student.name)}><FiUserMinus size={14} />Remove</button> : 
                        <button className={`assign-btn ${selectedStudents.includes(student.id) ? 'selected' : ''}`} onClick={() => toggleStudentSelection(student.id)}>
                          <FiUserPlus size={14} />{selectedStudents.includes(student.id) ? 'Selected' : 'Assign'}
                        </button>
                      }
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowStudentAssignmentModal(false)}>Close</button>
              {manageActiveTab === 'available' && selectedStudents.length > 0 && 
                <button className="btn-primary" onClick={assignStudents}><FiUserPlus size={16} />Assign Selected ({selectedStudents.length})</button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCourses;