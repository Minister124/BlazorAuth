import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User as UserIcon, 
  Mail as MailIcon, 
  Building as BuildingIcon, 
  Shield as ShieldIcon,
  Camera as CameraIcon 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../shared/Card';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/user';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().optional(),
  departmentId: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  className?: string;
}

export function ProfileForm({ user, className }: ProfileFormProps) {
  const { updateUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      departmentId: user.departmentId,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateUser(user.id, { 
        ...data, 
        avatar: avatarPreview || data.avatar 
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        error instanceof Error 
          ? `Failed to update profile: ${error.message}`
          : 'Failed to update profile. Please try again.'
      );
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto shadow-sm rounded-lg", className)}>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {Object.keys(errors).length > 0 && (
          <div className="px-4 sm:px-6 py-2 bg-destructive/10 text-destructive text-sm rounded-md mx-4 sm:mx-6">
            Please fix the following errors:
            <ul className="list-disc list-inside mt-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error?.message}</li>
              ))}
            </ul>
          </div>
        )}
        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Profile Picture</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <img
                  src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-offset-2 ring-offset-background ring-border"
                />
                <label
                  htmlFor="avatar-upload"
                  className={cn(
                    "absolute bottom-0 right-0 p-1.5 rounded-full",
                    "bg-background ring-2 ring-border",
                    "cursor-pointer hover:bg-accent transition-colors"
                  )}
                >
                  <CameraIcon className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  Upload a new profile picture
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 400x400 pixels
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Full Name"
                error={errors.name?.message}
                icon={<UserIcon className="h-4 w-4 text-muted-foreground" />}
                {...register('name')}
                placeholder="John Doe"
              />
              
              <Input
                label="Email Address"
                type="email"
                error={errors.email?.message}
                icon={<MailIcon className="h-4 w-4 text-muted-foreground" />}
                {...register('email')}
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Organization Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Organization Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
                  <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                  <span style={{ color: user.role.color }}>{user.role.name}</span>
                </div>
              </div>
              {user.departmentId && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department</label>
                  <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
                    <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                    {user.departmentId}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 px-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}