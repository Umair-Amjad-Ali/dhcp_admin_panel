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
  Loader2,
  DollarSign,
  User,
  Info,
  Clock3,
  Building2,
  Globe2,
  Layers,
  Activity
} from "lucide-react";
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AssignTechModal } from "@/components/orders/AssignTechModal";
import { Tooltip } from "@/components/ui/Tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingAction, setSyncingAction] = useState<string | null>(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

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

    syncCollection("orders");
    syncCollection("order");

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    const actionKey = newStatus === "completed" ? "completing" : "cancelling";
    setSyncingAction(actionKey);
    try {
      const collections = ["orders", "order"];
      for (const col of collections) {
         await updateDoc(doc(db, col, id as string), { 
           status: newStatus,
           updatedAt: serverTimestamp()
         }).catch(() => {});
      }

      // Specialist Release Protocol (Common for Success or Failure)
      if ((newStatus === "completed" || newStatus === "cancelled") && order.assignedTechId) {
         const techRef = doc(db, "technicians", order.assignedTechId);
         const techSnap = await getDoc(techRef);
         
         if (techSnap.exists()) {
            const currentTechStatus = techSnap.data().status?.toLowerCase();
            
            // Re-activation logic: preserve suspension, otherwise free the specialist
            const finalStatus = currentTechStatus === "suspended" ? "suspended" : "active";
            
            const updates: any = {
               status: finalStatus,
               updatedAt: serverTimestamp()
            };

            // Only increment performance logs on successful completion
            if (newStatus === "completed") {
               updates.completedJobs = increment(1);
            }

            await updateDoc(techRef, updates);
         }
      }

      // Sync user metrics for success cases
      if (newStatus === "completed" && order.userId) {
         await updateDoc(doc(db, "users", order.userId), {
            completedOrders: increment(1)
         }).catch(() => {});
      }

      toast.success(`Operational State: ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error("Process failed");
    } finally {
      setSyncingAction(null);
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
  
  // High-fidelity status 'freeze' during synchronization to prevent UI jumping
  // If we are currently completing, we show as "in-progress" until the actual code finishes
  const displayedStatus = syncingAction === "completing" ? "in-progress" : 
                          syncingAction === "cancelling" ? "in-progress" : status;

  const isFinalized = ["completed", "cancelled", "rejected"].includes(status);
  const isDisplayFinalized = ["completed", "cancelled", "rejected"].includes(displayedStatus);

  // Formatter for timestamps
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Dynamic Header Hub */}
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

        {/* The Action Command Hub */}
        <div className="flex items-center gap-3">
           <div className="mr-2">
              <Badge className={cn("px-5 py-3 rounded-xl text-[9px] font-black uppercase border border-white/5", getStatusStyles(displayedStatus))}>
                 {displayedStatus}
              </Badge>
           </div>

           {!isDisplayFinalized && (
             <>
                {/* Deployment Control */}
                {(displayedStatus === "pending" || displayedStatus === "in-progress") && (
                  <Tooltip content={order.assignedTechId ? "Change Specialist" : "Assign Specialist"}>
                    <button 
                      onClick={() => setIsTechModalOpen(true)}
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
                      onClick={() => updateStatus("completed")}
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
                    onClick={() => updateStatus("cancelled")}
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Main Intel */}
        <div className="lg:col-span-8 space-y-6">
           {/* Service Details Card */}
           <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-white/2 group-hover:text-white/3 transition-colors">
                 <Wrench size={180} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                       <Layers size={20} />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5">Service Classification</h3>
                       <p className="text-base font-black text-white uppercase italic tracking-tight">
                         {order.serviceType || order.service?.serviceType} / {order.serviceSubType || order.service?.serviceSubType}
                       </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/3">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-brand" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Primary issue</span>
                       </div>
                       <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-2">
                            {order.issue?.label?.replace(/_/g, " ") || "No Label Provided"}
                          </h4>
                          <p className="text-xs text-slate-500 font-bold leading-relaxed">
                            {order.issue?.customDescription || order.customDescription || "No custom intelligence logged."}
                          </p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Info size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Extended diagnostics</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {order.selectedIssues && order.selectedIssues.length > 0 ? (
                            order.selectedIssues.map((issue: string, index: number) => (
                              <Badge key={index} className="bg-blue-500/5 text-blue-400 border border-blue-500/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic">
                                {issue.replace(/_/g, " ")}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-700 font-black uppercase italic">No secondary issues selected</span>
                          )}
                       </div>
                       <div className="pt-2">
                          <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mb-1">Hardware Type</p>
                          <p className="text-[11px] font-black text-white uppercase italic">{order.type?.replace(/_/g, " ") || "Generic"}</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                    <HistoryBlock label="Target Date" icon={<Calendar size={12} className="text-brand"/>} value={order.schedule?.preferredDate ? new Date(order.schedule.preferredDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD"} />
                    <HistoryBlock label="Target Slot" icon={<Clock size={12} className="text-brand"/>} value={order.schedule?.preferredTimeSlot || "N/A"} />
                    <HistoryBlock label="Time Range" icon={<Clock3 size={12} className="text-brand"/>} value={order.schedule?.timeRange || "N/A"} />
                    <HistoryBlock label="Last Sync" icon={<Activity size={12} className="text-brand"/>} value={formatDateTime(order.updatedAt).split(',')[0]} />
                 </div>
              </div>
           </Card>

           {/* Location Target Card */}
           <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <MapPin size={20} />
                 </div>
                 <div>
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5">Operational Theatre</h3>
                    <p className="text-base font-black text-white uppercase italic tracking-tight">Location Intelligence</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                       <Building2 size={10} /> Area / District
                    </p>
                    <p className="text-xs font-black text-white uppercase italic">{order.location?.area || order.area || "Not Specified"}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                       <Hash size={10} /> Unit / Building
                    </p>
                    <p className="text-xs font-black text-white uppercase italic">{order.location?.buildingDetails || order.buildingDetails || "Not Specified"}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                       <Globe2 size={10} /> Geo-Zone
                    </p>
                    <p className="text-xs font-black text-white uppercase italic">{order.location?.city || order.city}, {order.location?.country || order.country || "UAE"}</p>
                 </div>
              </div>

              <div className="space-y-4 p-5 bg-white/1 border border-white/5 rounded-2xl">
                 <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Formatted Global Address</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location?.formattedAddress || order.formattedAddress || "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] font-black text-brand uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      View on Map <ExternalLink size={10} />
                    </a>
                 </div>
                 <p className="text-xs text-slate-400 font-bold leading-relaxed italic">
                    {order.location?.formattedAddress || order.formattedAddress || "Zero address data available in registry."}
                 </p>
              </div>
           </Card>

           {/* Specialist Info */}
           {order.assignedTechId && (
              <Card className="p-6 bg-blue-500/5 border-blue-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-colors">
                 <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl border border-blue-500/30">
                       <ShieldCheck size={28} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 leading-none italic">Assigned Specialist</p>
                       <h4 className="text-lg font-black text-white uppercase tracking-tight italic">{order.assignedTechName}</h4>
                       <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-slate-500">
                             <Phone size={12} className="text-blue-500/50" />
                             <span className="text-[11px] font-black tabular-nums tracking-wider">{order.assignedTechPhone}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-500 transition-all">
                    <ExternalLink size={18} />
                 </button>
              </Card>
           )}
        </div>

        {/* Right Column: User & Financials */}
        <div className="lg:col-span-4 space-y-6">
           {/* Client Protocol Card */}
           <Card className="p-6 bg-card-bg border-white/3 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-white/2">
                 <User size={80} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-black text-xl italic shadow-inner">
                       {order.userDetails?.name?.[0] || <User size={24} />}
                    </div>
                    <div>
                       <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Client Authority</h3>
                       <p className="text-sm font-black text-white uppercase tracking-tight italic">{order.userDetails?.name || "Unknown Identity"}</p>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <DetailItem icon={<Hash size={14} />} label="System UID" value={order.userDetails?.userId || order.userId || "GHOST_UID"} className="bg-white/1" />
                    <DetailItem icon={<Mail size={14} />} label="Intel Comms" value={order.userDetails?.email || order.userEmail || "No Email"} />
                    <DetailItem icon={<Phone size={14} />} label="Tactical Link" value={`${order.userDetails?.countryCode || ""} ${order.userDetails?.phone || "No Phone"}`} />
                 </div>
              </div>
           </Card>

           {/* Financials Card */}
           <Card className="p-6 bg-gradient-to-br from-card-bg to-brand/5 border-white/3 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 text-white/2 group-hover:scale-110 transition-transform duration-500">
                 <DollarSign size={140} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                       <DollarSign size={18} />
                    </div>
                    <div>
                       <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1.5 italic">Financial Matrix</h3>
                       <p className="text-xs font-black text-white uppercase italic tracking-[0.1em]">ESTIMATED QUOTA</p>
                    </div>
                 </div>
                 
                 <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-black text-white italic tracking-tighter">
                      {order.service?.estimatedPrice || order.estimatedPrice || "0"}
                    </span>
                    <span className="text-sm font-black text-brand uppercase">{order.service?.currency || order.currency || "AED"}</span>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest mb-4">
                       <span className="text-slate-700 uppercase italic">Status</span>
                       <span className="text-emerald-500 uppercase italic">Awaiting Settlement</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand w-1/3 rounded-full shadow-[0_0_10px_rgba(var(--brand-rgb),0.5)]" />
                    </div>
                 </div>
              </div>
           </Card>
           
        </div>
      </div>

      <AssignTechModal 
        isOpen={isTechModalOpen} 
        onClose={() => setIsTechModalOpen(false)} 
        orderId={order.id}
        previousTechId={order.assignedTechId}
      />
    </div>
  );
}

function HistoryBlock({ label, icon, value }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center gap-2">
          {icon}
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none italic">{label}</span>
       </div>
       <p className="text-[11px] font-black text-white uppercase italic truncate">{value}</p>
    </div>
  );
}

function DetailItem({ icon, label, value, className }: any) {
  return (
    <div className={cn("p-4 rounded-2xl border border-white/3 space-y-2 transition-all hover:bg-white/2", className)}>
       <div className="flex items-center gap-2 text-slate-700">
          {icon}
          <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{label}</span>
       </div>
       <p className="text-xs font-black text-white tracking-wide truncate">{value}</p>
    </div>
  );
}

function OrderDetailsShimmer() {
  return (
    <div className="space-y-12 pb-20 animate-pulse max-w-7xl mx-auto">
       <div className="flex justify-between items-center gap-4 py-8 border-b border-white/5">
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          <div className="flex gap-2">
             <div className="h-10 w-40 bg-white/5 rounded-xl" />
             <div className="h-10 w-10 bg-white/5 rounded-xl" />
          </div>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
             <div className="h-[400px] bg-card-bg border border-white/5 rounded-[2.5rem]" />
             <div className="h-48 bg-card-bg border border-white/5 rounded-[2.5rem]" />
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="h-64 bg-card-bg border border-white/5 rounded-[2.5rem]" />
             <div className="h-48 bg-card-bg border border-white/5 rounded-[2.5rem]" />
          </div>
       </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'in-progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

