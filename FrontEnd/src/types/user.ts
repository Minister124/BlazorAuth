export type Permission = 
  | 'create_user' 
  | 'edit_user' 
  | 'delete_user' 
  | 'manage_roles' 
  | 'view_analytics'
  | 'view_users'
  | 'edit_profile'
  | 'manage_settings';

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  createdAt: Date;
  departmentId: string; // Changed from department string to departmentId for proper relationship
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  hashedPassword: string; // Never store plain passwords
}