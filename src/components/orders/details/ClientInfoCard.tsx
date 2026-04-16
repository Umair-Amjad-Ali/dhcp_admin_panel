"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { User, Hash, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfoCardProps {
  order: any;
}

const DetailItem = ({ icon, label, value, className }: any) => (
  <div className={cn("p-4 rounded-2xl border border-white/3 space-y-2 transition-all hover:bg-white/2", className)}>
     <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{label}</span>
     </div>
     <p className="text-xs font-black text-white tracking-wide truncate">{value}</p>
  </div>
);

export const ClientInfoCard = ({ order }: ClientInfoCardProps) => {
  return (
    <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 text-white/2">
         <User size={80} strokeWidth={1} />
      </div>
      <div className="relative z-10">
         <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-black text-xl italic shadow-inner">
               {order.userDetails?.name?.[0] || <User size={24} />}
            </div>
            <div>
               <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Client Authority</h3>
               <p className="text-sm font-black text-white uppercase tracking-tight italic">{order.userDetails?.name || "Unknown Identity"}</p>
            </div>
         </div>

         <div className="space-y-5">
            <DetailItem icon={<Hash size={14} />} label="System UID" value={order.userDetails?.userId || order.userId || "GHOST_UID"} className="bg-white/1" />
            <DetailItem icon={<Mail size={14} />} label="Intel Comms" value={order.userDetails?.email || order.userEmail || "No Email"} />
            <DetailItem icon={<Phone size={14} />} label="Tactical Link" value={`${order.userDetails?.countryCode || ""} ${order.userDetails?.phone || "No Phone"}`} />
         </div>
      </div>
    </Card>
  );
};
