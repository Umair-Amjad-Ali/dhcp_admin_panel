"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface MissionMetricProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'minimal' | 'card' | 'dashboard';
  color?: 'blue' | 'amber' | 'emerald' | 'red' | 'purple' | 'slate';
  className?: string;
}

const colorVariants: Record<string, string> = {
  blue: "text-blue-500 border-blue-900/10 bg-blue-500/5",
  amber: "text-amber-500 border-amber-900/10 bg-amber-500/5",
  emerald: "text-emerald-500 border-emerald-900/10 bg-emerald-500/5",
  red: "text-rose-500 border-rose-900/10 bg-rose-500/5",
  purple: "text-purple-500 border-purple-900/10 bg-purple-500/5",
  slate: "text-slate-500 border-slate-900/10 bg-white/2",
};

export const MissionMetric = ({ 
  label, 
  value, 
  icon, 
  variant = 'card', 
  color = 'blue',
  className 
}: MissionMetricProps) => {
  
  if (variant === 'minimal') {
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <div className="flex items-center gap-1.5">
           <div className={cn("shrink-0", colorVariants[color].split(' ')[0])}>
              {icon}
           </div>
           <span className="text-xs font-black text-white tabular-nums">{value}</span>
        </div>
        <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest leading-none">{label}</span>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Card className={cn(
        "p-4 rounded-2xl bg-card-bg border border-border-subtle transition-all duration-500 group overflow-hidden",
        color === 'blue' ? "hover:bg-brand/5" : `hover:bg-${color}-500/5`,
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl border border-border-subtle group-hover:scale-110 transition-transform", colorVariants[color])}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
          </div>
          <div className="min-w-0">
            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1.5 truncate">{label}</p>
            <div className="text-lg font-black text-white leading-none tabular-nums tracking-tighter truncate">{value}</div>
          </div>
        </div>
      </Card>
    );
  }

  // Default 'card' variant (Customer Details/Profile style)
  return (
    <Card className={cn(
      "p-6 bg-card-bg border-white/3 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-brand/20 transition-all overflow-hidden",
      className
    )}>
       <div className={cn(
         "mb-4 p-4 rounded-2xl border transition-transform group-hover:scale-110 shadow-inner",
         colorVariants[color]
       )}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
       </div>
       <h3 className="text-2xl font-black text-white tabular-nums tracking-tighter">{value}</h3>
       <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] mt-2 italic">{label}</p>
    </Card>
  );
};
