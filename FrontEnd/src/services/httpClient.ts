import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

// Enhanced error logging function
function logAxiosError(error: any, context: string) {
  console.error(`[HTTP Error - ${context}]`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
    headers: error.config?.headers,
    stackTrace: error.stack
  });
}

// Create axios instance with base configuration
const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding token
httpClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    logAxiosError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if it's an unauthorized error and we haven't already tried to refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
        const refreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_KEY);

        if (!token || !refreshToken) {
          throw new Error('No tokens available');
        }

        // Try to refresh token
        const refreshResponse = await httpClient.post(
          API_CONFIG.ENDPOINTS.AUTH.REFRESH, 
          { token }
        );

        // If refresh successful, retry original request
        if (refreshResponse.data.token) {
          localStorage.setItem(API_CONFIG.TOKEN.KEY, refreshResponse.data.token);
          
          // Retry original request
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out user
        try {
          await useAuthStore.getState().logout();
        } catch (logoutError) {
          console.error('Logout failed', logoutError);
        }

        // Detailed error logging
        logAxiosError(refreshError, 'Token Refresh');

        toast.error('Your session has expired. Please log in again.', {
          position: 'bottom-right',
          duration: 4000,
          style: {
            background: '#e74c3c',
            color: 'white',
            borderRadius: '10px',
          }
        });

        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data 
      ? (error.response.data as any).message || 'An error occurred'
      : 'Network error';

    // Detailed error logging
    logAxiosError(error, 'Response Interceptor');

    toast.error(errorMessage, {
      position: 'bottom-right',
      duration: 4000,
      style: {
        background: '#e74c3c',
        color: 'white',
        borderRadius: '10px',
      }
    });

    return Promise.reject(error);
  }
);

// Helper function to replace URL parameters
export function replaceUrlParams(url: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value), 
    url
  );
}

export default httpClient;
