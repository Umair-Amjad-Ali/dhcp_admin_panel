"use client";
import { Card } from "@/components/ui/Card";
import { DollarSign, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateOrderReceipt } from "@/lib/invoiceGenerator";

interface FinancialsCardProps {
  order: any;
}

export const FinancialsCard = ({ order }: FinancialsCardProps) => {
  return (
    <Card className="p-6 bg-card-bg border border-white/5 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform duration-500">
         <DollarSign size={140} strokeWidth={1} />
      </div>
      <div className="relative z-10">
         <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
               <DollarSign size={18} />
            </div>
            <div>
               <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Financial Matrix</h3>
               <p className="text-xs font-black text-white uppercase italic tracking-widest">ESTIMATED QUOTA</p>
            </div>
         </div>
         
         <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-black text-white italic tracking-tighter">
              {order.finalPrice || order.service?.estimatedPrice || order.estimatedPrice || "0"}
            </span>
            <span className="text-sm font-black text-brand uppercase">{order.service?.currency || order.currency || "AED"}</span>
            
            {order.status === "completed" && order.finalPrice && order.finalPrice !== (order.service?.estimatedPrice || order.estimatedPrice) && (
               <div className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase">
                 Adjusted
               </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center justify-between text-[10px] font-black tracking-widest mb-4">
                <span className="text-slate-700 uppercase italic">Status</span>
                <span className={cn("uppercase italic", order.status === "completed" ? "text-emerald-500" : "text-amber-500")}>
                   {order.status === "completed" ? "Operational Settle" : "Awaiting Settlement"}
                </span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", order.status === "completed" ? "bg-emerald-500 w-full" : "bg-brand w-1/3")} />
             </div>
             {order.status === "completed" && (
               <>
                <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest mt-2 block text-center italic">Transaction finalized by registry</p>
                <button 
                  onClick={() => generateOrderReceipt(order)}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-brand hover:text-white hover:border-brand transition-all shadow-xl group/btn cursor-pointer"
                >
                  <Printer size={14} className="group-hover/btn:scale-110 transition-transform" />
                  <span>Generate Official Receipt</span>
                </button>
               </>
             )}
          </div>
      </div>
    </Card>
  );
};
