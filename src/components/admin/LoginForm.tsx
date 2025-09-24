
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { authApi } from '@/lib/api';

export default function LoginForm() {
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('password');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.adminLogin({ email, password });

      const data = response;

      if (data.success) {
        localStorage.setItem('authToken', data.token); // Save token
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });
        router.push('/admin/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" /> Login
          </>
        )}
      </Button>
    </form>
  );
}
