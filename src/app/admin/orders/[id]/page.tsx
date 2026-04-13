"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  UserPlus, 
  ShieldCheck,
  Wrench,
  AlertCircle,
  Hash,
  ExternalLink,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Loader2
} from "lucide-react";
import { doc, onSnapshot, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AssignTechModal } from "@/components/orders/AssignTechModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // We store unsubs in an array to clean them all up
    const unsubs: (() => void)[] = [];

    const syncCollection = (colName: string) => {
      const docRef = doc(db, colName, id as string);
      const unsub = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setOrder({ id: snapshot.id, ...snapshot.data() });
          setLoading(false);
        }
      });
      unsubs.push(unsub);
    };

    // Try both collections
    syncCollection("orders");
    syncCollection("order");

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setIsSyncing(true);
    try {
      const collections = ["orders", "order"];
      for (const col of collections) {
         await updateDoc(doc(db, col, id as string), { 
           status: newStatus,
           updatedAt: serverTimestamp()
         }).catch(() => {});
      }

      if (newStatus === "completed") {
         if (order.assignedTechId) {
            await updateDoc(doc(db, "technicians", order.assignedTechId), {
               completedJobs: increment(1),
               status: "active"
            }).catch(() => {});
         }
         if (order.userId) {
            await updateDoc(doc(db, "users", order.userId), {
               completedOrders: increment(1)
            }).catch(() => {});
         }
      }

      toast.success(`Operational State: ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error("Process failed");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <OrderDetailsShimmer />;

  if (!order) {
    return (
      <div className="p-20 text-center space-y-6">
        <AlertCircle size={32} className="mx-auto text-slate-800" />
        <h2 className="text-xl font-black text-white uppercase italic">Registry Entry Resolved to Null</h2>
        <button onClick={() => router.back()} className="text-[10px] font-black text-brand uppercase tracking-widest">Back to Mission Control</button>
      </div>
    );
  }

  const status = order.status?.toLowerCase();
  const isFinalized = ["completed", "cancelled", "rejected"].includes(status);

  return (
    <div className="space-y-6 pb-20">
      {/* Dynamic Header Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">Job Master ID</span>
            </div>
            <h1 className="text-base font-black text-white uppercase italic tracking-tight leading-none truncate max-w-[200px] md:max-w-none">
               {order.id}
            </h1>
          </div>
        </div>

        {/* The Action Command Hub */}
        <div className="flex items-center gap-3">
           <div className="mr-2">
              <Badge className={cn("px-5 py-3 rounded-xl text-[9px] font-black uppercase border border-white/5", getStatusStyles(status))}>
                 {status}
              </Badge>
           </div>

           {!isFinalized && (
             <>
                {status === "pending" && (
                  <button 
                    onClick={() => setIsTechModalOpen(true)}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-6 py-3 bg-brand rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-brand/90 transition-all shadow-xl active:scale-95 disabled:opacity-50 h-[42px]"
                  >
                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    Dispatch Specialist
                  </button>
                )}

                {status === "in-progress" && (
                  <button 
                    onClick={() => updateStatus("completed")}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 h-[42px]"
                  >
                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Complete Job
                  </button>
                )}

                <button 
                  onClick={() => updateStatus("cancelled")}
                  disabled={isSyncing}
                  className="flex items-center justify-center w-[42px] h-[42px] bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                  title="Cancel Job"
                >
                  {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                </button>
             </>
           )}
        </div>
      </div>

      {/* Grid Layout (Consistent with previous unique design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
           <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-white/2">
                 <Wrench size={180} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                       <Wrench size={20} />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5">Intended Service</h3>
                       <p className="text-base font-black text-white uppercase italic tracking-tight">{order.service?.serviceType} / {order.service?.serviceSubType}</p>
                    </div>
                 </div>

                 <div className="space-y-4 py-6 border-y border-white/3">
                    <div className="flex items-center gap-2">
                       <AlertCircle size={14} className="text-brand" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Issue Identified</span>
                    </div>
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                       <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-2">{order.issue?.label?.replace(/_/g, " ")}</h4>
                       <p className="text-xs text-slate-500 font-bold leading-relaxed">{order.issue?.customDescription || "No custom intel logged."}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-6">
                    <HistoryBlock label="Target Date" icon={<Calendar size={12}/>} value={order.schedule?.preferredDate ? new Date(order.schedule.preferredDate).toLocaleDateString() : "TBD"} />
                    <HistoryBlock label="Target Slot" icon={<Clock size={12}/>} value={order.schedule?.timeRange || "N/A"} />
                 </div>
              </div>
           </Card>

           {order.assignedTechId && (
              <Card className="p-5 bg-blue-500/5 border-blue-500/10 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest mb-1 leading-none italic">Unit Active</p>
                       <h4 className="text-[11px] font-black text-white uppercase">{order.assignedTechName}</h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Phone size={12} className="text-slate-800" />
                       <span className="text-[10px] font-black tabular-nums">{order.assignedTechPhone}</span>
                    </div>
                 </div>
              </Card>
           )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-400 font-black text-xs">
                    {order.userDetails?.name?.[0]}
                 </div>
                 <div>
                    <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Client Protocol</h3>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{order.userDetails?.name}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                    <Phone size={14} className="text-slate-700" />
                    <span>{order.userDetails?.phone}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                    <Mail size={14} className="text-slate-700" />
                    <span className="truncate">{order.userDetails?.email}</span>
                 </div>
              </div>
           </Card>

           <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
                    <MapPin size={18} />
                 </div>
                 <div>
                    <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Installation Target</h3>
                    <p className="text-[10px] font-black text-white uppercase">{order.location?.city || "Unknown Location"}</p>
                 </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed bg-white/1 border border-white/5 p-3 rounded-xl">
                 {order.location?.formattedAddress}
              </p>
           </Card>
        </div>
      </div>

      <AssignTechModal 
        isOpen={isTechModalOpen} 
        onClose={() => setIsTechModalOpen(false)} 
        orderId={order.id}
      />
    </div>
  );
}

function HistoryBlock({ label, icon, value }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center gap-2">
          {icon}
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">{label}</span>
       </div>
       <p className="text-xs font-black text-white uppercase italic">{value}</p>
    </div>
  );
}

function OrderDetailsShimmer() {
  return (
    <div className="space-y-12 pb-20 animate-pulse">
       <div className="flex justify-between items-center gap-4 py-8 border-b border-white/5">
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          <div className="flex gap-2">
             <div className="h-10 w-40 bg-white/5 rounded-xl" />
             <div className="h-10 w-10 bg-white/5 rounded-xl" />
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-card-bg border border-white/5 rounded-[2.5rem]" />
          <div className="h-96 bg-card-bg border border-white/5 rounded-[2.5rem]" />
       </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-500';
    case 'cancelled': return 'bg-rose-500/10 text-rose-500';
    case 'in-progress': return 'bg-blue-500/10 text-blue-500';
    case 'pending': return 'bg-amber-500/10 text-amber-500';
    default: return 'bg-slate-500/10 text-slate-500';
  }
}
