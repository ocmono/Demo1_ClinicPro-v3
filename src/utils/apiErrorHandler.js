import { toast } from "react-toastify";

// Centralized 401 error handler
export const handle401Error = () => {
  console.log("🔒 401 Unauthorized detected - logging out user");
  
  // Clear all auth data but preserve "Remember Me" credentials
  const rememberedUsername = localStorage.getItem("rememberedUsername");
  const rememberedPassword = localStorage.getItem("rememberedPassword");
  
  localStorage.clear();
  sessionStorage.clear();
  
  // Restore remembered credentials if they exist
  if (rememberedUsername) {
    localStorage.setItem("rememberedUsername", rememberedUsername);
  }
  if (rememberedPassword) {
    localStorage.setItem("rememberedPassword", rememberedPassword);
  }

  // Clear token cookie
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  
  // Show error message
  toast.error("Your session has expired. Please login again.");
  
  // Redirect to login page
  window.location.href = "/authentication/login";
};

// Enhanced fetch wrapper that handles 401 errors automatically
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  
  // Add authorization header if token exists
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 errors automatically
    if (response.status === 401) {
      handle401Error();
      throw new Error("Authentication failed");
    }

    return response;
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw error;
    }
    // Re-throw the error for the calling code to handle
    throw error;
  }
};

// Axios interceptor setup for handling 401 errors
export const setupAxiosInterceptors = (axiosInstance) => {
  // Request interceptor to add auth token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        handle401Error();
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Generic error handler for API responses
export const handleApiError = (error, customMessage = null) => {
  console.error("API Error:", error);
  
  // Handle 401 specifically
  if (error.response && error.response.status === 401) {
    handle401Error();
    return;
  }
  
  // Handle other errors
  const errorMessage = customMessage || 
    error.response?.data?.detail || 
    error.response?.data?.message || 
    error.message || 
    "An unexpected error occurred";
    
  // toast.error(errorMessage);
};