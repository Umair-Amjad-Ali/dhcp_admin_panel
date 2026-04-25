"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const CHUNK_SIZE = 12;

  const fetchReviews = useCallback(async (getNext = false) => {
    if (getNext) setLoadingMore(true);
    else setLoading(true);

    try {
      let reviewsRef = collection(db, "reviews");
      let constraints: any[] = [orderBy("createdAt", "desc"), limit(CHUNK_SIZE)];

      if (getNext && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(reviewsRef, ...constraints);
      const snapshot = await getDocs(q);
      const snapshotDocs = snapshot.docs;
      
      const rawReviews = snapshotDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Enhanced Sync: Fetch unique user profiles in parallel
      const uniqueUserIds = Array.from(new Set(rawReviews.map((r: any) => r.userId).filter(Boolean)));
      const userProfiles: Record<string, any> = {};
      
      if (uniqueUserIds.length > 0) {
        await Promise.all(uniqueUserIds.map(async (uid: any) => {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            userProfiles[uid] = userSnap.data();
          }
        }));
      }

      // Attach user profile to reviews
      const enrichedReviews = rawReviews.map((r: any) => ({
        ...r,
        userProfile: userProfiles[r.userId] || null
      }));

      if (getNext) {
        setReviews(prev => [...prev, ...enrichedReviews]);
      } else {
        setReviews(enrichedReviews);
      }

      setLastDoc(snapshotDocs[snapshotDocs.length - 1] || null);
      setHasMore(snapshotDocs.length === CHUNK_SIZE);
      
    } catch (err) {
      console.error("Reviews fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    fetchReviews();
  }, []);

  return { 
    reviews, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore: () => fetchReviews(true),
    refresh: () => fetchReviews(false)
  };
}
