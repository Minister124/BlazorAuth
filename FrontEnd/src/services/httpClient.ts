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
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { token } = response.data;
        localStorage.setItem(API_CONFIG.TOKEN.KEY, token);

        // Retry the original request
        if (originalRequest) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['X-Retry'] = 'true';
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem(API_CONFIG.TOKEN.KEY);
        localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    let errorMessage = API_CONFIG.ERROR_MESSAGES.DEFAULT;
    
    if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || API_CONFIG.ERROR_MESSAGES.VALIDATION;
          break;
        case 401:
          errorMessage = API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 403:
          errorMessage = API_CONFIG.ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          errorMessage = API_CONFIG.ERROR_MESSAGES.NOT_FOUND;
          break;
        default:
          errorMessage = error.response.data?.message || API_CONFIG.ERROR_MESSAGES.DEFAULT;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = API_CONFIG.ERROR_MESSAGES.NETWORK;
    }

    toast.error(errorMessage);
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
