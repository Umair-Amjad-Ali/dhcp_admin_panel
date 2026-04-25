"use client";

import React from "react";
import { Star, Quote, Mail, User as UserIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface OrderReviewCardProps {
  review: {
    rating: number;
    comment: string;
    userName?: string;
    userId?: string;
    userProfile?: any;
    createdAt?: any;
  };
}

export const OrderReviewCard = ({ review }: OrderReviewCardProps) => {
  const userDetails = review.userProfile;

  return (
    <Card className="p-6 bg-amber-500/5 border-amber-500/10 rounded-2xl flex items-center justify-between group relative overflow-hidden transition-all hover:bg-amber-500/8">
      <div className="flex items-center gap-6 w-full">
        {/* Visual Rating Badge */}
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-amber-500/20 flex flex-col items-center justify-center text-amber-500 shadow-xl border border-amber-500/30 relative z-10">
          <span className="text-xl font-black italic leading-none">{review.rating}</span>
          <Star size={12} className="fill-amber-500 mt-1" />
        </div>

        {/* Feedback Content */}
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 leading-none italic">
            Customer Feedback
          </p>
          <div className="flex items-start gap-3">
            <Quote size={12} className="text-amber-500/40 shrink-0 mt-1" />
            <h4 className="text-[13px] font-medium text-slate-300 leading-relaxed italic truncate lg:whitespace-normal pr-4">
              {review.comment || "No specific comment provided."}
            </h4>
          </div>

          {/* User Meta */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <UserIcon size={10} className="text-slate-600" />
              <span className="text-[9px] font-black text-white uppercase tracking-wider">
                {review.userName || userDetails?.name || "Customer"}
              </span>
            </div>
            
            {userDetails?.email && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Mail size={10} className="text-amber-500/30" />
                <span className="text-[8px] font-bold lowercase">{userDetails.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <Star size={100} className="absolute -bottom-8 -right-8 text-amber-500/3 -rotate-12 pointer-events-none" />
    </Card>
  );
};
