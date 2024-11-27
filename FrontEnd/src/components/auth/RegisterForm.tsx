import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { InputField } from './InputField';
import { PasswordStrength } from './PasswordStrength';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  onToggle: () => void;
}

export function RegisterForm({ onToggle }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('Registration successful!');
      onToggle();
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Create Account</h2>
      <p className="text-center text-gray-600 mb-8">Join our community today</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          icon={<User size={20} />}
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(value) => updateField('name', value)}
        />

        <InputField
          icon={<Mail size={20} />}
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(value) => updateField('email', value)}
        />

        <div className="space-y-2">
          <InputField
            icon={<Lock size={20} />}
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(value) => updateField('password', value)}
          />
          <PasswordStrength password={formData.password} />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-gray-600">
        Already have an account?{' '}
        <button
          onClick={onToggle}
          className="text-purple-600 hover:text-purple-500 font-semibold"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}