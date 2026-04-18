"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { OrderHeader } from "@/components/orders/details/OrderHeader";
import { ServiceDetailsCard } from "@/components/orders/details/ServiceDetailsCard";
import { LocationDetailsCard } from "@/components/orders/details/LocationDetailsCard";
import { ClientInfoCard } from "@/components/orders/details/ClientInfoCard";
import { FinancialsCard } from "@/components/orders/details/FinancialsCard";
import { SpecialistCard } from "@/components/orders/details/SpecialistCard";
import { OrderDetailsShimmer } from "@/components/orders/details/OrderDetailsShimmer";
import { AssignTechModal } from "@/components/orders/AssignTechModal";
import { CompleteJobModal } from "@/components/orders/CompleteJobModal";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { order, loading, updateStatus, syncingAction } = useOrderDetails(id as string);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  if (loading) return <OrderDetailsShimmer />;

  if (!order) {
    return (
      <div className="p-20 text-center space-y-6">
        <AlertCircle size={32} className="mx-auto text-slate-800" />
        <h2 className="text-xl font-black text-white uppercase italic">Registry Entry Resolved to Null</h2>
      </div>
    );
  }

  const handleJobCompletion = async (data: { finalPrice: number, workReport: string }) => {
     const success = await updateStatus("completed", data);
     if (success) {
        setIsCompleteModalOpen(false);
     }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <OrderHeader 
        order={order} 
        syncingAction={syncingAction} 
        onUpdateStatus={updateStatus}
        onOpenTechModal={() => setIsTechModalOpen(true)}
        onOpenCompleteModal={() => setIsCompleteModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Intel Column */}
        <div className="lg:col-span-8 space-y-6">
           <ServiceDetailsCard order={order} />
           <LocationDetailsCard order={order} />
           <SpecialistCard order={order} />
        </div>

        {/* Right Authority Column */}
        <div className="lg:col-span-4 space-y-6">
           <ClientInfoCard order={order} />
           <FinancialsCard order={order} />
        </div>
      </div>

      <AssignTechModal 
        isOpen={isTechModalOpen} 
        onClose={() => setIsTechModalOpen(false)} 
        orderId={order.id}
        previousTechId={order.assignedTechId}
      />

      <CompleteJobModal 
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        order={order}
        onComplete={handleJobCompletion}
        isSubmitting={syncingAction === "completing"}
      />
    </div>
  );
}
