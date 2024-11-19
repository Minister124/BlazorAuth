import api from './api/axios';

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

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const response = await api.post<AuthResponse>('identity/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response.data;
    },

    register: async (userData: RegisterData) => {
        const response = await api.post<AuthResponse>('identity/create', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    },

    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;
        
        try {
            const response = await api.post<AuthResponse>('identity/refresh-token', {
                refreshToken
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return null;
        }
    },

    getRoles: async () => {
        const response = await api.post<RoleResponse[]>('identity/role/list');
        return response.data;
    },

    createRole: async (name: string) => {
        const response = await api.post<AuthResponse>('identity/role/create', { name });
        return response.data;
    },

    getUsersWithRoles: async () => {
        const response = await api.post<UserWithRolesResponse[]>('identity/users-with-roles');
        return response.data;
    },

    changeUserRole: async (userEmail: string, roleName: string) => {
        const response = await api.post<AuthResponse>('identity/change-user-role', {
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
