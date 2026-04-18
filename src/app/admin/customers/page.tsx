"use client";

import React, { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag, 
  CheckCircle2,
  XCircle,
  ChevronRight,
  Database,
  Calendar,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MissionMetric } from "@/components/common/MissionMetric";
import { RegistryLayout } from "@/components/common/RegistryLayout";
import Link from "next/link";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { customers, loading, hasMore, loadMore, loadingMore } = useCustomers(searchQuery);

  const filteredCustomers = customers.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  return (
    <RegistryLayout
      title="Customer Registry"
      metricText={`${customers.length} Profiles Cached ${hasMore ? " • More in Cloud" : ""}`}
      pulseColor="blue"
      searchPlaceholder="Lookup by customer name, email or mobile serial..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      loading={loading}
      isEmpty={filteredCustomers.length === 0}
      emptyMessage="User registry search returned no matches"
    >
      <div className="space-y-2">
        {/* Registry Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] bg-card-bg/50 border border-white/5 rounded-2xl mb-2">
           <div className="col-span-4">Profile Identity</div>
           <div className="col-span-2">Contact Link</div>
           <div className="col-span-3">Order Statistics (T/C/X)</div>
           <div className="col-span-2">Registry Date</div>
           <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="space-y-2">
             {[1,2,3,4,5].map(i => <CustomerShimmer key={i} />)}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredCustomers.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group bg-card-bg border border-white/2 rounded-2xl p-4 hover:border-brand/30 transition-all hover:shadow-2xl hover:shadow-brand/5 relative"
                >
                   <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4">
                      {/* Profile Identity Row */}
                      <div className="col-span-4 w-full flex items-center justify-between lg:justify-start gap-4">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-brand font-black text-xs group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{user.name || "Anonymous User"}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-slate-600">
                                  <Mail size={10} />
                                  <span className="text-[9px] font-bold truncate">{user.email}</span>
                                </div>
                            </div>
                         </div>

                         {/* Mobile Phone Badge (Hidden on Desktop) */}
                         <div className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-white/2 border border-white/5 text-slate-500">
                            <Phone size={8} className="text-slate-800" />
                            <span className="text-[7px] font-black tracking-tighter tabular-nums">{user.phone || "---"}</span>
                         </div>
                      </div>

                      {/* Desktop Contact Column */}
                      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-500">
                         <Phone size={12} className="text-slate-800" />
                         <span className="text-[10px] font-black tabular-nums">{user.phone || "---"}</span>
                      </div>

                      {/* Order Statistics Hub (Responsive) */}
                      <div className="col-span-3 w-full flex items-center justify-between lg:justify-start lg:gap-6 py-3 lg:py-0 border-y border-white/5 lg:border-none my-1 lg:my-0">
                         <div className="lg:hidden text-[7px] font-black text-slate-700 uppercase tracking-widest">Order Pulse</div>
                         <div className="flex items-center gap-6">
                            <MissionMetric variant="minimal" icon={<ShoppingBag size={10} />} value={user.totalOrders || 0} label="Total" color="blue" />
                            <MissionMetric variant="minimal" icon={<CheckCircle2 size={10} />} value={user.completedOrders || 0} label="Done" color="emerald" />
                            <MissionMetric variant="minimal" icon={<XCircle size={10} />} value={user.cancelledOrders || 0} label="Lost" color="red" />
                         </div>
                      </div>

                      {/* Registry Date (Desktop Only) */}
                      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-600">
                         <Calendar size={12} className="text-slate-800" />
                         <span className="text-[9px] font-black uppercase tracking-widest">
                            {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "Historical"}
                         </span>
                      </div>

                      {/* Action Hub */}
                      <div className="col-span-1 w-full lg:w-auto flex items-center justify-end pt-3 lg:pt-0 border-t border-white/5 lg:border-none">
                         <Link 
                           href={`/admin/customers/${user.id}`}
                           className="w-full lg:h-9 lg:w-9 h-11 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center gap-3 text-slate-600 hover:text-white hover:bg-brand transition-all shadow-lg active:scale-95 group/btn px-4 lg:px-0"
                         >
                            <span className="lg:hidden text-[9px] font-black uppercase tracking-widest">View Profile Dossier</span>
                            <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                         </Link>
                      </div>
                   </div>
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
    </RegistryLayout>
  );
}

function CustomerShimmer() {
  return (
    <div className="bg-card-bg border border-white/2 rounded-2xl p-4 relative overflow-hidden">
       <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/1 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
       <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4">
          <div className="col-span-4 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-white/2 shrink-0" />
             <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/2 rounded w-2/3" />
                <div className="h-2 bg-white/2 rounded w-1/2" />
             </div>
          </div>
          <div className="col-span-2 hidden lg:block h-3 bg-white/2 rounded w-3/4" />
          <div className="col-span-3 hidden lg:flex items-center gap-6">
             <div className="h-4 w-12 bg-white/2 rounded-lg" />
             <div className="h-4 w-12 bg-white/2 rounded-lg" />
             <div className="h-4 w-12 bg-white/2 rounded-lg" />
          </div>
          <div className="col-span-2 hidden lg:block h-3 bg-white/2 rounded w-1/2" />
          <div className="col-span-1 hidden lg:flex justify-end">
             <div className="h-9 w-9 bg-white/2 rounded-xl" />
          </div>
       </div>
    </div>
  );
}
