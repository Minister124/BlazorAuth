import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/users');
  };

  const handleToggleForm = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <RegisterForm onSuccess={handleRegisterSuccess} onToggle={handleToggleForm} />
    </div>
  );
}
