import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Search, Filter, X, Check, RotateCcw, Archive, AlertCircle, Users,BookOpen,UserCheck } from 'lucide-react';
import { trashApi } from '../../api/trashApi';
import './Trash.css';

const AdminTrash = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const response = await trashApi.getAll();
      if (response.success) {
        setTrashItems(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching trash:', err);
      setError('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: trashItems.length,
    students: trashItems.filter(i => i.entityType === 'STUDENT').length,
    courses: trashItems.filter(i => i.entityType === 'COURSE').length,
    teachers: trashItems.filter(i => i.entityType === 'TEACHER').length,
  };

  const filteredItems = trashItems.filter(item => {
    const itemData = item.data || {};
    const itemName = itemData.name || itemData.title || '';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.entityType?.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  const handleRestore = async (id, type) => {
    if (window.confirm('Are you sure you want to restore this item?')) {
      try {
        await trashApi.restore(id);
        fetchTrash(); // Refresh list
      } catch (err) {
        console.error('Error restoring item:', err);
        alert('Failed to restore item');
      }
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('This action cannot be undone. Delete permanently?')) {
      try {
        await trashApi.permanentDelete(id);
        fetchTrash(); // Refresh list
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item');
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm('Are you sure you want to empty the trash? This action cannot be undone.')) {
      try {
        await trashApi.emptyTrash();
        fetchTrash(); // Refresh list
      } catch (err) {
        console.error('Error emptying trash:', err);
        alert('Failed to empty trash');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading trash...</p>
      </div>
    );
  }

  return (
    <div className="trash-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="header-title">
            <Trash2 className="header-icon" size={28} />
            Trash
          </h1>
          <p className="header-subtitle">Recover deleted items or permanently remove them</p>
        </div>
        <button className="btn-danger" onClick={handleEmptyTrash} disabled={trashItems.length === 0}>
          <Archive size={16} />
          Empty Trash
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Trash2 size={20} />
          <div>
            <span className="stat-label">Total Items</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={20} />
          <div>
            <span className="stat-label">Students</span>
            <span className="stat-value">{stats.students}</span>
          </div>
        </div>
        <div className="stat-card">
          <BookOpen size={20} />
          <div>
            <span className="stat-label">Courses</span>
            <span className="stat-value">{stats.courses}</span>
          </div>
        </div>
        <div className="stat-card">
          <UserCheck size={20} />
          <div>
            <span className="stat-label">Teachers</span>
            <span className="stat-value">{stats.teachers}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <Filter className="filter-icon" size={18} />
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="student">Students</option>
            <option value="course">Courses</option>
            <option value="teacher">Teachers</option>
          </select>
        </div>
      </div>

      {/* Trash Table */}
      <div className="table-container">
        <table className="trash-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name/Title</th>
              <th>Identifier</th>
              <th>Deleted By</th>
              <th>Deleted On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const itemData = item.data || {};
                const identifier = 
                  item.entityType === 'STUDENT' ? itemData.rollNo :
                  item.entityType === 'COURSE' ? itemData.code :
                  item.entityType === 'TEACHER' ? itemData.employeeId : '-';
                
                return (
                  <tr key={item.id}>
                    <td>
                      <span className={`type-badge ${item.entityType?.toLowerCase()}`}>
                        {item.entityType?.toLowerCase() === 'student' && <Users size={12} />}
                        {item.entityType?.toLowerCase() === 'course' && <BookOpen size={12} />}
                        {item.entityType?.toLowerCase() === 'teacher' && <UserCheck size={12} />}
                        {item.entityType?.toLowerCase()}
                      </span>
                    </td>
                    <td className="item-name">{itemData.name || itemData.title || '-'}</td>
                    <td>{identifier}</td>
                    <td>Admin</td>
                    <td>{new Date(item.deletedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-group">
                        <button
                          className="action-btn restore"
                          onClick={() => handleRestore(item.id, item.entityType)}
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handlePermanentDelete(item.id)}
                          title="Delete Permanently"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <Trash2 size={48} />
                  <h3>Trash is empty</h3>
                  <p>Deleted items will appear here</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <Check size={18} />
        <span>Items in trash are automatically deleted after 30 days</span>
      </div>
    </div>
  );
};

export default AdminTrash;