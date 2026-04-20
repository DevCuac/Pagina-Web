'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function NotificationPoller() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const previousCountRef = useRef<number>(0);

  useEffect(() => {
    if (!session) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications/unread');
        if (!res.ok) return;
        const data = await res.json();
        const currentCount = data.count || 0;

        // If the unread notifications count has increased
        if (currentCount > previousCountRef.current && previousCountRef.current !== 0) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch((e) => console.log('El navegador bloqueó el sonido automático hasta que el usuario interactúe.', e));

          if (data.latest && data.latest.message) {
             toast.success(data.latest.message, { icon: '🔔' });
          } else {
             toast.success('¡Tienes una nueva notificación!', { icon: '🔔' });
          }
        }

        previousCountRef.current = currentCount;
        setUnreadCount(currentCount);

        // Dispatch a custom event so other components (like Navbar) can update their badge count without refreshing context
        window.dispatchEvent(new CustomEvent('notification_count_updated', { detail: currentCount }));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Fetch immediately on mount
    fetchNotifications();

    // Poll every 10 seconds (10000 ms)
    const intervalId = setInterval(fetchNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [session]);

  return null; // Invisible component
}
