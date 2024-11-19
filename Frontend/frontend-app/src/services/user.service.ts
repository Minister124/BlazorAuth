import api from './api/axios';

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export const userService = {
    getProfile: async () => {
        const response = await api.get<UserProfile>('/users/profile');
        return response.data;
    },

    updateProfile: async (data: UserProfile) => {
        const response = await api.put<UserProfile>('/users/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordData) => {
        const response = await api.post('/users/change-password', data);
        return response.data;
    }
};
