import { useState, useCallback } from 'react';

/**
 * Custom hook for making API calls with loading, error, and data states
 * @param {Function} apiFunction - The API function to call
 * @param {*} initialData - Initial data state
 * @param {Object} options - Additional options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useFetch = (apiFunction, initialData = null, options = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setStatus('loading');
      setError(null);
      
      try {
        console.log(`🚀 Executing API call: ${apiFunction.name || 'anonymous'}`);
        const result = await apiFunction(...args);
        
        // Handle different response formats
        if (result && result.success === true) {
          setData(result.data);
          setStatus('success');
          return { success: true, data: result.data };
        } else if (result && result.data) {
          setData(result.data);
          setStatus('success');
          return { success: true, data: result.data };
        } else {
          // Assume the result itself is the data
          setData(result);
          setStatus('success');
          return { success: true, data: result };
        }
      } catch (err) {
        console.error('❌ API call error:', err);
        
        const errorMsg = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMsg);
        setStatus('error');
        
        if (options.throwOnError) {
          throw err;
        }
        
        return { 
          success: false, 
          error: errorMsg,
          status: err.response?.status
        };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options.throwOnError]
  );

  // Reset state to initial values
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setStatus('idle');
  }, [initialData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    status,
    execute,
    reset,
    clearError,
    setData,
    // Convenience booleans
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
};

/**
 * Simplified version for quick use
 */
export const useSimpleFetch = (apiFunction, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute, setData };
};

export default useFetch;