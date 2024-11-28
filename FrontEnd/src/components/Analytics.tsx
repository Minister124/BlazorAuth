import { BarChart, PieChart, Users, Building } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from './shared/Card';

export function Analytics() {
  const { users, departments } = useAuthStore();

  const usersByDepartment = users.reduce((acc, user) => {
    acc[user.departmentId] = (acc[user.departmentId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{users.length}</h3>
              </div>
            </div>
          </div>
        </Card>

        {/* Total Departments Card */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Building className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{departments.length}</h3>
              </div>
            </div>
          </div>
        </Card>

        {/* Users by Status */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <PieChart className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter(u => u.status === 'active').length}
                </h3>
              </div>
            </div>
          </div>
        </Card>

        {/* Department Distribution */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <BarChart className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Users/Dept</p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {departments.length ? Math.round(users.length / departments.length) : 0}
                </h3>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Distribution Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Distribution</h3>
          <div className="space-y-4">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">{dept.name}</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(usersByDepartment[dept.id] || 0) / users.length * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[2rem]">
                    {usersByDepartment[dept.id] || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
