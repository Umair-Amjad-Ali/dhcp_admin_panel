"use client";

import React from "react";

export const OrderDetailsShimmer = () => {
  return (
    <div className="space-y-12 pb-20 animate-pulse max-w-7xl mx-auto">
       <div className="flex justify-between items-center gap-4 py-8 border-b border-white/5">
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          <div className="flex gap-2">
             <div className="h-10 w-40 bg-white/5 rounded-xl" />
             <div className="h-10 w-10 bg-white/5 rounded-xl" />
          </div>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
             <div className="h-[400px] bg-card-bg border border-white/5 rounded-[2.5rem]" />
             <div className="h-48 bg-card-bg border border-white/5 rounded-[2.5rem]" />
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="h-64 bg-card-bg border border-white/5 rounded-[2.5rem]" />
             <div className="h-48 bg-card-bg border border-white/5 rounded-[2.5rem]" />
          </div>
       </div>
    </div>
  );
};
