
import type { Metadata } from 'next';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';


export const metadata: Metadata = {
  title: 'Cinefolio Admin Login',
  description: 'Login page for Cinefolio admin panel.',
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'system']}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
