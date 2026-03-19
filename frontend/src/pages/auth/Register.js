import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiBook, FiX, FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { register } from '../../api/authApi';
import './Register.css';

const Register = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Student fields
    rollNo: '',
    course: '',
    semester: '',
    // Teacher fields
    department: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'student' && !formData.rollNo) {
      setError('Roll number is required for students');
      return;
    }

    if (role === 'teacher' && !formData.department) {
      setError('Department is required for teachers');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare user data based on role
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role.toUpperCase(),
        phone: formData.phone || undefined
      };

      // Add role-specific fields
      if (role === 'student') {
        userData.rollNo = formData.rollNo;
        userData.course = formData.course || undefined;
        userData.semester = formData.semester ? parseInt(formData.semester) : 1;
      } else if (role === 'teacher') {
        userData.department = formData.department;
        userData.designation = formData.designation || 'Teacher';
      }

      console.log('📤 Registering user:', userData);
      
      const response = await register(userData);
      console.log('📥 Register response:', response);
      
      if (response && response.success) {
        // Show success message
        const successMsg = response.message || 'Registration successful! Please login.';
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(successMsg);
        }
        
        // Close the modal
        if (onClose) {
          onClose();
        }
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          rollNo: '',
          course: '',
          semester: '',
          department: '',
          designation: ''
        });
        setStep(1);
      } else {
        setError(response?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setError('');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="register-modal-overlay" onClick={handleOverlayClick}>
      <div className="register-modal-content">
        <button className="register-modal-close" onClick={onClose}>
          <FiX size={24} />
        </button>

        <div className="register-modal-header">
          <h2 className="register-modal-title">Create Account</h2>
          <p className="register-modal-subtitle">Join us as a student or teacher</p>
        </div>

        {step === 1 ? (
          <div className="register-role-selection">
            <h3 className="register-selection-title">Choose your role</h3>
            <div className="register-role-cards">
              <button
                className="register-role-card student"
                onClick={() => handleRoleSelect('student')}
              >
                <FaUserGraduate className="register-role-icon" />
                <span className="register-role-title">Student</span>
                <span className="register-role-desc">Enroll in courses and track your progress</span>
              </button>
              <button
                className="register-role-card teacher"
                onClick={() => handleRoleSelect('teacher')}
              >
                <FaChalkboardTeacher className="register-role-icon" />
                <span className="register-role-title">Teacher</span>
                <span className="register-role-desc">Manage courses and mark attendance</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="register-form">
            <button type="button" className="register-back-button" onClick={goBack}>
              <FiArrowLeft /> Back to role selection
            </button>

            <div className="register-role-badge">
              Registering as: <span className={`register-role-${role}`}>{role}</span>
            </div>

            {error && (
              <div className="register-error-message">
                <span className="register-error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Common Fields */}
            <div className="register-form-group">
              <label>
                <FiUser className="register-field-icon" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="register-form-group">
              <label>
                <FiMail className="register-field-icon" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="register-form-group">
              <label>
                <FiPhone className="register-field-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number (optional)"
              />
            </div>

            <div className="register-form-row">
              <div className="register-form-group">
                <label>
                  <FiLock className="register-field-icon" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              <div className="register-form-group">
                <label>
                  <FiLock className="register-field-icon" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <>
                <h4 className="register-section-title">Student Information</h4>
                <div className="register-form-row">
                  <div className="register-form-group">
                    <label>Roll Number *</label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="e.g., STU001"
                      required
                    />
                  </div>
                  <div className="register-form-group">
                    <label>Course</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                <div className="register-form-row">
                  <div className="register-form-group">
                    <label>Semester</label>
                    <input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      placeholder="e.g., 1"
                      min="1"
                      max="8"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Teacher Specific Fields */}
            {role === 'teacher' && (
              <>
                <h4 className="register-section-title">Teacher Information</h4>
                <div className="register-form-row">
                  <div className="register-form-group">
                    <label>Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div className="register-form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g., Professor"
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="register-submit-button" disabled={loading}>
              {loading ? (
                <span className="register-spinner"></span>
              ) : (
                <>
                  <FiUserPlus className="register-button-icon" />
                  Create Account
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;