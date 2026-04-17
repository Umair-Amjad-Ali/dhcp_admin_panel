"use client";

export const TechnicianShimmer = () => {
  return (
     <div className="bg-card-bg border border-white/2 rounded-[2rem] p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/1 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4">
           {/* Identity */}
           <div className="col-span-2 w-full flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/2" />
              <div className="flex-1 space-y-2">
                 <div className="h-3 bg-white/2 rounded w-3/4" />
                 <div className="h-2 bg-white/2 rounded w-1/2" />
              </div>
           </div>

           {/* Contact column */}
           <div className="col-span-2 hidden lg:flex items-center gap-2">
              <div className="h-3 bg-white/2 rounded w-full" />
           </div>

           {/* Location column */}
           <div className="col-span-2 hidden lg:flex items-center gap-2">
              <div className="h-3 bg-white/2 rounded w-2/3" />
           </div>

           {/* Expertise column */}
           <div className="col-span-2 hidden lg:flex items-center gap-2">
              <div className="h-3 bg-white/2 rounded w-3/4" />
           </div>

           {/* Jobs column */}
           <div className="col-span-1 hidden lg:block text-center px-4">
              <div className="h-3 bg-white/2 rounded w-full" />
           </div>

           {/* Status column */}
           <div className="col-span-1 hidden lg:flex justify-center">
              <div className="h-5 w-16 bg-white/2 rounded-full" />
           </div>

           {/* Actions column */}
           <div className="col-span-2 hidden lg:flex justify-end gap-2">
              <div className="h-8 w-8 bg-white/2 rounded-xl" />
              <div className="h-8 w-8 bg-white/2 rounded-xl" />
           </div>
        </div>
     </div>
  );
};
