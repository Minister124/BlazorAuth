import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { UserList } from '../components/UserList';
import { UserCreationForm } from '../components/UserCreationForm';
import { DepartmentManagement } from '../components/DepartmentManagement';
import { UserProfile } from '../components/profile/UserProfile';
import { AuthForm } from '../components/AuthForm';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/users" element={<UserList />} />
      {user?.canCreateUsers && (
        <Route path="/create-user" element={<UserCreationForm />} />
      )}
      <Route path="/departments" element={<DepartmentManagement />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/" element={<Navigate to="/users" replace />} />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};

export default AppRoutes;
