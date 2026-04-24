"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const { isAdmin, loading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Identity Verified");
      // router.push("/admin/dashboard");
    } catch (error: any) {
      // console.error("Login error:", error);
      toast.error("Invalid credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="container mx-auto max-w-5xl">
        <div className="w-full flex flex-col lg:flex-row rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-xl bg-[#09090b]">
          
          {/* LEFT: Cinematic Visual Panel */}
          <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden items-center justify-center p-8 bg-page-bg">
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen" />
              <div className="absolute inset-0 bg-linear-to-t from-page-bg via-transparent to-transparent" />
            </div>

            <div className="relative z-10 w-full flex flex-col justify-center gap-6 h-full">
              <div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20"
                >
                  <ShieldCheck className="text-blue-400" size={28} />
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-black text-white leading-tight tracking-tight mb-4"
                >
                  DHS Admin <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600">
                    Control Center.
                  </span>
                </motion.h1>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-[240px]">
                  Secure administration portal for logistics and systems.
                </p>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/2 border border-white/5 p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em]">
                  Encrypted Session Active
                </p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: Form Panel */}
          <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-10 md:p-14 bg-[#09090b]">
            <div className="w-full max-w-sm mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-black mb-1 text-white">Admin Access</h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-10">Verification Required</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div className="relative group">
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="peer w-full h-14 px-5 bg-transparent border-2 border-zinc-900 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm text-white placeholder-transparent"
                        placeholder="Email Address"
                      />
                      <label 
                        htmlFor="email" 
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 bg-[#09090b] px-2 pointer-events-none font-black uppercase tracking-widest text-zinc-500 text-[9px] z-10
                          peer-focus:top-0 peer-focus:text-[8px] peer-focus:text-blue-500
                          peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[8px]
                        "
                      >
                        Email Address
                      </label>
                    </div>

                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="peer w-full h-14 pl-5 pr-12 bg-transparent border-2 border-zinc-900 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm text-white placeholder-transparent"
                        placeholder="Password"
                      />
                      <label 
                        htmlFor="password" 
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 bg-[#09090b] px-2 pointer-events-none font-black uppercase tracking-widest text-zinc-500 text-[9px] z-10
                          peer-focus:top-0 peer-focus:text-[8px] peer-focus:text-blue-500
                          peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[8px]
                        "
                      >
                        Password
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1 z-20"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading || authLoading}
                      className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all gap-3 bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] border-none shadow-none"
                    >
                      {loading || (authLoading && !isAdmin) ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Verify and Enter"
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-14 pt-6 border-t border-zinc-900/50 text-center">
                  <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                    Fixora Admin Core v2.8
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#111114] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
