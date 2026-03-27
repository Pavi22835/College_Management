import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin } from '../../api/authApi';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaUserGraduate, FaChalkboardTeacher, FaUserCog } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // Demo credentials - UPDATED to match your database
  const demoCredentials = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    staff: { email: 'john.teacher@example.com', password: 'teacher123' }, // Fixed: teacher123, not staff123
    student: { email: 'ranjith@example.com', password: 'student123' }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillDemoCredentials = (role) => {
    console.log('🎯 Filling demo credentials for:', role);
    setSelectedRole(role);
    setFormData({
      email: demoCredentials[role].email,
      password: demoCredentials[role].password
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', formData.email);
      
      const response = await apiLogin(formData.email, formData.password);
      
      console.log('📥 Login response:', response);
      
      if (response && response.success) {
        const userData = response.user;
        const token = response.token;
        
        if (userData && token) {
          console.log('✅ Login successful for:', userData.email);
          console.log('👤 User role:', userData.role);
          
          authLogin(userData, token);
          
          const role = userData.role?.toLowerCase();
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'staff' || role === 'teacher') {
            navigate('/staff/dashboard');
          } else if (role === 'student') {
            navigate('/student/dashboard');
          } else {
            navigate('/');
          }
        } else {
          setError('Login succeeded but user data is missing');
        }
      } else {
        setError(response?.message || 'Account is Deactivated');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      if (err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please check if backend is running on port 3003.');
      } else if (err.response?.status === 401) {
        setError('Account is Deactivated');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">College Management System</h1>
          <p className="login-subtitle">Sign in with your credentials</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-option ${selectedRole === 'admin' ? 'active admin' : ''}`}
            onClick={() => fillDemoCredentials('admin')}
          >
            <FaUserCog className="role-icon" />
            <span className="role-label">Admin</span>
          </button>
          <button
            type="button"
            className={`role-option ${selectedRole === 'staff' ? 'active staff' : ''}`}
            onClick={() => fillDemoCredentials('staff')}
          >
            <FaChalkboardTeacher className="role-icon" />
            <span className="role-label">Staff</span>
          </button>
          <button
            type="button"
            className={`role-option ${selectedRole === 'student' ? 'active student' : ''}`}
            onClick={() => fillDemoCredentials('student')}
          >
            <FaUserGraduate className="role-icon" />
            <span className="role-label">Student</span>
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field">
            <label htmlFor="email">
              <FiMail className="field-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-field">
            <label htmlFor="password">
              <FiLock className="field-icon" />
              Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FiLogIn className="button-icon" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;