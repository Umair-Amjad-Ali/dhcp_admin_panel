"use client";

import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { FilterBar } from "@/components/orders/FilterBar";
import { DataTable } from "@/components/orders/DataTable";
import { CardView } from "@/components/orders/CardView";
import { RefreshCcw, LayoutGrid, List, ChevronDown, PackageOpen } from "lucide-react";

export default function OrdersPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { 
    orders, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore, 
    refresh 
  } = useOrders();

  return (
    <div className="space-y-6 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
            Orders Archive <span className="text-brand">.</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", loading ? "bg-slate-700 animate-pulse" : "bg-emerald-500")} />
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
              {loading ? "Initializing Page Buffer..." : `Synchronized ${orders.length || 0} production documents`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={refresh}
             className="p-2.5 rounded-xl bg-card-bg border border-border-subtle text-slate-500 hover:text-white transition-all shadow-xl"
           >
             <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
           </button>
           <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
           <div className="bg-card-bg border border-border-subtle p-1 rounded-xl flex gap-1 shadow-inner relative">
             <button 
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-all z-10",
                viewMode === "list" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-600 hover:text-slate-400"
              )}
             >
               <List size={16} />
             </button>
             <button 
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all z-10",
                viewMode === "grid" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-600 hover:text-slate-400"
              )}
             >
               <LayoutGrid size={16} />
             </button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <FilterBar />

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[1,2,3,4].map(i => <div key={i} className="h-12 bg-card-bg border border-border-subtle rounded-2xl animate-pulse" />)}
            </div>
            <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl p-6">
               <div className="space-y-6">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="flex items-center justify-between gap-10 opacity-30">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                           <div className="h-2 w-32 bg-white/5 rounded-full animate-pulse" />
                           <div className="h-1.5 w-20 bg-white/5 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
                      <div className="h-8 w-8 bg-white/5 rounded-lg animate-pulse" />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === "list" ? (
              <DataTable orders={orders} />
            ) : (
              <CardView orders={orders} />
            )}
            
            {/* Pagination Control */}
            {hasMore && (
              <div className="flex flex-col items-center gap-4 py-8">
                <button 
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="group flex flex-col items-center gap-2 transition-all active:scale-95"
                >
                  <div className="h-12 w-12 rounded-full bg-card-bg border border-border-subtle flex items-center justify-center text-slate-500 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/30 transition-all shadow-xl">
                    {loadingMore ? (
                      <RefreshCcw size={20} className="animate-spin text-brand" />
                    ) : (
                      <ChevronDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] group-hover:text-slate-400 transition-all">
                    {loadingMore ? "Fetching Next Chunk..." : "Load Next Batch"}
                  </span>
                </button>
              </div>
            )}

            {!hasMore && orders.length > 0 && (
              <div className="flex flex-col items-center gap-2 py-8 opacity-40">
                <PackageOpen size={24} className="text-slate-700" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">End of Archive Log</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center px-4 pt-4 border-t border-white/3">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">
          Fixora Operations • {orders.length} Records in Buffer
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase">
             <span className="h-1.5 w-1.5 rounded-full bg-blue-500/50" /> Virtualized Stream Mode: {viewMode.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(" "); }
