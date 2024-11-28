import { User } from '../types/user';
import httpClient, { replaceUrlParams } from './httpClient';
import { API_CONFIG } from '../config/api';

// Types for API requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  roleId: string;
  departmentId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const response = await httpClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store tokens
    localStorage.setItem(API_CONFIG.TOKEN.KEY, response.data.token);
    localStorage.setItem(API_CONFIG.TOKEN.REFRESH_KEY, response.data.refreshToken);
    
    return response.data.user;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await httpClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    // Store tokens
    localStorage.setItem(API_CONFIG.TOKEN.KEY, response.data.token);
    localStorage.setItem(API_CONFIG.TOKEN.REFRESH_KEY, response.data.refreshToken);
    
    return response.data.user;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await httpClient.post<User>(
      API_CONFIG.ENDPOINTS.USERS.CREATE,
      data
    );
    return response.data;
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const url = replaceUrlParams(API_CONFIG.ENDPOINTS.USERS.UPDATE, { id: userId });
    const response = await httpClient.put<User>(url, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const url = replaceUrlParams(API_CONFIG.ENDPOINTS.USERS.DELETE, { id: userId });
    await httpClient.delete(url);
  },

  logout: async (): Promise<void> => {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem(API_CONFIG.TOKEN.KEY);
      localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
    }
  },

  validateToken: async (): Promise<User> => {
    const response = await httpClient.get<User>(API_CONFIG.ENDPOINTS.AUTH.VALIDATE);
    return response.data;
  },
};
