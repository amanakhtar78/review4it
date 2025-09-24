
import LoginForm from '@/components/admin/LoginForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted p-4">
       <Button asChild variant="ghost" className="absolute top-4 left-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Link>
        </Button>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
