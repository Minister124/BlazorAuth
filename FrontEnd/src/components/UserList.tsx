import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Building, Shield, Edit2, X, Check, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { Select } from './shared/Select';
import { Badge } from './shared/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './shared/Card';
import { User } from '../types/user';
import useNotification from '../hooks/useNotification';

interface EditingUser extends Partial<User> {
  id: string;
}

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);

  const { users, departments, roles, updateUser, deleteUser } = useAuthStore();
  const { success, error, promise } = useNotification();

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = 
        selectedRole === '' || 
        user.role.name === selectedRole;

      const matchesDepartment = 
        selectedDepartment === '' || 
        user.departmentId === selectedDepartment;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [users, searchQuery, selectedRole, selectedDepartment]);

  const handleEdit = (user: User) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await promise(
        updateUser(editingUser.id, editingUser),
        {
          loading: 'Updating user...',
          success: `Successfully updated ${editingUser.name}'s profile`,
          error: 'Failed to update user. Please try again.'
        }
      );
      setEditingUser(null);
    } catch (err) {
      error('An unexpected error occurred while updating the user');
      console.error('Update user error:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm(`Are you sure you want to delete ${user.name}'s account? This action cannot be undone.`)) return;

    try {
      await promise(
        deleteUser(userId),
        {
          loading: 'Deleting user...',
          success: `Successfully deleted ${user.name}'s account`,
          error: 'Failed to delete user. Please try again.'
        }
      );
    } catch (err) {
      error('An unexpected error occurred while deleting the user');
      console.error('Delete user error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Button
            variant="outline"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    icon={<Shield className="w-4 h-4" />}
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    icon={<Building className="w-4 h-4" />}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} variant="hover">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    {editingUser?.id === user.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          placeholder="Name"
                          className="w-full"
                        />
                        <Input
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          placeholder="Email"
                          className="w-full"
                        />
                        <Select
                          value={editingUser.role?.id || ''}
                          onChange={(e) => {
                            const selectedRole = roles.find(r => r.id === e.target.value);
                            if (selectedRole) {
                              setEditingUser({ 
                                ...editingUser, 
                                role: selectedRole 
                              });
                            }
                          }}
                          className="w-full"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name} - {role.description}
                            </option>
                          ))}
                        </Select>
                        <Select
                          value={editingUser.departmentId}
                          onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value })}
                          className="w-full"
                        >
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {user.role.name}
                          </Badge>
                          {user.departmentId && (
                            <Badge variant="secondary">
                              {departments.find(d => d.id === user.departmentId)?.name}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingUser?.id === user.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(null)}
                        icon={<X className="w-4 h-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        icon={<Check className="w-4 h-4" />}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        icon={<Edit2 className="w-4 h-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredUsers.length === 0 && (
          <Card className="col-span-full p-8 text-center">
            <CardContent>
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}