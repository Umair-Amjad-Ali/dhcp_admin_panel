"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SpecialistCardProps {
  order: any;
}

export const SpecialistCard = ({ order }: SpecialistCardProps) => {
  if (!order.assignedTechId) return null;

  return (
    <Link href={`/admin/technicians/${order.assignedTechId}`}>
      <Card className="p-6 bg-blue-500/5 border-blue-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-colors">
         <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl border border-blue-500/30">
               <ShieldCheck size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 leading-none italic">Assigned Specialist</p>
               <h4 className="text-lg font-black text-white uppercase tracking-tight italic">{order.assignedTechName}</h4>
               <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-slate-500">
                     <Phone size={12} className="text-blue-500/50" />
                     <span className="text-[11px] font-black tabular-nums tracking-wider">{order.assignedTechPhone}</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-500 transition-all">
            <ExternalLink size={18} />
         </div>
      </Card>
    </Link>
  );
};
