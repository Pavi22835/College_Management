import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthProvider mounted - checking localStorage...');
    
    // Check localStorage on initial load
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('📦 localStorage contents:', { 
          hasToken: !!storedToken, 
          hasUser: !!storedUser,
          tokenPreview: storedToken ? storedToken.substring(0, 15) + '...' : null,
          userPreview: storedUser ? JSON.parse(storedUser) : null
        });
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('👤 User loaded from storage:', parsedUser);
          console.log('👤 User role from storage:', parsedUser.role);
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          console.log('👤 No user found in storage - will show login page');
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        console.log('✅ Auth loading complete, setting loading=false');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, userToken) => {
    console.log('🔐 Login called with data:', { 
      userData, 
      tokenPreview: userToken?.substring(0, 15) + '...' 
    });
    
    // Log the raw role before normalization
    console.log('📝 Raw role from API:', userData?.role);
    
    // Ensure role is uppercase
    if (userData && userData.role) {
      const originalRole = userData.role;
      userData.role = userData.role.toUpperCase();
      console.log('🔄 Role normalized from', originalRole, 'to', userData.role);
    }
    
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    
    console.log('✅ User logged in and stored:', userData);
    console.log('✅ User role after login:', userData.role);
  };

  const logout = () => {
    console.log('👋 Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    isStudent: user?.role === 'STUDENT'
  };

  console.log('🔄 AuthContext current state:', { 
    user: user ? { ...user, password: undefined } : null,
    userRole: user?.role,
    hasToken: !!token,
    loading,
    isAuthenticated: !!token && !!user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;