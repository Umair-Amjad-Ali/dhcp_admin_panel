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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CustomersPage() {
  const { customers, loading, hasMore, loadMore, loadingMore } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">
            Customer Registry <span className="text-brand">.</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.2em]">
              {customers.length} Profiles Cached {hasMore && " • More in Cloud"}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Filter */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-700 group-focus-within:text-brand transition-colors">
          <Search size={16} />
        </div>
        <input 
          type="text" 
          placeholder="Lookup by customer name, email or mobile serial..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-bg border border-white/3 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-brand/40 shadow-2xl transition-all"
        />
      </div>

      <div className="space-y-2">
        {/* Registry Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">
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
                   <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
                      <div className="col-span-4 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
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

                      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-500">
                         <Phone size={12} className="text-slate-800" />
                         <span className="text-[10px] font-black tabular-nums">{user.phone || "---"}</span>
                      </div>

                      <div className="col-span-3 hidden lg:flex items-center gap-6">
                         <Metric icon={<ShoppingBag size={10} className="text-brand"/>} value={user.totalOrders || 0} label="Total" />
                         <Metric icon={<CheckCircle2 size={10} className="text-emerald-500"/>} value={user.completedOrders || 0} label="Done" />
                         <Metric icon={<XCircle size={10} className="text-rose-500"/>} value={user.cancelledOrders || 0} label="Lost" />
                      </div>

                      <div className="col-span-2 hidden lg:flex items-center gap-2 text-slate-600">
                         <Calendar size={12} className="text-slate-800" />
                         <span className="text-[9px] font-black uppercase tracking-widest">
                            {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "Historical"}
                         </span>
                      </div>

                      <div className="col-span-1 flex justify-end">
                         <Link 
                           href={`/admin/customers/${user.id}`}
                           className="h-9 w-9 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-600 hover:text-white hover:bg-brand transition-all shadow-lg"
                         >
                            <ChevronRight size={18} />
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

        {!loading && filteredCustomers.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4 opacity-50 text-slate-800">
            <Database size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest italic">User registry search returned no matches</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon, value, label }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
       <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-black text-white tabular-nums">{value}</span>
       </div>
       <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function CustomerShimmer() {
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
