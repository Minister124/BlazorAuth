import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="relative h-48 bg-gradient-to-r from-[#FF3366] to-[#FF6B98]">
      <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />
          <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </button>
        </motion.div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-white/80">{user.email}</p>
        </div>
      </div>
    </div>
  );
}