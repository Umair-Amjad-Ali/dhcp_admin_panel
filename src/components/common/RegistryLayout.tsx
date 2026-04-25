import React from "react";
import { cn } from "@/lib/utils";
import { Search, Database } from "lucide-react";

interface RegistryLayoutProps {
  title: string;
  metricText: string;
  pulseColor?: "blue" | "emerald" | "brand" | "amber";
  actionSlot?: React.ReactNode;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  loading?: boolean;
}

export function RegistryLayout({
  title,
  metricText,
  pulseColor = "blue",
  actionSlot,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  children,
  isEmpty,
  emptyMessage = "No records matched your criteria",
  loading
}: RegistryLayoutProps) {

  const getPulseColor = () => {
    switch (pulseColor) {
      case "emerald": return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
      case "brand": return "bg-brand shadow-[0_0_8px_rgba(59,130,246,0.5)]";
      case "amber": return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
      default: return "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">
            {title} <span className="text-brand">.</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", loading ? "bg-slate-700 animate-pulse" : getPulseColor())} />
            <p className={cn("text-[9px] font-black uppercase tracking-[0.3em]", loading ? "text-slate-500" : "text-slate-400")}>
              {metricText}
            </p>
          </div>
        </div>

        {actionSlot && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            {actionSlot}
          </div>
        )}
      </div>

      {/* Global Search */}
      {onSearchChange && searchPlaceholder && (
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-brand transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card-bg border border-white/3 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-brand/40 shadow-2xl transition-all"
          />
        </div>
      )}

      {/* Main Content Render */}
      <div className="space-y-4">
        {children}

        {/* Empty State */}
        {!loading && isEmpty && (
          <div className="py-20 flex flex-col items-center gap-4 opacity-50 text-slate-800">
            <Database size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest italic">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
