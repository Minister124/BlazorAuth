import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Settings,
  LogOut,
  User,
  X,
  Building,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import { Permission } from '../types/user';

interface NavigationProps {
  onClose: () => void;
}

export default function Navigation({ onClose }: NavigationProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigationItems: Array<{
    name: string;
    path: string;
    icon: React.ElementType;
    permission: Permission;
  }> = [
    {
      name: 'Users',
      path: '/users',
      icon: Users,
      permission: 'view_users' as Permission,
    },
    {
      name: 'Departments',
      path: '/departments',
      icon: Building,
      permission: 'view_departments' as Permission,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      permission: 'edit_profile' as Permission,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      permission: 'manage_settings' as Permission,
    },
  ].filter(item => {
    if (!item.permission || !user?.role?.permissions) return false;
    return user.role.permissions.includes(item.permission);
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card className="h-full border-0 rounded-none lg:rounded-lg lg:border">
      {/* Close button - only shown on mobile */}
      <div className="lg:hidden absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          icon={<X className="w-4 h-4" />}
        />
      </div>

      <nav className="space-y-6 p-4">
        {/* Navigation Links */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            logout();
            onClose();
          }}
          icon={<LogOut className="w-4 h-4" />}
        >
          Logout
        </Button>
      </nav>
    </Card>
  );
}
