"use client";

import { 
  Clock, 
  Wrench,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { MissionBadge } from "@/components/common/MissionBadge";
import { motion } from "framer-motion";
import Link from "next/link";

interface CardViewProps {
  orders: any[];
}

export const CardView = ({ orders }: CardViewProps) => {
  if (orders.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order: any, idx: number) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
        >
          <Link href={`/admin/orders/${order.id}`}>
            <div className="group bg-card-bg border border-border-subtle rounded-2xl p-4 hover:border-brand/40 transition-all shadow-lg hover:shadow-brand/5 relative overflow-hidden h-full flex flex-col justify-between">
               {/* Background Hint */}
               <div className="absolute -right-6 -top-6 h-20 w-20 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10" />
               
               <div>
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                       <div className="h-8 w-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-[10px] uppercase">
                          {order.userDetails?.name?.[0]}
                       </div>
                       <div className="min-w-0">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate w-24">{order.userDetails?.name}</h4>
                          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest leading-none mt-1">{order.location?.city || order.city}</p>
                       </div>
                    </div>
                    <MissionBadge status={order.status} />
                 </div>

                 <div className="space-y-2 mb-4">
                    <div className="px-3 py-2 bg-white/2 border border-white/5 rounded-xl">
                       <div className="flex items-center gap-1.5 mb-0.5">
                          <Wrench size={8} className="text-brand" />
                          <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Job</span>
                       </div>
                       <p className="text-[10px] font-black text-slate-300 uppercase truncate">{order.service?.serviceType}</p>
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-600 px-1">
                       <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{order.schedule?.preferredTimeSlot}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{order.schedule?.preferredDate ? new Date(order.schedule.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "--"}</span>
                       </div>
                    </div>
                 </div>
               </div>
               
               <div className="pt-2 border-t border-white/2 flex items-center justify-between">
                  <p className="text-[7px] font-black text-slate-800 uppercase tracking-[0.2em]">#{order.id.slice(-6).toUpperCase()}</p>
                  <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-700 group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
                     <ChevronRight size={12} />
                  </div>
               </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
