"use client";
import { useUIStore } from "@/store/useUIStore";
import { Menu, Search, Bell, Command } from "lucide-react";
import { usePathname } from "next/navigation";

export const AdminTopbar = () => {
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();

  // Extract page title from pathname
  const pageTitle = pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard";

  return (
    <header className="h-14 bg-card-bg/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-6 z-30 sticky top-0 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 text-slate-400 hover:text-brand transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
            {pageTitle}
            <span className="h-1 w-1 rounded-full bg-brand" />
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Visible Search Bar */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/3 rounded-xl border border-border-subtle focus-within:border-brand/50 transition-all shadow-inner">
          <Search size={14} className="text-brand" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-300 placeholder:text-slate-500 w-40 focus:w-56 transition-all"
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-border-subtle text-[9px] font-black text-slate-500">
             <Command size={10} />
             <span>K</span>
          </div>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-brand transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full border border-card-bg" />
          </button>
        </div>
      </div>
    </header>
  );
};
