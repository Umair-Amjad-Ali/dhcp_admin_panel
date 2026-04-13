"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PlayCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusDropdownProps {
  currentStatus: string;
  onUpdate: (newStatus: string) => Promise<void>;
}

const statuses = [
  { id: "pending", label: "Pending", icon: Clock, color: "text-amber-500" },
  { id: "in-progress", label: "In Progress", icon: PlayCircle, color: "text-blue-500" }, // Changed to Blue for progression
  { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
  { id: "cancelled", label: "Cancelled", icon: XCircle, color: "text-rose-500" },
];

export const StatusDropdown = ({ currentStatus, onUpdate }: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeStatus = statuses.find(s => s.id === currentStatus?.toLowerCase()) || statuses[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdate = async (id: string) => {
    if (id === currentStatus?.toLowerCase()) {
      setIsOpen(false);
      return;
    }
    
    setIsSyncing(true);
    setIsOpen(false);
    try {
      await onUpdate(id);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !isSyncing && setIsOpen(!isOpen)}
        disabled={isSyncing}
        className={cn(
          "min-w-[140px] flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/5 transition-all bg-card-bg shadow-lg disabled:opacity-70",
          isOpen ? "border-brand/40 ring-1 ring-brand/20" : "hover:border-white/10"
        )}
      >
        <div className="flex items-center gap-2">
           {isSyncing ? (
             <Loader2 size={12} className="text-brand animate-spin" />
           ) : (
             <div className={cn("h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]", activeStatus.color)} />
           )}
           <span className={cn(
             "text-[10px] font-black uppercase tracking-widest",
             isSyncing ? "text-slate-500 italic animate-pulse" : "text-white"
           )}>
             {isSyncing ? "Syncing..." : activeStatus.label}
           </span>
        </div>
        {!isSyncing && <ChevronDown size={14} className={cn("text-slate-600 transition-transform duration-300", isOpen && "rotate-180")} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-3 w-52 bg-card-bg border border-white/10 rounded-2xl shadow-2xl p-2 z-100 backdrop-blur-xl"
          >
            <div className="space-y-1">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleUpdate(status.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    currentStatus?.toLowerCase() === status.id 
                      ? "bg-white/5 text-white" 
                      : "text-slate-500 hover:bg-white/3 hover:text-white"
                  )}
                >
                  <status.icon size={16} className={cn(
                    "transition-colors",
                    currentStatus?.toLowerCase() === status.id ? status.color : "text-slate-700 group-hover:text-slate-400"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                  {currentStatus?.toLowerCase() === status.id && (
                     <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
