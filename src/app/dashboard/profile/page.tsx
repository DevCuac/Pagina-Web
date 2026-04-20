'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/components/I18nProvider';

export default function ProfileEditPage() {
  const { data: session, update } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState({ bio: '', minecraftName: '', avatar: '', banner: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(data => {
      setForm({ 
         bio: data.bio || '', 
         minecraftName: data.minecraftName || '',
         avatar: data.avatar || '',
         banner: data.banner || ''
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess('Perfil actualizado correctamente');
      await update();
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('profileEdit.title')}</h1>

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--accent-success-bg)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-success)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">{t('auth.username')}</label>
            <input className="form-input" value={session?.user?.username || ''} disabled />
            <p className="form-hint">{t('profileEdit.err_cannot_change_username')}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={session?.user?.email || ''} disabled />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('profileEdit.avatar_url')}</label>
              <input type="url" className="form-input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://i.imgur.com/foto.png" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('profileEdit.banner_url')}</label>
              <input type="url" className="form-input" value={form.banner} onChange={e => setForm({ ...form, banner: e.target.value })} placeholder="https://i.imgur.com/fondo.jpg" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('profileEdit.bio')}</label>
            <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder={t('profileEdit.bio_placeholder')} rows={4} maxLength={500} />
            <p className="form-hint">{form.bio.length}/500</p>
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.minecraft_name')}</label>
            <input className="form-input" value={form.minecraftName} onChange={e => setForm({ ...form, minecraftName: e.target.value })} placeholder="Steve" maxLength={16} />
            <p className="form-hint">{t('auth.minecraft_hint')}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('profileEdit.saving') : t('profileEdit.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
