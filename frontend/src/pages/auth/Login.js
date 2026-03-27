import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin } from '../../api/authApi';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiAlertTriangle, FiUserX, FiX, FiCheckCircle } from 'react-icons/fi';
import { FaUserGraduate, FaChalkboardTeacher, FaUserCog } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Demo credentials
  const demoCredentials = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    staff: { email: 'john.teacher@example.com', password: 'teacher123' },
    student: { email: 'ranjith@example.com', password: 'student123' }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillDemoCredentials = (role) => {
    setSelectedRole(role);
    setFormData({
      email: demoCredentials[role].email,
      password: demoCredentials[role].password
    });
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    // Auto clear after 5 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 5000);
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiLogin(formData.email, formData.password);
      
      if (response && response.success) {
        const userData = response.user;
        const token = response.token;
        
        if (userData && token) {
          // Check if account is deactivated
          const isActive = userData.isActive !== false && 
                          userData.status !== 'deactivated' && 
                          userData.status !== 'inactive';
          
          if (!isActive) {
            // Show deactivated account toast
            showToast('Account is Deactivated', 'error');
            setLoading(false);
            return;
          }
          
          // Show success toast based on role
          const role = userData.role?.toLowerCase();
          const userName = userData.name || userData.email?.split('@')[0] || 'User';
          
          if (role === 'admin') {
            showToast('Admin logging successfully', 'success');
          } else if (role === 'staff' || role === 'teacher') {
            showToast(`${userName} login successfully`, 'success');
          } else if (role === 'student') {
            showToast(`${userName} login successfully`, 'success');
          } else {
            showToast('Login successful', 'success');
          }
          
          // Small delay to show toast before navigation
          setTimeout(() => {
            authLogin(userData, token);
            
            if (role === 'admin') {
              navigate('/admin/dashboard');
            } else if (role === 'staff' || role === 'teacher') {
              navigate('/staff/dashboard');
            } else if (role === 'student') {
              navigate('/student/dashboard');
            } else {
              navigate('/');
            }
          }, 1000);
        } else {
          showToast('Invalid email or password', 'error');
          setLoading(false);
        }
      } else {
        const errorMsg = response?.message || '';
        
        if (errorMsg.toLowerCase().includes('deactivated') || 
            errorMsg.toLowerCase().includes('inactive') ||
            errorMsg.toLowerCase().includes('disabled')) {
          showToast('Account is Deactivated', 'error');
        } else {
          showToast('Invalid email or password', 'error');
        }
        setLoading(false);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        const serverMsg = err.response.data.message;
        if (serverMsg.toLowerCase().includes('deactivated') || 
            serverMsg.toLowerCase().includes('inactive')) {
          showToast('Account is Deactivated', 'error');
        } else {
          showToast('Invalid email or password', 'error');
        }
      } else if (err.response?.status === 403) {
        showToast('Account is Deactivated', 'error');
      } else if (err.response?.status === 401) {
        showToast('Invalid email or password', 'error');
      } else if (err.message?.includes('Network Error')) {
        showToast('Cannot connect to server. Please check your connection.', 'error');
      } else {
        showToast('Invalid email or password', 'error');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === 'error' ? <FiAlertTriangle /> : <FiCheckCircle />}
            </div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={closeToast}>
            <FiX />
          </button>
        </div>
      )}

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">College Management System</h1>
          <p className="login-subtitle">Sign in with your credentials</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-option ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => fillDemoCredentials('admin')}
          >
            <FaUserCog className="role-icon" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            className={`role-option ${selectedRole === 'staff' ? 'active' : ''}`}
            onClick={() => fillDemoCredentials('staff')}
          >
            <FaChalkboardTeacher className="role-icon" />
            <span>Staff</span>
          </button>
          <button
            type="button"
            className={`role-option ${selectedRole === 'student' ? 'active' : ''}`}
            onClick={() => fillDemoCredentials('student')}
          >
            <FaUserGraduate className="role-icon" />
            <span>Student</span>
          </button>
        </div>

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

        <div className="login-footer">
          <p>College Management System © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;