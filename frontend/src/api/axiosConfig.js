import axios from 'axios';

const axiosConfig = axios.create({
  baseURL: 'http://localhost:3003/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - ALWAYS add token
axiosConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log(`🔐 Request to: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`🔑 Token exists: ${!!token}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ Token attached to request`);
    } else {
      console.warn(`⚠️ NO TOKEN found for request to ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosConfig.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status} for ${error.config?.url}:`);
      console.error('   Error data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('🔒 Unauthorized - No token or invalid token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
      
      if (error.response.status === 403) {
        console.error('🚫 Forbidden - Account deactivated or insufficient permissions');
      }
    } else if (error.request) {
      console.error('❌ No response from server. Is backend running on port 3003?');
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosConfig;