import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { environment } from '../../config/environment';
import { authService } from '../auth.service';

const api = axios.create({
    baseURL: environment.apiUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
            try {
                // Try to refresh the token
                const response = await authService.refreshToken();
                if (response?.token) {
                    // Retry the original request with the new token
                    originalRequest.headers['Authorization'] = `Bearer ${response.token}`;
                    originalRequest.headers['X-Retry'] = 'true';
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                authService.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
