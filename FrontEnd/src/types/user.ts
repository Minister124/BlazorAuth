export type Permission = 'create_user' | 'edit_user' | 'delete_user' | 'manage_roles' | 'view_analytics';

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
  department?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
}