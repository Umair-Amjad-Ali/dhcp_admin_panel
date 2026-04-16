"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Timeframe = "7d" | "30d" | "all";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");
  
  // Store raw data so we don't re-fetch from Firebase when changing dates
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [activeTechCount, setActiveTechCount] = useState(0);

  // 1. Fetch raw data ONCE on mount
  useEffect(() => {
    async function fetchRawData() {
      try {
        setLoading(true);
        let ordersRef = collection(db, "order");
        let ordersSnap = await getDocs(ordersRef);
        
        if (ordersSnap.empty) {
          ordersRef = collection(db, "orders");
          ordersSnap = await getDocs(ordersRef);
        }

        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRawOrders(orders);

        const techsSnap = await getDocs(collection(db, "technicians"));
        setActiveTechCount(techsSnap.docs.filter(d => d.data().status === "active").length);
      } catch (error) {
        console.error("Dashboard Hook Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRawData();
  }, []);

  // 2. Process data whenever rawOrders or timeframe changes
  const processedData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let daysToTrack = 7;
    if (timeframe === "7d") { cutoffDate.setDate(now.getDate() - 7); daysToTrack = 7; }
    else if (timeframe === "30d") { cutoffDate.setDate(now.getDate() - 30); daysToTrack = 30; }
    else { cutoffDate.setFullYear(2000); daysToTrack = 0; } // All time

    // Filter ALL orders by timeframe strictly
    const validOrders = timeframe === "all" 
      ? rawOrders 
      : rawOrders.filter(order => {
          const createdAt = order.createdAt?.toDate();
          return createdAt ? createdAt >= cutoffDate : false;
        });

    let pending = 0;
    let completed = 0;
    let cancelled = 0;
    let todayCount = 0;
    
    // Setup chart data structures
    const dayCounts: { [key: string]: number } = {};
    if (timeframe !== "all") {
      for (let i = daysToTrack - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = timeframe === "30d" 
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : d.toLocaleDateString('en-US', { weekday: 'short' });
        dayCounts[label] = 0;
      }
    }

    const serviceCounts: { [key: string]: number } = {};

    validOrders.forEach(order => {
      const createdAt = order.createdAt?.toDate();
      const status = order.status?.toLowerCase();
      const serviceName = order.service?.serviceType || "General";
      
      // Stats
      if (status === "pending" || status === "in-progress") pending++;
      else if (status === "completed") completed++;
      else if (status === "cancelled" || status === "rejected") cancelled++;
      
      // Today count
      if (createdAt && createdAt.getTime() >= startOfToday) todayCount++;

      // Area Chart (Trend)
      if (createdAt && timeframe !== "all") {
        const label = timeframe === "30d" 
          ? createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : createdAt.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayCounts.hasOwnProperty(label)) dayCounts[label]++;
      }

      // Bar Chart (Services)
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    // Format final chart arrays
    const chartData = timeframe === "all" ? [] : Object.keys(dayCounts).map(key => ({
      name: key,
      orders: dayCounts[key]
    }));

    const topServices = Object.keys(serviceCounts)
      .map(k => ({ name: k, value: serviceCounts[k] }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5);

    const statusChartData = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' },
    ].filter(s => s.value > 0);

    return {
      stats: { total: validOrders.length, pending, completed, cancelled, today: todayCount, activeTechs: activeTechCount },
      chartData,
      topServices,
      statusChartData,
      // Recent orders now STRICTLY respects the timeframe validOrders
      recentOrders: validOrders.sort((a,b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0)).slice(0, 5)
    };
  }, [rawOrders, timeframe, activeTechCount]);

  return { 
    loading, 
    ...processedData,
    timeframe,
    setTimeframe 
  };
}