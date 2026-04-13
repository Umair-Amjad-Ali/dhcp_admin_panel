"use client";

import React from "react";
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const { loading, stats, recentOrders, chartData } = useDashboardData();
  const [mounted, setMounted] = React.useState(false);
  const [chartReady, setChartReady] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !loading) {
      // Defer chart render with a small timeout to ensure the DOM layout is 
      // completely stable. rAF might still be too early for Recharts.
      const timer = setTimeout(() => {
        setChartReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, loading]);

  if (loading || !mounted) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-card-bg rounded-2xl border border-white/5" />)}
        </div>
        <div className="h-64 bg-card-bg rounded-[2rem] border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          Mission Control <span className="text-brand">.</span>
        </h2>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">Operational Oversight</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatItem title="Total Orders" value={stats.total} icon={<BarChart3 size={16} className="text-blue-400" />} color="blue" />
        <StatItem title="Pending" value={stats.pending} icon={<Clock size={16} className="text-amber-400" />} color="amber" />
        <StatItem title="Completed" value={stats.completed} icon={<CheckCircle2 size={16} className="text-emerald-400" />} color="emerald" />
        <StatItem title="Cancelled" value={stats.cancelled} icon={<XCircle size={16} className="text-red-400" />} color="red" />
        <StatItem title="Today" value={stats.today} icon={<Activity size={16} className="text-purple-400" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-6 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl overflow-hidden">
          <div className="mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Growth Analytics</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">7-Day Transaction Flow</p>
          </div>
          
          <div className="h-[220px] w-full min-h-[220px] relative">
            {chartReady ? (
              <ResponsiveContainer width="99%" height="100%" debounce={1}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '10px', fontWeight: 900 }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorO)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-2xl bg-white/2 animate-pulse" />
            )}
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] bg-card-bg border-border-subtle flex flex-col shadow-2xl">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            Live Activity
          </h3>

          <div className="flex-1 space-y-4 text-slate-300">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, idx) => (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} key={order.id} className="flex gap-3 group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/3 border border-border-subtle flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all shadow-lg">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0 font-bold uppercase">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] text-white truncate">{order.userDetails?.name || "Anonymous"}</p>
                      <Badge className={cn("text-[7px] px-1.5 py-0 border-none", order.status === "pending" ? "bg-amber-500/10 text-amber-500" : order.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400")}>
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

function StatItem({ title, value, icon, color }: any) {
  const variants: any = {
    blue: "border-blue-900/10 hover:bg-brand/5",
    amber: "border-amber-900/10 hover:bg-amber-600/5",
    emerald: "border-emerald-900/10 hover:bg-emerald-600/5",
    red: "border-red-900/10 hover:bg-red-600/5",
    purple: "border-purple-900/10 hover:bg-purple-600/5",
  };

  return (
    <Card className={cn("p-4 rounded-2xl bg-card-bg border border-border-subtle transition-all duration-500 group", variants[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/2 border border-border-subtle group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1.5">{title}</p>
          <div className="text-lg font-black text-white leading-none tabular-nums tracking-tighter">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(" "); }
