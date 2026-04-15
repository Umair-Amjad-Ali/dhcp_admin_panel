"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning"
}: ConfirmationModalProps) => {
  const themes = {
    danger: {
      accent: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      button: "bg-rose-500 hover:bg-rose-600 text-white"
    },
    warning: {
      accent: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      button: "bg-amber-500 hover:bg-amber-600 text-white"
    },
    info: {
      accent: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      button: "bg-brand hover:bg-brand/90 text-white"
    }
  };

  const theme = themes[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="relative w-full max-w-[280px] bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 text-center space-y-3">
               <div className={cn("mx-auto h-10 w-10 rounded-xl flex items-center justify-center border", theme.bg, theme.border)}>
                  <AlertTriangle size={18} className={theme.accent} />
               </div>

               <div className="space-y-1">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-wider">
                    {title}
                  </h3>
                  <p className="text-[9px] font-medium text-slate-500 leading-normal px-1">
                    {description}
                  </p>
               </div>
            </div>

            <div className="flex border-t border-white/5 divide-x divide-white/5">
               <button 
                onClick={onClose}
                className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-white/2 transition-all"
               >
                  {cancelText}
               </button>
               <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn("flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all active:opacity-80", theme.button)}
               >
                  {confirmText}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
