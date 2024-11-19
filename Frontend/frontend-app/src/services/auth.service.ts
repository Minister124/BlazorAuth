import api from './api/axios';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
    emailAddress?: string;
    userName?: string;
    password: string;
}

export interface RegisterData {
    name: string;
    userName: string;
    emailAddress: string;
    password: string;
    confirmPassword: string;
    role: string;
}

export interface AuthResponse {
    flag: boolean;
    message: string;
    token?: string;
    refreshToken?: string;
}

export interface RoleResponse {
    id: string;
    name: string;
}

export interface UserWithRolesResponse {
    id: string;
    userName: string;
    emailAddress: string;
    roles: string[];
}

export interface UserData {
    userName: string;
    email: string;
    role: string;
    name: string;
}

const decodeToken = (token: string): UserData | null => {
    try {
        const decoded = jwtDecode<any>(token);
        return {
            userName: decoded.unique_name || decoded.name,
            email: decoded.email,
            role: decoded.role,
            name: decoded.given_name || decoded.name
        };
    } catch {
        return null;
    }
};

const setAuthData = (response: AuthResponse) => {
    if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        const userData = decodeToken(response.token);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }
};

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const response = await api.post<AuthResponse>('api/Account/identity/login', credentials);
        if (response.data.flag && response.data.token) {
            setAuthData(response.data);
        }
        return response.data;
    },

    register: async (userData: RegisterData) => {
        const response = await api.post<AuthResponse>('api/Account/identity/create', userData);
        // Don't store auth data after registration, user needs to log in explicitly
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;
        
        try {
            const response = await api.post<AuthResponse>('api/Account/identity/refresh-token', {
                refreshToken
            });
            setAuthData(response.data);
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return null;
        }
    },

    getRoles: async () => {
        const response = await api.post<RoleResponse[]>('api/Account/identity/role/list');
        return response.data;
    },

    createRole: async (name: string) => {
        const response = await api.post<AuthResponse>('api/Account/identity/role/create', { name });
        return response.data;
    },

    getUsersWithRoles: async () => {
        const response = await api.post<UserWithRolesResponse[]>('identity/users-with-roles');
        return response.data;
    },

    changeUserRole: async (userEmail: string, roleName: string) => {
        const response = await api.post<AuthResponse>('api/Account/identity/admin/change-role', {
            userEmail,
            roleName
        });
        return response.data;
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
