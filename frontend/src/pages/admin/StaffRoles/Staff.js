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
  RotateCcw,
  AlertTriangle,
  Trash2 as TrashIcon,
  FolderOpen,
  FileJson,
  Undo2,
  HardDrive,
  ChevronLeft,
  ChevronRight
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
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
  }, [searchTerm, departmentFilter, statusFilter, activeTab]);

  // Handle individual row selection - FIXED
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

  // Handle select all checkbox click - FIXED
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
      setError('Please select at least one staff member');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to move ${selectedRows.length} staff member(s) to trash?`
      : `Are you sure you want to permanently delete ${selectedRows.length} staff member(s)? This action cannot be undone.`;

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
          console.error(`Failed to ${action} staff ${id}:`, err);
        }
      }
      
      setSuccessMessage(`Successfully ${action === 'delete' ? 'moved' : 'permanently deleted'} ${successCount} staff member(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedRows([]);
      setSelectAll(false);
      fetchStaff();
    } catch (err) {
      console.error(`Error during bulk ${action}:`, err);
      setError(`Failed to ${action} staff members`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

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

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.department === departmentFilter
      );
    }

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

      const active = staffData.filter(member => 
        !member.isDeleted && 
        member.status !== 'deleted' &&
        member.deletedAt === null &&
        member.trashed !== true
      );
      
      const deleted = staffData.filter(member => 
        member.isDeleted === true || 
        member.status === 'deleted' ||
        member.deletedAt !== null ||
        member.trashed === true
      );
      
      const sortedActive = [...active].sort((a, b) => (a.id || 0) - (b.id || 0));
      const sortedDeleted = [...deleted].sort((a, b) => (a.id || 0) - (b.id || 0));
      
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
        },
        deletedAt: member.deletedAt || new Date().toISOString()
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

  const handleSoftDelete = async (member) => {
    setSelectedStaff(member);
    setModalType('softDelete');
    setShowModal(true);
  };

  const confirmSoftDelete = async () => {
    try {
      setLoading(true);
      await staffApi.delete(selectedStaff.id);
      
      const updatedStaff = staff.filter(s => s.id !== selectedStaff.id);
      const deletedStaffWithDate = {
        ...selectedStaff,
        isDeleted: true,
        status: 'deleted',
        deletedAt: new Date().toISOString()
      };
      
      setStaff(updatedStaff);
      setDeletedStaff([deletedStaffWithDate, ...deletedStaff]);
      setFilteredStaff(updatedStaff);
      
      setStats(prev => ({
        ...prev,
        totalStaff: prev.totalStaff - 1,
        trashedStaff: prev.trashedStaff + 1,
        activeStaff: prev.activeStaff - (selectedStaff.user?.isActive !== false ? 1 : 0)
      }));
      
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

  const handleRestore = async (member) => {
    if (!window.confirm(`Are you sure you want to restore ${member.name}?`)) return;
    
    try {
      setLoading(true);
      
      await staffApi.restore(member.id);
      
      const updatedDeleted = deletedStaff.filter(s => s.id !== member.id);
      const restoredStaff = {
        ...member,
        isDeleted: false,
        status: 'active',
        deletedAt: null,
        user: {
          ...member.user,
          isActive: true
        }
      };
      
      setDeletedStaff(updatedDeleted);
      setStaff([restoredStaff, ...staff]);
      setFilteredStaff(activeTab === 'active' ? [restoredStaff, ...staff] : updatedDeleted);
      
      setStats(prev => ({
        ...prev,
        totalStaff: prev.totalStaff + 1,
        trashedStaff: prev.trashedStaff - 1,
        activeStaff: prev.activeStaff + 1
      }));
      
      setSuccessMessage(`${member.name} restored successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error restoring staff:', err);
      setError('Failed to restore: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (member) => {
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete ${member.name}? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      await staffApi.permanentDelete(member.id);
      
      const updatedDeleted = deletedStaff.filter(s => s.id !== member.id);
      setDeletedStaff(updatedDeleted);
      setFilteredStaff(updatedDeleted);
      
      setStats(prev => ({
        ...prev,
        trashedStaff: prev.trashedStaff - 1
      }));
      
      setSuccessMessage(`${member.name} permanently deleted`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error permanently deleting staff:', err);
      setError('Failed to permanently delete: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

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
      setError('Failed to update staff status');
      setTimeout(() => setError(null), 3000);
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
        setError('Please fill in all required fields');
        setTimeout(() => setError(null), 3000);
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
          setError('Password is required for new staff');
          setTimeout(() => setError(null), 3000);
          return;
        }
        staffData.password = formData.password;
        const response = await staffApi.create(staffData);
        
        const newStaff = {
          ...response.data,
          ...staffData,
          id: response.data?.id || Date.now(),
          user: { isActive: true }
        };
        setStaff([newStaff, ...staff]);
        setFilteredStaff([newStaff, ...filteredStaff]);
        setStats(prev => ({
          ...prev,
          totalStaff: prev.totalStaff + 1,
          activeStaff: prev.activeStaff + 1
        }));
        
        setSuccessMessage(`✅ Staff "${formData.name}" added successfully with ACTIVE status!`);
      } else if (modalType === 'edit') {
        await staffApi.update(selectedStaff.id, staffData);
        
        const updatedStaff = staff.map(s => 
          s.id === selectedStaff.id ? { ...s, ...staffData } : s
        );
        setStaff(updatedStaff);
        setFilteredStaff(updatedStaff);
        
        setSuccessMessage(`✅ Staff "${formData.name}" updated successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving staff:', err);
      setError(err.message || 'Failed to save staff');
      setTimeout(() => setError(null), 3000);
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

  const exportToExcel = () => {
    try {
      const exportData = currentItems.map(member => ({
        'ID': member.id || '',
        'Name': member.name || '',
        'Email': member.email || '',
        'Department': member.department || '',
        'Designation': member.designation || '',
        'Phone': member.phone || '',
        'Employee ID': member.employeeId || '',
        'Address': member.address || '',
        'Status': activeTab === 'deleted' ? 'Deleted' : (member.user?.isActive !== false ? 'Active' : 'Inactive')
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
            setError(`No new staff to import.\n${skippedCount} already exist.\n${errorCount} errors.`);
            setTimeout(() => setError(null), 5000);
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
              const response = await staffApi.create(staff);
              importedCount++;
              
              const newStaffMember = {
                ...response.data,
                ...staff,
                id: response.data?.id || Date.now() + importedCount,
                user: { isActive: true }
              };
              setStaff(prev => [newStaffMember, ...prev]);
              
            } catch (err) {
              console.error(`Failed to import ${staff.email}:`, err);
            }
          }

          setStats(prev => ({
            ...prev,
            totalStaff: prev.totalStaff + importedCount,
            activeStaff: prev.activeStaff + importedCount
          }));
          
          setSuccessMessage(`✅ Successfully imported ${importedCount} staff members!`);
          setTimeout(() => setSuccessMessage(''), 5000);
          
          setShowImportPreview(false);
          setImportFile(null);
          setImportPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
        } catch (err) {
          console.error('Import error:', err);
          setError('Failed to process import');
          setTimeout(() => setError(null), 3000);
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsBinaryString(importFile);
      
    } catch (err) {
      console.error('File reader error:', err);
      setError('Failed to read file');
      setTimeout(() => setError(null), 3000);
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

      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Staff Management</h1>
          <p className="page-description">Manage staff records, assignments, and permissions</p>
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

          <button 
            className={`btn-icon ${activeTab === 'deleted' ? 'active' : ''}`} 
            onClick={() => setActiveTab(activeTab === 'active' ? 'deleted' : 'active')} 
            title={activeTab === 'active' ? "View Trash" : "View Active Staff"}
          >
            <Archive size={18} />
            {stats.trashedStaff > 0 && <span className="badge-icon">{stats.trashedStaff}</span>}
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
          <div className="stat-icon gray"><TrashIcon size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TRASH</span>
            <span className="stat-value">{stats.trashedStaff}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          <Users size={16} />
          <span>Active Staff</span>
          <span className="tab-count">{staff.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`} onClick={() => setActiveTab('deleted')}>
          <TrashIcon size={16} />
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

      {/* Table Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="table-actions-bar">
          <span className="selected-count">{selectedRows.length} item(s) selected</span>
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
      
      {/* Staff Table */}
      <div className="table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              </th>
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
            {currentItems.length > 0 ? (
              currentItems.map((member) => {
                const isActive = member.user?.isActive !== false;
                const isDeleted = activeTab === 'deleted';
                const deletedDate = member.deletedAt ? new Date(member.deletedAt).toLocaleDateString() : null;
                
                return (
                  <tr key={member.id} className={isDeleted ? 'deleted-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(member.id)}
                        onChange={() => handleRowSelect(member.id)}
                      />
                    </td>
                    <td><span className="staff-id">#{member.id}</span></td>
                    <td>
                      <div className="staff-info">
                        <div className="staff-avatar">{member.name?.charAt(0).toUpperCase()}</div>
                        <div className="staff-details">
                          <div className="staff-name">{member.name}</div>
                          <div className="staff-email">{member.email}</div>
                          {isDeleted && deletedDate && (
                            <div className="deleted-date">Deleted: {deletedDate}</div>
                          )}
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
                        <button 
                          className={`status-toggle ${isActive ? 'active' : 'inactive'}`} 
                          onClick={() => handleToggleStatus(member)}
                          title={isActive ? "Deactivate Staff" : "Activate Staff"}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      ) : (
                        <span className="status-toggle deleted">DELETED</span>
                      )}
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="action-btn view" onClick={() => handleView(member)} title="View Details">
                          <Eye size={18} />
                        </button>
                        {activeTab === 'active' ? (
                          <>
                            <button className="action-btn edit" onClick={() => handleEdit(member)} title="Edit Staff">
                              <Edit size={18} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleSoftDelete(member)} title="Move to Trash">
                              <Archive size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestore(member)} title="Restore Staff">
                              <Undo2 size={18} />
                            </button>
                            <button className="action-btn permanent-delete" onClick={() => handlePermanentDelete(member)} title="Permanently Delete">
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
                <td colSpan="10" className="empty-state">
                  {activeTab === 'active' ? (
                    staff.length === 0 ? (
                      <>
                        <FolderOpen size={48} />
                        <h3>No Staff Found</h3>
                        <p>Click "Add Staff" to create your first staff record.</p>
                        <button className="btn-primary" onClick={handleAdd}>
                          <Plus size={16} /> Add Staff
                        </button>
                      </>
                    ) : (
                      <>
                        <Search size={48} />
                        <h3>No Matching Staff</h3>
                        <p>Try adjusting your search criteria or clear filters.</p>
                        <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>
                      </>
                    )
                  ) : (
                    <>
                      <TrashIcon size={48} />
                      <h3>Trash is Empty</h3>
                      <p>No deleted staff found. Deleted staff will appear here for restoration.</p>
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
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {modalType === 'add' ? 'Add Staff' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {modalType === 'view' && selectedStaff && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Staff Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar">{selectedStaff.name?.charAt(0).toUpperCase()}</div>
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
                <div className="detail-item full-width">
                  <span className="detail-label">Address</span>
                  <span className="detail-value address-value">{selectedStaff.address || '—'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              {selectedStaff.deletedAt ? (
                <button className="btn-primary" onClick={() => { setShowModal(false); handleRestore(selectedStaff); }}>
                  <Undo2 size={16} />Restore Staff
                </button>
              ) : (
                <button className="btn-primary" onClick={() => { setShowModal(false); handleEdit(selectedStaff); }}>
                  <Edit size={16} />Edit Staff
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
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body text-center">
              <div className="delete-icon warning"><Archive size={48} /></div>
              <p className="delete-message">Are you sure you want to move <strong>{selectedStaff.name}</strong> to trash?</p>
              <p className="delete-warning">You can restore this staff from trash later.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-warning" onClick={confirmSoftDelete}>
                <Archive size={16} />Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;