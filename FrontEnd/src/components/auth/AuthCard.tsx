import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaGithub, FaMoon, FaSun } from 'react-icons/fa';
import classNames from 'classnames';

interface AuthCardProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ isDarkMode, onThemeToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const cardClass = classNames(
    'w-full max-w-md p-8 rounded-2xl backdrop-blur-md shadow-xl',
    'transition-colors duration-300',
    {
      'bg-white/20': !isDarkMode,
      'bg-navy/20': isDarkMode,
    }
  );

  const inputClass = (isFocused: boolean, hasValue: boolean) =>
    classNames(
      'w-full px-4 py-3 rounded-lg outline-none transition-all duration-300',
      'border-2',
      {
        'border-transparent': !isFocused,
        'border-blue-500': isFocused,
        'bg-white/80': !isDarkMode,
        'bg-gray-900/50': isDarkMode,
        'text-gray-900': !isDarkMode,
        'text-white': isDarkMode,
      }
    );

  const labelClass = (isFocused: boolean, hasValue: boolean) =>
    classNames(
      'absolute left-4 transition-all duration-200',
      {
        'top-3 text-gray-500': !isFocused && !hasValue,
        'top-[-10px] text-sm text-blue-500': isFocused || hasValue,
        'bg-white/50 px-2': !isDarkMode && (isFocused || hasValue),
        'bg-gray-900/50 px-2': isDarkMode && (isFocused || hasValue),
      }
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClass}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sign In
        </h2>
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-full transition-colors ${
            isDarkMode ? 'bg-gray-800 text-yellow-500' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            className={inputClass(isEmailFocused, email.length > 0)}
          />
          <label className={labelClass(isEmailFocused, email.length > 0)}>
            Email
          </label>
        </div>

        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className={inputClass(isPasswordFocused, password.length > 0)}
          />
          <label className={labelClass(isPasswordFocused, password.length > 0)}>
            Password
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isDarkMode
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Sign In
        </motion.button>

        <div className="relative flex items-center gap-3 my-8">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            or continue with
          </span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <FaGoogle size={20} />
            <span>Google</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <FaGithub size={20} />
            <span>GitHub</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthCard;
