import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Department } from '../types/department';

export function DepartmentManagement() {
  const { departments, users, createDepartment, updateDepartment, deleteDepartment, user: currentUser } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
  });

  const canManageDepartments = currentUser?.role.permissions.includes('manage_roles');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDepartment) {
      updateDepartment(editingDepartment.id, formData);
      setEditingDepartment(null);
    } else {
      createDepartment(formData);
    }
    setIsCreating(false);
    setFormData({ name: '', description: '', managerId: '' });
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      managerId: department.managerId || '',
    });
    setIsCreating(true);
  };

  if (!canManageDepartments) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <Building size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-600">You don't have permission to manage departments.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Department Management</h2>
          <p className="text-gray-600 mt-1">Manage company departments and their managers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} />
          <span>New Department</span>
        </motion.button>
      </div>

      {isCreating && (
        <motion.form
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          onSubmit={handleSubmit}
          className="mb-8 p-6 border border-gray-200 rounded-xl space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Manager</label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a manager</option>
              {users
                .filter(u => u.role.name === 'Manager')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingDepartment(null);
                setFormData({ name: '', description: '', managerId: '' });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editingDepartment ? 'Update Department' : 'Create Department'}
            </motion.button>
          </div>
        </motion.form>
      )}

      <div className="space-y-4">
        {departments.map((department) => (
          <motion.div
            key={department.id}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
          >
            <div className="flex items-center space-x-4">
              <Building className="text-gray-400" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">{department.name}</h3>
                <p className="text-sm text-gray-600">{department.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {department.employeeCount} employees
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEdit(department)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteDepartment(department.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}