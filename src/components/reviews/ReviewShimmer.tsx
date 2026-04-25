"use client";

import React from "react";

export const ReviewShimmer = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stats Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card-bg border border-white/5 rounded-3xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5" />
            <div className="space-y-2">
              <div className="h-2 w-20 bg-white/5 rounded" />
              <div className="h-6 w-12 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card-bg border border-white/5 rounded-[2.5rem] p-7 h-64 flex flex-col justify-between">
            <div>
              <div className="flex justify-between mb-6">
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-5/6 bg-white/5 rounded" />
                <div className="h-3 w-4/6 bg-white/5 rounded" />
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/5" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded" />
                  <div className="h-2 w-12 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
