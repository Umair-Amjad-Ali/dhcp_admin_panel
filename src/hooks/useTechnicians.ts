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

export function useTechnicians(searchQuery?: string) {
  const [technicians, setTechnicians] = useState<any[]>([]);
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

    const q = query(
      collection(db, "technicians"), 
      orderBy("createdAt", "desc"),
      limit(activeLimit)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTechnicians(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      
      // If we are actively searching deep, hide the load more button
      setHasMore(!debouncedSearch && snapshot.docs.length === CHUNK_SIZE);
      setLoading(false);
    }, (err) => {
      console.error("Technicians sync error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [debouncedSearch]);

  const loadMore = () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextQ = query(
      collection(db, "technicians"),
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
        setTechnicians(prev => [...prev, ...newData]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === CHUNK_SIZE);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
      unsubscribe();
    }, (err) => {
      console.error("Load more technicians error:", err);
      setLoadingMore(false);
    });
  };

  return { technicians, loading, hasMore, loadMore, loadingMore };
}
