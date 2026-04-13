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

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Initial load
    const q = query(
      collection(db, "users"), 
      orderBy("createdAt", "desc"),
      limit(CHUNK_SIZE)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === CHUNK_SIZE);
      setLoading(false);
    }, (err) => {
      console.error("Customers initial load error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadMore = () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextQ = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(CHUNK_SIZE)
    );

    // For "Load More", we use a one-time get normally, but to keep it simple and reactive 
    // we just use a snapshot for the additional chunk as well.
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
      unsubscribe(); // One-time fetch for subsequent batches to prevent listener explosion
    }, (err) => {
      console.error("Load more customers error:", err);
      setLoadingMore(false);
    });
  };

  return { customers, loading, hasMore, loadMore, loadingMore };
}
