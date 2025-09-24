"use client";

import * as React from "react";
import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/context/CurrencyContext";
import {
  UserActionsProvider,
  useUserActions,
} from "@/context/UserActionsContext";
import QuizPopup from "@/components/movies/QuizPopup";
import { isToday } from "date-fns";

// Since we need context, we'll create a new component to handle the logic.
const MainContent = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, lastQuizDate } = useUserActions();
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);

  React.useEffect(() => {
    // Wait until we know the user's status
    if (isLoading) {
      return;
    }

    // Check if user is logged in and hasn't played today
    if (isLoggedIn) {
      const hasPlayedToday = lastQuizDate
        ? isToday(new Date(lastQuizDate))
        : false;
      if (!hasPlayedToday) {
        // Open popup after 3 seconds
        const timer = setTimeout(() => {
          setIsQuizOpen(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, isLoading, lastQuizDate]);

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
      <Toaster />
      <QuizPopup isOpen={isQuizOpen} setIsOpen={setIsQuizOpen} />
    </>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Metadata can't be in a client component, so we keep the main export a server component.
  const metadata: Metadata = {
    title: "Cinefolio - Movie Reviews",
    description: "Your ultimate destination for movie reviews and insights.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
        >
          <CurrencyProvider>
            <UserActionsProvider>
              <MainContent>{children}</MainContent>
            </UserActionsProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
