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
  users: [],
  roles: [],
  departments: [],
  initialized: false,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const user = await authApi.validateToken();
      set({ user, isAuthenticated: true, initialized: true, isLoading: false });
    } catch (error) {
      set({ initialized: true, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await authApi.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Login successful');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Invalid credentials');
      throw error;
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
        roleId: userData.role?.id || '',
        departmentId: userData.departmentId || ''
      });
      
      // Use get() to ensure we have the latest state
      const currentUsers = get().users;
      set({ users: [...currentUsers, newUser], isLoading: false });
      toast.success('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
      set({ isLoading: false });
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Partial<User>) => {
    return new Promise<void>((resolve, reject) => {
      try {
        set(state => {
          const oldUser = state.users.find(u => u.id === userId);
          if (!oldUser) {
            reject(new Error('User not found'));
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
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteUser: async (userId: string) => {
    try {
      set({ isLoading: true });
      await authApi.deleteUser(userId);
      
      // Use get() to ensure we have the latest state
      const { users, departments } = get();
      const userToDelete = users.find(u => u.id === userId);
      
      if (userToDelete) {
        // Update users list
        const updatedUsers = users.filter(user => user.id !== userId);
        
        // Update department counts if needed
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
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
      set({ isLoading: false });
      throw error;
    }
  },

  createRole: async (roleData: Omit<Role, 'id'>) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const newRole: Role = {
          id: Date.now().toString(),
          ...roleData,
        };
        set(state => ({ roles: [...state.roles, newRole] }));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  updateRole: async (roleId: string, roleData: Partial<Role>) => {
    return new Promise<void>((resolve, reject) => {
      try {
        set(state => ({
          roles: state.roles.map(role =>
            role.id === roleId ? { ...role, ...roleData } : role
          ),
        }));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteRole: async (roleId: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        set(state => ({
          roles: state.roles.filter(role => role.id !== roleId),
        }));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  createDepartment: async (departmentData: CreateDepartmentInput) => {
    if (!isDepartmentValid(departmentData)) {
      throw new Error('Invalid department data');
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