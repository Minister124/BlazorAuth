import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Permission } from '../../types/user';
import toast from 'react-hot-toast';

interface RoleFormProps {
  onClose: () => void;
}

export function RoleForm({ onClose }: RoleFormProps) {
  const { createRole } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[],
    color: '#FF3366',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRole(formData);
      toast.success('Role created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const availablePermissions: { value: Permission; label: string }[] = [
    { value: 'create_user', label: 'Create Users' },
    { value: 'edit_user', label: 'Edit Users' },
    { value: 'delete_user', label: 'Delete Users' },
    { value: 'manage_roles', label: 'Manage Roles' },
    { value: 'view_analytics', label: 'View Analytics' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel p-6 w-full max-w-lg relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Create New Role</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Role Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Role Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map(permission => (
                  <label key={permission.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.value)}
                      onChange={(e) => {
                        const newPermissions = e.target.checked
                          ? [...formData.permissions, permission.value]
                          : formData.permissions.filter(p => p !== permission.value);
                        setFormData(prev => ({ ...prev, permissions: newPermissions }));
                      }}
                      className="rounded text-[#FF3366] focus:ring-[#FF3366]"
                    />
                    <span className="text-white/80">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-white/60 hover:text-white/80"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary px-6"
              >
                Create Role
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}