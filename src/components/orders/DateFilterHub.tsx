"use client";

import React, { useState } from "react";
import { 
  CalendarDays, 
  CalendarRange, 
  Calendar as CalendarIcon, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DateFilterHubProps {
  dateFilter: { start: string; end: string };
  setDateFilter: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
}

export const DateFilterHub = ({ dateFilter, setDateFilter }: DateFilterHubProps) => {
  const [dateMode, setDateMode] = useState<"single" | "range" | null>(null);

  const handleSingleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateFilter({ start: val, end: val });
  };

  const handleRangeChange = (type: "start" | "end", val: string) => {
    setDateFilter(prev => ({ ...prev, [type]: val }));
  };

  const clearDates = () => {
    setDateFilter({ start: "", end: "" });
    setDateMode(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card-bg border border-white/5 p-1.5 rounded-2xl shadow-2xl relative w-full sm:w-auto">
      {/* Mode Selectors */}
      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5 w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={() => {
            setDateMode("single");
            setDateFilter({ start: "", end: "" });
          }}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
            dateMode === "single" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-500 hover:text-white hover:bg-white/5"
          )}
        >
          <CalendarDays size={12} /> Single
        </button>
        <button
          onClick={() => {
            setDateMode("range");
            setDateFilter({ start: "", end: "" });
          }}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
            dateMode === "range" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white hover:bg-white/5"
          )}
        >
          <CalendarRange size={12} /> Range
        </button>
      </div>

      {/* Input Area */}
      <div className="overflow-hidden w-full sm:w-auto">
        <AnimatePresence mode="wait">
          {dateMode === "single" && (
            <motion.div 
              key="single"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-1 sm:px-2 pt-2 sm:pt-0 w-full sm:w-auto"
            >
              <div className="relative group flex items-center w-full sm:w-auto">
                <CalendarIcon size={14} className="absolute left-3 text-brand group-hover:text-white transition-colors pointer-events-none z-10" />
                <input 
                  type="date"
                  value={dateFilter.start}
                  onChange={handleSingleDateChange}
                  className="w-full sm:w-[140px] h-9 sm:h-8 bg-brand/5 hover:bg-brand/10 border border-brand/20 rounded-lg pl-9 pr-3 text-[10px] font-bold text-white uppercase outline-none cursor-pointer scheme-dark transition-colors relative z-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </motion.div>
          )}

          {dateMode === "range" && (
            <motion.div 
              key="range"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row items-center gap-2 px-1 sm:px-2 pt-2 sm:pt-0 w-full sm:w-auto"
            >
              <div className="relative group flex items-center w-full sm:w-auto">
                <CalendarIcon size={14} className="absolute left-3 text-amber-500 group-hover:text-white transition-colors pointer-events-none z-10" />
                <input 
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => handleRangeChange("start", e.target.value)}
                  className="w-full sm:w-[130px] h-9 sm:h-8 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg pl-9 pr-2 text-[10px] font-bold text-white uppercase outline-none cursor-pointer scheme-dark transition-colors relative z-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <span className="text-slate-600 text-[8px] font-black uppercase hidden sm:block">TO</span>
              <div className="relative group flex items-center w-full sm:w-auto">
                <input 
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => handleRangeChange("end", e.target.value)}
                  className="w-full sm:w-[110px] h-9 sm:h-8 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 text-[10px] font-bold text-white uppercase outline-none cursor-pointer scheme-dark transition-colors relative z-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Button */}
      <AnimatePresence>
        {(dateFilter.start || dateFilter.end) && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={clearDates}
            className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto p-2 sm:mr-1 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-500 rounded-lg transition-all z-20"
            title="Clear Date Filter"
          >
            <X size={12} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
