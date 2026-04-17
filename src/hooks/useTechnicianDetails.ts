"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useTechnicianDetails(technicianId: string) {
  const [technician, setTechnician] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!technicianId) return;

    let unsubOrders: (() => void) | null = null;

    // 1. Sync Technician Profile
    const techRef = doc(db, "technicians", technicianId);
    const unsubTech = onSnapshot(techRef, (snapshot) => {
      if (snapshot.exists()) {
        const techData = { id: snapshot.id, ...snapshot.data() };
        setTechnician(techData);
        
        // 2. Sync Assigned Orders
        const ordersRef = collection(db, "orders");
        
        const setupOrderListener = () => {
          try {
            const q = query(
              ordersRef, 
              where("assignedTechId", "==", technicianId),
              orderBy("createdAt", "desc"),
              limit(100)
            );

            unsubOrders = onSnapshot(q, (orderSnap) => {
              const orderList = orderSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setOrders(orderList);
              setLoading(false);
            }, (err) => {
              console.warn("Complex query failed for orders, falling back to simple match.", err);
              unsubOrders?.();
              
              const simpleQ = query(
                ordersRef, 
                where("assignedTechId", "==", technicianId),
                limit(100)
              );
              
              unsubOrders = onSnapshot(simpleQ, (s) => {
                 setOrders(s.docs.map(d => ({id: d.id, ...d.data()})));
                 setLoading(false);
              }, (fallbackErr) => {
                 console.error("Critical: Orders sync failed:", fallbackErr);
                 setLoading(false);
              });
            });
          } catch (e) {
            console.error("Orders listener setup error:", e);
            setLoading(false);
          }
        };

        setupOrderListener();
      } else {
        setLoading(false);
      }
    }, (err) => {
      //  console.error("Technician Sync Error:", err);
       setLoading(false);
    });

    return () => {
      unsubTech();
      unsubOrders?.();
    };
  }, [technicianId]);

  return { technician, orders, loading };
}
