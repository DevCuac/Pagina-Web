import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import styles from './members.module.css';

export const metadata: Metadata = {
  title: 'Miembros',
  description: 'Miembros de la comunidad CrossPixel',
};

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ list?: string; search?: string; role?: string }> }) {
  const sp = await searchParams;
  const list = sp.list || 'overview';
  const search = sp.search || '';

  const whereClause: any = {};
  if (search) {
    whereClause.username = { contains: search };
  }
  if (sp.role) {
    whereClause.roleId = sp.role;
  }

  const staffMembers = await prisma.user.findMany({
    where: { role: { isStaff: true } },
    include: { role: true },
    orderBy: { role: { weight: 'desc' } },
    take: 10,
  });

  const recentMembers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { role: true },
    take: 8,
  });

  const topPosters = await prisma.user.findMany({
    include: { role: true, _count: { select: { forumPosts: true } } },
    orderBy: { forumPosts: { _count: 'desc' } },
    take: 5,
  });

  const allMembers = list === 'registered' ? await prisma.user.findMany({
    where: whereClause,
    include: { role: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  }) : [];

  const roles = await prisma.role.findMany({ orderBy: { weight: 'desc' } });
  const totalMembers = await prisma.user.count();

  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('members.title')}</h1>

        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <Link href="/members" className={`${styles.sidebarLink} ${list === 'overview' ? styles.active : ''}`}>
                📋 {locale === 'en' ? 'Overview' : 'Übersicht'}
              </Link>
              <Link href="/members?list=staff" className={`${styles.sidebarLink} ${list === 'staff' ? styles.active : ''}`}>
                🛡️ {t('members.staff')}
              </Link>
              <Link href="/members?list=top_posters" className={`${styles.sidebarLink} ${list === 'top_posters' ? styles.active : ''}`}>
                📝 {t('members.top_posters')}
              </Link>
              <Link href="/members?list=registered" className={`${styles.sidebarLink} ${list === 'registered' ? styles.active : ''}`}>
                👥 {t('members.all_members')}
              </Link>
            </div>

            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>{t('members.search')}</h4>
              <form action="/members" method="GET">
                <input type="hidden" name="list" value="registered" />
                <input
                  type="text"
                  name="search"
                  className="form-input"
                  placeholder="..."
                  defaultValue={search}
                  style={{ fontSize: '0.875rem' }}
                />
              </form>
            </div>

            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>{locale === 'en' ? 'Filter by Role' : 'Nach Rolle filtern'}</h4>
              <div className={styles.roleFilters}>
                {roles.map((role) => (
                  <Link
                    key={role.id}
                    href={`/members?list=registered&role=${role.id}`}
                    className={styles.roleTag}
                    style={{ borderColor: role.color, color: role.color }}
                  >
                    {role.icon} {role.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>{t('members.new_members')}</h4>
              <div className={styles.newMembers}>
                {recentMembers.slice(0, 5).map((m) => (
                  <Link key={m.id} href={`/members/${m.id}`} className={styles.newMemberAvatar} title={m.username}>
                    <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                      {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.username[0]}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {locale === 'en' ? 'Total' : 'Gesamt'}: <strong>{totalMembers}</strong>
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.main}>
            {(list === 'overview' || list === 'staff') && (
              <div className={styles.memberSection}>
                <h2>🛡️ {t('members.staff')}</h2>
                <div className={styles.memberGrid}>
                  {staffMembers.map((member) => (
                    <Link key={member.id} href={`/members/${member.id}`} className={styles.memberCard}>
                      <div className="avatar-placeholder avatar-lg" style={{ width: 56, height: 56, fontSize: '1.25rem', borderColor: member.role.color }}>
                        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : member.username[0]}
                      </div>
                      <span className={styles.memberName} style={{ color: member.role.color }}>
                        {member.username}
                      </span>
                      <span className="badge badge-role" style={{ background: member.role.color + '22', color: member.role.color }}>
                        {member.role.name}
                      </span>
                    </Link>
                  ))}
                  {staffMembers.length === 0 && <p style={{ color: 'var(--text-muted)', padding: 'var(--space-md)' }}>Sin miembros de equipo aún</p>}
                </div>
              </div>
            )}

            {(list === 'overview' || list === 'top_posters') && (
              <div className={styles.memberSection}>
                <h2>📝 {t('members.top_posters')}</h2>
                <div className={styles.memberList}>
                  {topPosters.map((member) => (
                    <Link key={member.id} href={`/members/${member.id}`} className={styles.memberRow}>
                      <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : member.username[0]}
                      </div>
                      <span style={{ color: member.role.color, flex: 1, fontWeight: 500 }}>{member.username}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{member._count.forumPosts} {t('members.posts')}</span>
                    </Link>
                  ))}
                  {topPosters.length === 0 && <p style={{ color: 'var(--text-muted)', padding: 'var(--space-md)' }}>Sin posts aún</p>}
                </div>
              </div>
            )}

            {list === 'registered' && (
              <div className={styles.memberSection}>
                <h2>👥 {t('members.all_members')}</h2>
                <div className={styles.memberGrid}>
                  {allMembers.map((member) => (
                    <Link key={member.id} href={`/members/${member.id}`} className={styles.memberCard}>
                      <div className="avatar-placeholder avatar-lg" style={{ width: 56, height: 56, fontSize: '1.25rem', borderColor: member.role.color }}>
                        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : member.username[0]}
                      </div>
                      <span className={styles.memberName} style={{ color: member.role.color }}>{member.username}</span>
                      <span className="badge badge-role" style={{ background: member.role.color + '22', color: member.role.color }}>
                        {member.role.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(member.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { month: 'short', year: 'numeric' })}
                      </span>
                    </Link>
                  ))}
                  {allMembers.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', padding: 'var(--space-md)' }}>
                      {search ? `...` : t('members.no_staff')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
