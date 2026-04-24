"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { 
  X, 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Users, 
  Building, 
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Technicians", href: "/admin/technicians", icon: Wrench },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const { adminUser, logout } = useAdminAuth();

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-56 bg-card-bg border-r border-border-subtle transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl shadow-black",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="flex h-16 items-center px-4">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 group transition-transform hover:scale-[0.98] active:scale-95"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="bg-brand text-white p-2 rounded-xl shadow-lg shadow-brand/20 group-hover:rotate-12 transition-transform duration-500">
              <Wrench size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter text-white leading-none">
                DHS
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand mt-0.5">
                Admin
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto pt-8 px-2 space-y-4">
          <div>
            <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-700 mb-3">
              Main Menu
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                        isActive 
                          ? "bg-brand/20 text-white" 
                          : "text-slate-500 hover:text-white hover:bg-white/4"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={19} className={cn("transition-transform group-hover:scale-110", isActive ? "text-brand" : "text-inherit")} />
                        <span className="font-bold text-xs tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight 
                        size={12} 
                        className={cn(
                          "opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0",
                          isActive && "opacity-100 translate-x-0 text-brand"
                        )} 
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* User / Footer Section */}
        <div className="p-4">
          <div className="bg-white/2 p-4 rounded-2xl border border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-brand to-brand/80 flex items-center justify-center font-black text-white text-[10px]">
                {adminUser?.email?.[0].toUpperCase() || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate lowercase leading-tight">{adminUser?.email?.split('@')[0]}</span>
                <span className="text-[8px] text-slate-600 truncate font-black uppercase tracking-widest leading-none mt-1">{adminUser?.role || "admin"}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-border-subtle"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
