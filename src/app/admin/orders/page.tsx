"use client";

import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { FilterBar } from "@/components/orders/FilterBar";
import { DataTable } from "@/components/orders/DataTable";
import { CardView } from "@/components/orders/CardView";
import { DateFilterHub } from "@/components/orders/DateFilterHub";
import { 
  RefreshCcw, LayoutGrid, List, ChevronDown, PackageOpen, 
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

import { RegistryLayout } from "@/components/common/RegistryLayout";

export default function OrdersPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { 
    orders, 
    loading, 
    loadingMore, 
    hasMore, 
    dateFilter,
    setDateFilter,
    loadMore, 
    refresh 
  } = useOrders();

  const actionControls = (
    <>
      <DateFilterHub dateFilter={dateFilter} setDateFilter={setDateFilter} />

      <div className="flex items-center gap-2">
        <button 
          onClick={refresh}
          className="h-[46px] w-[46px] flex items-center justify-center rounded-2xl bg-card-bg border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all shadow-xl"
          title="Force Sync"
        >
          <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
        </button>
        
        <div className="h-[46px] bg-card-bg border border-white/5 p-1 rounded-2xl flex items-center gap-1 shadow-inner relative">
          <button 
          onClick={() => setViewMode("list")}
          className={cn(
            "h-full px-3 rounded-xl transition-all z-10 flex items-center justify-center",
            viewMode === "list" ? "bg-white/10 text-white shadow-lg" : "text-slate-600 hover:text-slate-300"
          )}
          >
            <List size={16} />
          </button>
          <button 
          onClick={() => setViewMode("grid")}
          className={cn(
            "h-full px-3 rounded-xl transition-all z-10 flex items-center justify-center",
            viewMode === "grid" ? "bg-white/10 text-white shadow-lg" : "text-slate-600 hover:text-slate-300"
          )}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <RegistryLayout
      title="Orders Archive"
      metricText={loading ? "Initializing Page Buffer..." : `Synchronized ${orders.length || 0} production documents`}
      pulseColor="emerald"
      actionSlot={actionControls}
      loading={loading}
      isEmpty={orders.length === 0}
      emptyMessage="Try adjusting your date filters"
    >
      <div className="space-y-6">
        <FilterBar />

        {loading ? (
          <OrdersShimmer />
        ) : (
          <div className="space-y-8">
            {viewMode === "list" && orders.length > 0 ? (
              <DataTable orders={orders} />
            ) : viewMode === "grid" && orders.length > 0 ? (
              <CardView orders={orders} />
            ) : null}
            
            {hasMore && orders.length > 0 && (
              <PaginationControl loadingMore={loadingMore} onLoadMore={loadMore} />
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
    </RegistryLayout>
  );
}

function OrdersShimmer() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="bg-card-bg border border-white/2 rounded-[2rem] p-5 lg:px-8 lg:py-4 relative overflow-hidden">
           <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/1 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
           <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4">
              <div className="col-span-4 flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white/2 shrink-0" />
                 <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/2 rounded w-2/3" />
                    <div className="h-2 bg-white/2 rounded w-1/2" />
                 </div>
              </div>
              <div className="col-span-3 hidden lg:block space-y-2">
                 <div className="h-3 bg-white/2 rounded w-1/2" />
                 <div className="h-2 bg-white/2 rounded w-full" />
              </div>
              <div className="col-span-2 hidden lg:block space-y-2">
                 <div className="h-3 bg-white/2 rounded w-3/4" />
                 <div className="h-2 bg-white/2 rounded w-1/2" />
              </div>
              <div className="col-span-1 hidden lg:flex justify-center">
                 <div className="h-6 w-16 bg-white/2 rounded-full" />
              </div>
              <div className="col-span-2 hidden lg:flex justify-end">
                 <div className="h-8 w-24 bg-white/2 rounded-xl" />
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}

function PaginationControl({ loadingMore, onLoadMore }: { loadingMore: boolean, onLoadMore: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <button 
        onClick={onLoadMore}
        disabled={loadingMore}
        className="group flex flex-col items-center gap-2 transition-all active:scale-95"
      >
        <div className="h-10 w-10 rounded-full bg-card-bg border border-white/5 flex items-center justify-center text-slate-500 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/30 transition-all shadow-xl">
          {loadingMore ? (
            <RefreshCcw size={16} className="animate-spin text-brand" />
          ) : (
            <ChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
          )}
        </div>
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] group-hover:text-slate-400 transition-all">
          {loadingMore ? "Fetching Next Chunk..." : "Load Next Batch"}
        </span>
      </button>
    </div>
  );
}