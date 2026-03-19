import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is staff (case insensitive)
  const isStaff = user.role === 'STAFF' || user.role === 'staff';
  
  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StaffRoute;