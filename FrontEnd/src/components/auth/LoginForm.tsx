import React, { useState } from 'react';
import { Mail, Lock, Github, Linkedin, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../shared/Card';

interface LoginFormProps {
  onSuccess: () => void;
  onToggle: () => void;
}

export function LoginForm({ onSuccess, onToggle }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      onSuccess();
    } catch (error) {
      console.error('LoginForm error:', error);
      toast.error(error instanceof Error ? error.message : 'Invalid credentials');
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
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => {}}
            icon={<Github className="w-4 h-4" />}
            className="bg-[#24292e] hover:bg-[#1a1e22] text-white border-[#24292e] 
                     hover:border-[#1a1e22] transition-all duration-200
                     dark:bg-[#333] dark:hover:bg-[#444] dark:border-[#444]
                     flex items-center justify-center gap-2"
          >
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => {}}
            icon={<Linkedin className="w-4 h-4" />}
            className="bg-[#0A66C2] hover:bg-[#004182] text-white border-[#0A66C2] 
                     hover:border-[#004182] transition-all duration-200
                     dark:bg-[#0073b1] dark:hover:bg-[#005582] dark:border-[#0073b1]
                     flex items-center justify-center gap-2"
          >
            LinkedIn
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggle}
            className="underline hover:text-primary"
          >
            Sign up
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}