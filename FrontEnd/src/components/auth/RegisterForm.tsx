import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../shared/Card';
import { RegisterRequest } from '../../services/authApi';

interface RegisterFormProps {
  onToggle: () => void;
  onSuccess: () => void;
}

const passwordStrength = (password: string): { score: number; message: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengthMap = [
    { message: 'Very weak', color: 'bg-destructive' },
    { message: 'Weak', color: 'bg-destructive/80' },
    { message: 'Fair', color: 'bg-yellow-500' },
    { message: 'Good', color: 'bg-emerald-500' },
    { message: 'Strong', color: 'bg-green-500' }
  ];

  return { 
    score, 
    ...strengthMap[score - 1] || strengthMap[0]
  };
};

export default function RegisterForm({ onToggle, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
      onSuccess();
      onToggle();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const strength = passwordStrength(formData.password);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <p className="text-center text-muted-foreground">
          Enter your information to create an account
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent>
          <Input
            label="Name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.emailAddress}
            onChange={(e) => updateField('emailAddress', e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
            
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-border">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[80px]">
                    {strength.message}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </CardContent>
      </form>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          Already have an account?{' '}
          <button
            onClick={onToggle}
            className="text-primary hover:text-primary/90 font-medium"
            type="button"
          >
            Sign in
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}