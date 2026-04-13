"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  orderBy, 
  limit,
  query
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    activeTechs: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log("Starting Dashboard Data Fetch...");

        // Try 'order' collection first, fallback to 'orders' if zero
        let ordersRef = collection(db, "order");
        let ordersSnap = await getDocs(ordersRef);
        
        if (ordersSnap.empty) {
          console.log("'order' collection empty, trying 'orders'...");
          ordersRef = collection(db, "orders");
          ordersSnap = await getDocs(ordersRef);
        }

        console.log(`Found ${ordersSnap.size} orders total.`);

        let pending = 0;
        let completed = 0;
        let cancelled = 0;
        let todayCount = 0;
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const dayCounts: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const label = d.toLocaleDateString('en-US', { weekday: 'short' });
          dayCounts[label] = 0;
        }

        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();
          const status = data.status?.toLowerCase();
          
          // Count statuses accurately
          if (status === "pending") pending++;
          else if (status === "completed") completed++;
          else if (status === "cancelled" || status === "rejected") cancelled++;
          
          if (createdAt) {
            const time = createdAt.getTime();
            if (time >= startOfToday) todayCount++;

            const label = createdAt.toLocaleDateString('en-US', { weekday: 'short' });
            if (dayCounts.hasOwnProperty(label)) {
              dayCounts[label]++;
            }
          }
        });

        // 2. Fetch Techs
        const techsSnap = await getDocs(collection(db, "technicians"));

        setStats({
          total: ordersSnap.size,
          pending: pending,
          completed: completed,
          cancelled: cancelled,
          today: todayCount,
          activeTechs: techsSnap.docs.filter(d => d.data().status === "active").length
        });

        setChartData(Object.keys(dayCounts).map(key => ({
          name: key,
          orders: dayCounts[key]
        })));

        // 3. Recent 5
        const recentQuery = query(ordersRef, orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(recentQuery);
        setRecentOrders(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Dashboard Hook Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { loading, stats, recentOrders, chartData };
}
