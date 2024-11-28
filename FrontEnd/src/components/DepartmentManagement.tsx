import React, { useState } from 'react';
import { Building, Users, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Department } from '../types/department';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { Select } from './shared/Select';
import { Card, CardHeader, CardTitle, CardContent } from './shared/Card';

export function DepartmentManagement() {
  const { departments, users, createDepartment, updateDepartment, deleteDepartment, user: currentUser } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
  });

  const canManageDepartments = currentUser?.role.permissions.includes('manage_roles');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDepartment) {
      updateDepartment(editingDepartment.id, formData);
      setEditingDepartment(null);
    } else {
      createDepartment(formData);
    }
    setIsCreating(false);
    setFormData({ name: '', description: '', managerId: '' });
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      managerId: department.managerId || '',
    });
    setIsCreating(true);
  };

  if (!canManageDepartments) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <CardTitle className="mt-4">Access Restricted</CardTitle>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have permission to manage departments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Department Management
        </h1>
        <Button
          variant="outline"
          onClick={() => setIsCreating(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Department
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDepartment ? 'Update Department' : 'Create Department'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Department Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter department name"
                required
              />

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter department description"
              />

              <Select
                label="Department Manager"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                icon={<Users className="w-4 h-4" />}
              >
                <option value="">Select a manager</option>
                {users
                  .filter(u => u.role.name === 'Manager')
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </Select>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingDepartment(null);
                    setFormData({ name: '', description: '', managerId: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id} variant="hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {department.name}
                  </h3>
                  {department.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {department.description}
                    </p>
                  )}
                  {department.managerId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manager ID: {department.managerId}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {department.employeeCount} employees
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(department)}
                    icon={<Edit2 className="w-4 h-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDepartment(department.id)}
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}