import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  RefreshCw,
  AlertCircle,
  Search
} from 'lucide-react';
import { departmentApi } from '../../api/adminApi';
import Spinner from '../../components/common/Spinner';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: ''
  });

  // List of departments to choose from
  const departmentOptions = [
    "Computer Science",
    "CSE",
    "IT",
    "Mechanical",
    "ECE",
    "E and I",
    "ICE",
    "CSD",
    "Civil",
    "EEE",
    "Bio Medical",
    "Aerospace",
    "Automobile",
    "Chemical",
    "Commerce",
    "English",
    "Maths",
    "Tamil",
    "History",
    "BBA",
    "Economics",
    "Political Science"
  ].sort();

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = departments.filter(dept =>
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments);
    }
  }, [searchTerm, departments]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await departmentApi.getAll();
      
      // Handle different response structures
      let departmentsData = [];
      if (response?.success && response?.data) {
        departmentsData = response.data;
      } else if (Array.isArray(response)) {
        departmentsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        departmentsData = response.data;
      }
      
      setDepartments(departmentsData);
      setFilteredDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setErrorMessage('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  // Generate code from department name
  const generateCodeFromName = (name) => {
    if (!name) return '';
    
    const codeMap = {
      "Computer Science": "CS",
      "CSE": "CSE",
      "IT": "IT",
      "Mechanical": "MECH",
      "ECE": "ECE",
      "E and I": "EI",
      "ICE": "ICE",
      "CSD": "CSD",
      "Civil": "CIVIL",
      "EEE": "EEE",
      "Bio Medical": "BME",
      "Aerospace": "AE",
      "Automobile": "AUTO",
      "Chemical": "CHEM",
      "Commerce": "COM",
      "English": "ENG",
      "Maths": "MATH",
      "Tamil": "TAM",
      "History": "HIS",
      "BBA": "BBA",
      "Economics": "ECO",
      "Political Science": "POL"
    };
    
    return codeMap[name] || name.substring(0, 3).toUpperCase();
  };

  const handleNameChange = (selectedName) => {
    const code = generateCodeFromName(selectedName);
    setFormData({
      name: selectedName,
      code: code
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddNew = () => {
    setFormData({
      code: '',
      name: ''
    });
    setEditingId(null);
    setShowModal(true);
    setErrorMessage('');
  };

  const handleEdit = (department) => {
    setFormData({
      code: department.code || '',
      name: department.name || ''
    });
    setEditingId(department.id);
    setShowModal(true);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage('');
      
      if (!formData.name) {
        setErrorMessage('Department name is required');
        return;
      }

      const code = formData.code || generateCodeFromName(formData.name);

      const departmentData = {
        code: code.toUpperCase(),
        name: formData.name
      };

      let response;
      if (editingId) {
        response = await departmentApi.update(editingId, departmentData);
      } else {
        response = await departmentApi.create(departmentData);
      }

      if (response?.success) {
        setSuccessMessage(editingId ? 'Department updated successfully' : 'Department created successfully');
        setShowModal(false);
        fetchDepartments();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response?.message || 'Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Error saving department');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} department?`)) {
      try {
        const response = await departmentApi.delete(id);
        
        if (response?.success) {
          setSuccessMessage('Department deleted successfully');
          fetchDepartments();
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage(response?.message || 'Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        setErrorMessage(error.response?.data?.message || error.message || 'Error deleting department');
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return <Spinner message="Loading departments..." />;
  }

  return (
    <div className="departments-container">
      <div className="departments-header">
        <h1>
          <Building2 size={24} />
          Department Management
        </h1>
        <div className="header-actions">
          <button 
            className="btn btn-outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn-add-department" onClick={handleAddNew}>
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <AlertCircle size={16} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search departments by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        Showing <strong>{filteredDepartments.length}</strong> of <strong>{departments.length}</strong> departments
      </div>

      {/* Departments Table */}
      <div className="table-container">
        <table className="departments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Department Name</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>
                    <span className="code-badge">{dept.code}</span>
                  </td>
                  <td>
                    <span className="dept-name">{dept.name}</span>
                  </td>
                  <td>
                    {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {dept.updatedAt ? new Date(dept.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(dept)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(dept.id, dept.name)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  {departments.length === 0 ? (
                    <>
                      <Building2 size={48} />
                      <h3>No Departments Found</h3>
                      <p>Click "Add Department" to create your first department.</p>
                    </>
                  ) : (
                    <>
                      <Search size={48} />
                      <h3>No Matching Departments</h3>
                      <p>Try adjusting your search criteria.</p>
                      <button className="btn btn-outline btn-sm" onClick={clearSearch}>
                        Clear Search
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Department' : 'Add New Department'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {errorMessage && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errorMessage}
                </div>
              )}
              
              <div className="form-group">
                <label>Department Name *</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="Auto-generated if left empty"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="form-control"
                  maxLength="10"
                />
                <small className="form-hint">Leave empty to auto-generate from name</small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                <Save size={16} />
                {editingId ? 'Update' : 'Create'} Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;