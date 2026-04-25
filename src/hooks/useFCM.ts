import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, setDoc, collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { getMessagingInstance, db } from '@/lib/firebase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/useNotificationStore';

export const useFCM = () => {
  const { adminUser } = useAdminAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!adminUser) return;

    // 1. Handle FCM Token Registration
    const requestPermissionAndSaveToken = async () => {
      try {
        console.log('FCM: Starting registration...');
        const permission = await Notification.requestPermission();
        console.log('FCM: Permission status:', permission);
        
        if (permission !== 'granted') {
          console.warn('FCM: Permission not granted');
          return;
        }

        // Manually register the service worker
        console.log('FCM: Registering Service Worker...');
        const swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );
        console.log('FCM: Service Worker registered:', swRegistration);

        const msg = await getMessagingInstance();
        if (msg) {
          const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
          });

          if (token) {
            console.log('FCM: Token received:', token);
            await setDoc(doc(db, 'admin_fcm_tokens', adminUser.uid), {
              token,
              adminId: adminUser.uid,
              updatedAt: new Date().toISOString(),
            });
            console.log('FCM Token registered and saved to Firestore!');
          }
        }
      } catch (error) {
        console.error('FCM Error during registration:', error);
      }
    };

    requestPermissionAndSaveToken();

    // 2. Load existing notifications from Firestore
    const loadInitialNotifications = async () => {
      try {
        const qInitial = query(
          collection(db, 'admin_notifications'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(qInitial);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          addNotification({
            id: doc.id,
            title: data.title,
            body: data.body,
            timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            read: data.read || false,
            orderId: data.orderId,
          });
        });
      } catch (error) {
        console.error('Error loading initial notifications:', error);
      }
    };

    loadInitialNotifications();

    // 3. Real-time Firestore Listener for New Notifications
    const q = query(
      collection(db, 'admin_notifications'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          const createdAt = data.createdAt?.toDate?.() || new Date();
          const now = new Date();
          const secondsDiff = (now.getTime() - createdAt.getTime()) / 1000;
          
          if (secondsDiff < 10) { 
            const title = data.title || 'New Order Received! 🎉';
            const body = data.body || '';

            addNotification({
              id: change.doc.id,
              title,
              body,
              timestamp: createdAt.toISOString(),
              read: false,
              orderId: data.orderId
            });

            toast.success(title, {
              description: body,
              duration: 5000,
            });

            try {
              const audio = new Audio('/ding.mp3');
              audio.play().catch(() => {});
            } catch (e) {}
          }
        }
      });
    });

    return () => {
      unsubscribeFirestore();
    };
  }, [adminUser, addNotification]);
};
