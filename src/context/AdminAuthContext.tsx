"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface AdminUser extends User {
  role?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  isAdmin: false,
  loading: true,
  logout: async () => {},
});

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Stable Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admin", user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            setAdminUser({ ...user, role: adminData.role } as AdminUser);
            setIsAdmin(true);
          } else {
            setAdminUser(null);
            setIsAdmin(false);
            await firebaseSignOut(auth);
          }
        } catch (error) {
          console.error("Auth cycle error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setAdminUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Optimized Redirect Logic
  useEffect(() => {
    if (loading) return;

    const isLoginPath = pathname === "/admin/login";
    const isAdminPath = pathname.startsWith("/admin") && !isLoginPath;

    if (isAdmin && isLoginPath) {
      router.replace("/admin/dashboard");
    } else if (!isAdmin && isAdminPath) {
      router.replace("/admin/login");
    }
  }, [isAdmin, loading, pathname, router]);

  const logout = async () => {
    await firebaseSignOut(auth);
    setAdminUser(null);
    setIsAdmin(false);
    router.replace("/admin/login");
  };

  const contextValue = useMemo(() => ({
    adminUser,
    isAdmin,
    loading,
    logout
  }), [adminUser, isAdmin, loading]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
