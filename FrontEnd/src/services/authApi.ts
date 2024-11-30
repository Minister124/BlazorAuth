import { User } from '../types/user';
import httpClient, { replaceUrlParams } from './httpClient';
import { API_CONFIG } from '../config/api';

// Types for API requests
export interface LoginRequest {
  emailAddress: string;
  password: string;
}

export interface RegisterRequest {
  emailAddress: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: string;
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
    console.log('Sending login request:', {
      url: API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials: { ...credentials, password: '[REDACTED]' }
    });

    const response = await httpClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    console.log('Login response:', {
      user: response.data.user,
      tokenReceived: !!response.data.token,
      refreshTokenReceived: !!response.data.refreshToken
    });
    
    if (response.data.token && response.data.refreshToken) {
      localStorage.setItem(API_CONFIG.TOKEN.KEY, response.data.token);
      localStorage.setItem(API_CONFIG.TOKEN.REFRESH_KEY, response.data.refreshToken);
      console.log('Tokens stored in localStorage');
    } else {
      console.error('Invalid response from server: Missing tokens');
      throw new Error('Invalid response from server: Missing tokens');
    }
    
    return response.data.user;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    console.log('Sending registration request:', {
      url: API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data: { ...data, password: '[REDACTED]' }
    });

    const response = await httpClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );

    console.log('Registration response:', {
      success: !!response.data,
      user: response.data?.user,
      tokenReceived: !!response.data?.token
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data.user;
  },

  createAdmin: async (): Promise<void> => {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.CREATE_ADMIN);
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
    const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await httpClient.get<{ user: User }>(
      API_CONFIG.ENDPOINTS.AUTH.VALIDATE
    );
    
    return response.data.user;
  },
};
