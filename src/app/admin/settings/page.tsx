"use client";

import React from "react";
import { Key, Loader2, Lock, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export default function SettingsPage() {
  const {
    loading,
    actionLoading,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleChangePassword
  } = useAdminSettings();

  // --- SHIMMER LOADING STATE ---
  if (loading) {
    return (
      <div className="space-y-6 pb-20 w-full">
        <div className="flex flex-col gap-2 mb-2">
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[460px] w-full bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
          <div className="lg:col-span-1 space-y-6">
            <div className="h-[200px] w-full bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
            <div className="h-[200px] w-full bg-card-bg rounded-[2rem] border border-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          Security Settings <span className="text-brand">.</span>
        </h2>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">Credentials Management</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {/* LEFT COLUMN - FORM */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl border">
            <div className="mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Key size={18} className="text-amber-500" />
                Update Credentials
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Verify your identity to change password</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              
              {/* Current Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-xs text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">New Secure Entry</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-xs text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Verify new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        "w-full bg-black/20 border rounded-xl pl-12 pr-12 py-3.5 text-xs text-white font-bold placeholder:text-slate-600 focus:outline-none transition-colors",
                        confirmPassword && newPassword !== confirmPassword ? "border-rose-500 focus:border-rose-500" : "border-white/10 focus:border-amber-500"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={actionLoading === "updatePassword" || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full md:w-auto px-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                >
                  {actionLoading === "updatePassword" ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                  Confirm & Update Credentials
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN - INFO CARDS */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <Card className="p-6 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl bg-linear-to-br from-card-bg to-amber-500/5">
            <ShieldCheck size={28} className="text-amber-500 mb-4 opacity-70" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Security Protocol</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
              To verify your identity, you must enter your current password. Once verified, your new password will be applied immediately, securing your active session across all devices.
            </p>
          </Card>

          <Card className="p-6 rounded-[2rem] bg-card-bg border-border-subtle shadow-2xl border">
            <AlertCircle size={28} className="text-brand mb-4 opacity-70" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Password Rules</h3>
            <ul className="space-y-3">
              {[
                "Minimum 6 characters long",
                "Cannot be the same as your email",
                "Case-sensitive verification",
                "Requires re-authentication"
              ].map((rule, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand/50" />
                  {rule}
                </li>
              ))}
            </ul>
          </Card>

        </div>
      </motion.div>
    </div>
  );
}