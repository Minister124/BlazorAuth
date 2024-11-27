import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Users, Lock, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { RoleForm } from './RoleForm';
import { RoleList } from './RoleList';
import { PermissionMatrix } from './PermissionMatrix';

export function RoleManagementPanel() {
  const { user } = useAuthStore();
  const [showRoleForm, setShowRoleForm] = useState(false);

  if (!user?.role.permissions.includes('manage_roles')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 text-center"
      >
        <Shield className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-white/60">
          You don't have permission to manage roles.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Role Management</h2>
          <p className="text-white/60">Manage user roles and permissions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRoleForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Role</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-white/60" />
            <h3 className="text-xl font-semibold text-white">Roles</h3>
          </div>
          <RoleList />
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-white/60" />
            <h3 className="text-xl font-semibold text-white">Permissions</h3>
          </div>
          <PermissionMatrix />
        </div>
      </div>

      {showRoleForm && (
        <RoleForm onClose={() => setShowRoleForm(false)} />
      )}
    </div>
  );
}