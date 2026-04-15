"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export function useAddTechnician(onSuccess: () => void) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    skills: [] as string[],
  });
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill] }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(s => s !== skillToRemove) 
    }));
  };

  const registerTech = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Required: Name, Email and Phone Contact.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "technicians"), {
        ...formData,
        status: "active",
        completedJobs: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Specialist Successfully Onboarded");
      setFormData({ name: "", email: "", phone: "", city: "", skills: [] });
      onSuccess();
    } catch (err) {
      console.error("Staffing Error:", err);
      toast.error("Registration Failed: Cloud Sync Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    currentSkill,
    setCurrentSkill,
    addSkill,
    removeSkill,
    registerTech,
    loading
  };
}
