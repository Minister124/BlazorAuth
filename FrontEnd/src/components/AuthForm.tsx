import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const passwordStrength = (password: string): { score: number; message: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const messages = [
    'Very weak',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ];

  return { score, message: messages[score - 1] || 'Very weak' };
};

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuthStore();

  const strength = passwordStrength(password);
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-400',
    'bg-green-500'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { isLogin, email, password: '***' });
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              aria-label="Full Name"
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            aria-label="Email Address"
          />
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      index <= strength.score ? strengthColors[strength.score - 1] : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-sm ${strength.score >= 4 ? 'text-green-600' : 'text-gray-500'}`}>
                Password strength: {strength.message}
              </p>
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : null}
          {isLogin ? 'Sign In' : 'Sign Up'}
        </motion.button>
      </form>
      <p className="mt-6 text-center text-gray-600">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 text-blue-500 hover:text-blue-600 font-medium focus:outline-none focus:underline"
          type="button"
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </motion.div>
  );
}