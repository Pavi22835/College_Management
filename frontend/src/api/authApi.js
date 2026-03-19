import axiosConfig from './axiosConfig.js';

export const login = async (email, password) => {
  try {
    const response = await axiosConfig.post('/auth/login', { email, password });
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
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getMe = async () => {
  try {
    const response = await axiosConfig.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('❌ GetMe API error:', error.response?.data || error.message);
    throw error;
  }
};