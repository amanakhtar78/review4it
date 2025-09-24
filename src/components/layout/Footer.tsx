
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 text-center text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Cinefolio. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Movie data and images are for demonstration purposes only.
        </p>
        <p className="text-xs mt-2">
          <Link href="/test78ADMINLogin" className="hover:text-primary hover:underline">
            Admin Login
          </Link>
        </p>
      </div>
    </footer>
  );
}
