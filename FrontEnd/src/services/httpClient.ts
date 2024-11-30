import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api';
import toast from 'react-hot-toast';

interface ApiErrorResponse {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
  message?: string;
  type?: string;
  traceId?: string;
}

const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Request interceptor for API calls
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest?.headers['X-Retry']) {
      try {
        const refreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_KEY);
        if (!refreshToken) {
          localStorage.removeItem(API_CONFIG.TOKEN.KEY);
          localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        // Try to refresh the token
        const response = await axios.post<{ token: string }>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const newToken = response.data.token;
        localStorage.setItem(API_CONFIG.TOKEN.KEY, newToken);

        // Retry the original request
        if (originalRequest) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['X-Retry'] = 'true';
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(API_CONFIG.TOKEN.KEY);
        localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle validation errors and other responses
    if (error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      
      // Handle validation errors
      if (errorData.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`, {
              duration: 5000,
              style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#333',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                padding: '16px',
                maxWidth: '500px'
              },
            });
          });
        });
      }
      // Handle general error message
      else if (errorData.title) {
        toast.error(errorData.title);
      }
      else if (errorData.message) {
        toast.error(errorData.message);
      }
    } else if (error.message === 'Network Error') {
      toast.error('Unable to connect to the server. Please check your internet connection.');
    } else {
      toast.error('An unexpected error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default httpClient;

// Helper function to handle API endpoints with parameters
export const replaceUrlParams = (url: string, params: Record<string, string>) => {
  let finalUrl = url;
  Object.entries(params).forEach(([key, value]) => {
    finalUrl = finalUrl.replace(`:${key}`, value);
  });
  return finalUrl;
};
