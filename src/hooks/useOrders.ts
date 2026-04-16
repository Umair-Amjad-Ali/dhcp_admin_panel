"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  where,
  Timestamp,
  doc,
  getDoc,
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
  
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const CHUNK_SIZE = 10;
  
  const { searchQuery, statusFilter } = useAdminStore();

  // 1. DEBOUNCER: Wait 500ms after user stops typing before searching
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. THE FETCH ENGINE
  const fetchOrders = useCallback(async (getNext = false, currentDates = dateFilter, currentSearch = debouncedSearch) => {
    if (getNext) setLoadingMore(true);
    else setLoading(true);

    try {
      let ordersRef = collection(db, "orders");
      let snapshotDocs: QueryDocumentSnapshot<DocumentData>[] = [];

      if (currentSearch && currentSearch.trim().length > 15) {
        const exactDoc = await getDoc(doc(db, "orders", currentSearch.trim()));
        if (exactDoc.exists()) {
          snapshotDocs = [exactDoc as QueryDocumentSnapshot<DocumentData>];
        }
      }

      // STANDARD/DEEP PATH: If no exact ID was found, run the query
      if (snapshotDocs.length === 0) {
        
        // DEEP SCAN: If searching, pull 150 records to ensure the local filter catches it.
        // Otherwise, pull standard 10 for normal pagination.
        const activeLimit = currentSearch ? 150 : CHUNK_SIZE;
        
        let constraints: any[] = [orderBy("createdAt", "desc"), limit(activeLimit)];

        if (currentDates.start) {
          const startDate = new Date(currentDates.start);
          startDate.setHours(0, 0, 0, 0);
          constraints.unshift(where("createdAt", ">=", Timestamp.fromDate(startDate)));
        }

        if (currentDates.end) {
          const endDate = new Date(currentDates.end);
          endDate.setHours(23, 59, 59, 999);
          constraints.unshift(where("createdAt", "<=", Timestamp.fromDate(endDate)));
        }

        // Only use pagination cursor if we are NOT currently running a deep search
        if (getNext && lastDoc && !currentSearch) {
          constraints.push(startAfter(lastDoc));
        }

        const q = query(ordersRef, ...constraints);
        const snapshot = await getDocs(q);
        snapshotDocs = snapshot.docs;
      }
      
      const newOrders = snapshotDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (getNext && !currentSearch) {
        // Append unique orders if loading more
        setOrders(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const uniqueNew = newOrders.filter(o => !existingIds.has(o.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        // Replace entirely if fresh fetch or search
        setOrders(newOrders);
      }

      setLastDoc(snapshotDocs[snapshotDocs.length - 1] || null);
      
      // Disable the "Load More" button if we are currently searching
      setHasMore(!currentSearch && snapshotDocs.length === CHUNK_SIZE);
      
    } catch (err) {
      console.error("Pagination/Filter error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dateFilter, lastDoc]);

  // 3. TRIGGER: Run when dates or search changes
  useEffect(() => {
    fetchOrders(false, dateFilter, debouncedSearch);
  }, [dateFilter.start, dateFilter.end, debouncedSearch]);

  // 4. LOCAL FILTER: Refine the large fetched chunk down to exactly what the user typed
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
    dateFilter,
    setDateFilter,
    loadMore: () => fetchOrders(true),
    refresh: () => fetchOrders(false)
  };
}