import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import styles from './admin.module.css';

export default async function AdminDashboard() {
  const [userCount, postCount, ticketCount, openTickets] = await Promise.all([
    prisma.user.count(),
    prisma.forumPost.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: { not: 'closed' } } }),
  ]);

  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { role: true },
  });

  const recentTickets = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { username: true } }, category: true },
  });

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin.panel')}</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>{t('admin.total_users')}</h4>
          <div className={styles.value}>{userCount}</div>
        </div>
        <div className={styles.statCard}>
          <h4>{t('admin.total_posts')}</h4>
          <div className={styles.value}>{postCount}</div>
        </div>
        <div className={styles.statCard}>
          <h4>{t('admin.total_tickets')}</h4>
          <div className={styles.value}>{ticketCount}</div>
        </div>
        <div className={styles.statCard}>
          <h4>{t('admin.open_tickets')}</h4>
          <div className={styles.value} style={{ color: openTickets > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
            {openTickets}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin.recent_users')}</h3>
          {recentUsers.map((user) => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: user.role.color, fontWeight: 500 }}>{user.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(user.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin.recent_tickets')}</h3>
          {recentTickets.map((ticket) => (
            <div key={ticket.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{ticket.subject}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('admin.by')} {ticket.author.username}</div>
              </div>
              <span className={`badge ${ticket.status === 'open' ? 'badge-success' : ticket.status === 'in_progress' ? 'badge-warning' : 'badge-danger'}`}>
                {ticket.status === 'open' ? t('admin.open') : ticket.status === 'in_progress' ? t('admin.in_progress') : t('admin.closed')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
