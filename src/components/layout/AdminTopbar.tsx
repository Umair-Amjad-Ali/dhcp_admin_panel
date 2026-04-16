"use client";
import { useUIStore } from "@/store/useUIStore";
import { Menu, Search, Bell, Command } from "lucide-react";
import { usePathname } from "next/navigation";

export const AdminTopbar = () => {
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();

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
        {/* Minimal Actions */}
        {/* <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-brand transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full border border-card-bg" />
          </button>
        </div> */}
      </div>
    </header>
  );
};
