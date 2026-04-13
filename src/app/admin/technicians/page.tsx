"use client";

import React, { useState } from "react";
import { useTechnicians } from "@/hooks/useTechnicians";
import { 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  CheckCircle2,
  Ban,
  Database,
  ArrowRight,
  ShieldCheck,
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AddTechModal } from "@/components/technicians/AddTechModal";

export default function TechniciansPage() {
  const { technicians, loading } = useTechnicians();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTechs = technicians.filter(tech => 
    tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    tech.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">
            Fleet Registry <span className="text-brand">.</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.2em]">
              {technicians.length} Operatives Synced
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg active:scale-95"
        >
          <UserPlus size={14} />
          Register Specialist
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-brand transition-colors">
          <Search size={16} />
        </div>
        <input 
          type="text" 
          placeholder="Lookup specialist by name, skill or email registry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-bg border border-white/3 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-brand/40 transition-all"
        />
      </div>

      <div className="space-y-2">
        {/* Table Header - Only visible on desktop */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">
           <div className="col-span-4">Pros Identity</div>
           <div className="col-span-2">Contact Signal</div>
           <div className="col-span-3">Core Expertise</div>
           <div className="col-span-1 text-center">Jobs</div>
           <div className="col-span-1 text-center">Status</div>
           <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="space-y-2">
             {[1,2,3,4,5].map(i => <TechListShimmer key={i} />)}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTechs.map((tech, idx) => (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group bg-card-bg border border-white/2 rounded-2xl p-3 lg:p-4 hover:border-brand/30 transition-all hover:shadow-2xl hover:shadow-brand/5 relative overflow-hidden"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
                      {/* Identity Column */}
                      <div className="col-span-4 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-brand font-black text-xs group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
                            {tech.name?.[0]}
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{tech.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-600">
                               <Mail size={10} />
                               <span className="text-[9px] font-bold truncate">{tech.email}</span>
                            </div>
                         </div>
                      </div>

                      {/* Contact Column */}
                      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-500">
                         <Phone size={12} className="text-slate-800" />
                         <span className="text-[10px] font-black tabular-nums">{tech.phone}</span>
                      </div>

                      {/* Expertise Column */}
                      <div className="col-span-3 hidden lg:flex flex-wrap gap-1.5">
                         {tech.skills?.slice(0, 3).map((skill: string) => (
                           <span key={skill} className="px-2 py-0.5 rounded-lg bg-white/2 border border-white/5 text-[7px] font-black text-slate-700 uppercase tracking-widest">{skill}</span>
                         ))}
                         {tech.skills?.length > 3 && <span className="text-[7px] text-slate-800 font-bold self-center">+{tech.skills.length - 3}</span>}
                      </div>

                      {/* Jobs Column */}
                      <div className="col-span-1 hidden lg:block text-center">
                         <span className="text-xs font-black text-white tabular-nums">{tech.completedJobs || 0}</span>
                      </div>

                      {/* Status Column */}
                      <div className="col-span-1 flex lg:justify-center">
                         <Badge className={cn("px-2.5 py-1 rounded-full text-[7px] font-black uppercase border-none", getStatusStyles(tech.status))}>
                           {tech.status || "Pending"}
                         </Badge>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-1 flex justify-end gap-2">
                         <button className="h-8 w-8 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-700 hover:text-emerald-500 transition-all">
                            <CheckCircle2 size={16} />
                         </button>
                         <button className="h-8 w-8 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-700 hover:text-rose-500 transition-all">
                            <Ban size={16} />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredTechs.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4 opacity-50 text-slate-800">
            <Database size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest italic">Inventory search resolved zero results</p>
          </div>
        )}
      </div>

      {/* Add Tech Modal */}
      <AddTechModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function TechListShimmer() {
  return (
    <div className="bg-card-bg border border-white/2 rounded-2xl p-4 relative overflow-hidden">
       <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/1 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
       <div className="flex items-center gap-6">
          <div className="h-10 w-10 rounded-xl bg-white/2 shrink-0" />
          <div className="grid grid-cols-4 gap-12 flex-1">
             <div className="h-3 bg-white/2 rounded w-3/4" />
             <div className="h-3 bg-white/2 rounded w-full" />
             <div className="h-3 bg-white/2 rounded w-1/2" />
             <div className="h-3 bg-white/2 rounded w-1/4" />
          </div>
       </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'active': return 'bg-emerald-500/10 text-emerald-500';
    case 'busy': return 'bg-brand/10 text-brand';
    case 'pending': return 'bg-amber-500/10 text-amber-500';
    default: return 'bg-slate-500/10 text-slate-500';
  }
}
