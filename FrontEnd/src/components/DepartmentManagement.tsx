import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Building } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Department, CreateDepartmentInput } from '../types/department';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { Select } from './shared/Select';
import { Card, CardHeader, CardTitle, CardContent } from './shared/Card';

export function DepartmentManagement() {
  const { departments, users, createDepartment, updateDepartment, deleteDepartment, user: currentUser } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentInput>({
    name: '',
    description: '',
    managerId: '',
  });

  const canViewDepartments = currentUser?.role.permissions.includes('view_departments');
  const canManageDepartments = currentUser?.role.permissions.includes('manage_departments');
  const canAssignManager = currentUser?.role.permissions.includes('assign_department_manager');

  // Function to get manager details by ID
  const getManagerDetails = (managerId: string | undefined) => {
    if (!managerId) return null;
    return users.find(user => user.id === managerId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData);
        setEditingDepartment(null);
      } else {
        await createDepartment(formData);
      }
      setIsCreating(false);
      setFormData({ name: '', description: '', managerId: '' });
    } catch (error) {
      console.error('Failed to save department:', error);
    }
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

  const handleDelete = async (departmentId: string) => {
    try {
      await deleteDepartment(departmentId);
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  if (!canViewDepartments) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-gray-500">You don't have permission to view departments.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter potential managers to those with appropriate permissions
  const potentialManagers = users.filter(u => 
    u.role.permissions.includes('manage_departments') || 
    u.role.permissions.includes('assign_department_manager')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-gray-500" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Department Management
          </h1>
        </div>
        {canManageDepartments && (
          <Button
            variant="outline"
            onClick={() => setIsCreating(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Department
          </Button>
        )}
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

              {canAssignManager && (
                <Select
                  label="Department Manager"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                >
                  <option value="">Select a manager</option>
                  {potentialManagers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              )}

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
                      Manager: {getManagerDetails(department.managerId)?.name || 'Unknown Manager'}
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
                  {canManageDepartments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(department)}
                      icon={<Edit2 className="w-4 h-4" />}
                    />
                  )}
                  {canManageDepartments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(department.id)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}