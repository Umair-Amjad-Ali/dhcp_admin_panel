"use client";

import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

const statusOptions = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export const FilterBar = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter, 
    resetFilters 
  } = useAdminStore();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" size={16} />
        <input 
          type="text"
          placeholder="Search by name, service, or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-bg border border-border-subtle rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-brand/50 transition-all shadow-xl"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-card-bg border border-border-subtle rounded-2xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand/50 cursor-pointer shadow-xl min-w-[160px]"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
            <Filter size={10} />
          </div>
        </div>

        {/* Reset Button */}
        <button 
          onClick={resetFilters}
          className="p-3 bg-card-bg border border-border-subtle rounded-2xl text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all shadow-xl"
          title="Reset Filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
