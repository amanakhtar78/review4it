import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar />
        <div className="flex flex-col flex-1 sm:gap-4 sm:py-4 md:ml-14">
          <AdminHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
