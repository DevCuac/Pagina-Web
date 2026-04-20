'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/components/I18nProvider';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    minecraftName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          minecraftName: form.minecraftName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      if (data.verificationRequired) {
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Auto-login only after registration if verification isn't required
      const loginResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Error del servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
            <h1 style={{ color: 'var(--accent-primary)' }}>{t('auth.check_mail_title')}</h1>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{t('auth.check_mail_desc')} <strong>{form.email}</strong>.</p>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{t('auth.check_mail_hint')}</p>
          </div>
          <Link href="/login" className="btn btn-secondary w-full btn-lg" style={{ marginTop: '2rem' }}>
            {t('auth.go_login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <span>CROSS</span><span className={styles.accent}>PIXEL</span>
          </Link>
          <h1>{t('auth.register_title')}</h1>
          <p>{t('auth.register_desc')}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">{t('auth.username')}</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              className="form-input"
              value={form.username}
              onChange={handleChange}
              placeholder="TuNombre"
              minLength={3}
              maxLength={20}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">{t('auth.email')}</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="user@mail.com"
              required
            />
          </div>

          <div className={styles.twoCol}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">{t('auth.password')}</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">{t('auth.confirm_password')}</label>
              <input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-mc">{t('auth.minecraft_name')}</label>
            <input
              id="reg-mc"
              name="minecraftName"
              type="text"
              className="form-input"
              value={form.minecraftName}
              onChange={handleChange}
              placeholder="Steve"
              maxLength={16}
            />
            <p className="form-hint">{t('auth.minecraft_hint')}</p>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? t('auth.register_loading') : t('auth.register_btn')}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('auth.or_continue')}</span>
        </div>

        <div className={styles.socialBtns}>
          <button className={styles.discordBtn} onClick={() => signIn('discord', { callbackUrl: '/' })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Discord
          </button>
          <button className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/' })}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        <p className={styles.switchLink}>
          {t('auth.has_account')} <Link href="/login">{t('auth.login_btn')}</Link>
        </p>
      </div>
    </div>
  );
}
