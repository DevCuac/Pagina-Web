import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import ProfileActions from '@/components/profile/ProfileActions';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const [dbUser, postCount, ticketCount, unreadNotifs] = await Promise.all([
    (prisma.user as any).findUnique({ 
      where: { id: session.user.id }, 
      select: { 
        bio: true, banner: true, avatar: true, 
        instagram: true, twitter: true, discord: true, youtube: true, facebook: true 
      } 
    }),
    prisma.forumPost.count({ where: { authorId: session.user.id } }),
    prisma.ticket.count({ where: { authorId: session.user.id } }),
    prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
  ]);

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  const finalBanner = dbUser?.banner || session.user.banner;

  return (
    <div className="page-content" style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Banner Area */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-xl)', position: 'relative' }}>
          <div style={{
            height: '160px',
            background: finalBanner
              ? `url(${finalBanner}) center/cover`
              : `linear-gradient(135deg, ${session.user.roleColor}33, var(--bg-elevated))`,
          }} />

          <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' }}>
            <ProfileActions userId={session.user.id} />
          </div>

          <div style={{ padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-end', marginTop: '-60px' }}>
            <div className="avatar-placeholder avatar-2xl" style={{
              width: 110, height: 110, fontSize: '2.5rem',
              borderColor: session.user.roleColor, borderWidth: '4px',
              background: 'var(--bg-surface)', flexShrink: 0, overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
            }}>
              {(dbUser?.avatar || session.user.avatar || session.user.image) ? (
                <img src={dbUser?.avatar || session.user.avatar || session.user.image || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : session.user.username[0]}
            </div>
            <div style={{ flex: 1, paddingBottom: 'var(--space-sm)' }}>
              <h1 style={{ fontSize: '1.8rem', color: session.user.roleColor, fontWeight: 800 }}>{t('dashboard.greeting').split(',')[0]}, {session.user.username}!</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                   {dbUser?.instagram && <span title="Instagram">📸</span>}
                   {dbUser?.twitter && <span title="Twitter">🐦</span>}
                   {dbUser?.discord && <span title="Discord">💬</span>}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('dashboard.greeting').split(', ')[1] || 'Welcome back'}</p>
              </div>
            </div>
          </div>
          {dbUser?.bio && (
            <div style={{ padding: '0 var(--space-lg) var(--space-lg)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {dbUser.bio}
            </div>
          )}
        </div>

        <div className="grid grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{postCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('dashboard.posts')}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{ticketCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('dashboard.tickets')}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: unreadNotifs > 0 ? 'var(--accent-warning)' : 'var(--text-primary)' }}>{unreadNotifs}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('dashboard.notifications')}</div>
          </div>
        </div>

        <div className="grid grid-2">
          <Link href="/dashboard/profile" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>👤 {t('dashboard.edit_profile')}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('dashboard.edit_profile_desc')}</p>
          </Link>
          <Link href="/notifications" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>🔔 {t('dashboard.notifications')}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}></p>
          </Link>
          <Link href="/support" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>🎫 {t('dashboard.my_tickets')}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('dashboard.my_tickets_desc')}</p>
          </Link>
          <Link href="/forums" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>💬 {t('dashboard.forums')}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('dashboard.forums_desc')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
