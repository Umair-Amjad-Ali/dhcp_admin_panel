"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type MissionStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'rejected' | 'active' | 'busy' | 'suspended' | string;

interface MissionBadgeProps {
  status: MissionStatus;
  className?: string;
}

export const getStatusStyles = (status: MissionStatus) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed':
    case 'active':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'cancelled':
    case 'rejected':
    case 'suspended':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'in-progress':
    case 'busy':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'pending':
    case 'amber':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

export const MissionBadge = ({ status, className }: MissionBadgeProps) => {
  return (
    <Badge className={cn(
      "px-2.5 py-1 rounded-full text-[7px] font-black uppercase border",
      getStatusStyles(status),
      className
    )}>
      {status || "Unknown"}
    </Badge>
  );
};
