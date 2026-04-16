"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { 
  MapPin, 
  Building2, 
  Hash, 
  Globe2, 
  ExternalLink 
} from "lucide-react";

interface LocationDetailsCardProps {
  order: any;
}

export const LocationDetailsCard = ({ order }: LocationDetailsCardProps) => {
  return (
    <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem]">
      <div className="flex items-center gap-3 mb-8">
         <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <MapPin size={20} />
         </div>
         <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5">Operational Theatre</h3>
            <p className="text-base font-black text-white uppercase italic tracking-tight">Location Intelligence</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
               <Building2 size={10} /> Area / District
            </p>
            <p className="text-xs font-black text-white uppercase italic">{order.location?.area || order.area || "Not Specified"}</p>
         </div>
         <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
               <Hash size={10} /> Unit / Building
            </p>
            <p className="text-xs font-black text-white uppercase italic">{order.location?.buildingDetails || order.buildingDetails || "Not Specified"}</p>
         </div>
         <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
               <Globe2 size={10} /> Geo-Zone
            </p>
            <p className="text-xs font-black text-white uppercase italic">{order.location?.city || order.city}, {order.location?.country || order.country || "UAE"}</p>
         </div>
      </div>

      <div className="space-y-4 p-5 bg-white/1 border border-white/5 rounded-2xl">
         <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Formatted Global Address</p>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location?.formattedAddress || order.formattedAddress || "")}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-black text-brand uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              View on Map <ExternalLink size={10} />
            </a>
         </div>
         <p className="text-xs text-slate-400 font-bold leading-relaxed italic">
            {order.location?.formattedAddress || order.formattedAddress || "Zero address data available in registry."}
         </p>
      </div>
    </Card>
  );
};
