import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  UploadCloud,
  AlertCircle,
  Building2,
  Library,
  Lock,
  Key,
  ChevronLeft,
  ChevronRight,
  Archive,
  Undo2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import studentApi from '../../api/studentApi';
import staffApi from '../../api/staffApi';
import courseApi from '../../api/courseApi';
import { departmentApi } from '../../api/adminApi';
import * as XLSX from 'xlsx';
import './Students.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
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
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const departmentSearchRef = useRef(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    enrollmentNo: '',
    phone: '',
    address: '',
    admissionYear: '',
    batch: '',
    age: '',
    gender: '',
    department: '',
    course: '',
    semester: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    trashedStudents: 0
  });

  const departmentOptions = [
    "Computer Science",
    "Computer Science and Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Electronics and Communication Engineering",
    "Electronics and Instrumentation Engineering",
    "Instrumentation and Control Engineering",
    "Computer Science and Design",
    "Civil Engineering",
    "Electrical and Electronics Engineering",
    "Biomedical Engineering",
    "Aerospace Engineering",
    "Automobile Engineering",
    "Chemical Engineering",
    "Bachelor of Commerce",
    "Bachelor of Arts in English",
    "Bachelor of Science in Mathematics",
    "Bachelor of Arts in Tamil",
    "Bachelor of Arts in History",
    "Bachelor of Business Administration",
    "Bachelor of Arts in Economics",
    "Bachelor of Arts in Political Science",
    "Physics",
    "Chemistry",
    "Biology"
  ].sort();

  const filteredDepartments = departmentOptions.filter(dept =>
    dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  const branchOptions = {
    "Computer Science": ["B.Sc Computer Science", "M.Sc Computer Science", "BCA", "MCA"],
    "Computer Science and Engineering": ["B.E Computer Science and Engineering", "M.E Computer Science and Engineering"],
    "Information Technology": ["B.E Information Technology", "M.E Information Technology"],
    "Mechanical Engineering": ["B.E Mechanical Engineering", "M.E Mechanical Engineering"],
    "Electronics and Communication Engineering": ["B.E Electronics and Communication Engineering", "M.E Electronics and Communication Engineering"],
    "Electronics and Instrumentation Engineering": ["B.E Electronics and Instrumentation Engineering"],
    "Instrumentation and Control Engineering": ["B.E Instrumentation and Control Engineering"],
    "Computer Science and Design": ["B.E Computer Science and Design"],
    "Civil Engineering": ["B.E Civil Engineering", "M.E Civil Engineering"],
    "Electrical and Electronics Engineering": ["B.E Electrical and Electronics Engineering", "M.E Electrical and Electronics Engineering"],
    "Biomedical Engineering": ["B.E Biomedical Engineering"],
    "Aerospace Engineering": ["B.E Aerospace Engineering"],
    "Automobile Engineering": ["B.E Automobile Engineering"],
    "Chemical Engineering": ["B.E Chemical Engineering"],
    "Bachelor of Commerce": ["B.Com", "M.Com"],
    "Bachelor of Arts in English": ["B.A English", "M.A English"],
    "Bachelor of Science in Mathematics": ["B.Sc Mathematics", "M.Sc Mathematics"],
    "Bachelor of Arts in Tamil": ["B.A Tamil", "M.A Tamil"],
    "Bachelor of Arts in History": ["B.A History", "M.A History"],
    "Bachelor of Business Administration": ["BBA", "MBA"],
    "Bachelor of Arts in Economics": ["B.A Economics", "M.A Economics"],
    "Bachelor of Arts in Political Science": ["B.A Political Science", "M.A Political Science"],
    "Physics": ["B.Sc Physics", "M.Sc Physics"],
    "Chemistry": ["B.Sc Chemistry", "M.Sc Chemistry"],
    "Biology": ["B.Sc Biology", "M.Sc Biology"]
  };

  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  // Use useMemo for filtered students
  const filteredStudents = useMemo(() => {
    let filtered = activeTab === 'active' ? students : deletedStudents;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.batch?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(student => student.course === courseFilter);
    }

    return filtered;
  }, [searchTerm, departmentFilter, courseFilter, students, deletedStudents, activeTab]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchTerm, departmentFilter, courseFilter, activeTab]);

  // Handle individual row selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      const newSelected = prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      return newSelected;
    });
  };

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

  // Update selectAll state when selectedRows changes
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every(item => selectedRows.includes(item.id));
      if (allSelected !== selectAll) {
        setSelectAll(allSelected);
      }
    }
  }, [selectedRows, currentItems]);

  // Handle bulk delete/move to trash
  const handleBulkAction = async (action) => {
    if (selectedRows.length === 0) {
      setError('Please select at least one student');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to move ${selectedRows.length} student(s) to trash?`
      : `Are you sure you want to permanently delete ${selectedRows.length} student(s)? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      let successCount = 0;
      
      for (const id of selectedRows) {
        try {
          if (action === 'delete') {
            await studentApi.softDeleteStudent(id);
          } else if (action === 'permanent') {
            await studentApi.permanentDeleteStudent(id);
          }
          successCount++;
        } catch (err) {
          console.error(`Failed to ${action} student ${id}:`, err);
        }
      }
      
      setSuccessMessage(`Successfully ${action === 'delete' ? 'moved' : 'permanently deleted'} ${successCount} student(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedRows([]);
      setSelectAll(false);
      fetchData();
    } catch (err) {
      console.error(`Error during bulk ${action}:`, err);
      setError(`Failed to ${action} students`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentSearchRef.current && !departmentSearchRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // Separate active and deleted based on deletedAt field
      const active = studentsData.filter(student => !student.deletedAt);
      const deleted = studentsData.filter(student => student.deletedAt);

      setStudents(active);
      setDeletedStudents(deleted);
      setTeachers(teachersData);
      setCourses(coursesData);

      const uniqueCourses = [...new Set(studentsData.map(s => s.course).filter(Boolean))];
      const activeStudents = active.filter(s => s.user?.isActive !== false).length;
      const inactiveStudents = active.filter(s => s.user?.isActive === false).length;
      
      setStats({
        totalStudents: active.length,
        totalCourses: uniqueCourses.length,
        activeStudents: activeStudents,
        inactiveStudents: inactiveStudents,
        trashedStudents: deleted.length
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
      password: '',
      rollNo: '',
      enrollmentNo: '',
      phone: '',
      address: '',
      admissionYear: '',
      batch: '',
      age: '',
      gender: '',
      department: '',
      course: '',
      semester: ''
    });
    setDepartmentSearchTerm('');
    setSelectedStudent(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: '',
      rollNo: student.rollNo || '',
      enrollmentNo: student.enrollmentNo || '',
      phone: student.phone || '',
      address: student.address || '',
      admissionYear: student.admissionYear || '',
      batch: student.batch || '',
      age: student.age || '',
      gender: student.gender || '',
      department: student.department || '',
      course: student.course || '',
      semester: student.semester || ''
    });
    setDepartmentSearchTerm(student.department || '');
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setModalType('view');
    setShowModal(true);
  };

  // Soft Delete - Move to trash
  const handleSoftDelete = async (student) => {
    setSelectedStudent(student);
    setModalType('softDelete');
    setShowModal(true);
  };

  const confirmSoftDelete = async () => {
    try {
      setLoading(true);
      await studentApi.softDeleteStudent(selectedStudent.id);
      
      const updatedActive = students.filter(s => s.id !== selectedStudent.id);
      const deletedStudentWithDate = {
        ...selectedStudent,
        deletedAt: new Date().toISOString()
      };
      
      setStudents(updatedActive);
      setDeletedStudents([deletedStudentWithDate, ...deletedStudents]);
      
      setStats(prev => ({
        ...prev,
        totalStudents: prev.totalStudents - 1,
        trashedStudents: prev.trashedStudents + 1,
        activeStudents: prev.activeStudents - (selectedStudent.user?.isActive !== false ? 1 : 0)
      }));
      
      setSuccessMessage(`${selectedStudent.name} moved to trash successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('Error soft deleting student:', err);
      setError('Failed to move to trash: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Restore from trash
  const handleRestore = async (student) => {
    if (!window.confirm(`Are you sure you want to restore ${student.name}?`)) return;
    
    try {
      setLoading(true);
      await studentApi.restoreStudent(student.id);
      
      const updatedDeleted = deletedStudents.filter(s => s.id !== student.id);
      const restoredStudent = {
        ...student,
        deletedAt: null,
        restoredAt: new Date().toISOString()
      };
      
      setDeletedStudents(updatedDeleted);
      setStudents([restoredStudent, ...students]);
      
      setStats(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + 1,
        trashedStudents: prev.trashedStudents - 1,
        activeStudents: prev.activeStudents + 1
      }));
      
      setSuccessMessage(`${student.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error restoring student:', err);
      setError('Failed to restore: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (student) => {
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete ${student.name}? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      await studentApi.permanentDeleteStudent(student.id);
      
      const updatedDeleted = deletedStudents.filter(s => s.id !== student.id);
      setDeletedStudents(updatedDeleted);
      
      setStats(prev => ({
        ...prev,
        trashedStudents: prev.trashedStudents - 1
      }));
      
      setSuccessMessage(`${student.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error permanently deleting student:', err);
      setError('Failed to permanently delete: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await studentApi.deleteStudent(selectedStudent.id);
      setSuccessMessage(`${selectedStudent.name} deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'department') {
      setFormData(prev => ({
        ...prev,
        department: value,
        course: ''
      }));
      setDepartmentSearchTerm(value);
      setShowDepartmentDropdown(false);
    }
  };

  const handleDepartmentSelect = (dept) => {
    setFormData(prev => ({
      ...prev,
      department: dept,
      course: ''
    }));
    setDepartmentSearchTerm(dept);
    setShowDepartmentDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.rollNo) {
        setError('Please fill in all required fields');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      if (modalType === 'add' && !formData.password) {
        setError('Please enter a password for the student');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      if (modalType === 'add' && formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setTimeout(() => setError(null), 3000);
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
        batch: formData.batch || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        department: formData.department || null,
        course: formData.course || null,
        semester: formData.semester ? parseInt(formData.semester) : null
      };
      
      if (modalType === 'add') {
        studentData.password = formData.password;
      }

      if (modalType === 'add') {
        await studentApi.createStudent(studentData);
        setSuccessMessage('Student added successfully!');
      } else if (modalType === 'edit') {
        if (formData.password) {
          studentData.password = formData.password;
        }
        await studentApi.updateStudent(selectedStudent.id, studentData);
        setSuccessMessage('Student updated successfully!');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving student:', err);
      setError(err.message || 'Failed to save student');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setCourseFilter('all');
  };

  const getUniqueDepartments = () => {
    const allStudents = [...students, ...deletedStudents];
    const depts = allStudents.map(s => s.department).filter(Boolean);
    return [...new Set(depts)].sort();
  };

  const getUniqueCourses = () => {
    const allStudents = [...students, ...deletedStudents];
    const coursesList = allStudents.map(s => s.course).filter(Boolean);
    return [...new Set(coursesList)].sort();
  };

  const exportToExcel = () => {
    try {
      const exportData = currentItems.map(student => ({
        'Name': student.name || '',
        'Email': student.email || '',
        'Roll No': student.rollNo || '',
        'Enrollment No': student.enrollmentNo || '',
        'Department': student.department || '',
        'Course/Branch': student.course || '',
        'Semester': student.semester || '',
        'Batch': student.batch || '',
        'Phone': student.phone || '',
        'Address': student.address || '',
        'Admission Year': student.admissionYear || '',
        'Age': student.age || '',
        'Gender': student.gender || '',
        'Status': activeTab === 'deleted' ? 'Deleted' : (student.user?.isActive !== false ? 'Active' : 'Inactive')
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      ws['!cols'] = [
        { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 },
        { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 12 },
        { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 8 }, { wch: 10 }, { wch: 10 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export to Excel');
      setTimeout(() => setError(null), 3000);
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

        const existingResponse = await studentApi.getStudents();
        let existingStudents = [];
        if (existingResponse?.success && existingResponse?.data) {
          existingStudents = existingResponse.data;
        } else if (Array.isArray(existingResponse)) {
          existingStudents = existingResponse;
        }

        const existingRollNoMap = new Map();
        const existingEmailMap = new Map();
        
        existingStudents.forEach(student => {
          if (student.rollNo) {
            existingRollNoMap.set(student.rollNo.toString().toLowerCase(), student);
          }
          if (student.email) {
            existingEmailMap.set(student.email.toLowerCase(), student);
          }
        });

        let newCount = 0;
        let duplicateByRollNo = 0;
        let duplicateByEmail = 0;
        let errorCount = 0;
        const newStudents = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];

          try {
            const name = String(row['Name'] || row['name'] || '').trim();
            const email = String(row['Email'] || row['email'] || '').trim().toLowerCase();
            const rollNo = String(row['Roll No'] || row['rollNo'] || row['rollno'] || '').trim();
            const enrollmentNo = String(row['Enrollment No'] || row['enrollmentNo'] || '').trim();
            const department = String(row['Department'] || row['department'] || '').trim();
            const course = String(row['Course/Branch'] || row['course'] || row['branch'] || '').trim();
            const semester = row['Semester'] || row['semester'] ? parseInt(row['Semester'] || row['semester']) : null;
            const batch = String(row['Batch'] || row['batch'] || '').trim();
            const phone = String(row['Phone'] || row['phone'] || '').trim();
            const address = String(row['Address'] || row['address'] || '').trim();
            const admissionYear = String(row['Admission Year'] || row['admissionYear'] || '').trim();
            const age = row['Age'] || row['age'] ? parseInt(String(row['Age'] || row['age'])) : null;
            const gender = String(row['Gender'] || row['gender'] || '').trim();

            if (!name || !email || !rollNo) {
              errorCount++;
              continue;
            }

            if (existingRollNoMap.has(rollNo.toLowerCase())) {
              duplicateByRollNo++;
              continue;
            }

            if (existingEmailMap.has(email)) {
              duplicateByEmail++;
              continue;
            }

            const defaultPassword = `student@${rollNo}`;
            
            newStudents.push({
              name, email, rollNo, enrollmentNo: enrollmentNo || null,
              department: department || null, course: course || null, semester,
              batch: batch || null, phone: phone || null, address: address || null,
              admissionYear: admissionYear || null, age, gender: gender || null,
              password: defaultPassword
            });
            newCount++;
            
          } catch (err) {
            errorCount++;
          }
        }

        if (newCount === 0) {
          setError(`No new students to import.\nDuplicate Roll No: ${duplicateByRollNo}\nDuplicate Email: ${duplicateByEmail}\nErrors: ${errorCount}`);
          setTimeout(() => setError(null), 5000);
          setShowImportPreview(false);
          setImportFile(null);
          setLoading(false);
          return;
        }

        if (!window.confirm(`Import ${newCount} new students?`)) {
          setLoading(false);
          return;
        }

        let importedCount = 0;
        for (const student of newStudents) {
          try {
            await studentApi.createStudent(student);
            importedCount++;
          } catch (err) {
            console.error(`Failed to import ${student.name}:`, err);
          }
        }

        setSuccessMessage(`Successfully imported ${importedCount} students!`);
        setTimeout(() => setSuccessMessage(''), 5000);
        setShowImportPreview(false);
        setImportFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchData();
        
      } catch (err) {
        console.error('Import error:', err);
        setError('Failed to process import');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  const cancelImport = () => {
    setShowImportPreview(false);
    setImportFile(null);
    setImportPreview([]);
    setImportError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Name': 'John Doe', 'Email': 'john.doe@example.com', 'Roll No': '2024001',
        'Enrollment No': 'ENR001', 'Department': 'Computer Science',
        'Course/Branch': 'B.Sc Computer Science', 'Semester': 3, 'Batch': '2023-2026',
        'Phone': '9876543210', 'Address': '123 Main Street, City',
        'Admission Year': '2023', 'Age': 20, 'Gender': 'Male'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 8 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Student Template');
    XLSX.writeFile(wb, 'student_import_template.xlsx');
    setShowImportMenu(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  const uniqueDepartments = getUniqueDepartments();
  const uniqueCourses = getUniqueCourses();

  return (
    <div className="admin-students">
      <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileImport} style={{ display: 'none' }} />

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-description">Manage student records</p>
        </div>
        <div className="header-actions">
          <div className="import-dropdown">
            <button className="btn-import" onClick={() => setShowImportMenu(!showImportMenu)}>
              <Upload size={18} /><span>Import Excel</span>
            </button>
            {showImportMenu && (
              <div className="import-menu">
                <div className="import-menu-body">
                  <button className="import-option" onClick={handleImportClick}><FileSpreadsheet size={16} /><span>Upload Excel</span></button>
                  <button className="import-option" onClick={downloadSampleTemplate}><Download size={16} /><span>Download Template</span></button>
                </div>
                {importError && <div className="import-error">{importError}</div>}
              </div>
            )}
          </div>
          <button className="btn-export" onClick={exportToExcel}><DownloadCloud size={18} /><span>Export Excel</span></button>
          
          {/* Trash Icon */}
          <button 
            className={`btn-icon ${activeTab === 'deleted' ? 'active-trash' : ''}`} 
            onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')}
            title={activeTab === 'active' ? "View Trash" : "View Active Students"}
          >
            <Archive size={18} />
            {stats.trashedStudents > 0 && <span className="badge-icon">{stats.trashedStudents}</span>}
          </button>
          
          <button className="btn-icon" onClick={handleRefresh} title="Refresh"><RefreshCw size={18} /></button>
          <button className="btn-add-student" onClick={handleAdd}><Plus size={20} /><span>Add Student</span></button>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="modal-overlay" onClick={cancelImport}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Import Preview</h2><button className="close-btn" onClick={cancelImport}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="import-preview-info" style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <AlertCircle size={16} style={{ marginRight: '8px', color: '#f59e0b', verticalAlign: 'middle' }} />
                <span><strong>Duplicate Detection:</strong> Students with existing <strong>Roll No</strong> or <strong>Email</strong> will be skipped.</span>
              </div>
              <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <Key size={16} style={{ marginRight: '8px', color: '#059669', verticalAlign: 'middle' }} />
                <span><strong>Default Password:</strong> <code>student@[rollNo]</code> (e.g., student@2024001)</span>
              </div>
              <p>Found <strong>{importPreview.length}</strong> records to import. Preview of first 5 rows:</p>
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
        <div className="stat-card blue"><div className="stat-icon blue"><Users size={24} /></div><div className="stat-content"><span className="stat-label">Total Students</span><span className="stat-value">{stats.totalStudents}</span></div></div>
        <div className="stat-card green"><div className="stat-icon green"><UserCheck size={24} /></div><div className="stat-content"><span className="stat-label">Active Students</span><span className="stat-value">{stats.activeStudents}</span></div></div>
        <div className="stat-card purple"><div className="stat-icon purple"><Archive size={24} /></div><div className="stat-content"><span className="stat-label">Trash</span><span className="stat-value">{stats.trashedStudents}</span></div></div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          <Users size={16} />
          <span>Active Students</span>
          <span className="tab-count">{students.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`} onClick={() => setActiveTab('deleted')}>
          <Trash2 size={16} />
          <span>Trash</span>
          <span className="tab-count">{deletedStudents.length}</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-filter-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" className="search-input" placeholder={activeTab === 'active' ? "Search by name, roll no, email, batch..." : "Search deleted students..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}><X size={16} /></button>}
          </div>

          <div className="filter-dropdown">
            <Building2 className="filter-icon" size={18} />
            <select className="filter-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <ChevronDown className="select-chevron" size={16} />
          </div>

          <div className="filter-dropdown">
            <Library className="filter-icon" size={18} />
            <select className="filter-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="all">All Courses/Branches</option>
              {uniqueCourses.map(course => <option key={course} value={course}>{course}</option>)}
            </select>
            <ChevronDown className="select-chevron" size={16} />
          </div>
        </div>

        {(searchTerm || departmentFilter !== 'all' || courseFilter !== 'all') && (
          <div className="active-filters">
            {searchTerm && <span className="active-filter-tag">Search: "{searchTerm}"<button onClick={() => setSearchTerm('')}><X size={14} /></button></span>}
            {departmentFilter !== 'all' && <span className="active-filter-tag">Department: {departmentFilter}<button onClick={() => setDepartmentFilter('all')}><X size={14} /></button></span>}
            {courseFilter !== 'all' && <span className="active-filter-tag">Course: {courseFilter}<button onClick={() => setCourseFilter('all')}><X size={14} /></button></span>}
            <button className="clear-all-btn" onClick={clearFilters}>Clear all</button>
          </div>
        )}
      </div>

      {/* Table Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="table-actions-bar">
          <span className="selected-count">{selectedRows.length} student(s) selected</span>
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

      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th>Student</th>
              <th>Roll No</th>
              <th>Department</th>
              <th>Course/Branch</th>
              <th>Semester</th>
              <th>Batch</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((student) => {
                const isActive = student.user?.isActive !== false;
                const isDeleted = activeTab === 'deleted';
                const deletedDate = student.deletedAt ? new Date(student.deletedAt).toLocaleDateString() : null;
                
                return (
                  <tr key={student.id} className={isDeleted ? 'deleted-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(student.id)}
                        onChange={() => handleRowSelect(student.id)}
                      />
                    </td>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">{student.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="student-name">{student.name}</div>
                          <div className="student-email">{student.email}</div>
                          {isDeleted && deletedDate && (
                            <div className="deleted-date">Deleted: {deletedDate}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="roll-badge">{student.rollNo}</span></td>
                    <td><span className="department-badge">{student.department || '—'}</span></td>
                    <td><span className="course-badge">{student.course || '—'}</span></td>
                    <td><span className="semester-badge">{student.semester || '—'}</span></td>
                    <td><span className="batch-badge">{student.batch || '—'}</span></td>
                    <td>{student.phone ? <span className="contact-info"><Phone size={14} />{student.phone}</span> : '—'}</td>
                    <td>
                      {activeTab === 'active' ? (
                        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      ) : (
                        <span className="status-badge deleted">DELETED</span>
                      )}
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="action-btn view" onClick={() => handleView(student)} title="View"><Eye size={18} /></button>
                        {activeTab === 'active' ? (
                          <>
                            <button className="action-btn edit" onClick={() => handleEdit(student)} title="Edit"><Edit size={18} /></button>
                            <button className="action-btn delete" onClick={() => handleSoftDelete(student)} title="Move to Trash"><Archive size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestore(student)} title="Restore"><RotateCcw size={18} /></button>
                            <button className="action-btn permanent-delete" onClick={() => handlePermanentDelete(student)} title="Permanently Delete"><Trash2 size={18} /></button>
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
                    students.length === 0 ? (
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
                        <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>
                      </>
                    )
                  ) : (
                    <>
                      <Trash2 size={48} />
                      <h3>Trash is Empty</h3>
                      <p>No deleted students found. Deleted students will appear here for restoration.</p>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
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
              Total: {filteredStudents.length}
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

      {/* Add/Edit Student Modal */}
      {(modalType === 'add' || modalType === 'edit') && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add New Student' : 'Edit Student'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter student name" required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" required />
                    </div>
                  </div>
                  
                  {modalType === 'add' ? (
                    <div className="form-group">
                      <label>Password *</label>
                      <div className="password-wrapper">
                        <Lock size={16} className="password-icon" />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password (min. 6 characters)" required autoComplete="new-password" />
                      </div>
                      <small className="form-hint">Password must be at least 6 characters long</small>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>New Password (Optional)</label>
                      <div className="password-wrapper">
                        <Key size={16} className="password-icon" />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" autoComplete="new-password" />
                      </div>
                      <small className="form-hint">Only enter if you want to change the password</small>
                    </div>
                  )}
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter age" />
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
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Academic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Roll Number *</label>
                      <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="Enter roll number" required />
                    </div>
                    <div className="form-group">
                      <label>Enrollment Number</label>
                      <input type="text" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange} placeholder="Enter enrollment number" />
                    </div>
                  </div>
                  
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
                                    {formData.department === dept && <Check size={14} />}
                                  </div>
                                ))
                              ) : (
                                <div className="dropdown-no-results">No departments found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <small className="form-hint">Searchable dropdown with all departments</small>
                    </div>
                    
                    <div className="form-group">
                      <label>Course/Branch *</label>
                      <select 
                        name="course" 
                        value={formData.course} 
                        onChange={handleChange} 
                        required 
                        disabled={!formData.department}
                      >
                        <option value="">Select Course/Branch</option>
                        {formData.department && branchOptions[formData.department]?.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                      {!formData.department && (
                        <small className="form-hint" style={{ color: '#f59e0b' }}>
                          Please select a department first
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Semester</label>
                      <select name="semester" value={formData.semester} onChange={handleChange}>
                        <option value="">Select Semester</option>
                        {semesterOptions.map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Admission Year</label>
                      <input type="text" name="admissionYear" value={formData.admissionYear} onChange={handleChange} placeholder="e.g., 2023" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Batch (e.g., 2019-2022 or 2019-2023)</label>
                    <input 
                      type="text" 
                      name="batch" 
                      value={formData.batch} 
                      onChange={handleChange} 
                      placeholder="Enter batch year range (e.g., 2019-2022)" 
                    />
                    <small className="form-hint">Format: Start Year - End Year (e.g., 2019-2023)</small>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contact Information</h3>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
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
            <div className="modal-header"><h2>Student Details</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="profile-header"><div className="profile-avatar">{selectedStudent.name?.charAt(0).toUpperCase()}</div><div className="profile-info"><h3>{selectedStudent.name}</h3><p>{selectedStudent.email}</p>{selectedStudent.deletedAt && (<p className="deleted-info">Deleted on: {new Date(selectedStudent.deletedAt).toLocaleString()}</p>)}</div></div>
              <div className="details-grid">
                <div className="detail-item"><span className="detail-label">Roll No</span><span className="detail-value">{selectedStudent.rollNo}</span></div>
                <div className="detail-item"><span className="detail-label">Enrollment No</span><span className="detail-value">{selectedStudent.enrollmentNo || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Department</span><span className="detail-value">{selectedStudent.department || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Course/Branch</span><span className="detail-value">{selectedStudent.course || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Semester</span><span className="detail-value">{selectedStudent.semester || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Batch</span><span className="detail-value">{selectedStudent.batch || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Admission Year</span><span className="detail-value">{selectedStudent.admissionYear || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-value">{selectedStudent.phone || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Age</span><span className="detail-value">{selectedStudent.age || '—'}</span></div>
                <div className="detail-item"><span className="detail-label">Gender</span><span className="detail-value">{selectedStudent.gender || '—'}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Address</span><span className="detail-value">{selectedStudent.address || '—'}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Status</span><span className={`status-badge ${selectedStudent.user?.isActive !== false ? 'active' : 'inactive'}`}>{selectedStudent.user?.isActive !== false ? 'ACTIVE' : 'INACTIVE'}</span></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              {selectedStudent.deletedAt ? (
                <button className="btn-primary" onClick={() => { setShowModal(false); handleRestore(selectedStudent); }}><RotateCcw size={16} />Restore Student</button>
              ) : (
                <button className="btn-primary" onClick={() => { setShowModal(false); handleEdit(selectedStudent); }}><Edit size={16} />Edit Student</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {modalType === 'softDelete' && selectedStudent && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Move to Trash</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body text-center"><div className="delete-icon warning"><Archive size={48} /></div><p className="delete-message">Are you sure you want to move <strong>{selectedStudent.name}</strong> to trash?</p><p className="delete-warning">You can restore this student from trash later.</p></div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-warning" onClick={confirmSoftDelete}><Archive size={16} />Move to Trash</button></div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedStudent && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Student</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body text-center"><div className="delete-icon"><Trash2 size={48} /></div><p className="delete-message">Are you sure you want to delete <strong>{selectedStudent.name}</strong>?</p><p className="delete-warning">This action cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-danger" onClick={confirmDelete}><Trash2 size={16} />Delete Student</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;