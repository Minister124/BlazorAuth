import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function RoleList() {
  const { roles, deleteRole } = useAuthStore();

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10"
        >
          <div className="flex items-center space-x-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: role.color }}
            />
            <div>
              <h4 className="font-medium text-white">{role.name}</h4>
              <p className="text-sm text-white/60">{role.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Edit2 size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => deleteRole(role.id)}
              className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}