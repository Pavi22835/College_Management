import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, GraduationCap, Calendar, Edit2, Save, X, BookOpen, DollarSign, Clock } from 'lucide-react';
import './StudentProfile.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNo: '',
    course: '',
    semester: '',
    batch: '',
    enrollmentNo: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        rollNo: user.rollNo || '',
        course: user.course || '',
        semester: user.semester || '',
        batch: user.batch || '',
        enrollmentNo: user.enrollmentNo || ''
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
    return <div className="student-profile-loading">Loading...</div>;
  }

  return (
    <div className="student-profile-container">
      <div className="student-profile-card">
        <div className="student-profile-header">
          <div className="student-profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="student-profile-title">Student Profile</h2>
          <p className="student-profile-subtitle">Manage your academic information</p>
        </div>

        {message && (
          <div className={`student-profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="student-profile-form">
            <div className="student-profile-form-header">
              <h3 className="student-profile-form-title">Personal Information</h3>
              {!isEditing && (
                <button type="button" className="student-profile-edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>

            <div className="student-profile-row">
              <div className="student-profile-form-group">
                <label className="student-profile-label">Full Name</label>
                <div className="student-profile-input-group">
                  <User size={16} className="student-profile-input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="student-profile-input"
                  />
                </div>
              </div>

              <div className="student-profile-form-group">
                <label className="student-profile-label">Email Address</label>
                <div className="student-profile-input-group">
                  <Mail size={16} className="student-profile-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="student-profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="student-profile-row">
              <div className="student-profile-form-group">
                <label className="student-profile-label">Phone Number</label>
                <div className="student-profile-input-group">
                  <Phone size={16} className="student-profile-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                    className="student-profile-input"
                  />
                </div>
              </div>

              <div className="student-profile-form-group">
                <label className="student-profile-label">Roll Number</label>
                <div className="student-profile-input-group">
                  <GraduationCap size={16} className="student-profile-input-icon" />
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="student-profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="student-profile-row">
              <div className="student-profile-form-group">
                <label className="student-profile-label">Course</label>
                <div className="student-profile-input-group">
                  <BookOpen size={16} className="student-profile-input-icon" />
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="student-profile-input"
                  />
                </div>
              </div>

              <div className="student-profile-form-group">
                <label className="student-profile-label">Semester</label>
                <div className="student-profile-input-group">
                  <Calendar size={16} className="student-profile-input-icon" />
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="student-profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="student-profile-row">
              <div className="student-profile-form-group">
                <label className="student-profile-label">Batch</label>
                <div className="student-profile-input-group">
                  <Clock size={16} className="student-profile-input-icon" />
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 2020-2024"
                    className="student-profile-input"
                  />
                </div>
              </div>

              <div className="student-profile-form-group">
                <label className="student-profile-label">Enrollment Number</label>
                <div className="student-profile-input-group">
                  <DollarSign size={16} className="student-profile-input-icon" />
                  <input
                    type="text"
                    name="enrollmentNo"
                    value={formData.enrollmentNo}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="student-profile-input"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="student-profile-form-actions">
                <button type="button" className="student-profile-cancel-btn" onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    rollNo: user.rollNo || '',
                    course: user.course || '',
                    semester: user.semester || '',
                    batch: user.batch || '',
                    enrollmentNo: user.enrollmentNo || ''
                  });
                }}>
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="student-profile-save-btn">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Quick Stats Section */}
        <div className="student-profile-stats-section">
          <h4 className="student-profile-stats-title">Quick Stats</h4>
          <div className="student-profile-stats-grid">
            <div className="student-profile-stat-card">
              <div className="student-profile-stat-icon">📚</div>
              <div className="student-profile-stat-value">6</div>
              <div className="student-profile-stat-label">Active Courses</div>
            </div>
            <div className="student-profile-stat-card">
              <div className="student-profile-stat-icon">✅</div>
              <div className="student-profile-stat-value">85%</div>
              <div className="student-profile-stat-label">Attendance</div>
            </div>
            <div className="student-profile-stat-card">
              <div className="student-profile-stat-icon">⭐</div>
              <div className="student-profile-stat-value">8.5</div>
              <div className="student-profile-stat-label">CGPA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;