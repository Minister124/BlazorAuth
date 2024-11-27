import { useState } from 'react';
import { Building, Users, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './shared/Card';
import { Button } from './shared/Button';
import { Select } from './shared/Select';
import { cn } from '../lib/utils';

interface DepartmentAssignmentProps {
  className?: string;
}

export function DepartmentAssignment({ className }: DepartmentAssignmentProps) {
  const { users, departments, updateUser } = useAuthStore();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleAssign = async () => {
    if (!selectedDepartmentId) {
      toast.error('Please select a department');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      await Promise.all(
        selectedUsers.map(userId => {
          const user = users.find(u => u.id === userId);
          if (user) {
            return updateUser(userId, { departmentId: selectedDepartmentId });
          }
        })
      );

      const department = departments.find(d => d.id === selectedDepartmentId);
      toast.success(`Assigned ${selectedUsers.length} users to ${department?.name || selectedDepartmentId}`);
      setSelectedUsers([]);
      setSelectedDepartmentId('');
    } catch (error) {
      toast.error('Failed to assign users to department');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Department Assignment</CardTitle>
        <CardDescription>Assign users to departments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building className="w-4 h-4" />
              Select Department
            </div>
            <Select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              Select Users
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto rounded-lg border bg-card">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 hover:bg-accent transition-colors",
                    selectedUsers.includes(user.id) && "bg-accent"
                  )}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-grow text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {departments.find(d => d.id === user.departmentId)?.name || 'No Department'}
                    </div>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleAssign}
          disabled={!selectedDepartmentId || selectedUsers.length === 0}
        >
          Assign to Department
        </Button>
      </CardFooter>
    </Card>
  );
}