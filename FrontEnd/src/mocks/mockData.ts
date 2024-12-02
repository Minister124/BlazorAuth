import { User, Role} from '../types/user';
import { Department } from '../types/department';

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    color: '#3B82F6',
    permissions: ['view_users', 'create_user', 'manage_roles', 'view_analytics', 'view_departments', 'assign_department_manager', 'edit_profile', 'manage_settings']
  },
  {
    id: '2',
    name: 'User',
    description: 'Standard user access',
    color: '#10B981',
    permissions: ['edit_profile']
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: mockRoles[0],
    avatar: 'https://example.com/admin-avatar.png',
    createdAt: new Date(),
    departmentId: '1',
    status: 'active',
    lastLogin: new Date(),
    hashedPassword: 'AdminPass123!' // Note: In real app, this would be a hashed password
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: mockRoles[1],
    avatar: 'https://example.com/user-avatar.png',
    createdAt: new Date(),
    departmentId: '2',
    status: 'active',
    hashedPassword: 'UserPass123!' // Note: In real app, this would be a hashed password
  }
];

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software Development Department',
    managerId: '1',
    employeeCount: 1,
    createdAt: new Date() 
  },
  {
    id: '2',
    name: 'HR',
    description: 'Human Resources Department',
    managerId: '2',
    employeeCount: 1,
    createdAt: new Date() 
  }
];

export const generateMockToken = () => {
  return {
    token: 'mock_access_token_' + Math.random().toString(36).substring(7),
    refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7)
  };
};
