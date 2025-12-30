import { useCallback } from 'react';
import { fetchWithAuth, handleApiError } from '../utils/apiErrorHandler';

/**
 * Custom hook that provides API methods with automatic 401 error handling
 * @returns {Object} Object containing API methods
 */
export const useApiWithAuth = () => {
  // Enhanced fetch with automatic 401 handling
  const apiCall = useCallback(async (url, options = {}) => {
    try {
      return await fetchWithAuth(url, options);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  // Convenience methods
  const get = useCallback(async (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  }, [apiCall]);

  const post = useCallback(async (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [apiCall]);

  const put = useCallback(async (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [apiCall]);

  const del = useCallback(async (url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  }, [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApiWithAuth;