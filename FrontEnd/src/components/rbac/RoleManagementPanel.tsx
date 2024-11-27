import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { RoleForm } from './RoleForm';
import { RoleList } from './RoleList';
import { PermissionMatrix } from './PermissionMatrix';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/Card';
import { Button } from '../shared/Button';

export function RoleManagementPanel() {
  const { user } = useAuthStore();
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  if (!user?.role.permissions.includes('manage_roles')) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="p-3 bg-muted inline-block rounded-full mb-4">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">Access Restricted</CardTitle>
          <CardDescription>
            You don't have permission to manage roles
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const handleEditRole = (roleId: string) => {
    setEditingRoleId(roleId);
    setShowRoleForm(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Configure and manage user roles and permissions
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRoleId(null);
            setShowRoleForm(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoleList
          onEditRole={handleEditRole}
        />
        <PermissionMatrix />
      </div>

      {showRoleForm && (
        <RoleForm
          onClose={() => {
            setShowRoleForm(false);
            setEditingRoleId(null);
          }}
          editingRoleId={editingRoleId}
        />
      )}
    </div>
  );
}