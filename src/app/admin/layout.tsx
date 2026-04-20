import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import styles from './admin.module.css';

const adminLinks = [
  { href: '/admin', tKey: 'admin.panel', icon: '📊' },
  { href: '/admin/users', tKey: 'admin.users', icon: '👥' },
  { href: '/admin/roles', tKey: 'admin.roles', icon: '🛡️' },
  { href: '/admin/forums', tKey: 'admin.forums', icon: '💬' },
  { href: '/admin/games', tKey: 'admin.games', icon: '🎮' },
  { href: '/admin/wiki', tKey: 'admin.wiki', icon: '📚' },
  { href: '/admin/servers', tKey: 'admin.servers', icon: '🖥️' },
  { href: '/admin/tickets', tKey: 'admin.tickets', icon: '🎫' },
  { href: '/admin/settings', tKey: 'admin.settings', icon: '⚙️' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (!session.user.isAdmin && !session.user.isStaff)) {
    redirect('/');
  }

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.adminLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h3>⚙️ {t('admin.title')}</h3>
            </div>
            <nav className={styles.sidebarNav}>
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href} className={styles.sidebarLink}>
                  <span>{link.icon}</span>
                  {t(link.tKey)}
                </Link>
              ))}
            </nav>
            <div className={styles.sidebarFooter}>
              <Link href="/" className={styles.sidebarLink}>{t('admin.back')}</Link>
            </div>
          </aside>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
