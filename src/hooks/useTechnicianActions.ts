"use client";

import { useState } from "react";
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export function useTechnicianActions() {
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const executeStatusUpdate = async (tech: any, newStatus: string) => {
    setStatusLoading(tech.id);
    try {
      let finalStatus = newStatus;

      // Logic check for Activation: Should they be Active or Busy?
      if (newStatus === "active") {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef, 
          where("assignedTechId", "==", tech.id),
          where("status", "==", "in-progress")
        );
        const orderSnap = await getDocs(q);

        if (!orderSnap.empty) {
          finalStatus = "busy";
        }
      }

      const techRef = doc(db, "technicians", tech.id);
      await updateDoc(techRef, {
        status: finalStatus,
        updatedAt: serverTimestamp()
      });
      
      toast.success(
        finalStatus === "active" 
          ? `Specialist ${tech.name} is now ACTIVE.`
          : finalStatus === "busy"
          ? `Specialist ${tech.name} restored to BUSY (Active Job Detected).`
          : `Specialist ${tech.name} has been SUSPENDED.`
      );
      return true;
    } catch (err) {
      console.error("Status Update Error:", err);
      toast.error("Failed to update registry.");
      return false;
    } finally {
      setStatusLoading(null);
    }
  };

  return { executeStatusUpdate, statusLoading };
}
