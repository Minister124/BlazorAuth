import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../shared/Card';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (error) {
      // Error will be handled by HTTP interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <p className="text-center text-muted-foreground">
          Sign in to your account
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              icon={<Mail className="w-5 h-5" />}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              icon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              required
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mt-2">
              <p>Password requirements:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>At least 8 characters long</li>
                <li>Must contain at least one uppercase letter</li>
                <li>Must contain at least one lowercase letter</li>
                <li>Must contain at least one number</li>
                <li>Must contain at least one special character</li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}