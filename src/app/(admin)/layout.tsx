import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Cinefolio Admin",
  description: "Admin panel for Cinefolio movie reviews.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
        >
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
