
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Film, Users, ShieldCheck, Edit3, ListOrdered, UserCog, Settings, BarChart3, TrendingUp, Newspaper, Puzzle } from 'lucide-react';

const menuItems = [
  {
    label: 'Movie Management',
    icon: Film,
    basePath: '/admin/movies',
    subItems: [
      { label: 'Manage Movies', href: '/admin/movies/manage', icon: Edit3 },
    ],
  },
  {
    label: 'Cast & Crew',
    icon: Users,
    basePath: '/admin/cast',
    subItems: [
      { label: 'Actors List', href: '/admin/cast/actors', icon: ListOrdered },
      { label: 'Actor Payments', href: '/admin/cast/payments', icon: TrendingUp },
    ],
  },
   {
    label: 'Earnings Tracking',
    icon: BarChart3,
    basePath: '/admin/earnings',
    subItems: [
      { label: 'Country-wise Earnings', href: '/admin/earnings/country-wise', icon: BarChart3 },
    ],
  },
  {
    label: 'News & Fun',
    icon: Newspaper,
    basePath: '/admin/news',
    subItems: [
      { label: 'Fun Facts', href: '/admin/news/fun-facts', icon: ListOrdered },
      { label: 'Quiz Management', href: '/admin/news/quiz', icon: Puzzle },
    ],
  },
  {
    label: 'User Management',
    icon: ShieldCheck,
    basePath: '/admin/users',
    subItems: [
      { label: 'Admin Users', href: '/admin/users/manage', icon: UserCog },
      { label: 'App Users', href: '/admin/users/app-users', icon: Users },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-2 h-16 flex items-center justify-center">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg text-foreground group-data-[collapsible=icon]:hidden">Cinefolio</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow">
        <SidebarMenu>
          {menuItems.map((group) => (
            <SidebarGroup key={group.label}>
               <SidebarGroupLabel className="flex items-center gap-2">
                <group.icon className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
              </SidebarGroupLabel>
              <SidebarMenuSub>
                {group.subItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard')}
                        tooltip={item.label}
                      >
                        <a>
                          {item.icon && <item.icon />}
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenuSub>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Placeholder for footer items if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
