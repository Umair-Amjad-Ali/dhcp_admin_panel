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
               {order.userDetails?.name?.[0] || order.name?.[0] || <User size={24} />}
            </div>
            <div>
               <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Client Authority</h3>
               <p className="text-sm font-black text-white uppercase tracking-tight italic">{order.userDetails?.name || order.name || order.userName || "Unknown Identity"}</p>
               <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-2 leading-tight">Master profile and authentication link</p>
            </div>
         </div>

          <div className="space-y-6">
            {/* Section 1: Contact Info */}
            <div className="space-y-3">
               <h4 className="text-[9px] font-black text-slate-700 uppercase tracking-widest pl-1">Primary Contact Details</h4>
               <div className="space-y-3">
                  <DetailItem icon={<Mail size={14} />} label="Email Address" value={order.userDetails?.email || order.email || "No Email"} />
                  <DetailItem icon={<Phone size={14} />} label="Phone Number" value={`${order.userDetails?.countryCode || ""} ${order.userDetails?.phone || order.phone || "No Phone"}`} />
               </div>
            </div>

            {/* Section 2: Account Info */}
            {(order.userEmail || order.userDetails?.userEmail || order.userId || order.userDetails?.userId) && (
               <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-[9px] font-black text-slate-700 uppercase tracking-widest pl-1">Authentication Source</h4>
                  <div className="space-y-3">
                     {(order.userEmail || order.userDetails?.userEmail) && (
                        <DetailItem 
                           icon={<User size={14} className="text-brand" />} 
                           label="Master Account" 
                           value={order.userEmail || order.userDetails?.userEmail} 
                           className="bg-brand/5 border-brand/10"
                        />
                     )}
                     
                  </div>
               </div>
            )}
         </div>
      </div>
    </Card>
  );
};
