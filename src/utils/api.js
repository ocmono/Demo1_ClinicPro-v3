import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'https://bkdemo1.clinicpro.cc',
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
            sessionStorage.clear();
            
            // Show error message
            toast.error('Your session has expired. Please login again.');
            
            // Redirect to login page if not already there
            if (window.location.pathname !== '/authentication/login') {
                window.location.href = '/authentication/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;