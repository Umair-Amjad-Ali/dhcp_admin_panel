"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useTechnicians } from "@/hooks/useTechnicians";
import { RegistryLayout } from "@/components/common/RegistryLayout";
import { ReviewShimmer } from "@/components/reviews/ReviewShimmer";
import { Card } from "@/components/ui/Card";
import { 
  Star, 
  MessageSquare, 
  User, 
  RefreshCcw, 
  ChevronDown,
  Wrench,
  ExternalLink,
  Award,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ReviewsPage() {
  const { 
    reviews, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore, 
    refresh 
  } = useReviews();

  const { technicians } = useTechnicians();

  // Map technician IDs to names for quick lookup
  const techMap = useMemo(() => {
    const map: Record<string, string> = {};
    technicians.forEach(tech => {
      map[tech.id] = tech.name || tech.fullName || "Unknown Technician";
    });
    return map;
  }, [technicians]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return {
      avg: (sum / reviews.length).toFixed(1),
      count: reviews.length
    };
  }, [reviews]);

  const actionControls = (
    <button 
      onClick={refresh}
      className="h-[46px] w-[46px] flex items-center justify-center rounded-2xl bg-card-bg border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all shadow-xl"
    >
      <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
    </button>
  );

  return (
    <RegistryLayout
      title="Service Reviews"
      metricText={loading ? "Synchronizing Feedback..." : `${stats.count} Reviews Analysis Complete`}
      pulseColor="amber"
      actionSlot={actionControls}
      loading={loading}
      isEmpty={!loading && reviews.length === 0}
      emptyMessage="No reviews found in the system."
    >
      {loading ? (
        <ReviewShimmer />
      ) : (
        <>
          {/* Summary Section */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card-bg border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Average Rating</p>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-2xl font-black text-white italic">{stats.avg}</h3>
                    <Star size={14} className="text-amber-500 fill-amber-500 mb-1" />
                  </div>
                </div>
              </div>

              <div className="bg-card-bg border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Customer Satisfaction</p>
                  <h3 className="text-2xl font-black text-white italic">
                    {Math.round((Number(stats.avg) / 5) * 100)}%
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                technicianName={techMap[review.technicianId]} 
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="group flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <div className="h-10 w-10 rounded-full bg-card-bg border border-white/5 flex items-center justify-center text-slate-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all shadow-xl">
                  {loadingMore ? (
                    <RefreshCcw size={16} className="animate-spin text-amber-500" />
                  ) : (
                    <ChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
                  )}
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                  {loadingMore ? "Fetching..." : "Load More Feedback"}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </RegistryLayout>
  );
}

function ReviewCard({ review, technicianName }: { review: any, technicianName?: string }) {
  const userDetails = review.userProfile;

  const date = review.createdAt?.toDate 
    ? review.createdAt.toDate().toLocaleDateString("en-US", { 
        month: "short", 
        day: "2-digit", 
        year: "numeric",
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : "N/A";
  
  return (
    <Card className="bg-card-bg border border-white/5 rounded-[2rem] p-7 flex flex-col h-full hover:border-amber-500/30 transition-all group relative overflow-hidden shadow-2xl">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Rating & Date */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            <span className="text-sm font-black text-amber-500 italic">{review.rating}.0</span>
            <Star size={12} className="fill-amber-500 text-amber-500" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock size={10} />
            <span className="text-[9px] font-black uppercase tracking-widest">{date}</span>
          </div>
        </div>

        {/* Content: The Quote */}
        <div className="flex-1 mb-8">
          <div className="flex gap-3">
            <Quote size={16} className="text-amber-500/20 shrink-0 mt-1 rotate-180" />
            <p className="text-[13px] text-slate-300 font-medium leading-relaxed italic pr-4">
              {review.comment || "No specific feedback message provided by the customer."}
            </p>
          </div>
        </div>

        {/* Footer: User & Order Info */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <User size={18} className="text-amber-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight leading-tight truncate">
                    {review.userName || userDetails?.name || "Customer"}
                  </span>
                  <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] mt-0.5">Verified Client</span>
                  
                  {/* Contact Meta */}
                  {(userDetails?.email || userDetails?.phoneNumber) && (
                    <div className="flex flex-col gap-1">
                      {userDetails?.email && (
                        <div className="flex items-center gap-1.5 text-slate-600 group-hover:text-slate-500 transition-colors">
                          <span className="text-[8px] font-bold lowercase truncate max-w-[150px]">{userDetails.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Link 
                href={`/admin/orders/${review.orderId}`}
                className="h-9 w-9 rounded-xl bg-white/2 hover:bg-amber-500/10 text-slate-600 hover:text-amber-500 transition-all flex items-center justify-center border border-white/5"
                title="View Deployment File"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Service Tech Assignment */}
          <div className="flex items-center gap-3 bg-white/2 border border-white/5 p-3 rounded-2xl group/tech hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover/tech:border-amber-500/20 group-hover/tech:text-amber-500 transition-all">
              <Wrench size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 group-hover/tech:text-slate-200 transition-colors truncate max-w-[120px]">
                {technicianName || "Assigned Specialist"}
              </span>
              <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest leading-none mt-1">Specialist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Background Icon */}
      <Star size={120} className="absolute -bottom-10 -right-10 text-amber-500/2 -rotate-12 pointer-events-none" />
    </Card>
  );
}
