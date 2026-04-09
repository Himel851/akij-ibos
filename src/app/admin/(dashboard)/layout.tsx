import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AdminNavbar />
      {children}
    </div>
  );
}
