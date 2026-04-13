"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminStore } from "@/store/useAdminStore";

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const CHUNK_SIZE = 10;
  const { searchQuery, statusFilter } = useAdminStore();

  async function fetchOrders(getNext = false) {
    if (getNext) setLoadingMore(true);
    else setLoading(true);

    try {
      // Automatic collection discovery
      let ordersRef = collection(db, "order");
      const checkSnap = await getDocs(query(ordersRef, limit(1)));
      if (checkSnap.empty) {
        ordersRef = collection(db, "orders");
      }

      let q = query(
        ordersRef, 
        orderBy("createdAt", "desc"), 
        limit(CHUNK_SIZE)
      );

      if (getNext && lastDoc) {
        q = query(
          ordersRef, 
          orderBy("createdAt", "desc"), 
          startAfter(lastDoc), 
          limit(CHUNK_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (getNext) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === CHUNK_SIZE);
      
    } catch (err) {
      console.error("Pagination error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const name = order.userDetails?.name?.toLowerCase() || "";
      const id = order.id.toLowerCase();
      const type = order.service?.serviceType?.toLowerCase() || "";
      const search = searchQuery.toLowerCase();

      const matchesSearch = name.includes(search) || id.includes(search) || type.includes(search);
      const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return { 
    orders: filteredOrders, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore: () => fetchOrders(true),
    refresh: () => fetchOrders(false)
  };
}
