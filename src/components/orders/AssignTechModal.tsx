"use client";

import React, { useState } from "react";
import { useTechnicians } from "@/hooks/useTechnicians";
import { 
  X, 
  Wrench, 
  Star, 
  UserPlus, 
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface AssignTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onAssigned?: () => void;
  previousTechId?: string | null;
}

import { MissionModal } from "@/components/common/MissionModal";

export const AssignTechModal = ({ isOpen, onClose, orderId, onAssigned, previousTechId }: AssignTechModalProps) => {
  const { technicians, loading } = useTechnicians();
  const [searchQuery, setSearchQuery] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  const getActiveJobsCount = (tech: any) => tech.activeJobsCount || 0;

  const availableTechs = technicians.filter(tech => {
    const isSuspended = tech.status?.toLowerCase() === "suspended";
    const jobsCount = getActiveJobsCount(tech);
    const isWithinLimit = jobsCount < 5;
    
    // Tech must not be suspended and must have less than 5 jobs
    const isEligible = !isSuspended && isWithinLimit;

    const matchesSearch = tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tech.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return isEligible && matchesSearch;
  });

  const handleAssign = async (tech: any) => {
    setAssigning(tech.id);
    try {
      if (previousTechId && previousTechId !== tech.id) {
        const prevTech = technicians.find(t => t.id === previousTechId);
        const prevTechStatus = prevTech?.status?.toLowerCase();
        const finalPrevStatus = prevTechStatus === "suspended" ? "suspended" : "active";

        const currentJobs = prevTech?.activeJobsCount || 0;
        const newPrevJobsCount = Math.max(0, currentJobs - 1);

        const prevTechRef = doc(db, "technicians", previousTechId);
        await updateDoc(prevTechRef, {
          status: finalPrevStatus,
          activeJobsCount: newPrevJobsCount,
          updatedAt: serverTimestamp()
        }).catch(e => console.error("Previous Tech Revert Error:", e));
      }

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        assignedTechId: tech.id,
        assignedTechName: tech.name,
        assignedTechPhone: tech.phone,
        status: "in-progress", 
        updatedAt: serverTimestamp(),
        assignedAt: serverTimestamp()
      });

      const currentJobs = getActiveJobsCount(tech);
      const newStatus = (currentJobs + 1) >= 5 ? "busy" : "active";

      const techRef = doc(db, "technicians", tech.id);
      await updateDoc(techRef, {
        status: newStatus,
        activeJobsCount: increment(1),
        updatedAt: serverTimestamp()
      }).catch(e => console.error("Tech Availability Update Error:", e));

      toast.success(`Specialist ${tech.name} Dispatched!`);
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      console.error("Assignment Error:", err);
      toast.error("Failed to assign technician.");
    } finally {
      setAssigning(null);
    }
  };

  const headerSearch = (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-brand">
        <Search size={16} />
      </div>
      <input 
        type="text" 
        placeholder="Lookup by name or expertise..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white/2 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[10px] font-bold text-white focus:outline-none focus:border-brand/40 transition-all shadow-inner"
      />
    </div>
  );

  return (
    <MissionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Dispatch"
      subtitle="Select Operative for Deployment"
      icon={<UserPlus size={20} />}
      maxWidth="max-w-lg"
      headerAction={headerSearch}
    >
      <div className="p-4 space-y-2">
         {loading ? (
           [1,2,3].map(i => <div key={i} className="h-20 bg-white/1 rounded-2xl animate-pulse" />)
         ) : availableTechs.length === 0 ? (
           <div className="text-center py-10 opacity-30 uppercase text-[10px] font-black tracking-widest">No available pros matched</div>
         ) : (
           availableTechs.map((tech) => (
             <div 
              key={tech.id}
              onClick={() => handleAssign(tech)}
              className="group bg-white/1 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-brand/10 hover:border-brand/30 cursor-pointer transition-all active:scale-[0.98]"
             >
                <div className="flex items-center gap-4">
                   <div className="h-11 w-11 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand group-hover:text-white transition-all font-black">
                      {tech.name?.[0]}
                   </div>
                   <div className="min-w-0">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight truncate pr-2">{tech.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                         <Wrench size={10} className="text-slate-700" />
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[150px]">
                           {tech.skills?.slice(0, 2).join(", ") || "General Pro"}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                      <ShieldCheck size={10} />
                      <span className="text-[7px] font-black uppercase">Approved</span>
                   </div>
                   <div className="text-[9px] font-black tracking-widest text-brand mt-1 uppercase">Jobs: {getActiveJobsCount(tech)}/5</div>
                   {assigning === tech.id ? (
                     <div className="h-4 w-4 border-2 border-brand/20 border-t-brand animate-spin rounded-full" />
                   ) : (
                     <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest group-hover:text-brand transition-colors">Select Unit</div>
                   )}
                </div>
             </div>
           ))
         )}
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center justify-between sticky bottom-0 backdrop-blur-md">
         <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Active Fleet Capacity: {technicians.length}</span>
         <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Real-time Sync Active</span>
         </div>
      </div>
    </MissionModal>
  );
};
