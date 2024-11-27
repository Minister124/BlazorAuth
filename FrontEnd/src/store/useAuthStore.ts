import { create } from 'zustand';
import { User, Role, Permission } from '../types/user';
import { Department } from '../types/department';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  users: User[];
  roles: Role[];
  departments: Department[];
  login: (email: string, password: string) => Promise<void>;
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
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: defaultRoles[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      createdAt: new Date(),
      status: 'active',
      department: 'IT Department',
      lastLogin: new Date(),
    },
  ],
  roles: defaultRoles,
  departments: defaultDepartments,

  login: async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = get().users.find(u => u.email === email);
    if (user) {
      set({ user: { ...user, lastLogin: new Date() } });
      toast.success('Welcome back!');
    } else {
      throw new Error('Invalid credentials');
    }
  },

  logout: () => set({ user: null }),

  createUser: async (userData) => {
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      name: userData.name!,
      role: userData.role || defaultRoles[2],
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      createdAt: new Date(),
      status: 'active',
      department: userData.department,
      lastLogin: undefined,
    };
    set(state => ({ users: [...state.users, newUser] }));
    toast.success('User created successfully');
  },

  updateUser: (userId, userData) => {
    set(state => ({
      users: state.users.map(user =>
        user.id === userId ? { ...user, ...userData } : user
      ),
    }));
    toast.success('User updated successfully');
  },

  deleteUser: (userId) => {
    set(state => ({
      users: state.users.filter(user => user.id !== userId),
    }));
    toast.success('User deleted successfully');
  },

  createRole: (roleData) => {
    const newRole: Role = {
      id: Date.now().toString(),
      ...roleData,
    };
    set(state => ({ roles: [...state.roles, newRole] }));
    toast.success('Role created successfully');
  },

  updateRole: (roleId, roleData) => {
    set(state => ({
      roles: state.roles.map(role =>
        role.id === roleId ? { ...role, ...roleData } : role
      ),
    }));
    toast.success('Role updated successfully');
  },

  deleteRole: (roleId) => {
    set(state => ({
      roles: state.roles.filter(role => role.id !== roleId),
    }));
    toast.success('Role deleted successfully');
  },

  createDepartment: (departmentData) => {
    const newDepartment: Department = {
      id: Date.now().toString(),
      ...departmentData,
      createdAt: new Date(),
      employeeCount: 0,
    };
    set(state => ({ departments: [...state.departments, newDepartment] }));
    toast.success('Department created successfully');
  },

  updateDepartment: (departmentId, departmentData) => {
    set(state => ({
      departments: state.departments.map(dept =>
        dept.id === departmentId ? { ...dept, ...departmentData } : dept
      ),
    }));
    toast.success('Department updated successfully');
  },

  deleteDepartment: (departmentId) => {
    set(state => ({
      departments: state.departments.filter(dept => dept.id !== departmentId),
    }));
    toast.success('Department deleted successfully');
  },
}));