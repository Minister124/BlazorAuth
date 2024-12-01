import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  const { 
    isAuthenticated, 
    user, 
    initialize, 
    initialized,
    isLoading 
  } = useAuthStore();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Only run initialization if not already initialized
    if (!initialized) {
      checkAuth();
    } else {
      setIsInitializing(false);
    }
  }, [initialize, initialized]);

  // Show loading state during initialization
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Authenticating...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    toast.error('Please log in to access this page', {
      position: 'bottom-right',
      duration: 3000,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is provided
  if (requiredRoles && user) {
    const userRoles = user.role ? [user.role.name] : [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      toast.error('You do not have permission to access this page', {
        position: 'bottom-right',
        duration: 3000,
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
