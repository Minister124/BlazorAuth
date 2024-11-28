import { create } from 'zustand';
import { User, Role } from '../types/user';
import { Department, CreateDepartmentInput, UpdateDepartmentInput, isDepartmentValid, isDepartment } from '../types/department';
import { authApi } from '../services/authApi';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  users: User[];
  roles: Role[];
  departments: Department[];
  initialized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  createRole: (roleData: Omit<Role, 'id'>) => void;
  updateRole: (roleId: string, roleData: Partial<Role>) => void;
  deleteRole: (roleId: string) => void;
  createDepartment: (departmentData: CreateDepartmentInput) => Promise<void>;
  updateDepartment: (departmentId: string, departmentData: UpdateDepartmentInput) => Promise<void>;
  deleteDepartment: (departmentId: string) => Promise<void>;
}

// Mock data for initial state
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: ['create_user', 'edit_user', 'delete_user', 'manage_roles', 'view_analytics', 'manage_departments'],
    color: '#EF4444',
  },
  {
    id: '2',
    name: 'User',
    description: 'Basic access',
    permissions: ['view_users', 'edit_profile'],
    color: '#3B82F6',
  },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [],
  roles: mockRoles,
  departments: [],
  initialized: false,
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      // In a real app, this would load initial data from the backend
      set({ initialized: true });
    } catch (error) {
      console.error('Failed to initialize:', error);
      toast.error('Failed to initialize application');
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const user = await authApi.login({ email, password });
      set({ user, isAuthenticated: true });
      toast.success('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid credentials');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true });
      const user = await authApi.register({ email, password, name });
      set({ user, isAuthenticated: true });
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  createUser: async (userData: Partial<User>) => {
    try {
      set({ isLoading: true });
      const newUser = await authApi.createUser({
        email: userData.email || '',
        name: userData.name || '',
        password: userData.hashedPassword,
        roleId: userData.role?.id || '2',
        departmentId: userData.departmentId || '1'
      });
      
      set(state => ({
        users: [...state.users, newUser]
      }));
      toast.success('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (userId: string, userData: Partial<User>) => {
    set(state => {
      const oldUser = state.users.find(u => u.id === userId);
      if (!oldUser) {
        toast.error('User not found');
        return state;
      }

      const updatedUsers = state.users.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      );

      // Update department employee counts if department changed
      let updatedDepartments = [...state.departments];
      if (userData.departmentId && oldUser.departmentId !== userData.departmentId) {
        updatedDepartments = state.departments.map(dept => {
          if (dept.id === oldUser.departmentId) {
            return { ...dept, employeeCount: Math.max(0, dept.employeeCount - 1) };
          }
          if (dept.id === userData.departmentId) {
            return { ...dept, employeeCount: dept.employeeCount + 1 };
          }
          return dept;
        });
      }

      return {
        users: updatedUsers,
        departments: updatedDepartments,
        user: state.user?.id === userId ? { ...state.user, ...userData } : state.user
      };
    });
    toast.success('User updated successfully!');
  },

  deleteUser: (userId: string) => {
    set(state => {
      const userToDelete = state.users.find(u => u.id === userId);
      if (!userToDelete) {
        toast.error('User not found');
        return state;
      }

      // Update department employee count
      const updatedDepartments = state.departments.map(dept =>
        dept.id === userToDelete.departmentId
          ? { ...dept, employeeCount: Math.max(0, dept.employeeCount - 1) }
          : dept
      );

      return {
        users: state.users.filter(user => user.id !== userId),
        departments: updatedDepartments,
        // If the deleted user is the current user, log them out
        user: state.user?.id === userId ? null : state.user,
        isAuthenticated: state.user?.id === userId ? false : state.isAuthenticated
      };
    });
    toast.success('User deleted successfully');
  },

  createRole: (roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      id: Date.now().toString(),
      ...roleData,
    };
    set(state => ({ roles: [...state.roles, newRole] }));
    toast.success('Role created successfully');
  },

  updateRole: (roleId: string, roleData: Partial<Role>) => {
    set(state => ({
      roles: state.roles.map(role =>
        role.id === roleId ? { ...role, ...roleData } : role
      ),
    }));
    toast.success('Role updated successfully');
  },

  deleteRole: (roleId: string) => {
    set(state => ({
      roles: state.roles.filter(role => role.id !== roleId),
    }));
    toast.success('Role deleted successfully');
  },

  createDepartment: async (departmentData: CreateDepartmentInput) => {
    if (!isDepartmentValid(departmentData)) {
      toast.error('Invalid department data');
      return;
    }

    try {
      // Simulate API call
      const newDepartment: Department = {
        id: Date.now().toString(),
        ...departmentData,
        createdAt: new Date(),
        employeeCount: 0
      };

      if (!isDepartment(newDepartment)) {
        throw new Error('Invalid department structure');
      }

      set(state => ({
        departments: [...state.departments, newDepartment]
      }));
      toast.success('Department created successfully');
    } catch (error) {
      toast.error('Failed to create department');
      throw error;
    }
  },

  updateDepartment: async (departmentId: string, departmentData: UpdateDepartmentInput) => {
    try {
      set(state => ({
        departments: state.departments.map(dept => {
          if (dept.id === departmentId) {
            const updatedDept = { ...dept, ...departmentData };
            if (!isDepartment(updatedDept)) {
              throw new Error('Invalid department structure after update');
            }
            return updatedDept;
          }
          return dept;
        })
      }));
      toast.success('Department updated successfully');
    } catch (error) {
      toast.error('Failed to update department');
      throw error;
    }
  },

  deleteDepartment: async (departmentId: string) => {
    try {
      set(state => ({
        departments: state.departments.filter(dept => dept.id !== departmentId)
      }));
      toast.success('Department deleted successfully');
    } catch (error) {
      toast.error('Failed to delete department');
      throw error;
    }
  },
}));