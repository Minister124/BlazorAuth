import { UserCog } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ProfileForm } from './ProfileForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/Card';

export function UserProfile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCog className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}