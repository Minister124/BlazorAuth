import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail as MailIcon, Building as BuildingIcon, Shield as ShieldIcon, UserPlus as UserPlusIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './shared/Card';
import { Input } from './shared/Input';
import { Select } from './shared/Select';
import { Button } from './shared/Button';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

const userCreationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().optional(),
  roleId: z.string().min(1, 'Please select a role'),
});

type FormData = z.infer<typeof userCreationSchema>;

interface UserCreationFormProps {
  className?: string;
}

export function UserCreationForm({ className }: UserCreationFormProps) {
  const { roles, departments, createUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      roleId: roles[2]?.id || '', // Default to basic user role if available
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const selectedRole = roles.find(role => role.id === data.roleId);
      if (!selectedRole) {
        toast.error('Invalid role selected');
        return;
      }

      await createUser({
        ...data,
        role: selectedRole,
      });
      
      toast.success('User created successfully');
      reset();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(
        error instanceof Error 
          ? `Failed to create user: ${error.message}`
          : 'Failed to create user. Please try again.'
      );
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto shadow-sm rounded-lg", className)}>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>Add a new user to the system</CardDescription>
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
              <Select
                label="Role"
                error={errors.roleId?.message}
                icon={<ShieldIcon className="h-4 w-4 text-muted-foreground" />}
                {...register('roleId')}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Department"
                icon={<BuildingIcon className="h-4 w-4 text-muted-foreground" />}
                {...register('department')}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 px-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <ShieldIcon className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <UserPlusIcon className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}