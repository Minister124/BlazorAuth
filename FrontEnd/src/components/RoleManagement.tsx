import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Shield, Lock, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Permission, Role } from '../types/user';
import { toast } from 'react-hot-toast';

const availablePermissions: { value: Permission; label: string; icon: JSX.Element }[] = [
  { value: 'create_user', label: 'Create Users', icon: <Plus className="w-4 h-4" /> },
  { value: 'edit_user', label: 'Edit Users', icon: <Edit2 className="w-4 h-4" /> },
  { value: 'delete_user', label: 'Delete Users', icon: <Trash2 className="w-4 h-4" /> },
  { value: 'manage_roles', label: 'Manage Roles', icon: <Shield className="w-4 h-4" /> },
  { value: 'view_analytics', label: 'View Analytics', icon: <Lock className="w-4 h-4" /> },
];

export function RoleManagement() {
  const { roles, createRole, updateRole, deleteRole } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[],
    color: '#3B82F6',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        toast.success('Role updated successfully');
      } else {
        await createRole(formData);
        toast.success('Role created successfully');
      }
      setIsCreating(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [], color: '#3B82F6' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      color: role.color,
    });
    setIsCreating(true);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Role Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage user roles and their permissions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
            bg-blue-500 hover:bg-blue-600 text-white font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          New Role
        </motion.button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg
                      bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter role name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role Color
                  </label>
                  <input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 px-2 rounded-lg cursor-pointer
                      border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter role description"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map(permission => (
                    <motion.label
                      key={permission.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer
                        border ${formData.permissions.includes(permission.value)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'}
                        hover:bg-gray-50 dark:hover:bg-gray-700/50
                        transition-colors duration-200
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.value)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...formData.permissions, permission.value]
                            : formData.permissions.filter(p => p !== permission.value);
                          setFormData(prev => ({ ...prev, permissions: newPermissions }));
                        }}
                        className="hidden"
                      />
                      <div className={`
                        w-5 h-5 rounded-md flex items-center justify-center
                        ${formData.permissions.includes(permission.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'}
                      `}>
                        {formData.permissions.includes(permission.value) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          permission.icon
                        )}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {permission.label}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRole(null);
                    setFormData({ name: '', description: '', permissions: [], color: '#3B82F6' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                    hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-blue-500 hover:bg-blue-600 text-white font-medium
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-colors duration-200
                    ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingRole ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingRole ? 'Update Role' : 'Create Role'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence>
          {roles.map((role) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm
                border border-gray-200 dark:border-gray-700 overflow-hidden
                hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {role.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(role)}
                    className="p-2 text-gray-400 hover:text-blue-500
                      rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20
                      transition-colors duration-200"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(role.id)}
                    className="p-2 text-gray-400 hover:text-red-500
                      rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map(permission => {
                    const permInfo = availablePermissions.find(p => p.value === permission);
                    return (
                      <div
                        key={permission}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full
                          bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                          text-xs font-medium"
                      >
                        {permInfo?.icon}
                        {permInfo?.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}