import { Check, X, Info } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Permission } from '../../types/user';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/Card';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

interface PermissionMatrixProps {
  className?: string;
}

export function PermissionMatrix({ className }: PermissionMatrixProps) {
  const { roles } = useAuthStore();

  const permissions: { key: Permission; label: string; description: string }[] = [
    { key: 'create_user', label: 'Create Users', description: 'Can create new user accounts' },
    { key: 'edit_user', label: 'Edit Users', description: 'Can modify existing user details' },
    { key: 'delete_user', label: 'Delete Users', description: 'Can remove user accounts' },
    { key: 'manage_roles', label: 'Manage Roles', description: 'Can create and modify roles' },
    { key: 'view_analytics', label: 'View Analytics', description: 'Can access analytics dashboard' },
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>
          Manage role-based access control for different user roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium text-muted-foreground">
                  Permission
                </th>
                {roles.map(role => (
                  <th
                    key={role.id}
                    className="text-center p-2 font-medium"
                    style={{ color: role.color }}
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(permission => (
                <tr key={permission.key} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span>{permission.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        title={permission.description}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  {roles.map(role => (
                    <td key={role.id} className="text-center p-2">
                      {role.permissions.includes(permission.key) ? (
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}