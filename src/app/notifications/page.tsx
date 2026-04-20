import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import NotificationActions from './NotificationActions';
import { getLocaleObj, getTranslation } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);
  return { title: t('notifications.title') };
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const typeIcons: Record<string, string> = {
    forum_reply: '💬',
    ticket_update: '🎫',
    ticket_message: '📩',
    system: '🔔',
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h1>{t('notifications.title')}</h1>
          <NotificationActions />
        </div>

        {notifications.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.link || '#'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  borderBottom: '1px solid var(--border-muted)',
                  textDecoration: 'none',
                  background: notif.isRead ? 'transparent' : 'var(--accent-primary-bg)',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{typeIcons[notif.type] || '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: notif.isRead ? 400 : 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notif.message}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(notif.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <h3 className="empty-state-title">{t('notifications.empty_title')}</h3>
              <p className="empty-state-text">{t('notifications.empty_desc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
