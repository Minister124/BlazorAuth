import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCog, Edit2, X, Building } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types/user';

export function UserList() {
  const { users, updateUser, user: currentUser, roles, departments } = useAuthStore();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleRoleChange = (userId: string, roleId: string) => {
    const selectedRole = roles.find(r => r.id === roleId);
    if (selectedRole) {
      updateUser(userId, { role: selectedRole });
      setEditingUser(null);
    }
  };

  const canManageRoles = currentUser?.role.permissions.includes('manage_roles');

  const renderRoleSelector = (user: User) => {
    const isEditing = editingUser === user.id;

    if (!canManageRoles) {
      return (
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: user.role.color + '20',
            color: user.role.color
          }}
        >
          {user.role.name}
        </span>
      );
    }

    if (!isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: user.role.color + '20',
              color: user.role.color
            }}
          >
            {user.role.name}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setEditingUser(user.id)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Edit2 size={16} />
          </motion.button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <select
          value={user.role.id}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          autoFocus
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setEditingUser(null)}
          className="p-1 text-red-600 hover:bg-red-100 rounded-full"
        >
          <X size={16} />
        </motion.button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600 mt-1">
            {canManageRoles ? 'Click the edit icon next to a role to change it' : 'User roles are managed by administrators'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserCog className="text-gray-600" size={24} />
          <span className="text-gray-600 font-medium">Total Users: {users.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-2">
                    <Building size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {departments.find(d => d.id === user.departmentId)?.name || 'No Department'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {renderRoleSelector(user)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}