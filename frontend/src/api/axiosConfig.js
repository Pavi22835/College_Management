import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3003/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - FIXED: Better token logging
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Log token status (without exposing the full token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url} - ✅ Token attached`);
    } else {
      console.warn(`⚠️ ${config.method.toUpperCase()} ${config.url} - ❌ No token found!`);
    }
    
    // Log full URL for debugging
    const fullUrl = `${config.baseURL || 'http://localhost:3003/api'}${config.url}`;
    console.log(`📤 Request: ${fullUrl}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - FIXED: Better error messages
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`❌ Error ${error.response.status} for ${error.config?.url}:`, error.response.data);
      
      if (error.response.status === 401) {
        console.error('🔒 Unauthorized - Token invalid or expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect immediately, give time to see the error
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response.status === 403) {
        console.error('🚫 Forbidden - You don\'t have permission');
      } else if (error.response.status === 404) {
        console.error('🔍 Endpoint not found. Check if URL is correct:', error.config?.url);
        console.log('Expected URL pattern: /teachers/dashboard/stats');
      } else if (error.response.status === 500) {
        console.error('💥 Server error - Check backend logs');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ No response from server. Is backend running on port 3003?');
      console.error('Request URL:', error.request?.responseURL || 'Unknown');
    } else {
      // Something happened in setting up the request
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;