"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { DollarSign } from "lucide-react";

interface FinancialsCardProps {
  order: any;
}

export const FinancialsCard = ({ order }: FinancialsCardProps) => {
  return (
    <Card className="p-6 bg-card-bg border border-white/5 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform duration-500">
         <DollarSign size={140} strokeWidth={1} />
      </div>
      <div className="relative z-10">
         <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
               <DollarSign size={18} />
            </div>
            <div>
               <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Financial Matrix</h3>
               <p className="text-xs font-black text-white uppercase italic tracking-widest">ESTIMATED QUOTA</p>
            </div>
         </div>
         
         <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-black text-white italic tracking-tighter">
              {order.service?.estimatedPrice || order.estimatedPrice || "0"}
            </span>
            <span className="text-sm font-black text-brand uppercase">{order.service?.currency || order.currency || "AED"}</span>
         </div>

         <div className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest mb-4">
               <span className="text-slate-700 uppercase italic">Status</span>
               <span className="text-emerald-500 uppercase italic">Awaiting Settlement</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-brand w-1/3 rounded-full shadow-[0_0_10px_rgba(var(--brand-rgb),0.5)]" />
            </div>
         </div>
      </div>
    </Card>
  );
};
