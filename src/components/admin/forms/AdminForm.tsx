
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IAdmin } from '@/lib/models/Admin';

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  rights_input: z.string().optional(), // Using a separate field for comma-separated rights
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type FormData = z.infer<typeof formSchema>;

interface AdminFormProps {
  initialData?: IAdmin | null;
  onSubmit: (data: Partial<IAdmin>) => void;
  onCancel: () => void;
}

export default function AdminForm({ initialData, onSubmit, onCancel }: AdminFormProps) {
  const isEditing = !!initialData;
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialData?.username || '',
      email: initialData?.email || '',
      password: '',
      rights_input: initialData?.rights.join(', ') || '',
      status: initialData?.status || 'Active',
    },
  });
  
  React.useEffect(() => {
    if (initialData) {
        setValue('username', initialData.username);
        setValue('email', initialData.email);
        setValue('rights_input', initialData.rights.join(', '));
        setValue('status', initialData.status);
    }
  }, [initialData, setValue]);

  const processSubmit = (data: FormData) => {
    const rights = data.rights_input?.split(',').map(r => r.trim()).filter(Boolean) || [];
    const submissionData: Partial<IAdmin> = {
        username: data.username,
        email: data.email,
        rights,
        status: data.status,
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
        <Input id="username" {...register('username')} placeholder="e.g., admin_user" />
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
      
      <div className="space-y-2">
        <Label htmlFor="rights_input">Rights (comma-separated)</Label>
        <Textarea id="rights_input" {...register('rights_input')} placeholder="e.g., ADD_MOVIE, DELETE_MOVIE" />
        {errors.rights_input && <p className="text-sm text-destructive mt-1">{errors.rights_input.message}</p>}
      </div>

      <div className="space-y-2">
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

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Create Admin'}</Button>
      </div>
    </form>
  );
}
