import { Camera, Mail } from 'lucide-react';
import { User } from '../../types/user';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

interface ProfileHeaderProps {
  user: User;
  onAvatarClick?: () => void;
  className?: string;
}

export function ProfileHeader({ user, onAvatarClick, className }: ProfileHeaderProps) {
  return (
    <Card className={cn("relative overflow-hidden border-none", className)}>
      <div className="h-32 bg-gradient-to-r from-primary to-primary/60" />
      <div className="px-6">
        <div className="relative -mt-16 flex flex-col sm:flex-row sm:items-end gap-6 mb-4">
          <div className="relative group shrink-0">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-background bg-background object-cover shadow-md"
            />
            {onAvatarClick && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onAvatarClick}
              >
                <Camera className="w-6 h-6 text-white" />
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.role && (
                <Badge variant={user.role.name === 'admin' ? 'default' : 'info'} style={{ backgroundColor: user.role.color }}>
                  {user.role.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground gap-1">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {user.departmentId && (
              <Badge variant="default" size="sm" className="mt-1">
                {user.departmentId}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}