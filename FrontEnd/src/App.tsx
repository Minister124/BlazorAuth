import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { LogOut, Shield, Users, Settings, Building, UserPlus, User } from 'lucide-react';
import { AuthForm } from './components/AuthForm';
import { UserList } from './components/UserList';
import { UserCreationForm } from './components/UserCreationForm';
import { RoleManagement } from './components/RoleManagement';
import { DepartmentManagement } from './components/DepartmentManagement';
import { DepartmentAssignment } from './components/DepartmentAssignment';
import { UserProfile } from './components/profile/UserProfile';
import { WaterBubbles } from './components/background/WaterBubbles';
import { ThemeToggle } from './components/profile/ThemeToggle';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

type Tab = 'users' | 'create-user' | 'roles' | 'departments' | 'assign-departments' | 'profile';

function App() {
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'create-user':
        return <UserCreationForm />;
      case 'roles':
        return <RoleManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'assign-departments':
        return <DepartmentAssignment />;
      case 'profile':
        return <UserProfile />;
      default:
        return <UserList />;
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0F1C]' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center px-4 relative overflow-hidden`}>
        <WaterBubbles />
        <div className="relative z-10">
          <AuthForm />
        </div>
      </div>
    );
  }

  const canManageRoles = user.role.permissions.includes('manage_roles');
  const canCreateUsers = user.role.permissions.includes('create_user');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0F1C] text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'}`}>
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-blue-600" />
                <span className="text-blue-600 font-medium">{user.role.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            <span>Users</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </motion.button>

          {canCreateUsers && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('create-user')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === 'create-user'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <UserPlus size={20} />
              <span>Create User</span>
            </motion.button>
          )}

          {canManageRoles && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('roles')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Shield size={20} />
              <span>Roles</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('departments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'departments'
                ? 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Building size={20} />
            <span>Departments</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('assign-departments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'assign-departments'
                ? 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Settings size={20} />
            <span>Assign</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={theme === 'dark' ? 'glass-panel' : 'bg-white rounded-xl shadow-xl p-6'}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

export default App;