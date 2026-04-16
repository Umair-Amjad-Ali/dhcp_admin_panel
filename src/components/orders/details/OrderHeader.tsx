"use client";

import React from "react";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface OrderHeaderProps {
  order: any;
  syncingAction: string | null;
  onUpdateStatus: (status: string) => void;
  onOpenTechModal: () => void;
}

export const OrderHeader = ({ order, syncingAction, onUpdateStatus, onOpenTechModal }: OrderHeaderProps) => {
  const router = useRouter();
  const status = order.status?.toLowerCase();
  
  const displayedStatus = syncingAction === "completing" ? "in-progress" : 
                          syncingAction === "cancelling" ? "in-progress" : status;

  const isDisplayFinalized = ["completed", "cancelled", "rejected"].includes(displayedStatus);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-white/5 pb-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">Job Master ID</span>
             <span className="h-1 w-1 rounded-full bg-slate-800" />
             <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">{formatDateTime(order.createdAt)}</span>
          </div>
          <h1 className="text-base font-black text-white uppercase italic tracking-tight leading-none truncate max-w-[200px] md:max-w-none">
             {order.id}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="mr-2">
            <Badge className={cn("px-5 py-3 rounded-xl text-[9px] font-black uppercase border border-white/5", getStatusStyles(displayedStatus))}>
               {displayedStatus}
            </Badge>
         </div>

         {!isDisplayFinalized && (
           <>
              {(displayedStatus === "pending" || displayedStatus === "in-progress") && (
                <Tooltip content={order.assignedTechId ? "Change Specialist" : "Assign Specialist"}>
                  <button 
                    onClick={onOpenTechModal}
                    disabled={!!syncingAction}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 h-[42px]",
                      order.assignedTechId 
                        ? "bg-slate-800 text-slate-400 hover:text-white border border-white/5" 
                        : "bg-brand text-white hover:bg-brand/90"
                    )}
                  >
                    <UserPlus size={16} />
                    <span className="hidden md:inline">{order.assignedTechId ? "Re-deploy Specialist" : "Assign Specialist"}</span>
                  </button>
                </Tooltip>
              )}

              {displayedStatus === "in-progress" && (
                <Tooltip content="Finalize job">
                  <button 
                    onClick={() => onUpdateStatus("completed")}
                    disabled={!!syncingAction}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 h-[42px] min-w-[140px] justify-center"
                  >
                    {syncingAction === "completing" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Complete Job</span>
                      </>
                    )}
                  </button>
                </Tooltip>
              )}

              <Tooltip content="Cancel Job">
                <button 
                  onClick={() => onUpdateStatus("cancelled")}
                  disabled={!!syncingAction}
                  className="flex items-center justify-center w-[42px] h-[42px] bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {syncingAction === "cancelling" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                </button>
              </Tooltip>
           </>
         )}
      </div>
    </div>
  );
};
