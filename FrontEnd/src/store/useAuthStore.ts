import { create } from 'zustand';
import { User, Role } from '../types/user';
import { Department } from '../types/department';
import toast from 'react-hot-toast';
import bcryptjs from 'bcryptjs';

// Secure password validation
const isPasswordValid = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
};

interface AuthState {
  user: User | null;
  users: User[];
  roles: Role[];
  departments: Department[];
  initialized: boolean;
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
  createDepartment: (departmentData: Omit<Department, 'id' | 'createdAt' | 'employeeCount'>) => void;
  updateDepartment: (departmentId: string, departmentData: Partial<Department>) => void;
  deleteDepartment: (departmentId: string) => void;
}

const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: ['create_user', 'edit_user', 'delete_user', 'manage_roles', 'view_analytics'],
    color: '#EF4444',
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Department management',
    permissions: ['create_user', 'edit_user', 'view_analytics'],
    color: '#F59E0B',
  },
  {
    id: '3',
    name: 'User',
    description: 'Basic access',
    permissions: ['view_analytics'],
    color: '#10B981',
  },
];

const defaultDepartments: Department[] = [
  {
    id: '1',
    name: 'IT Department',
    description: 'Information Technology',
    managerId: '1',
    createdAt: new Date(),
    employeeCount: 1,
  },
  {
    id: '2',
    name: 'HR Department',
    description: 'Human Resources',
    managerId: '2',
    createdAt: new Date(),
    employeeCount: 0,
  },
];

// Create default admin user with temporary password
const defaultAdmin: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: defaultRoles[0],
  departmentId: defaultDepartments[0].id,
  createdAt: new Date(),
  status: 'active',
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Admin User`,
  lastLogin: new Date(),
  hashedPassword: '' // Will be set during initialization
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  users: [defaultAdmin],
  roles: defaultRoles,
  departments: defaultDepartments,
  initialized: false,

  initialize: async () => {
    const state = get();
    if (state.initialized) return;

    try {
      const hashedPassword = await bcryptjs.hash('Admin123!@#', 10);
      const initializedAdmin = { ...defaultAdmin, hashedPassword };
      set({
        users: [initializedAdmin],
        initialized: true
      });
      console.log('AuthStore: Initialized with admin user');
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      throw error; // Propagate error to handle it in login
    }
  },

  login: async (email: string, password: string) => {
    const state = get();
    
    try {
      if (!state.initialized) {
        console.log('AuthStore: Initializing during login...');
        await state.initialize();
      }

      console.log('AuthStore: Login attempt with:', { email });
      const user = state.users.find(u => u.email === email);
      
      if (!user) {
        console.error('AuthStore: User not found');
        throw new Error('Invalid email or password');
      }

      console.log('AuthStore: Attempting password comparison...');
      const isValidPassword = await bcryptjs.compare(password, user.hashedPassword);
      console.log('AuthStore: Password comparison result:', isValidPassword);
      
      if (!isValidPassword) {
        console.error('AuthStore: Invalid password');
        throw new Error('Invalid email or password');
      }

      const updatedUser = { ...user, lastLogin: new Date() };
      set({ 
        user: updatedUser,
        users: state.users.map(u => u.id === user.id ? updatedUser : u)
      });
      
      console.log('AuthStore: Login successful');
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('AuthStore: Login error:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const state = get();
      if (!state.initialized) {
        await state.initialize();
      }

      if (!isPasswordValid(password)) {
        throw new Error(
          'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
        );
      }

      if (state.users.some(user => user.email === email)) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const defaultDepartmentId = defaultDepartments[0].id;
      
      const newUser: User = {
        id: String(Math.random()),
        email,
        name,
        role: defaultRoles[2], // Default to User role
        departmentId: defaultDepartmentId,
        createdAt: new Date(),
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        lastLogin: new Date(),
        hashedPassword
      };

      set(state => ({
        users: [...state.users, newUser]
      }));

      toast.success('Registration successful!');
    } catch (error) {
      console.error('AuthStore: Registration error:', error);
      throw error;
    }
  },

  logout: () => set({ user: null }),

  createUser: async (userData: Partial<User>) => {
    try {
      const state = get();
      if (!state.initialized) {
        await state.initialize();
      }

      const defaultDepartmentId = defaultDepartments[0].id;
      const newUser: User = {
        id: String(Math.random()),
        email: userData.email || '',
        name: userData.name || '',
        role: userData.role || defaultRoles[2],
        departmentId: userData.departmentId || defaultDepartmentId,
        createdAt: new Date(),
        status: userData.status || 'pending',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || '')}`,
        lastLogin: new Date(),
        hashedPassword: userData.hashedPassword || ''
      };

      set(state => ({
        users: [...state.users, newUser]
      }));

      toast.success('User created successfully!');
    } catch (error) {
      toast.error('Failed to create user');
      throw error;
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
        user: state.user?.id === userId ? null : state.user
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

  createDepartment: (departmentData: Omit<Department, 'id' | 'createdAt' | 'employeeCount'>) => {
    const newDepartment: Department = {
      id: Date.now().toString(),
      ...departmentData,
      createdAt: new Date(),
      employeeCount: 0,
    };
    set(state => ({ departments: [...state.departments, newDepartment] }));
    toast.success('Department created successfully');
  },

  updateDepartment: (departmentId: string, departmentData: Partial<Department>) => {
    set(state => ({
      departments: state.departments.map(dept =>
        dept.id === departmentId ? { ...dept, ...departmentData } : dept
      ),
    }));
    toast.success('Department updated successfully');
  },

  deleteDepartment: (departmentId: string) => {
    set(state => ({
      departments: state.departments.filter(dept => dept.id !== departmentId),
    }));
    toast.success('Department deleted successfully');
  },
}));