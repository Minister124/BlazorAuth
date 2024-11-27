import { useState } from 'react';
import { motion} from 'framer-motion';
import { Building, Users, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function DepartmentAssignment() {
  const { users, departments, updateUser } = useAuthStore();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleAssign = () => {
    if (!selectedDepartmentId) {
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
        updateUser(userId, { departmentId: selectedDepartmentId });
      }
    });

    const department = departments.find(d => d.id === selectedDepartmentId);
    toast.success(`Assigned ${selectedUsers.length} users to ${department?.name || selectedDepartmentId}`);
    setSelectedUsers([]);
    setSelectedDepartmentId('');
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Building className="mr-2" size={20} />
            Select Department
          </h3>
          <div className="space-y-2">
            {departments.map(department => (
              <motion.button
                key={department.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDepartmentId(department.id)}
                className={`w-full p-3 rounded-lg border ${
                  selectedDepartmentId === department.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-200'
                } transition-colors`}
              >
                <div className="flex items-center">
                  <span className="flex-grow text-left">{department.name}</span>
                  {selectedDepartmentId === department.id && (
                    <Check size={20} className="text-blue-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Users className="mr-2" size={20} />
            Select Users
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {users.map(user => (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleUserSelection(user.id)}
                className={`w-full p-3 rounded-lg border ${
                  selectedUsers.includes(user.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-200'
                } transition-colors`}
              >
                <div className="flex items-center">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div className="flex-grow text-left">
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-500">
                      {departments.find(d => d.id === user.departmentId)?.name || 'No Department'}
                    </div>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Check size={20} className="text-blue-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAssign}
          disabled={!selectedDepartmentId || selectedUsers.length === 0}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Assign to Department
        </motion.button>
      </div>
    </motion.div>
  );
}