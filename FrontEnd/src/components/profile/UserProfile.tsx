import React from 'react';
import { motion } from 'framer-motion';
import { ProfileHeader } from './ProfileHeader';
import { ProfileForm } from './ProfileForm';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../../store/useAuthStore';

export function UserProfile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#2A2F3C] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="glass-panel overflow-hidden">
          <ProfileHeader user={user} />
          <div className="p-6 lg:p-8 space-y-8">
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
            <ProfileForm user={user} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}