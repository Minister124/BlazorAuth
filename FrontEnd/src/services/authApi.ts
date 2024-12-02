import { User, Role } from '../types/user';
import { API_CONFIG } from '../config/api';
import { mockUsers, mockRoles, generateMockToken } from '../mocks/mockData';

// Recreate the types here to avoid import issues
export interface LoginRequest {
  emailAddress: string;
  password: string;
}

export interface RegisterRequest {
  emailAddress: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  role?: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<User> => {
    console.log('Mock login request:', { 
      email: credentials.emailAddress, 
      password: '[REDACTED]' 
    });

    const user = mockUsers.find(u => 
      u.email.toLowerCase() === credentials.emailAddress.toLowerCase() && 
      u.hashedPassword === credentials.password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { token, refreshToken } = generateMockToken();
    localStorage.setItem(API_CONFIG.TOKEN.KEY, token);
    localStorage.setItem(API_CONFIG.TOKEN.REFRESH_KEY, refreshToken);

    console.log('Mock login successful');
    return user;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    console.log('Mock register request:', { 
      email: data.emailAddress 
    });

    if (mockUsers.some(u => u.email.toLowerCase() === data.emailAddress.toLowerCase())) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name: data.name || 'New User',
      email: data.emailAddress,
      role: data.role || mockRoles[1],
      avatar: 'https://example.com/default-avatar.png',
      createdAt: new Date(),
      departmentId: '2',
      status: 'active',
      hashedPassword: data.password
    };

    const { token, refreshToken } = generateMockToken();
    localStorage.setItem(API_CONFIG.TOKEN.KEY, token);
    localStorage.setItem(API_CONFIG.TOKEN.REFRESH_KEY, refreshToken);

    console.log('Mock registration successful');
    return newUser;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(API_CONFIG.TOKEN.KEY);
    localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
  },

  validateToken: async (): Promise<User> => {
    const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
    if (!token) {
      throw new Error('No token found');
    }
    // Return the first user (admin) for demo purposes
    return mockUsers[0];
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const { token, refreshToken } = generateMockToken();
    localStorage.setItem(API_CONFIG.TOKEN.KEY, token);
    localStorage.setItem(API_CONFIG.TOKEN.REFRESH_KEY, refreshToken);
    return { 
      user: mockUsers[0], 
      token, 
      refreshToken 
    };
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || mockRoles[1],
      avatar: userData.avatar || 'https://example.com/default-avatar.png',
      createdAt: new Date(),
      departmentId: userData.departmentId || '2',
      status: 'active',
      hashedPassword: 'MockPass123!' // Generate a mock password
    };
    return newUser;
  },

  deleteUser: async (userId: string): Promise<void> => {
    // Simulate user deletion
    console.log(`Mock delete user with ID: ${userId}`);
  },

  createAdmin: async (): Promise<void> => {
    // Simulate admin creation
    console.log('Mock create admin');
  }
};
