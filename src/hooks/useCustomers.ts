"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const CHUNK_SIZE = 25;

export function useCustomers(searchQuery?: string) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery || "");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery || "");
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const activeLimit = debouncedSearch ? 150 : CHUNK_SIZE;
    
    // Initial load
    const q = query(
      collection(db, "users"), 
      orderBy("createdAt", "desc"),
      limit(activeLimit)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(!debouncedSearch && snapshot.docs.length === CHUNK_SIZE);
      setLoading(false);
    }, (err) => {
      console.error("Customers initial load error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [debouncedSearch]);

  const loadMore = () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextQ = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(CHUNK_SIZE)
    );

    const unsubscribe = onSnapshot(nextQ, (snapshot) => {
      if (!snapshot.empty) {
        const newData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomers(prev => [...prev, ...newData]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === CHUNK_SIZE);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
      unsubscribe(); 
    }, (err) => {
      console.error("Load more customers error:", err);
      setLoadingMore(false);
    });
  };

  return { customers, loading, hasMore, loadMore, loadingMore };
}
