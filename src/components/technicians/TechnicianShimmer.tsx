"use client";

export const TechnicianShimmer = () => {
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
};
