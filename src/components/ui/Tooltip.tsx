"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
  delay?: number;
}

export const Tooltip = ({ children, content, className, delay = 0.3 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            transition={{ duration: 0.15, delay }}
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-9999",
              "whitespace-nowrap pointer-events-none"
            )}
          >
            <div className="relative">
              {/* Tooltip Background & Styling */}
              <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl">
                 <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none italic">
                   {content}
                 </p>
              </div>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                 <div className="w-2 h-2 bg-slate-950 border-r border-b border-white/10 rotate-45" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
