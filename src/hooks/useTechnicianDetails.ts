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
        
        // 2. Discover and Sync Assigned Orders
        const collectionNames = ["orders", "order"];
        
        const attachOrderListener = (index: number) => {
          if (index >= collectionNames.length) {
            setLoading(false);
            return;
          }

          const colName = collectionNames[index];
          const ordersRef = collection(db, colName);
          
          try {
            const q = query(
              ordersRef, 
              where("assignedTechId", "==", technicianId),
              orderBy("createdAt", "desc"),
              limit(100)
            );

            unsubOrders = onSnapshot(q, (orderSnap) => {
              if (orderSnap.empty && index < collectionNames.length - 1) {
                unsubOrders?.();
                attachOrderListener(index + 1);
              } else {
                const orderList = orderSnap.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                setOrders(orderList);
                setLoading(false);
              }
            }, (err) => {
              console.warn(`Complex query failed for ${colName}, falling back to simple match.`, err);
              unsubOrders?.();
              
              const simpleQ = query(
                ordersRef, 
                where("assignedTechId", "==", technicianId),
                limit(100)
              );
              
              unsubOrders = onSnapshot(simpleQ, (s) => {
                 setOrders(s.docs.map(d => ({id: d.id, ...d.data()})));
                 setLoading(false);
              });
            });
          } catch (e) {
            setLoading(false);
          }
        };

        attachOrderListener(0);
      } else {
        setLoading(false);
      }
    }, (err) => {
       console.error("Technician Sync Error:", err);
       setLoading(false);
    });

    return () => {
      unsubTech();
      unsubOrders?.();
    };
  }, [technicianId]);

  return { technician, orders, loading };
}
