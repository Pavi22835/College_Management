import axiosConfig from './axiosConfig.js';

export const login = async (email, password) => {
  try {
    const response = await axiosConfig.post('/auth/login', { email, password });
    
    console.log('📦 Login response:', response.data);
    
    // IMPORTANT: Store token immediately after login
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('✅ Token stored in localStorage');
    }
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ User stored in localStorage');
    }
    
    // Verify token was stored
    const storedToken = localStorage.getItem('token');
    console.log(`🔐 Token stored verification: ${!!storedToken}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Login API error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axiosConfig.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('❌ Register API error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('👋 Logout - Token removed');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  const token = localStorage.getItem('token');
  console.log(`🔐 getToken called - Token exists: ${!!token}`);
  return token;
};

export const getMe = async () => {
  try {
    // Check token before making request
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No token found before getMe call');
      throw new Error('No token available');
    }
    
    console.log('🔐 Making getMe request with token');
    const response = await axiosConfig.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('❌ GetMe API error:', error.response?.data || error.message);
    throw error;
  }
};