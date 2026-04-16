"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export function useOrderDetails(id: string) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingAction, setSyncingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "orders", id);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() });
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    const actionKey = newStatus === "completed" ? "completing" : "cancelling";
    setSyncingAction(actionKey);
    try {
      await updateDoc(doc(db, "orders", id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Specialist Release Protocol
      if ((newStatus === "completed" || newStatus === "cancelled") && order?.assignedTechId) {
         const techRef = doc(db, "technicians", order.assignedTechId);
         const techSnap = await getDoc(techRef);
         
         if (techSnap.exists()) {
            const currentTechStatus = techSnap.data().status?.toLowerCase();
            const finalStatus = currentTechStatus === "suspended" ? "suspended" : "active";
            
            const updates: any = {
               status: finalStatus,
               updatedAt: serverTimestamp()
            };

            if (newStatus === "completed") {
               updates.completedJobs = increment(1);
            }

            await updateDoc(techRef, updates);
         }
      }

      // Customer Metrics
      if (newStatus === "completed" && order?.userId) {
         await updateDoc(doc(db, "users", order.userId), {
            completedOrders: increment(1)
         }).catch(() => {});
      }

      toast.success(`Operational State: ${newStatus.toUpperCase()}`);
      return true;
    } catch (err) {
      toast.error("Process failed");
      return false;
    } finally {
      setSyncingAction(null);
    }
  };

  return { order, loading, updateStatus, syncingAction };
}
