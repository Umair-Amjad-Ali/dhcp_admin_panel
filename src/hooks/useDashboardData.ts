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
        
        // Use ONLY the "orders" collection as confirmed
        const ordersRef = collection(db, "orders");
        const ordersSnap = await getDocs(ordersRef);
        
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRawOrders(orders);

        // Fetch technicians separately to avoid crashing the whole dashboard if technicians aren't ready
        try {
          const techsSnap = await getDocs(collection(db, "technicians"));
          setActiveTechCount(techsSnap.docs.filter(d => d.data().status === "active").length);
        } catch (techError) {
          console.warn("Technicians collection fetch failed:", techError);
          setActiveTechCount(0);
        }
      } catch (error) {
        console.error("Dashboard Global Fetch Error:", error);
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
    const dayCounts: { [key: string]: { count: number, sortKey: string, label: string } } = {};
    
    if (timeframe === "all") {
      if (validOrders.length > 0) {
        // Find the earliest date
        const dates = validOrders.map(o => o.createdAt?.toDate()).filter(d => !!d);
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        const latest = new Date(); // Go up to today

        // Fill ALL months from earliest to today with 0
        let current = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
        while (current <= latest) {
          const year = current.getFullYear();
          const month = current.getMonth();
          const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
          const label = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          
          dayCounts[sortKey] = { count: 0, sortKey, label };
          current.setMonth(current.getMonth() + 1);
        }

        // Fill in actual data
        validOrders.forEach(order => {
          const createdAt = order.createdAt?.toDate();
          if (createdAt) {
            const sortKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (dayCounts[sortKey]) {
              dayCounts[sortKey].count++;
            }
          }
        });
      }
    } else {
      // Group by Day for 7d/30d
      for (let i = daysToTrack - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = timeframe === "30d" 
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : d.toLocaleDateString('en-US', { weekday: 'short' });
        const sortKey = d.toISOString().split('T')[0];
        dayCounts[sortKey] = { count: 0, sortKey, label };
      }

      validOrders.forEach(order => {
        const createdAt = order.createdAt?.toDate();
        if (createdAt) {
          const sortKey = createdAt.toISOString().split('T')[0];
          if (dayCounts[sortKey]) {
            dayCounts[sortKey].count++;
          }
        }
      });
    }

    const serviceCounts: { [key: string]: number } = {};

    validOrders.forEach(order => {
      const status = order.status?.toLowerCase();
      const serviceName = order.service?.serviceType || "General";
      
      // Stats
      if (status === "pending" || status === "in-progress") pending++;
      else if (status === "completed") completed++;
      else if (status === "cancelled" || status === "rejected") cancelled++;
      
      const createdAt = order.createdAt?.toDate();
      // Today count
      if (createdAt && createdAt.getTime() >= startOfToday) todayCount++;

      // Bar Chart (Services)
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    // Format final chart arrays
    const chartData = Object.values(dayCounts)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(item => ({
        name: item.label,
        orders: item.count
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