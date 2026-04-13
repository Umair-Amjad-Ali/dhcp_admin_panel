"use client";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, isAdmin } = useAdminAuth();
  const isLoginPage = pathname === "/admin/login";

  // Case 1: Full-Screen Loading Overlay
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-page-bg z-100">
        <div className="h-10 w-10 rounded-full border-4 border-white/5 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  // Case 2: Login Page Experience (Minimal Shell)
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center relative overflow-hidden">
        {children}
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // Case 3: Unauthorized Access (Prevent rendering shell if not admin)
  if (!isAdmin) {
    return null; 
  }

  // Case 4: Authenticated Admin Shell (Stable Structure)
  return (
    <div className="flex h-screen bg-page-bg overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
