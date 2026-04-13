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
        const collectionNames = ["orders", "order"];
        
        const attachOrderListener = (index: number) => {
          if (index >= collectionNames.length) {
            setLoading(false);
            return;
          }

          const colName = collectionNames[index];
          const ordersRef = collection(db, colName);
          
          try {
            // We use customerId directly as it represents the userId in orders
            const q = query(
              ordersRef, 
              where("userId", "==", customerId),
              orderBy("createdAt", "desc"),
              limit(50)
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
              // Clean up previous listener before starting fallback
              unsubOrders?.();
              
              const simpleQ = query(
                ordersRef, 
                where("userId", "==", customerId),
                limit(50)
              );
              
              // Correctly track the fallback listener
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
