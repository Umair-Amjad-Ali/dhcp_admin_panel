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
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface AssignTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onAssigned?: () => void;
  previousTechId?: string | null;
}

export const AssignTechModal = ({ isOpen, onClose, orderId, onAssigned, previousTechId }: AssignTechModalProps) => {
  const { technicians, loading } = useTechnicians();
  const [searchQuery, setSearchQuery] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  const availableTechs = technicians.filter(tech => 
    tech.status?.toLowerCase() === "active" && 
    (tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleAssign = async (tech: any) => {
    setAssigning(tech.id);
    try {
      // 1. Revert Previous Technician Status (if applicable)
      if (previousTechId && previousTechId !== tech.id) {
        const prevTechRef = doc(db, "technicians", previousTechId);
        await updateDoc(prevTechRef, {
          status: "active",
          updatedAt: serverTimestamp()
        }).catch(e => console.error("Previous Tech Revert Error:", e));
      }

      // 2. Update the Order Document
      const orderRef = doc(db, "orders", orderId);
      const collections = ["orders", "order"];
      
      for (const col of collections) {
        await updateDoc(doc(db, col, orderId), {
          assignedTechId: tech.id,
          assignedTechName: tech.name,
          assignedTechPhone: tech.phone,
          status: "in-progress", 
          updatedAt: serverTimestamp(),
          assignedAt: serverTimestamp()
        }).catch(() => {});
      }

      // 3. Update New Technician Availability
      const techRef = doc(db, "technicians", tech.id);
      await updateDoc(techRef, {
        status: "busy",
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-card-bg border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-white/5 bg-white/1">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                      <UserPlus size={20} />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Job Dispatch</h3>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2">Select Operative for Deployment</p>
                   </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-brand">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Lookup by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/2 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[10px] font-bold text-white focus:outline-none focus:border-brand/40 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
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

            <div className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center justify-between">
               <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Active Fleet Capacity: {technicians.length}</span>
               <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Real-time Sync Active</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
