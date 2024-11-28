import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/users');
  };

  const handleToggleForm = () => {
    // Handle registration toggle if needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm onSuccess={handleLoginSuccess} onToggle={handleToggleForm} />
    </div>
  );
}
