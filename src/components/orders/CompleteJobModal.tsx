"use client";

import React, { useState, useEffect } from "react";
import { MissionModal } from "@/components/common/MissionModal";
import { 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Wrench, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface CompleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onComplete: (data: { finalPrice: number, workReport: string }) => void;
  isSubmitting: boolean;
}

export const CompleteJobModal = ({ isOpen, onClose, order, onComplete, isSubmitting }: CompleteJobModalProps) => {
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [workReport, setWorkReport] = useState<string>("");
  const initialPrice = order?.service?.estimatedPrice || order?.estimatedPrice || 0;

  useEffect(() => {
    if (isOpen) {
      setFinalPrice(initialPrice.toString());
      setWorkReport("");
    }
  }, [isOpen, initialPrice]);

  const handleSubmit = () => {
    const priceNum = parseFloat(finalPrice);
    if (isNaN(priceNum)) {
      toast.error("Invalid price entered");
      return;
    }
    if (!workReport.trim()) {
      toast.error("Please provide a work report");
      return;
    }

    onComplete({
      finalPrice: priceNum,
      workReport: workReport.trim()
    });
  };

  return (
    <MissionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Close Operation"
      subtitle="Finalize Mission & Settle Account"
      icon={<CheckCircle2 size={20} />}
      maxWidth="max-w-md"
    >
      <div className="p-6 space-y-6">
         {/* Price Section */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-brand" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Financial Settlement</span>
               </div>
               <div className="text-[9px] font-black text-slate-500 uppercase italic">Expected Settlement: {finalPrice || initialPrice} {order?.service?.currency || "AED"}</div>
            </div>

            <div className="relative group">
               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand">
                  <span className="font-black italic lg:text-xl">$</span>
               </div>
               <input 
                  type="text" 
                  value={finalPrice}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFinalPrice(val);
                  }}
                  placeholder="0.00"
                  className="w-full bg-white/2 border border-white/5 rounded-2xl pl-10 pr-16 py-4 text-2xl font-black text-white focus:outline-none focus:border-brand/40 transition-all shadow-inner tabular-nums"
               />
               <div className="absolute right-4 inset-y-0 flex items-center border-l border-white/5 pl-4 ml-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order?.service?.currency || "AED"}</span>
               </div>
            </div>
            
            {parseFloat(finalPrice) > initialPrice && (
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-500">
                  <TrendingUp size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Adjustment: +{parseFloat(finalPrice) - initialPrice} Over Estimate</span>
               </div>
            )}
         </div>

         {/* Work Report Section */}
         <div className="space-y-4">
            <div className="flex items-center gap-2">
               <FileText size={16} className="text-brand" />
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Execution Report</span>
            </div>
            <textarea 
               value={workReport}
               onChange={(e) => setWorkReport(e.target.value)}
               placeholder="Detail exactly what was repaired, replaced or modified..."
               className="w-full bg-white/2 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-brand/40 transition-all shadow-inner min-h-[120px] leading-relaxed"
            />
         </div>

         {/* Tech Credit */}
         <div className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 italic font-black">
               {order?.assignedTechName?.[0]}
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Sign-off Operative</p>
               <p className="text-xs font-black text-white uppercase italic">{order?.assignedTechName || "Unassigned"}</p>
            </div>
         </div>
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-white/5">
         <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand/90 py-4 rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
         >
            {isSubmitting ? (
               <div className="h-4 w-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
            ) : (
               <>
                  <span>Finalize & Close Mission</span>
                  <ArrowRight size={16} />
               </>
            )}
         </button>
      </div>
    </MissionModal>
  );
};
