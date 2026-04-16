"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Wrench, 
  Layers, 
  AlertCircle, 
  Info, 
  Calendar, 
  Clock, 
  Clock3, 
  Activity 
} from "lucide-react";

interface ServiceDetailsCardProps {
  order: any;
}

const HistoryBlock = ({ label, icon, value }: any) => (
  <div className="space-y-2">
     <div className="flex items-center gap-2">
        {icon}
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none italic">{label}</span>
     </div>
     <p className="text-[11px] font-black text-white uppercase italic truncate">{value}</p>
  </div>
);

export const ServiceDetailsCard = ({ order }: ServiceDetailsCardProps) => {
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 text-white/2 group-hover:text-white/3 transition-colors">
         <Wrench size={180} strokeWidth={1} />
      </div>
      
      <div className="relative z-10">
         <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
               <Layers size={20} />
            </div>
            <div>
               <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5">Service Classification</h3>
               <p className="text-base font-black text-white uppercase italic tracking-tight">
                 {order.serviceType || order.service?.serviceType} / {order.serviceSubType || order.service?.serviceSubType}
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/3">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-brand" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Primary issue</span>
               </div>
               <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-2">
                    {order.issue?.label?.replace(/_/g, " ") || "No Label Provided"}
                  </h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {order.issue?.customDescription || order.customDescription || "No custom intelligence logged."}
                  </p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <Info size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Extended diagnostics</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  {order.selectedIssues && order.selectedIssues.length > 0 ? (
                    order.selectedIssues.map((issue: string, index: number) => (
                      <Badge key={index} className="bg-blue-500/5 text-blue-400 border border-blue-500/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic">
                        {issue.replace(/_/g, " ")}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-700 font-black uppercase italic">No secondary issues selected</span>
                  )}
               </div>
               <div className="pt-2">
                  <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-1">Hardware Type</p>
                  <p className="text-[11px] font-black text-white uppercase italic">{order.type?.replace(/_/g, " ") || "Generic"}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            <HistoryBlock label="Target Date" icon={<Calendar size={12} className="text-brand"/>} value={order.schedule?.preferredDate ? new Date(order.schedule.preferredDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD"} />
            <HistoryBlock label="Target Slot" icon={<Clock size={12} className="text-brand"/>} value={order.schedule?.preferredTimeSlot || "N/A"} />
            <HistoryBlock label="Time Range" icon={<Clock3 size={12} className="text-brand"/>} value={order.schedule?.timeRange || "N/A"} />
            <HistoryBlock label="Last Sync" icon={<Activity size={12} className="text-brand"/>} value={formatDateTime(order.updatedAt)} />
         </div>
      </div>
    </Card>
  );
};
