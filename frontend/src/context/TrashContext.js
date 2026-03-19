import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { trashApi } from '../api/trashApi';
import { useAuth } from './AuthContext';

const TrashContext = createContext();

export const TrashProvider = ({ children }) => {
  const [trashItems, setTrashItems] = useState([]);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Fetch trash items
  const fetchTrash = useCallback(async () => {
    // Only fetch trash if user is authenticated AND is admin
    if (!isAuthenticated) {
      console.log('⏭️ Not authenticated, skipping trash fetch');
      setTrashItems([]);
      setTrashCount(0);
      return { success: false, items: [] };
    }

    if (!isAdmin) {
      console.log('⏭️ User is not admin, skipping trash fetch');
      setTrashItems([]);
      setTrashCount(0);
      return { success: false, items: [] };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching trash items for admin...');
      const response = await trashApi.getAll();
      
      const items = response.data || [];
      setTrashItems(items);
      setTrashCount(items.length);
      
      console.log(`📊 Trash count: ${items.length}`);
      return { success: true, items };
    } catch (err) {
      // Don't log permission errors as errors
      if (err.message?.includes('Admin access only') || err.response?.status === 403) {
        console.log('⏭️ Admin access only - clearing trash');
        setTrashItems([]);
        setTrashCount(0);
        return { success: false, items: [] };
      }
      
      console.error('❌ Trash fetch error:', err);
      setError(err.message || 'Failed to fetch trash');
      setTrashItems([]);
      setTrashCount(0);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Restore item from trash
  const restoreItem = useCallback(async (id, type) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Admin access required');
    }

    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (type) {
        case 'student':
          response = await trashApi.restoreStudent(id);
          break;
        case 'course':
          response = await trashApi.restoreCourse(id);
          break;
        case 'teacher':
          response = await trashApi.restoreTeacher(id);
          break;
        default:
          response = await trashApi.restore(id);
      }
      
      // Refresh trash after restore
      await fetchTrash();
      
      return response;
    } catch (err) {
      console.error('❌ Restore error:', err);
      setError(err.message || 'Failed to restore item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, fetchTrash]);

  // Permanently delete item from trash
  const permanentDelete = useCallback(async (id, type) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Admin access required');
    }

    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (type) {
        case 'student':
          response = await trashApi.permanentDeleteStudent(id);
          break;
        case 'course':
          response = await trashApi.permanentDeleteCourse(id);
          break;
        case 'teacher':
          response = await trashApi.permanentDeleteTeacher(id);
          break;
        default:
          response = await trashApi.permanentDelete(id);
      }
      
      // Refresh trash after deletion
      await fetchTrash();
      
      return response;
    } catch (err) {
      console.error('❌ Permanent delete error:', err);
      setError(err.message || 'Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, fetchTrash]);

  // Empty trash
  const emptyTrash = useCallback(async (force = false) => {
    if (!isAuthenticated || !isAdmin) {
      throw new Error('Admin access required');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = force 
        ? await trashApi.emptyAllTrash()
        : await trashApi.emptyTrash();
      
      // Refresh trash after emptying
      await fetchTrash();
      
      return response;
    } catch (err) {
      console.error('❌ Empty trash error:', err);
      setError(err.message || 'Failed to empty trash');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, fetchTrash]);

  // Fetch trash when authentication or admin status changes
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchTrash();
    } else {
      // Clear trash for non-admin users
      setTrashItems([]);
      setTrashCount(0);
    }
  }, [isAuthenticated, isAdmin, fetchTrash]);

  const value = {
    trashItems,
    trashCount,
    loading,
    error,
    fetchTrash,
    restoreItem,
    permanentDelete,
    emptyTrash,
    isAdmin: isAdmin && isAuthenticated
  };

  return (
    <TrashContext.Provider value={value}>
      {children}
    </TrashContext.Provider>
  );
};

// Custom hook for using trash context
export const useTrash = () => {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error('useTrash must be used within a TrashProvider');
  }
  return context;
};

export default TrashContext;