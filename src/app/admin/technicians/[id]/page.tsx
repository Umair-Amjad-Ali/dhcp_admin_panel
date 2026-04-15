"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTechnicianDetails } from "@/hooks/useTechnicianDetails";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Wrench,
  Award,
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TechnicianDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { technician, orders, loading } = useTechnicianDetails(id as string);

  if (loading) {
    return <TechnicianShimmer />;
  }

  if (!technician) {
    return (
      <div className="p-20 text-center space-y-4">
         <div className="h-16 w-16 bg-white/5 rounded-full mx-auto flex items-center justify-center text-slate-800">
            <Briefcase size={32} />
         </div>
         <h2 className="text-xl font-black text-white uppercase italic">Specialist Not Found</h2>
         <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">The requested operative is not registered in the active fleet</p>
         <button onClick={() => router.back()} className="text-[10px] font-black text-brand uppercase tracking-widest underline decoration-2 underline-offset-8 mt-4 block mx-auto">Return to Fleet</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Navigation & Header */}
      <div className="flex items-center gap-4">
         <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
         </button>
         <div>
            <h2 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Fleet Intelligence</h2>
            <h1 className="text-lg font-black text-white uppercase italic tracking-tight">{technician.name}</h1>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-6 bg-card-bg border-white/3 rounded-[2rem] flex flex-col justify-between overflow-hidden relative">
           <div className="absolute -top-10 -right-10 text-brand/5">
              <ShieldCheck size={200} strokeWidth={1} />
           </div>

           <div className="relative z-10">
              <div className="h-20 w-20 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-3xl font-black italic mb-6 shadow-2xl">
                 {technician.name?.[0]}
              </div>
              
              <div className="space-y-4">
                 <div>
                    <Badge className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase border-none", getStatusStyles(technician.status))}>
                       {technician.status || "Active"}
                    </Badge>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-400">
                       <Mail size={16} className="text-slate-700" />
                       <span className="text-xs font-bold">{technician.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                       <Phone size={16} className="text-slate-700" />
                       <span className="text-xs font-bold">{technician.phone || "---"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                       <MapPin size={16} className="text-slate-700" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{technician.location || "Dubai, UAE"}</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-3">Specialized Skillset</p>
                    <div className="flex flex-wrap gap-2">
                       {technician.skills?.map((skill: string) => (
                          <Badge key={skill} className="bg-white/2 text-slate-400 border border-white/5 text-[7px] px-2 py-1 uppercase font-black">
                             {skill}
                          </Badge>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-8 relative z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/5 border border-brand/10 text-brand">
                 <Award size={14} />
                 <span className="text-[8px] font-black uppercase tracking-widest">Verified Operative</span>
              </div>
           </div>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricBox 
                label="Mission Volume" 
                value={technician.completedJobs || 0} 
                icon={<Briefcase size={24}/>} 
                color="text-brand" 
              />
              <MetricBox 
                label="Success Rate" 
                value="98%" 
                icon={<CheckCircle2 size={24}/>} 
                color="text-emerald-500" 
              />
              <MetricBox 
                label="System Health" 
                value="A+" 
                icon={<Zap size={24}/>} 
                color="text-amber-500" 
              />
           </div>

           {/* Active Deployment (If Busy) */}
           {technician.status?.toLowerCase() === "busy" && (
              <Card className="p-6 bg-amber-500/5 border-amber-500/10 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 text-amber-500/5 group-hover:rotate-12 transition-transform">
                    <Clock size={120} />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4 italic">Live Deployment</h3>
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-lg font-black text-white uppercase italic tracking-tight">Active Operation In Progress</p>
                          <p className="text-[9px] text-slate-600 font-bold mt-1 uppercase tracking-widest">Specialist is currently deployed on the field</p>
                       </div>
                    </div>
                 </div>
              </Card>
           )}
        </div>
      </div>

      {/* Mission History */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Fleet Mission History</h3>
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">{orders.length} Deployment Logs</span>
         </div>

         <div className="space-y-3">
            {orders.length === 0 ? (
               <div className="py-20 bg-card-bg border border-white/2 rounded-[2.5rem] flex flex-col items-center gap-4 opacity-50">
                  <Clock size={32} className="text-slate-800" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No historical mission data for this operative</p>
               </div>
            ) : (
               orders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="group block bg-card-bg border border-white/2 rounded-2xl p-4 hover:border-brand/30 transition-all hover:shadow-2xl"
                    >
                        <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4">
                           {/* Mission Profile Item */}
                           <div className="col-span-6 w-full flex items-center justify-between lg:justify-start gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="h-10 w-10 shrink-0 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-brand transition-colors shadow-inner">
                                    <Wrench size={18} />
                                 </div>
                                 <div className="min-w-0">
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                                       {order.service?.serviceType || "Unknown"}
                                       <span className="mx-2 text-slate-700">/</span>
                                       <span className="text-slate-400">{order.service?.serviceSubType}</span>
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-700 uppercase mt-0.5">
                                       Log ID: {order.id.slice(0, 8)}...
                                    </p>
                                 </div>
                              </div>
                              {/* Mobile Date Badge */}
                              <div className="lg:hidden flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/2 border border-white/5 text-slate-500">
                                 <Clock size={8} className="text-slate-800" />
                                 <span className="text-[7px] font-black uppercase tabular-nums">
                                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Historical"}
                                 </span>
                              </div>
                           </div>

                           {/* Registry Log (Desktop) */}
                           <div className="col-span-3 hidden lg:block">
                              <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest text-right italic">Registry Log</p>
                              <p className="text-[10px] font-bold text-white tabular-nums mt-0.5 text-right">
                                 {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "N/A"}
                              </p>
                           </div>

                           {/* Operation Pulse Hub */}
                           <div className="col-span-3 w-full flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t border-white/5 lg:border-none mt-1 lg:mt-0">
                              <div className="lg:hidden text-[7px] font-black text-slate-700 uppercase tracking-widest">Mission Pulse</div>
                              <div className="flex items-center gap-4">
                                 <Badge className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase border-none", getOrderStateStyles(order.status))}>
                                    {order.status || "Pending"}
                                 </Badge>
                                 <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-700 group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
                                    <ChevronRight size={16} />
                                 </div>
                              </div>
                           </div>
                        </div>
                    </Link>
                  </motion.div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon, color }: any) {
  return (
    <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-brand/20 transition-all">
       <div className={cn("mb-4 p-4 rounded-2xl bg-white/2 group-hover:scale-110 transition-transform shadow-inner", color)}>
          {icon}
       </div>
       <h3 className="text-2xl font-black text-white tabular-nums tracking-tighter">{value}</h3>
       <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] mt-2 italic">{label}</p>
    </Card>
  );
}

function TechnicianShimmer() {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/2" />
          <div className="space-y-2">
             <div className="h-3 w-32 bg-white/2 rounded" />
             <div className="h-4 w-48 bg-white/2 rounded" />
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-80 bg-card-bg border border-white/3 rounded-[2rem]" />
          <div className="lg:col-span-2 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-card-bg border border-white/3 rounded-[2rem]" />)}
             </div>
          </div>
       </div>

       <div className="space-y-3 pt-6">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-20 bg-card-bg border border-white/2 rounded-2xl" />
          ))}
       </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'active': return 'bg-emerald-500/10 text-emerald-500';
    case 'busy': return 'bg-amber-500/10 text-amber-500';
    case 'suspended': return 'bg-rose-500/10 text-rose-500';
    default: return 'bg-slate-500/10 text-slate-500';
  }
}

function getOrderStateStyles(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-500';
    case 'cancelled': return 'bg-rose-500/10 text-rose-500';
    case 'in-progress': return 'bg-blue-500/10 text-blue-500';
    case 'pending': return 'bg-amber-500/10 text-amber-500';
    default: return 'bg-slate-500/10 text-slate-500';
  }
}
