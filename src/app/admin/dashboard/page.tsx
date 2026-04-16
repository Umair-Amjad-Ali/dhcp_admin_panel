"use client";

import React from "react";
import { 
  BarChart3, Users, Clock, CheckCircle2, XCircle, 
  MapPin, Calendar, Activity, ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { MissionMetric } from "@/components/common/MissionMetric";
import { useDashboardData, Timeframe } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { 
    loading, stats, recentOrders, chartData, 
    topServices, statusChartData, timeframe, setTimeframe 
  } = useDashboardData();
  
  const [mounted, setMounted] = React.useState(false);
  const [chartReady, setChartReady] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !loading) {
      const timer = setTimeout(() => setChartReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, loading, timeframe]);

  // FIXED: Comprehensive Shimmer State that matches the actual layout
  if (loading || !mounted) {
    return (
      <div className="space-y-6 pb-8 w-full overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-[88px] bg-card-bg rounded-2xl border border-white/5 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-[320px] bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
          <div className="h-[320px] bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
          <div className="xl:col-span-2 h-[260px] bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
          <div className="h-[260px] bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 w-full max-w-full overflow-hidden">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
            Mission Control <span className="text-brand">.</span>
          </h2>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">Operational Oversight</p>
        </div>

        {/* Timeframe Selector */}
        <div className="relative inline-flex">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="appearance-none bg-card-bg border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-brand cursor-pointer transition-colors"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MissionMetric variant="dashboard" label="Total Orders" value={stats.total} icon={<BarChart3 />} color="blue" />
        <MissionMetric variant="dashboard" label="Pending" value={stats.pending} icon={<Clock />} color="amber" />
        <MissionMetric variant="dashboard" label="Completed" value={stats.completed} icon={<CheckCircle2 />} color="emerald" />
        <MissionMetric variant="dashboard" label="Cancelled" value={stats.cancelled} icon={<XCircle />} color="red" />
        <MissionMetric variant="dashboard" label="Today" value={stats.today} icon={<Activity />} color="purple" />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <Card className="xl:col-span-2 p-4 md:p-6 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl overflow-hidden w-full">
          <div className="mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Growth Analytics</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
              {timeframe === "all" ? "Historical Trend not available for 'All Time'" : "Transaction Flow"}
            </p>
          </div>
          
          <div className="h-[240px] w-full min-h-[240px] relative">
            {chartReady && timeframe !== "all" ? (
              <ResponsiveContainer width="99%" height="100%" debounce={1}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '10px', fontWeight: 900, color: '#fff' }}
                    itemStyle={{ color: '#3b82f6' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorO)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-2xl bg-white/2 border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center px-4">
                  {timeframe === "all" ? "Select 7D or 30D timeframe to view trend" : "Loading metrics..."}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Status Distribution Donut Chart */}
        <Card className="p-4 md:p-6 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl overflow-hidden w-full flex flex-col">
          <div className="mb-2 shrink-0">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Status Distribution</h3>
          </div>
          <div className="flex-1 min-h-[220px] w-full relative flex items-center justify-center">
            {chartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '10px', fontWeight: 900, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 shrink-0">
            {statusChartData.map((entry: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[9px] text-slate-400 font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Services Bar Chart - REDESIGNED */}
        <Card className="xl:col-span-2 p-4 md:p-6 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl overflow-hidden w-full flex flex-col">
           <div className="mb-6 shrink-0">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Top Demanded Services</h3>
          </div>
          {/* FIXED: Removed fixed barSize, using flex-1 to stretch chart fully */}
          <div className="flex-1 min-h-[240px] w-full">
            {chartReady ? (
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={topServices} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: -5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={true} vertical={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                  {/* FIXED width to prevent pushing out of bounds on mobile */}
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontSize: 9, fontWeight: 800 }} width={85} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '10px', fontWeight: 900, color: '#fff' }}
                    itemStyle={{ color: '#60a5fa' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  {/* FIXED: maxBarSize lets Recharts stretch the bars nicely instead of squeezing them */}
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    radius={[0, 4, 4, 0]} 
                    maxBarSize={40} 
                    background={{ fill: 'rgba(255,255,255,0.02)' }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </Card>

        {/* Live Activity */}
        <Card className="p-4 md:p-6 rounded-[2rem] bg-card-bg border-border-subtle flex flex-col shadow-2xl overflow-hidden w-full">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            Live Activity
          </h3>

          <div className="flex-1 space-y-4 text-slate-300">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any, idx: number) => (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} key={order.id} className="flex gap-3 group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/3 border border-border-subtle flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all shadow-lg">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0 font-bold uppercase">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-[10px] text-white truncate">{order.userDetails?.name || "Anonymous"}</p>
                      <Badge className={cn("text-[7px] px-1.5 py-0 border-none shrink-0", order.status === "pending" || order.status === "in-progress" ? "bg-amber-500/10 text-amber-500" : order.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400")}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-[9px] text-slate-500 tracking-wider truncate">{order.service?.serviceType}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[8px] text-slate-600">
                      <Calendar size={10} /> {order.city || "Dubai"}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-700 text-[8px] font-black uppercase tracking-widest">Idle Sync Engine</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}