'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/I18nProvider';

export default function NotificationActions() {
  const router = useRouter();
  const { t } = useTranslation();

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    router.refresh();
  };

  return (
    <button onClick={markAllRead} className="btn btn-ghost btn-sm">
      {t('notifications.mark_all_read')}
    </button>
  );
}
