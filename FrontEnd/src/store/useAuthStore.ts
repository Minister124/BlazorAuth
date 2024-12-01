import { create } from 'zustand';
import { User, Role } from '../types/user';
import { Department, CreateDepartmentInput, UpdateDepartmentInput } from '../types/department';
import { authApi, RegisterRequest } from '../services/authApi';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../config/api';

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

// Department Validation Functions
const isDepartmentValid = (departmentData: CreateDepartmentInput | UpdateDepartmentInput): boolean => {
  if (!departmentData.name || 
      departmentData.name.trim().length === 0 || 
      departmentData.name.length > 100) {
    return false;
  }

  if (departmentData.description === undefined) {
    return false;
  }

  return true;
};

const isDepartment = (department: Department): boolean => {
  return (
    department.id !== undefined && 
    department.name !== undefined && 
    department.name.trim().length > 0 &&
    department.description !== undefined &&
    department.createdAt instanceof Date &&
    department.employeeCount !== undefined &&
    department.employeeCount >= 0
  );
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [],
  roles: [],
  departments: [],
  initialized: false,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Check for tokens in localStorage
      const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
      const refreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_KEY);

      if (token && refreshToken) {
        try {
          // Attempt to validate the current token
          const user = await authApi.validateToken();
          set({ 
            user, 
            isAuthenticated: true, 
            initialized: true, 
            isLoading: false 
          });
          return user;
        } catch (refreshError) {
          // If validation fails, try to refresh the token
          try {
            await authApi.refreshToken({ token });
            
            // Validate the new token
            const user = await authApi.validateToken();
            set({ 
              user, 
              isAuthenticated: true, 
              initialized: true, 
              isLoading: false 
            });
            return user;
          } catch (error) {
            // If refresh fails, clear all tokens
            localStorage.removeItem(API_CONFIG.TOKEN.KEY);
            localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
            
            set({ 
              user: null, 
              isAuthenticated: false, 
              initialized: true, 
              isLoading: false 
            });
            return null;
          }
        }
      } else {
        set({ 
          user: null,
          isAuthenticated: false, 
          initialized: true, 
          isLoading: false 
        });
        return null;
      }
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
      // Ensure email and password are valid
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Normalize email (trim whitespace)
      const normalizedEmail = email.trim().toLowerCase();

      // Login with normalized credentials
      const user = await authApi.login({ emailAddress: normalizedEmail, password });
      
      // Explicitly set tokens in localStorage to ensure persistence
      const token = localStorage.getItem(API_CONFIG.TOKEN.KEY);
      const refreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_KEY);

      if (!token || !refreshToken) {
        throw new Error('Token storage failed');
      }
      
      // Update store state
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        initialized: true 
      });

      // Success toast
      toast.success(`Welcome, ${user.name || user.email}!`, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#3498db',  // Soft blue
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
      // Reset authentication state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        initialized: true 
      });

      // Remove any potentially invalid tokens
      localStorage.removeItem(API_CONFIG.TOKEN.KEY);
      localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);

      // Error toast
      toast.error(error.response?.data?.message || 'Login Failed', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#e74c3c',  // Soft red
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
      
      // Clear tokens from both localStorage and sessionStorage
      localStorage.removeItem(API_CONFIG.TOKEN.KEY);
      localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
      sessionStorage.removeItem(API_CONFIG.TOKEN.KEY);
      sessionStorage.removeItem(API_CONFIG.TOKEN.REFRESH_KEY);
      
      set({ 
        user: null, 
        isAuthenticated: false 
      });
      
      toast.success('Logged out successfully', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#2ecc71',  // Soft green
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
          background: '#e74c3c',  // Soft red
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
      // Validate input data
      if (!data.emailAddress || !data.password || !data.userName) {
        throw new Error('All fields are required for registration');
      }

      // Normalize email and username
      const normalizedEmail = data.emailAddress.trim().toLowerCase();
      const normalizedUsername = data.userName.trim();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Ensure passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Attempt registration with normalized data
      const registrationData: RegisterRequest = {
        ...data,
        emailAddress: normalizedEmail,
        userName: normalizedUsername,
        name: normalizedUsername,  // Use username as name if not provided
        role: data.role || 'User'  // Default to User role if not specified
      };

      const user = await authApi.register(registrationData);
      
      // Success toast
      toast.success('Registration Successful! Please log in.', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#2ecc71',  // Soft green
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#2ecc71',
        },
      });

      set({ 
        user,
        isAuthenticated: true,
        isLoading: false,
        initialized: true 
      });

      return user;
    } catch (error: any) {
      // Reset loading state
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true 
      });

      // Detailed error handling
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Registration Failed';

      // Error toast with detailed message
      toast.error(errorMessage, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#e74c3c',  // Soft red
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#e74c3c',
        },
      });

      // Log the full error for debugging
      console.error('Registration Error:', {
        message: errorMessage,
        fullError: error,
        requestData: {
          emailAddress: data.emailAddress,
          userName: data.userName,
          // Do not log password
        }
      });

      // Rethrow the error for potential further handling
      throw error;
    }
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
      toast.success('Department created successfully', {
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
      toast.error('Failed to create department', {
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
      toast.success('Department updated successfully', {
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
      toast.error('Failed to update department', {
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
      throw error;
    }
  },

  deleteDepartment: async (departmentId: string) => {
    try {
      set(state => ({
        departments: state.departments.filter(dept => dept.id !== departmentId)
      }));
      toast.success('Department deleted successfully', {
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
      toast.error('Failed to delete department', {
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
      throw error;
    }
  },
}));