
"use client";

import Link from 'next/link';
import { LogOut, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle'; // Assuming you might want theme toggle in admin too

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex items-center gap-2">
        {/* You can add breadcrumbs or page titles here */}
        <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/test78ADMINLogin">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Link>
        </Button>
      </div>
    </header>
  );
}
