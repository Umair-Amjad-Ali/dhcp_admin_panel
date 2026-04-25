import { create } from 'zustand';

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

interface NotificationStore {
  notifications: AdminNotification[];
  unreadCount: number;
  isOpen: boolean;
  addNotification: (notification: Partial<AdminNotification> & { title: string; body: string; timestamp: string }) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  togglePanel: () => void;
  closePanel: () => void;
  setNotifications: (notifications: AdminNotification[]) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount: unread });
  },

  addNotification: (notification) =>
    set((state) => {
      // Check if notification already exists by ID
      if (notification.id && state.notifications.some(n => n.id === notification.id)) {
        return state;
      }

      const newNotification: AdminNotification = {
        title: notification.title,
        body: notification.body,
        timestamp: notification.timestamp,
        id: notification.id || Date.now().toString(),
        read: notification.read || false,
        orderId: notification.orderId,
      };

      const updatedNotifications = [newNotification, ...state.notifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);

      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  closePanel: () => set({ isOpen: false }),
}));
