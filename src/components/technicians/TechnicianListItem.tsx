"use client";

import { 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Ban, 
  CheckCircle2, 
  Loader2, 
  Eye 
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TechnicianListItemProps {
  tech: any;
  onEdit: (tech: any) => void;
  onStatusToggle: (tech: any) => void;
  isStatusLoading: boolean;
}

export const TechnicianListItem = ({ 
  tech, 
  onEdit, 
  onStatusToggle, 
  isStatusLoading 
}: TechnicianListItemProps) => {

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500';
      case 'busy': return 'bg-brand/10 text-brand';
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4">
      {/* Identity & Mobile Location Row */}
      <div className="col-span-2 w-full flex items-center justify-between lg:justify-start gap-4">
        <Link 
          href={`/admin/technicians/${tech.id}`}
          className="flex items-center gap-4 min-w-0 hover:opacity-80 transition-opacity flex-1"
        >
           <div className="h-10 w-10 shrink-0 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-brand font-black text-xs group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
               {tech.name?.[0]}
           </div>
           <div className="min-w-0">
               <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{tech.name}</h4>
               <div className="flex items-center gap-1.5 mt-0.5 text-slate-600">
                 <Mail size={10} />
                 <span className="text-[9px] font-bold truncate">{tech.email}</span>
               </div>
           </div>
        </Link>

        {/* Mobile Location Badge - Pinned to absolute right */}
        <div className="lg:hidden flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/2 border border-white/5 text-slate-500 shrink-0">
           <MapPin size={8} className="text-slate-800" />
           <span className="text-[7px] font-black uppercase tracking-tighter">{tech.city || "N/A"}</span>
        </div>
      </div>

      {/* Contact Column (Desktop Only) */}
      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-500">
         <Phone size={12} className="text-slate-800" />
         <span className="text-[10px] font-black tabular-nums">{tech.phone}</span>
      </div>

      {/* Location Column (Desktop Only) */}
      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-500">
         <MapPin size={12} className="text-slate-800" />
         <span className="text-[9px] font-black uppercase tracking-widest">{tech.city || "Not Set"}</span>
      </div>

      {/* Expertise Column (Desktop Only) */}
      <div className="col-span-2 hidden lg:flex flex-wrap gap-2 items-center">
         {tech.skills?.slice(0, 2).map((skill: string) => (
           <span key={skill} className="flex items-center justify-center h-6 px-2.5 rounded-lg bg-white/2 border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest min-w-[45px]">
            {skill}
           </span>
         ))}
         {tech.skills?.length > 2 && (
           <Tooltip content={tech.skills.slice(2).join(" • ")}>
              <span className="flex items-center justify-center h-6 px-2.5 rounded-lg bg-brand/5 border border-brand/10 text-[8px] font-black text-brand uppercase tracking-tighter cursor-help hover:bg-brand/10 transition-colors">
                +{tech.skills.length - 2} more
              </span>
           </Tooltip>
         )}
      </div>

      {/* Jobs Column (Desktop Only) */}
      <div className="col-span-1 hidden lg:flex flex-col items-center justify-center">
         <span className="text-xs font-black text-white tabular-nums" title="Completed Jobs">{tech.completedJobs || 0}</span>
         <span className="text-[7px] font-black text-brand uppercase tracking-widest mt-0.5" title="Active Jobs Limit">
           {tech.activeJobsCount || 0}/5 ACTIVE
         </span>
      </div>

      {/* Status & Actions Hub (Mobile Optimized) */}
      <div className="w-full lg:col-span-2 flex items-center justify-between lg:contents pt-3 lg:pt-0 border-t border-white/5 lg:border-t-0">
        <div className="lg:col-span-1 flex lg:justify-center items-center gap-2">
           <Badge className={cn("px-2.5 py-1 rounded-full text-[7px] font-black uppercase border-none shrink-0", getStatusStyles(tech.status))}>
              {tech.status || "Pending"}
           </Badge>
           <span className="lg:hidden text-[7px] font-black text-brand uppercase tracking-widest shrink-0 whitespace-nowrap">
             {tech.activeJobsCount || 0}/5 ACTIVE
           </span>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-2 shrink-0">
           <Tooltip content="View Intelligence Dossier">
              <Link
                href={`/admin/technicians/${tech.id}`}
                className="h-8 w-8 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all shadow-inner"
              >
                 <Eye size={13} />
              </Link>
           </Tooltip>

           <Tooltip content="Edit Specialist Profile">
             <button 
              onClick={() => onEdit(tech)}
              className="h-8 w-8 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-700 hover:text-brand transition-all shadow-inner"
             >
                <Edit2 size={13} />
             </button>
           </Tooltip>

           {["active", "busy"].includes(tech.status?.toLowerCase()) ? (
             <Tooltip content="Ban Operative">
               <button 
                onClick={() => onStatusToggle(tech)}
                disabled={isStatusLoading}
                className="h-8 w-8 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50"
               >
                  {isStatusLoading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={15} />}
               </button>
             </Tooltip>
           ) : (
             <Tooltip content="Activate Operative">
               <button 
                onClick={() => onStatusToggle(tech)}
                disabled={isStatusLoading}
                className="h-8 w-8 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
               >
                  {isStatusLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
               </button>
             </Tooltip>
           )}
        </div>
      </div>
    </div>
  );
};
