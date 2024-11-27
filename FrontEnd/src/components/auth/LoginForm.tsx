import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Github, Linkedin } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { SocialButton } from './SocialButton';
import { InputField } from './InputField';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSuccess: () => void;
  onToggle: () => void;
}

export function LoginForm({ onSuccess, onToggle }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      onSuccess();
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="glass-panel p-8"
      whileHover={{ boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.2)" }}
    >
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Welcome Back</h2>
      <p className="text-center text-white/60 mb-8">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          icon={<Mail size={20} />}
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
        />

        <InputField
          icon={<Lock size={20} />}
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 btn-primary font-semibold disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-white/60 bg-[#0A0F1C]/80 backdrop-blur-xl">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <SocialButton icon={<Github size={20} />} onClick={() => {}} provider="GitHub" />
          <SocialButton icon={<Linkedin size={20} />} onClick={() => {}} provider="LinkedIn" />
        </div>
      </div>

      <p className="mt-8 text-center text-white/60">
        Don't have an account?{' '}
        <button
          onClick={onToggle}
          className="text-[#FF3366] hover:text-[#FF6B98] font-semibold"
        >
          Sign Up
        </button>
      </p>
    </motion.div>
  );
}