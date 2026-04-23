'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '@/components/I18nProvider';
import { 
  Languages, 
  ChevronDown, 
  User, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import NotificationPoller from '../NotificationPoller';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', tKey: 'navbar.home' },
  { href: '/games', tKey: 'navbar.games' },
  { href: '/forums', tKey: 'navbar.forums' },
  { href: '/support', tKey: 'navbar.support' },
  { href: '/members', tKey: 'navbar.members' },
  { href: '/status', tKey: 'navbar.status' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  
  useEffect(() => {
    if (session) {
      fetch('/api/user/profile', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => setCurrentAvatar(data.avatar))
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    const handleCountUpdate = (e: any) => setUnreadCount(e.detail);
    window.addEventListener('notification_count_updated', handleCountUpdate);
    return () => window.removeEventListener('notification_count_updated', handleCountUpdate);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const changeLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setLangMenuOpen(false);
    router.refresh();
  };

  return (
    <>
      {session && session.user && !(session.user as any).emailVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-500">
           <span className="text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
             <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
             {t('navbar.unverified_warning')}
           </span>
           <button 
             onClick={async () => {
               const res = await fetch('/api/user/resend-verification', { method: 'POST' });
               if (res.ok) alert('Correo enviado!');
               else alert('Error al enviar');
             }}
             className="px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
           >
             Resend Email
           </button>
        </div>
      )}
      <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>CROSS</span>
          <span className={styles.logoAccent}>PIXEL</span>
        </Link>

        <div className={`${styles.navLinks} ${mobileOpen ? styles.mobileOpen : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.tKey.includes('.') ? t(link.tKey) : link.tKey}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          {/* Language Switcher */}
          <div className="relative group">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <Languages className="size-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{locale}</span>
              <ChevronDown className={cn("size-3 transition-transform duration-300", langMenuOpen && "rotate-180")} />
            </button>
            
            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-40 p-1.5 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
                  <button onClick={() => changeLocale('es')} className={cn("flex items-center w-full gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors", locale === 'es' ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                    <span className="text-base">🇪🇸</span> Español
                  </button>
                  <button onClick={() => changeLocale('en')} className={cn("flex items-center w-full gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors", locale === 'en' ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                    <span className="text-base">🇬🇧</span> English
                  </button>
                  <button onClick={() => changeLocale('de')} className={cn("flex items-center w-full gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors", locale === 'de' ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white")}>
                    <span className="text-base">🇩🇪</span> Deutsch
                  </button>
                </div>
              </>
            )}
          </div>
          {isLoading ? (
            <div style={{ width: '100px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="size-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            </div>
          ) : session ? (
            <div className={styles.userArea}>
              <NotificationPoller />
              <Link href="/notifications" className={styles.notifBtn} title="Notificaciones" style={{ position: 'relative' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className={styles.userMenu}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className={styles.userAvatar}>
                    {currentAvatar || session.user.image ? (
                      <img src={currentAvatar || session.user.image || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span>{session.user.username?.[0] || 'U'}</span>
                    )}
                  </div>
                  <span className={styles.userName}>{session.user.username || session.user.name}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L1 3h10z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className={styles.dropdown} onClick={() => setUserMenuOpen(false)}>
                    <Link href="/dashboard" className={styles.dropdownItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18" />
                      </svg>
                      {t('navbar.dashboard')}
                    </Link>
                    <Link href="/dashboard/profile" className={styles.dropdownItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {t('dashboard.edit_profile')}
                    </Link>
                    {(session.user.isAdmin || session.user.isStaff) && (
                      <Link href="/admin" className={styles.dropdownItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        {t('navbar.admin')}
                      </Link>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button
                      className={styles.dropdownItem}
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {t('navbar.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/login" className={`btn btn-ghost ${styles.loginBtn}`}>
                {t('navbar.login')}
              </Link>
              <Link href="/register" className="btn btn-primary">
                {t('navbar.register')}
              </Link>
            </div>
          )}

          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            <span className={`${styles.line} ${mobileOpen ? styles.lineOpen : ''}`} />
            <span className={`${styles.line} ${mobileOpen ? styles.lineOpen : ''}`} />
            <span className={`${styles.line} ${mobileOpen ? styles.lineOpen : ''}`} />
          </button>
        </div>
        </div>
      </nav>
    </>
  );
}
