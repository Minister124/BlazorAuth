import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './shared/Card';

const passwordStrength = (password: string): { score: number; message: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengthMap = [
    { message: 'Very weak', color: 'bg-red-500' },
    { message: 'Weak', color: 'bg-orange-500' },
    { message: 'Fair', color: 'bg-yellow-500' },
    { message: 'Good', color: 'bg-green-500' },
    { message: 'Strong', color: 'bg-emerald-500' }
  ];

  return { 
    score, 
    ...strengthMap[score - 1] || strengthMap[0]
  };
};

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        if (passwordStrength(password).score < 3) {
          toast.error('Please choose a stronger password');
          return;
        }
        await register(name, email, password);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {isLogin ? 'Welcome back!' : 'Create an account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  icon={<User className="w-4 h-4" />}
                  required
                />
              )}
              
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  required
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                {!isLogin && password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full rounded-full transition-all ${strength.color}`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {strength.message}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}