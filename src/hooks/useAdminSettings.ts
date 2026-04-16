"use client";

import { useState, useEffect } from "react";
import { updatePassword, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export function useAdminSettings() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Input States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => setLoading(false), 300); 
    });
    return () => unsubscribe();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (auth.currentUser?.email && newPassword.toLowerCase() === auth.currentUser.email.toLowerCase()) {
      toast.error("Security risk: Password cannot be the same as your email.");
      return;
    }

    setActionLoading("updatePassword");
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update Password
      await updatePassword(user, newPassword);
      
      toast.success("Password updated successfully!");
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {
      console.error("Password Update Error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        toast.error("Incorrect current password. Please try again.");
      } else {
        toast.error("Failed to update password. Please try again later.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return {
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
  };
}
