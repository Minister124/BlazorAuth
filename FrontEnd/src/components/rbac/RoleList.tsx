import { Edit2, Trash2, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

interface RoleListProps {
  className?: string;
  onEditRole?: (roleId: string) => void;
}

export function RoleList({ className, onEditRole }: RoleListProps) {
  const { roles, deleteRole } = useAuthStore();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Manage and organize user roles</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-background"
                style={{ backgroundColor: role.color }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{role.name}</h4>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ 
                      borderColor: role.color,
                      color: role.color,
                    }}
                  >
                    {role.permissions.length} permissions
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEditRole && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditRole(role.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteRole(role.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No roles have been created yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}