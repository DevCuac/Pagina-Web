'use client';

import { useRouter } from 'next/navigation';

export default function NotificationActions() {
  const router = useRouter();

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    router.refresh();
  };

  return (
    <button onClick={markAllRead} className="btn btn-ghost btn-sm">
      Marcar todo como leído
    </button>
  );
}
