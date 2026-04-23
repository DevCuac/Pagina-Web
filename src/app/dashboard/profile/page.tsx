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
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/user/profile', { cache: 'no-store' }).then(r => r.json()).then(data => {
      setForm({ 
         bio: data.bio || '', 
         minecraftName: data.minecraftName || '',
         avatar: data.avatar || '',
         banner: data.banner || ''
      });
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('File is too large (max 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(t('profileEdit.success'));
        await update();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error saving profile');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('profileEdit.title')}</h1>

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-success)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">{t('auth.username')}</label>
            <input className="form-input" value={session?.user?.username || ''} disabled />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">{t('profileEdit.avatar') || 'Avatar'}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {form.avatar && <img src={form.avatar} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />}
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'avatar')} style={{ fontSize: '0.8rem' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('profileEdit.banner') || 'Banner'}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {form.banner && <img src={form.banner} alt="Preview" style={{ width: '100%', height: '50px', borderRadius: '4px', objectFit: 'cover', border: '2px solid var(--border-color)' }} />}
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'banner')} style={{ fontSize: '0.8rem' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('profileEdit.bio')}</label>
            <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} maxLength={500} />
            <p className="form-hint">{form.bio.length}/500</p>
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.minecraft_name')}</label>
            <input className="form-input" value={form.minecraftName} onChange={e => setForm({ ...form, minecraftName: e.target.value })} placeholder="Steve" maxLength={16} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
              {loading ? t('profileEdit.saving') : t('profileEdit.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
