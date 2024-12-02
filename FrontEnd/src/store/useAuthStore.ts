import { create } from 'zustand';
import { User, Role } from '../types/user';
import { Department, CreateDepartmentInput, UpdateDepartmentInput } from '../types/department';
import { authApi, RegisterRequest } from '../services/authApi';
import toast from 'react-hot-toast';
import { mockUsers, mockRoles, mockDepartments } from '../mocks/mockData';

interface AuthState {
  user: User | null;
  users: User[];
  roles: Role[];
  departments: Department[];
  initialized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  createRole: (roleData: Omit<Role, 'id'>) => Promise<void>;
  updateRole: (roleId: string, roleData: Partial<Role>) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  createDepartment: (departmentData: CreateDepartmentInput) => Promise<void>;
  updateDepartment: (departmentId: string, departmentData: UpdateDepartmentInput) => Promise<void>;
  deleteDepartment: (departmentId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: mockUsers,
  roles: mockRoles,
  departments: mockDepartments,
  initialized: false,
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = mockUsers[0];
      set({ 
        user, 
        isAuthenticated: true, 
        initialized: true, 
        isLoading: false 
      });
      return user;
    } catch (error) {
      set({ 
        user: null,
        isAuthenticated: false, 
        initialized: true, 
        isLoading: false 
      });
      return null;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await authApi.login({ emailAddress: normalizedEmail, password });
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        initialized: true 
      });

      toast.success(`Welcome, ${user.name || user.email}!`, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#3498db',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#3498db',
        },
      });

      return user;
    } catch (error: any) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        initialized: true 
      });

      toast.error(error.message || 'Login Failed', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#e74c3c',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#e74c3c',
        },
      });

      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const user = await authApi.register(data);
      
      set({ 
        user,
        users: [...get().users, user],
        isAuthenticated: true,
        isLoading: false,
        initialized: true 
      });

      toast.success('Registration Successful!', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#2ecc71',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#2ecc71',
        },
      });

      return user;
    } catch (error: any) {
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true 
      });

      toast.error(error.message || 'Registration Failed', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#e74c3c',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#e74c3c',
        },
      });

      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      
      set({ 
        user: null, 
        isAuthenticated: false 
      });
      
      toast.success('Logged out successfully', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#2ecc71',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#2ecc71',
        },
      });
    } catch (error) {
      toast.error('Logout failed', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#e74c3c',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#e74c3c',
        },
      });
      throw error;
    }
  },

  createUser: async (userData: Partial<User>) => {
    try {
      set({ isLoading: true });
      const newUser = await authApi.createUser(userData);
      
      const currentUsers = get().users;
      set({ 
        users: [...currentUsers, newUser], 
        isLoading: false 
      });

      toast.success('User created successfully', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#4CAF50',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#FF5252',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#FF5252',
        },
      });
      set({ isLoading: false });
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Partial<User>) => {
    try {
      set({ isLoading: true });
      const currentUsers = get().users;
      const updatedUsers = currentUsers.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      );
      
      set({ 
        users: updatedUsers, 
        isLoading: false 
      });

      toast.success('User updated successfully', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#4CAF50',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#FF5252',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#FF5252',
        },
      });
      set({ isLoading: false });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      set({ isLoading: true });
      await authApi.deleteUser(userId);
      
      const { users, departments } = get();
      const userToDelete = users.find(u => u.id === userId);
      
      if (userToDelete) {
        const updatedUsers = users.filter(user => user.id !== userId);
        
        const updatedDepartments = departments.map(dept => 
          dept.id === userToDelete.departmentId
            ? { ...dept, employeeCount: (dept.employeeCount || 0) - 1 }
            : dept
        );
        
        set({ 
          users: updatedUsers, 
          departments: updatedDepartments,
          isLoading: false 
        });

        toast.success('User deleted successfully', {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: '#4CAF50',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#4CAF50',
          },
        });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#FF5252',
          color: 'white',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#FF5252',
        },
      });
      set({ isLoading: false });
      throw error;
    }
  },

  createRole: async (roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      id: (get().roles.length + 1).toString(),
      ...roleData
    };
    set(state => ({ roles: [...state.roles, newRole] }));
  },

  updateRole: async (roleId: string, roleData: Partial<Role>) => {
    set(state => ({
      roles: state.roles.map(role => 
        role.id === roleId ? { ...role, ...roleData } : role
      )
    }));
  },

  deleteRole: async (roleId: string) => {
    set(state => ({
      roles: state.roles.filter(role => role.id !== roleId)
    }));
  },

  createDepartment: async (departmentData: CreateDepartmentInput) => {
    const newDepartment: Department = {
      id: (get().departments.length + 1).toString(),
      ...departmentData,
      employeeCount: 0,
      createdAt: new Date()
    };
    set(state => ({ departments: [...state.departments, newDepartment] }));
  },

  updateDepartment: async (departmentId: string, departmentData: UpdateDepartmentInput) => {
    set(state => ({
      departments: state.departments.map(dept => 
        dept.id === departmentId ? { ...dept, ...departmentData } : dept
      )
    }));
  },

  deleteDepartment: async (departmentId: string) => {
    set(state => ({
      departments: state.departments.filter(dept => dept.id !== departmentId)
    }));
  },
}));