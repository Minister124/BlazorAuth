import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { User as UserType } from '../../types/user';

interface ProfileFormProps {
  user: UserType;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department || '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(user.id, formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Department</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              disabled={!isEditing}
              className="input-field w-full pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Role</label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              value={user.role.name}
              disabled
              className="input-field w-full pl-12"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-primary px-6"
          >
            Edit Profile
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-xl text-white/60 hover:text-white/80"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary px-6 flex items-center space-x-2"
            >
              <Save size={20} />
              <span>Save Changes</span>
            </motion.button>
          </>
        )}
      </div>
    </form>
  );
}