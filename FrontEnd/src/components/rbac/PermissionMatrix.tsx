import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Permission } from '../../types/user';

export function PermissionMatrix() {
  const { roles } = useAuthStore();

  const permissions: { key: Permission; label: string }[] = [
    { key: 'create_user', label: 'Create Users' },
    { key: 'edit_user', label: 'Edit Users' },
    { key: 'delete_user', label: 'Delete Users' },
    { key: 'manage_roles', label: 'Manage Roles' },
    { key: 'view_analytics', label: 'View Analytics' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-white/60 font-medium p-2">Permission</th>
            {roles.map(role => (
              <th
                key={role.id}
                className="text-center text-white/60 font-medium p-2"
                style={{ color: role.color }}
              >
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map(permission => (
            <tr key={permission.key} className="border-t border-white/10">
              <td className="text-white/80 p-2">{permission.label}</td>
              {roles.map(role => (
                <td key={role.id} className="text-center p-2">
                  {role.permissions.includes(permission.key) ? (
                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-400 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}