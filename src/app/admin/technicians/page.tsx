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
  Wrench,
  Edit2,
  RotateCcw,
  Loader2,
  MapPin,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AddTechModal } from "@/components/technicians/AddTechModal";
import { EditTechModal } from "@/components/technicians/EditTechModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function TechniciansPage() {
  const { technicians, loading } = useTechnicians();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; tech: any } | null>(null);

  const filteredTechs = technicians.filter(tech => 
    tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    tech.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (tech: any) => {
    setEditingTech(tech);
    setIsEditModalOpen(true);
  };

  const handleStatusToggle = async (tech: any) => {
    const isBusy = tech.status?.toLowerCase() === "busy";
    const newStatus = tech.status === "active" || tech.status === "busy" ? "suspended" : "active";
    
    // Safety Confirmation for Busy Technicians
    if (isBusy && newStatus === "suspended") {
      setConfirmModal({ isOpen: true, tech });
      return;
    }

    executeStatusUpdate(tech, newStatus);
  };

  const executeStatusUpdate = async (tech: any, newStatus: string) => {
    setStatusLoading(tech.id);
    try {
      let finalStatus = newStatus;

      // Logic check for Activation: Should they be Active or Busy?
      if (newStatus === "active") {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef, 
          where("assignedTechId", "==", tech.id),
          where("status", "==", "in-progress")
        );
        const orderSnap = await getDocs(q);
        
        // Also check 'order' collection
        const orderAltRef = collection(db, "order");
        const qAlt = query(
          orderAltRef,
          where("assignedTechId", "==", tech.id),
          where("status", "==", "in-progress")
        );
        const orderAltSnap = await getDocs(qAlt);

        if (!orderSnap.empty || !orderAltSnap.empty) {
          finalStatus = "busy";
        }
      }

      const techRef = doc(db, "technicians", tech.id);
      await updateDoc(techRef, {
        status: finalStatus,
        updatedAt: serverTimestamp()
      });
      
      toast.success(
        finalStatus === "active" 
          ? `Specialist ${tech.name} is now ACTIVE.`
          : finalStatus === "busy"
          ? `Specialist ${tech.name} restored to BUSY (Active Job Detected).`
          : `Specialist ${tech.name} has been SUSPENDED.`
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      toast.error("Failed to update registry.");
    } finally {
      setStatusLoading(null);
    }
  };

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
           <div className="col-span-2">Pros Identity</div>
           <div className="col-span-2">Contact Signal</div>
           <div className="col-span-2">Base Location</div>
           <div className="col-span-2">Core Expertise</div>
           <div className="col-span-1 text-center">Jobs</div>
           <div className="col-span-1 text-center">Status</div>
           <div className="col-span-2 text-right">Actions</div>
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
                  className="group bg-card-bg border border-white/2 rounded-2xl p-3 lg:p-4 hover:border-brand/30 transition-all hover:shadow-2xl hover:shadow-brand/5 relative"
                >
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
                      <div className="col-span-1 hidden lg:block text-center">
                         <span className="text-xs font-black text-white tabular-nums">{tech.completedJobs || 0}</span>
                      </div>

                      {/* Status & Actions Hub (Mobile Optimized) */}
                      <div className="w-full lg:col-span-1 flex items-center justify-between lg:contents pt-3 lg:pt-0 border-t border-white/5 lg:border-t-0">
                        {/* Status Section */}
                        <div className="lg:col-span-1 flex lg:justify-center">
                           <Badge className={cn("px-2.5 py-1 rounded-full text-[7px] font-black uppercase border-none", getStatusStyles(tech.status))}>
                              {tech.status || "Pending"}
                           </Badge>
                        </div>

                        {/* Actions Section - Pinned to absolute right */}
                        <div className="lg:col-span-2 flex justify-end gap-2 shrink-0">
                           <Tooltip content="View Details">
                              <Link
                                href={`/admin/technicians/${tech.id}`}
                                className="h-8 w-8 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all shadow-inner"
                              >
                                 <Eye size={13} />
                              </Link>
                           </Tooltip>

                           <Tooltip content="Edit Specialist Profile">
                             <button 
                              onClick={() => handleEdit(tech)}
                              className="h-8 w-8 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-700 hover:text-brand transition-all shadow-inner"
                             >
                                <Edit2 size={13} />
                             </button>
                           </Tooltip>

                           {["active", "busy"].includes(tech.status?.toLowerCase()) ? (
                             <Tooltip content="Ban Operative">
                               <button 
                                onClick={() => handleStatusToggle(tech)}
                                disabled={statusLoading === tech.id}
                                className="h-8 w-8 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                               >
                                  {statusLoading === tech.id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={15} />}
                               </button>
                             </Tooltip>
                           ) : (
                             <Tooltip content="Activate Operative">
                               <button 
                                onClick={() => handleStatusToggle(tech)}
                                disabled={statusLoading === tech.id}
                                className="h-8 w-8 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                               >
                                  {statusLoading === tech.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                               </button>
                             </Tooltip>
                           )}
                        </div>
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

      {/* Edit Tech Modal */}
      <EditTechModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTech(null);
        }}
        technician={editingTech}
      />

      {/* Tactical Suspension Warning */}
      <ConfirmationModal 
        isOpen={!!confirmModal?.isOpen}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => confirmModal?.tech && executeStatusUpdate(confirmModal.tech, "suspended")}
        variant="warning"
        title="Active Assignment Intercept"
        description={`Specialist ${confirmModal?.tech?.name} is currently engaging in a live task. Suspending them now will blacklist them from future deployments immediately after this task concludes.`}
        confirmText="Confirm Suspension"
        cancelText="Abort Deactivation"
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
