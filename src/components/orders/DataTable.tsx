"use client";

import { 
  ChevronRight, 
  MapPin, 
  Clock, 
  Wrench,
  Calendar
} from "lucide-react";
import { MissionBadge } from "@/components/common/MissionBadge";
import { motion } from "framer-motion";
import Link from "next/link";

interface DataTableProps {
  orders: any[];
}

export const DataTable = ({ orders }: DataTableProps) => {
  if (orders.length === 0) {
    return (
      <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full bg-white/2 flex items-center justify-center mb-6 border border-white/5">
          <Clock className="text-slate-700" size={32} />
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">No Orders Found</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Adjust your filters or start fresh</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Desktop Only */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] bg-card-bg/50 border border-white/5 rounded-2xl mb-2">
        <div className="col-span-4">Customer / Location</div>
        <div className="col-span-3">Service Insight</div>
        <div className="col-span-2">Timeline</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      <div className="space-y-3">
        {orders.map((order: any, idx: number) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="group bg-card-bg border border-white/2 rounded-[2rem] p-5 lg:px-8 lg:py-4 hover:border-brand/30 transition-all hover:shadow-2xl relative overflow-hidden"
          >
            <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-6 lg:gap-4">
              
              {/* Profile / Customer Section */}
              <div className="col-span-4 w-full flex items-center justify-between lg:justify-start gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xs shadow-lg group-hover:bg-brand group-hover:text-white transition-all">
                    {order.userDetails?.name?.[0].toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                      {order.userDetails?.name || "Anonymous User"}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                      <MapPin size={10} className="text-slate-700" />
                      <span className="text-[9px] font-black uppercase tracking-tight truncate">
                        {order.city || "Dubai"}, {order.country || "UAE"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Status Badge - Only visible on mobile here */}
                <div className="lg:hidden">
                  <MissionBadge status={order.status || "pending"} />
                </div>
              </div>

              {/* Service Details Section */}
              <div className="col-span-3 w-full lg:w-auto flex flex-col border-t border-white/5 pt-4 lg:pt-0 lg:border-none">
                <div className="lg:hidden text-[7px] font-black text-slate-700 uppercase tracking-widest mb-2">Deployment Service</div>
                <div className="flex items-center gap-2 mb-1">
                  <Wrench size={10} className="text-brand" />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                    {order.service?.serviceType?.replace('_', ' ') || "Consultation"}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest pl-4">
                  {order.service?.serviceSubType?.replace('_', ' ') || "Standard Registry"}
                </p>
              </div>

              {/* Timeline Section */}
              <div className="col-span-2 w-full lg:w-auto flex flex-row lg:flex-col justify-between items-center lg:items-start gap-2 border-t border-white/5 pt-4 lg:pt-0 lg:border-none">
                <div className="lg:hidden text-[7px] font-black text-slate-700 uppercase tracking-widest">Temporal Log</div>
                <div className="flex flex-col gap-1.5 lg:gap-0.5">
                  <div className="flex items-center gap-2">
                    <Calendar size={10} className="text-slate-600" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tabular-nums">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Historical"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={10} className="text-brand/60" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      {order.schedule?.preferredTimeSlot || "ASAP Deployment"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Section (Desktop) */}
              <div className="col-span-1 hidden lg:flex justify-center">
                <MissionBadge status={order.status || "pending"} />
              </div>

              {/* Actions Section */}
              <div className="col-span-2 w-full lg:w-auto flex items-center justify-end pt-4 lg:pt-0 border-t border-white/5 lg:border-none">
                <Link 
                  href={`/admin/orders/${order.id}`}
                  className="w-full lg:w-auto h-10 lg:h-8 flex items-center justify-center gap-2 px-4 rounded-xl bg-white/2 border border-white/5 text-slate-400 hover:text-white hover:border-brand/40 hover:bg-brand/5 transition-all group/btn"
                >
                  <span className="lg:hidden text-[9px] font-black uppercase tracking-widest">Access Deployment File</span>
                  <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
