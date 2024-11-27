import { motion } from 'framer-motion';
import { ProfileHeader } from './ProfileHeader';
import { ProfileForm } from './ProfileForm';
import { useAuthStore } from '../../store/useAuthStore';
import { UserCog } from 'lucide-react';

export function UserProfile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#2A2F3C] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Profile Overview Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-6 h-6" />
            Profile Settings
          </h1>
        </div>

        {/* Main Profile Card */}
        <div className="glass-panel overflow-hidden">
          {/* Profile Header with Avatar and Cover */}
          <ProfileHeader user={user} />
          
          {/* Profile Information Section */}
          <div className="p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
              {/* Profile Form */}
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-lg font-medium text-white">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    Update your personal information and preferences.
                  </p>
                </div>
                <ProfileForm user={user} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}