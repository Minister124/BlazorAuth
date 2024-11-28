import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Building, Shield } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { Select } from './shared/Select';
import { Badge } from './shared/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './shared/Card';

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { users, departments, roles } = useAuthStore();

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
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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