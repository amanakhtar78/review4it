
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usersApi } from '@/lib/api';
import { IUser } from '@/lib/models/User';
import { Separator } from '../ui/separator';

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
});

// The backend doesn't currently validate currentPassword, but it's good practice for the form.
const passwordSchema = z.object({
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
    currentUser: IUser;
}

export default function ProfileForm({ currentUser }: ProfileFormProps) {
  const [isProfileLoading, setIsProfileLoading] = React.useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = React.useState(false);
  const { toast } = useToast();
  
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        username: currentUser.username,
        email: currentUser.email,
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    try {
        await usersApi.update(currentUser._id, data);
        toast({
            title: "Profile Updated",
            description: "Your information has been successfully updated.",
        });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordLoading(true);
    try {
        // The API now correctly handles hashing the password if it's included in the payload.
        await usersApi.update(currentUser._id, { 
            password: data.newPassword, 
        });
        toast({
            title: "Password Changed",
            description: "Your password has been successfully updated.",
        });
        resetPasswordForm();
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...registerProfile('username')} disabled={isProfileLoading} />
                {profileErrors.username && <p className="text-destructive text-sm mt-1">{profileErrors.username.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email (read-only)</Label>
                <Input id="email" {...registerProfile('email')} disabled={true} />
                {profileErrors.email && <p className="text-destructive text-sm mt-1">{profileErrors.email.message}</p>}
            </div>
            <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>

        <Separator />

        <div>
            <h3 className="text-lg font-medium">Change Password</h3>
            <p className="text-sm text-muted-foreground">
                Enter a new password to update your account.
            </p>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 mt-4">
                 <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" {...registerPassword('newPassword')} disabled={isPasswordLoading} />
                    {passwordErrors.newPassword && <p className="text-destructive text-sm mt-1">{passwordErrors.newPassword.message}</p>}
                </div>
                <Button type="submit" variant="secondary" disabled={isPasswordLoading}>
                    {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </form>
        </div>
    </div>
  );
}
