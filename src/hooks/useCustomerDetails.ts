"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useCustomerDetails(customerId: string) {
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;

    let unsubOrders: (() => void) | null = null;

    // 1. Sync Customer Profile
    const userRef = doc(db, "users", customerId);
    const unsubUser = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = { id: snapshot.id, ...(snapshot.data() as any) };
        setCustomer(userData);
        
        // 2. Discover and Sync Orders using userId (Perfect Matching)
        const ordersRef = collection(db, "orders");
        
        const setupOrderListener = () => {
          try {
            // We use customerId directly as it represents the userId in orders
            const q = query(
              ordersRef, 
              where("userId", "==", customerId),
              orderBy("createdAt", "desc"),
              limit(50)
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
              // Clean up previous listener before starting fallback
              unsubOrders?.();
              
              const simpleQ = query(
                ordersRef, 
                where("userId", "==", customerId),
                limit(50)
              );
              
              // Correctly track the fallback listener with error handling
              unsubOrders = onSnapshot(simpleQ, (s) => {
                 setOrders(s.docs.map(d => ({id: d.id, ...d.data()})));
                 setLoading(false);
              }, (fallbackErr) => {
                 console.error("Critical: Orders sync failed:", fallbackErr);
                 setLoading(false);
              });
            });
          } catch (e) {
            console.error("Orders sync listener setup error:", e);
            setLoading(false);
          }
        };

        setupOrderListener();
      } else {
        setLoading(false);
      }
    }, (err) => {
       console.error("User Sync Error:", err);
       setLoading(false);
    });

    return () => {
      unsubUser();
      unsubOrders?.();
    };
  }, [customerId]);

  return { customer, orders, loading };
}
