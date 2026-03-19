import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// This is a wrapper hook that re-exports the useAuth from context
// You can either use this OR the one from context directly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};