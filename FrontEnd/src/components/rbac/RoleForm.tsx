import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Permission } from '../../types/user';
import { toast } from 'react-hot-toast';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../shared/Card';
import { Checkbox } from '../shared/Checkbox';
import { Label } from '../shared/Label';

interface RoleFormProps {
  onClose: () => void;
}

export function RoleForm({ onClose }: RoleFormProps) {
  const { createRole } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[],
    color: '#4F46E5',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createRole(formData);
      toast.success('Role created successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePermissions: { value: Permission; label: string; description: string }[] = [
    { value: 'create_user', label: 'Create Users', description: 'Can create new user accounts' },
    { value: 'edit_user', label: 'Edit Users', description: 'Can modify existing user details' },
    { value: 'delete_user', label: 'Delete Users', description: 'Can remove user accounts' },
    { value: 'manage_roles', label: 'Manage Roles', description: 'Can create and modify roles' },
    { value: 'view_analytics', label: 'View Analytics', description: 'Can access analytics dashboard' },
  ];

  const togglePermission = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Create New Role</CardTitle>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Role Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="font-mono"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {availablePermissions.map(permission => (
                  <div
                    key={permission.value}
                    className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                  >
                    <Checkbox
                      id={permission.value}
                      checked={formData.permissions.includes(permission.value)}
                      onCheckedChange={() => togglePermission(permission.value)}
                    />
                    <Label
                      htmlFor={permission.value}
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="font-medium">{permission.label}</span>
                      <span className="text-sm text-muted-foreground">{permission.description}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Create Role
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}