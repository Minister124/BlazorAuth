import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Users, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function DepartmentAssignment() {
  const { users, departments, updateUser } = useAuthStore();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleAssign = () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    selectedUsers.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user) {
        updateUser(userId, { department: selectedDepartment });
      }
    });

    toast.success(`Assigned ${selectedUsers.length} users to ${selectedDepartment}`);
    setSelectedUsers([]);
    setSelectedDepartment('');
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Department Assignment</h2>
          <p className="text-gray-600 mt-1">Assign users to departments</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAssign}
            disabled={!selectedDepartment || selectedUsers.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              selectedDepartment && selectedUsers.length > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Building size={20} />
            <span>Assign to Department</span>
          </motion.button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                selectedUsers.includes(user.id)
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => toggleUserSelection(user.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {selectedUsers.includes(user.id) && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {user.department || 'No Department'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}