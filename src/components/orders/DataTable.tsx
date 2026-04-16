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
    <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-white/1">
              <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Customer / Location</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Service Insight</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Timeline</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {orders.map((order: any, idx: number) => (
              <motion.tr 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group hover:bg-white/2 transition-all cursor-default"
              >
                {/* Customer Column */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-[10px] shadow-lg group-hover:scale-110 transition-transform">
                      {order.userDetails?.name?.[0].toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-white truncate">
                        {order.userDetails?.name || "Anonymous User"}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={10} className="text-slate-600" />
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-tight truncate">
                          {order.city || "Dubai"}, {order.country || "UAE"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Service Column */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench size={10} className="text-brand" />
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                        {order.service?.serviceType?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest pl-4">
                      {order.service?.serviceSubType?.replace('_', ' ') || "Standard"}
                    </p>
                  </div>
                </td>

                {/* Timeline Column */}
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                       <Calendar size={10} className="text-slate-600" />
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                         {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Pending"}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Clock size={10} className="text-brand/60" />
                       <span className="text-[9px] font-bold text-slate-500 uppercase">
                         {order.schedule?.preferredTimeSlot || "ASAP"}
                       </span>
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-5">
                  <MissionBadge status={order.status || "pending"} />
                </td>

                {/* Actions Column */}
                <td className="px-6 py-5 text-right">
                  <Link 
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-white/3 border border-border-subtle text-slate-400 hover:text-brand hover:border-brand/40 hover:bg-brand/5 transition-all group/btn"
                  >
                    <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
