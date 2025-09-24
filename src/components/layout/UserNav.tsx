"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  PartyPopper,
  Settings,
  User,
  Moon,
  Sun,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCurrency } from "@/context/CurrencyContext";
import { usersApi } from "@/lib/api";
import { IUser } from "@/lib/models/User";
import { Skeleton } from "../ui/skeleton";
import { ThemeToggle } from "./ThemeToggle";

export function UserNav() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // A simple way to get user ID from JWT without a full-decode library
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;

        if (userId) {
          const userData = await usersApi.getOne(userId);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user data or parse token:", error);
        // If token is invalid or user not found, log out
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
    // Use window.location.reload() to ensure all state is cleared
    window.location.reload();
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return null; // Or some fallback UI if the user isn't found but token was present
  }

  const userInitial = user.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PartyPopper className="mr-2 h-4 w-4 text-yellow-500" />
            <span>XP Points: {user.monthlyXP || 0}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="md:hidden">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">
            Theme
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="md:hidden" />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">
            Currency
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setCurrency("inr")}>
            <IndianRupee className="mr-2 h-4 w-4" />
            <span>INR (₹)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCurrency("usd")}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>USD ($)</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
