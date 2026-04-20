'use client';

import Link from 'next/link';
import { useTranslation } from '@/components/I18nProvider';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>CROSS</span>
            <span className={styles.logoAccent}>PIXEL</span>
          </Link>
          <p className={styles.tagline}>{t('footer.tagline')}</p>
        </div>

        <div className={styles.links}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.nav_title')}</h4>
            <Link href="/">{t('footer.nav_home')}</Link>
            <Link href="/games">{t('footer.nav_games')}</Link>
            <Link href="/forums">{t('footer.nav_forums')}</Link>
            <Link href="/members">{t('footer.nav_members')}</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.support_title')}</h4>
            <Link href="/support">{t('footer.support_center')}</Link>
            <Link href="/status">{t('footer.support_status')}</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.community_title')}</h4>
            <a href="https://discord.gg/crosspixel" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© CrossPixel {new Date().getFullYear()}. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}
