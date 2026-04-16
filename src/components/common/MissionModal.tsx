"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; 
  headerAction?: React.ReactNode; 
}

export function MissionModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "max-w-md",
  headerAction
}: MissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full flex flex-col bg-card-bg border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh]", 
              maxWidth
            )}
          >
            {/* Header */}
            <div className={cn("p-6 shrink-0 bg-white/2", !headerAction && "border-b border-white/5")}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   {icon && (
                     <div className="h-10 w-10 shrink-0 rounded-xl bg-white/3 border border-white/5 shadow-inner flex items-center justify-center text-brand">
                        {icon}
                     </div>
                   )}
                   <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none italic">{title}</h3>
                      {subtitle && (
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 leading-none">
                          {subtitle}
                        </p>
                      )}
                   </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-brand/10 text-slate-700 hover:text-brand transition-all cursor-pointer active:scale-95"
                  title="Close Dialog"
                >
                  <X size={20} />
                </button>
              </div>

              {headerAction && (
                <div className="mt-6 border-t border-white/5 pt-4">
                  {headerAction}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-card-bg">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
