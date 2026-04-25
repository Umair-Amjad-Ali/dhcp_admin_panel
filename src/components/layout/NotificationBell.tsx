"use client";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Bell, X, CheckCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, updateDoc, query, collection, where, getDocs, writeBatch } from "firebase/firestore";

export const NotificationBell = () => {
  const { notifications, unreadCount, isOpen, togglePanel, closePanel, markAllRead, markRead } =
    useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closePanel]);

  const handleNotificationClick = async (id: string, isRead: boolean, orderId?: string) => {
    if (!isRead) {
      markRead(id); // Update UI instantly
      try {
        await updateDoc(doc(db, "admin_notifications", id), { read: true });
      } catch (e) {
        console.error("Failed to update notification status", e);
      }
    }
    
    if (orderId) {
      router.push(`/admin/orders/${orderId}`);
    } else {
      router.push("/admin/orders");
    }
    
    closePanel();
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    try {
      const q = query(collection(db, "admin_notifications"), where("read", "==", false));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((d) => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error("Failed to mark all as read in DB", e);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={togglePanel}
        className="relative p-2 text-slate-400 hover:text-white transition-all duration-200 hover:bg-white/5 rounded-lg"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/2">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={closePanel}
                className="p-1 text-slate-500 hover:text-white transition-colors rounded"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.filter(n => !n.read).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Bell size={28} className="mb-2 opacity-40" />
                <p className="text-xs">No active notifications</p>
              </div>
            ) : (
              notifications.filter(n => !n.read).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.read, notif.orderId)}
                  className="px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer bg-blue-500/5 border-l-2 border-l-blue-500"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-600 whitespace-nowrap mt-0.5">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
