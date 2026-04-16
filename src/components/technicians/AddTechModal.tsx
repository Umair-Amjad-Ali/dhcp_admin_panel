"use client";

import React from "react";
import { 
  X, 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAddTechnician } from "@/hooks/useAddTechnician";
import { cn } from "@/lib/utils";

interface AddTechModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}

import { MissionModal } from "@/components/common/MissionModal";

export const AddTechModal = ({ isOpen, onClose }: AddTechModalProps) => {
  const {
    formData,
    setFormData,
    currentSkill,
    setCurrentSkill,
    addSkill,
    removeSkill,
    registerTech,
    loading
  } = useAddTechnician(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerTech();
  };

  return (
    <MissionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Specialist"
      subtitle="Fleet Registry"
      icon={<UserPlus size={18} />}
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <InputField 
              icon={<User size={14} />} 
              label="Name" 
              placeholder="Full name"
              value={formData.name}
              onChange={(v) => setFormData(prev => ({...prev, name: v}))}
             />
             <InputField 
              icon={<MapPin size={14} />} 
              label="Location" 
              placeholder="Location"
              value={formData.city}
              onChange={(v) => setFormData(prev => ({...prev, city: v}))}
             />
          </div>

          <InputField 
            icon={<Mail size={12} />} 
            label="Fleet Email" 
            placeholder="name@fleet.com"
            type="email"
            value={formData.email}
            onChange={(v) => setFormData(prev => ({...prev, email: v}))}
          />

          <InputField 
            icon={<Phone size={12} />} 
            label="Contact Serial" 
            placeholder="+971 -- --- ----"
            value={formData.phone}
            onChange={(v) => setFormData(prev => ({...prev, phone: v}))}
          />

          <div className="space-y-2">
             <label className="text-[8px] text-slate-700 font-black uppercase tracking-widest pl-1">Primary Skills</label>
             <div className="relative group/skill">
                <input 
                  type="text"
                  placeholder="Add skill..."
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="w-full bg-white/1 border border-white/5 rounded-xl pl-10 pr-12 py-3 text-[10px] text-white placeholder:text-slate-800 focus:outline-none focus:border-brand/30 transition-all font-bold"
                />
                <Hash size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
                <button 
                  type="button"
                  onClick={addSkill}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all"
                >
                  <Plus size={14} />
                </button>
             </div>
             
             <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
                {formData.skills.map(skill => (
                  <div key={skill} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/2 border border-white/5 group/tag">
                     <span className="text-[7px] font-black text-slate-500 uppercase">{skill}</span>
                     <button onClick={() => removeSkill(skill)} type="button" className="text-slate-700 hover:text-rose-500 transition-colors">
                        <X size={10} />
                     </button>
                  </div>
                ))}
             </div>
          </div>

          <div className="pt-4">
             <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
             >
               {loading ? (
                  <div className="h-3.5 w-3.5 border-2 border-slate-400 border-t-slate-950 animate-spin rounded-full" />
               ) : (
                  <>
                    Onboard Specialist
                    <ArrowRight size={14} />
                  </>
               )}
             </button>
          </div>
        </form>
      </div>

      <div className="p-3 bg-white/2 border-t border-white/5 flex items-center justify-center gap-2">
         <ShieldCheck size={12} className="text-slate-700" />
         <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Digital Auth Verified</span>
      </div>
    </MissionModal>
  );
};

function InputField({ icon, label, placeholder, value, onChange, type = "text" }: InputFieldProps) {
  return (
    <div className="space-y-1.5 flex-1">
       <label className="text-[8px] text-slate-700 font-black uppercase tracking-widest pl-1">{label}</label>
       <div className="relative">
          <input 
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/1 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[10px] text-white placeholder:text-slate-800 focus:outline-none focus:border-brand/30 transition-all font-bold"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700">
             {icon}
          </div>
       </div>
    </div>
  );
}
