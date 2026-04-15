"use client";

import { useState, useEffect } from "react";
import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export function useEditTechnician(technician: any, onSuccess: () => void) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    skills: [] as string[],
  });
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name || "",
        email: technician.email || "",
        phone: technician.phone || "",
        city: technician.city || "",
        skills: technician.skills || [],
      });
    }
  }, [technician]);

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill] }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(s => s !== skillToRemove) 
    }));
  };

  const updateTech = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Required: Name, Email and Phone Contact.");
      return;
    }

    setLoading(true);
    try {
      const techRef = doc(db, "technicians", technician.id);
      
      // 1. Update the technician document (Source of Truth)
      await updateDoc(techRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });

      // 2. Sync with orders if name or phone changed
      if (formData.name !== technician.name || formData.phone !== technician.phone) {
        toast.info("Synchronizing data across active orders...");
        
        // Find orders where this technician is assigned
        // We sync only 'pending' and 'in-progress' orders to preserve historical data on completed ones
        const ordersRef = collection(db, "order"); // The user mentioned 'order' or 'orders' collection
        const ordersQuery = query(
          ordersRef, 
          where("assignedTechId", "==", technician.id)
        );
        
        const snapshot = await getDocs(ordersQuery);
        const batch = writeBatch(db);
        
        snapshot.docs.forEach(orderDoc => {
          const status = orderDoc.data().status?.toLowerCase();
          if (["pending", "in-progress"].includes(status)) {
            batch.update(orderDoc.ref, {
              assignedTechName: formData.name,
              assignedTechPhone: formData.phone,
              updatedAt: serverTimestamp()
            });
          }
        });

        // Also check the "orders" collection if it exists separately
        const ordersAltRef = collection(db, "orders");
        const ordersAltQuery = query(
          ordersAltRef,
          where("assignedTechId", "==", technician.id)
        );
        const snapshotAlt = await getDocs(ordersAltQuery);
        snapshotAlt.docs.forEach(orderDoc => {
          const status = orderDoc.data().status?.toLowerCase();
          if (["pending", "in-progress"].includes(status)) {
            batch.update(orderDoc.ref, {
              assignedTechName: formData.name,
              assignedTechPhone: formData.phone,
              updatedAt: serverTimestamp()
            });
          }
        });

        await batch.commit();
      }

      toast.success("Specialist Profile Updated & Synchronized");
      onSuccess();
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Process Failed: Registry Update Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    currentSkill,
    setCurrentSkill,
    addSkill,
    removeSkill,
    updateTech,
    loading
  };
}
