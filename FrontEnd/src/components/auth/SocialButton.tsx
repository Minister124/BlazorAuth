import React from 'react';
import { motion } from 'framer-motion';

interface SocialButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  provider: string;
}

export function SocialButton({ icon, onClick, provider }: SocialButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <span className="text-gray-600">{icon}</span>
      <span className="ml-2 text-sm font-medium text-gray-700">{provider}</span>
    </motion.button>
  );
}