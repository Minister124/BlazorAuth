import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api';
import toast from 'react-hot-toast';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
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
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post<{ token: string }>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newToken = response.data.token;
        localStorage.setItem(API_CONFIG.TOKEN.KEY, newToken);

        // Retry the original request with the new token
        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest.headers['X-Retry'] = 'true';
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        localStorage.removeItem(API_CONFIG.TOKEN.KEY);
        localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 403) {
      toast.error(API_CONFIG.ERROR_MESSAGES.FORBIDDEN);
    } else if (error.response?.status === 404) {
      toast.error(API_CONFIG.ERROR_MESSAGES.NOT_FOUND);
    } else if (!error.response) {
      toast.error(API_CONFIG.ERROR_MESSAGES.NETWORK);
    } else {
      toast.error(API_CONFIG.ERROR_MESSAGES.DEFAULT);
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
