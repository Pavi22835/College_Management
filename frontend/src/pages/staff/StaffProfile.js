import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, BookOpen, Edit2, Save, X } from 'lucide-react';
import './StaffProfile.css';

const StaffProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsEditing(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (!user) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="staff-profile-container">
      <div className="staff-profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2>Staff Profile</h2>
          <p>Manage your professional information</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="profile-form">
            <div className="form-header">
              <h3>Professional Information</h3>
              {!isEditing && (
                <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <div className="input-group">
                <User size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <Mail size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-group">
                <Phone size={16} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department</label>
              <div className="input-group">
                <BookOpen size={16} />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Designation</label>
              <div className="input-group">
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g., Professor, HOD"
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    department: user.department || '',
                    designation: user.designation || ''
                  });
                }}>
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffProfile;