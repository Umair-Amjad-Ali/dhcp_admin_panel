"use client";

import { useState, useEffect } from "react";
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  getDoc,
  collection,
  query,
  where,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export function useOrderDetails(id: string) {
  const [order, setOrder] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingAction, setSyncingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch Order
    const docRef = doc(db, "orders", id);
    const unsubOrder = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() });
        setLoading(false);
      }
    });

    // Fetch Review for this Order
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("orderId", "==", id), limit(1));
    const unsubReview = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const reviewData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() as any };
        
        // Fetch user profile for the review
        if (reviewData.userId) {
          const userSnap = await getDoc(doc(db, "users", reviewData.userId));
          if (userSnap.exists()) {
            reviewData.userProfile = userSnap.data();
          }
        }
        
        setReview(reviewData);
      } else {
        setReview(null);
      }
    });

    return () => {
      unsubOrder();
      unsubReview();
    };
  }, [id]);

  const updateStatus = async (newStatus: string, completionData?: { finalPrice: number, workReport: string }) => {
    const actionKey = newStatus === "completed" ? "completing" : "cancelling";
    setSyncingAction(actionKey);
    try {
      const updates: any = { 
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (completionData) {
        updates.finalPrice = completionData.finalPrice;
        updates.workReport = completionData.workReport;
        updates.completedAt = serverTimestamp();
      }

      await updateDoc(doc(db, "orders", id), updates);

      // Specialist Release Protocol
      if ((newStatus === "completed" || newStatus === "cancelled") && order?.assignedTechId) {
         const techRef = doc(db, "technicians", order.assignedTechId);
         const techSnap = await getDoc(techRef);
         
         if (techSnap.exists()) {
            const techData = techSnap.data();
            const currentTechStatus = techData.status?.toLowerCase();
            const finalStatus = currentTechStatus === "suspended" ? "suspended" : "active";
            
            const currentJobsCount = techData.activeJobsCount || 0;
            const newJobsCount = Math.max(0, currentJobsCount - 1);
            
            const updates: any = {
               status: finalStatus,
               activeJobsCount: newJobsCount,
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

  return { order, review, loading, updateStatus, syncingAction };
}
