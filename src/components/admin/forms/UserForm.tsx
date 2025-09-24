
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { IUser } from '@/lib/models/User';

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  monthlyXP: z.coerce.number().optional(),
  deactivationReason: z.string().optional(),
}).refine(data => {
    if (data.status === 'Inactive') {
        return !!data.deactivationReason && data.deactivationReason.length > 0;
    }
    return true;
}, {
    message: "Deactivation reason is required when status is Inactive.",
    path: ["deactivationReason"],
});


type FormData = z.infer<typeof formSchema>;

interface UserFormProps {
  initialData?: IUser | null;
  onSubmit: (data: Partial<IUser>) => void;
  onCancel: () => void;
}

export default function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const isEditing = !!initialData;
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialData?.username || '',
      email: initialData?.email || '',
      password: '',
      status: initialData?.status || 'Active',
      monthlyXP: initialData?.monthlyXP || 0,
      deactivationReason: initialData?.deactivationReason || '',
    },
  });

  const watchedStatus = watch('status');
  
  React.useEffect(() => {
    if (initialData) {
        setValue('username', initialData.username);
        setValue('email', initialData.email);
        setValue('status', initialData.status);
        setValue('monthlyXP', initialData.monthlyXP || 0);
        setValue('deactivationReason', initialData.deactivationReason || '');
    }
  }, [initialData, setValue]);

  const processSubmit = (data: FormData) => {
    const submissionData: Partial<IUser> = {
        username: data.username,
        email: data.email,
        status: data.status,
        monthlyXP: data.monthlyXP,
        deactivationReason: data.deactivationReason,
    };
    if (data.password) {
        submissionData.password = data.password;
    }
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 py-4 max-h-[75vh] overflow-y-auto pr-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} placeholder="e.g., john_doe" />
        {errors.username && <p className="text-sm text-destructive mt-1">{errors.username.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} placeholder="e.g., user@example.com" />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} placeholder={isEditing ? "Leave blank to keep unchanged" : "Enter new password"} />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as 'Active' | 'Inactive')} defaultValue={watch('status')}>
                <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
        </div>
      </div>
      
      {watchedStatus === 'Inactive' && (
        <div className="space-y-2">
            <Label htmlFor="deactivationReason">Reason for Deactivation</Label>
            <Textarea 
                id="deactivationReason" 
                {...register('deactivationReason')} 
                placeholder="Enter reason for deactivating the user..."
            />
            {errors.deactivationReason && <p className="text-sm text-destructive mt-1">{errors.deactivationReason.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="monthlyXP">Monthly XP</Label>
        <Input id="monthlyXP" type="number" {...register('monthlyXP')} placeholder="e.g., 100" />
        {errors.monthlyXP && <p className="text-sm text-destructive mt-1">{errors.monthlyXP.message}</p>}
      </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  );
}
