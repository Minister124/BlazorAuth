import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

export default function RoleBasedRoute({ 
    children, 
    allowedRoles, 
    redirectTo = '/welcome' 
}: RoleBasedRouteProps) {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
