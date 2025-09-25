"use client";

import Link from "next/link";
import { Film, User as UserIcon, Puzzle } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { UserNav } from "./UserNav";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import MainLoginForm from "../auth/MainLoginForm";
import { ThemeToggle } from "./ThemeToggle";
import QuizPopup from "../movies/QuizPopup";
import { CurrencyToggle } from "./CurrencyToggle";

const GuestNav = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" className="hidden md:flex">
        Login
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Welcome Back!</DialogTitle>
        <DialogDescription>
          Enter your credentials to access your account.
        </DialogDescription>
      </DialogHeader>
      <MainLoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </DialogContent>
  </Dialog>
);

const MobileGuestNav = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <UserIcon className="h-5 w-5" />
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Welcome Back!</DialogTitle>
        <DialogDescription>
          Enter your credentials to access your account.
        </DialogDescription>
      </DialogHeader>
      <MainLoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </DialogContent>
  </Dialog>
);

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const today = new Date().toISOString().slice(0, 10);
    const lastQuizDate = localStorage.getItem("quizSeenDate");

    if (lastQuizDate !== today) {
      setIsQuizOpen(true);
      localStorage.setItem("quizSeenDate", today); // mark as seen immediately
    }

    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  // Handle quiz close
  const handleQuizClose = () => {
    setIsQuizOpen(false);
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            Review4it
          </h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQuizOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Puzzle className="mr-2 h-4 w-4" /> Daily Quiz
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsQuizOpen(true)}
            className="sm:hidden"
          >
            <Puzzle className="h-5 w-5" />
          </Button>
          <GlobalSearch />
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <CurrencyToggle />
          </div>
          {isClient &&
            (isLoggedIn ? (
              <UserNav />
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <GuestNav />
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
                <div className="md:hidden flex items-center gap-1">
                  <CurrencyToggle />
                  <MobileGuestNav />
                </div>
              </>
            ))}
        </nav>
      </div>
      <QuizPopup
        isOpen={isQuizOpen}
        setIsOpen={setIsQuizOpen}
        onClose={handleQuizClose}
      />
    </header>
  );
}
