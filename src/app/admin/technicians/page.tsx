"use client";

import React, { useState } from "react";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useTechnicianActions } from "@/hooks/useTechnicianActions";
import { UserPlus, Search, Database, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddTechModal } from "@/components/technicians/AddTechModal";
import { EditTechModal } from "@/components/technicians/EditTechModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { TechnicianListItem } from "@/components/technicians/TechnicianListItem";
import { TechnicianShimmer } from "@/components/technicians/TechnicianShimmer";
import { RegistryLayout } from "@/components/common/RegistryLayout";

export default function TechniciansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { technicians, loading, hasMore, loadMore, loadingMore } = useTechnicians(searchQuery);
  const { executeStatusUpdate, statusLoading } = useTechnicianActions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
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
    
    if (isBusy && newStatus === "suspended") {
      setConfirmModal({ isOpen: true, tech });
      return;
    }

    executeStatusUpdate(tech, newStatus);
  };

  const actionButton = (
    <button 
      onClick={() => setIsModalOpen(true)}
      className="flex items-center gap-2 px-5 py-3 bg-brand rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg active:scale-95"
    >
      <UserPlus size={14} />
      Register Specialist
    </button>
  );

  return (
    <>
      <RegistryLayout
      title="Fleet Registry"
      metricText={`${technicians.length} Operatives Synced`}
      pulseColor="emerald"
      searchPlaceholder="Lookup specialist by name, skill or email registry..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      actionSlot={actionButton}
      loading={loading}
      isEmpty={filteredTechs.length === 0}
      emptyMessage="Inventory search resolved zero results"
    >
      <div className="space-y-2">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] bg-card-bg/50 border border-white/5 rounded-2xl mb-2">
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
             {[1,2,3,4,5].map(i => <TechnicianShimmer key={i} />)}
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
                   <TechnicianListItem 
                      tech={tech}
                      onEdit={handleEdit}
                      onStatusToggle={handleStatusToggle}
                      isStatusLoading={statusLoading === tech.id}
                   />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination Control */}
            {hasMore && !searchQuery && (
              <div className="pt-8 flex justify-center">
                 <button 
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="group flex items-center gap-3 px-8 py-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50"
                 >
                    {loadingMore ? (
                       <div className="h-4 w-4 border-2 border-brand/20 border-t-brand animate-spin rounded-full" />
                    ) : (
                       <>
                         <Layers size={16} className="text-brand group-hover:rotate-12 transition-transform" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronize Next Batch</span>
                       </>
                    )}
                 </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AddTechModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditTechModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingTech(null); }} technician={editingTech} />
      
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
      </RegistryLayout>
    </>
  );
}
