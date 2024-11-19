import { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Card from '../common/Card';
import '../../styles/animations.css';

interface UserRole {
    id: string;
    name: string;
}

interface UserWithRoles {
    id: string;
    userName: string;
    emailAddress: string;
    roles: string[];
}

export default function Dashboard() {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, rolesData] = await Promise.all([
                authService.getUsersWithRoles(),
                authService.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !selectedRole) {
            toast.warning('Please select both user and role');
            return;
        }

        setIsUpdating(true);
        try {
            const result = await authService.changeUserRole(selectedUser, selectedRole);
            if (result.flag) {
                toast.success(result.message || 'Role updated successfully');
                loadData();
                setSelectedUser('');
                setSelectedRole('');
            } else {
                toast.error(result.message || 'Failed to update role');
            }
        } catch (error) {
            toast.error('Failed to update role');
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold gradient-text">User Management Dashboard</h1>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card variant="glass" animate hover delay={0.1}>
                            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                            <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
                        </Card>
                        <Card variant="glass" animate hover delay={0.2}>
                            <h3 className="text-lg font-semibold text-gray-700">Available Roles</h3>
                            <p className="text-3xl font-bold text-indigo-600">{roles.length}</p>
                        </Card>
                        <Card variant="glass" animate hover delay={0.3}>
                            <h3 className="text-lg font-semibold text-gray-700">Active Sessions</h3>
                            <p className="text-3xl font-bold text-indigo-600">{users.filter(u => u.roles.length > 0).length}</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* User List */}
                        <Card variant="glass" className="animate-slide-in">
                            <h2 className="text-xl font-semibold text-gray-700 mb-6">Users and Their Roles</h2>
                            <div className="space-y-4">
                                {filteredUsers.map((user, index) => (
                                    <div 
                                        key={user.id} 
                                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all animate-fade-in"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                {user.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{user.userName}</p>
                                                <p className="text-sm text-gray-500">{user.emailAddress}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map(role => (
                                                    <span 
                                                        key={role} 
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No users found matching your search.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Role Management */}
                        <Card variant="glass" className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-xl font-semibold text-gray-700 mb-6">Change User Role</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                    >
                                        <option value="">Select a user</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.emailAddress}>
                                                {user.userName} ({user.emailAddress})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">Select a role</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    onClick={handleChangeRole}
                                    loading={isUpdating}
                                    disabled={!selectedUser || !selectedRole}
                                    className="w-full"
                                >
                                    Update Role
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
