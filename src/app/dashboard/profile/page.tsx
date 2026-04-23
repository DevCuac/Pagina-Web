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

    if (file.size > 2 * 1024 * 1024) {
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
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.error || 'Error saving profile');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '10px' }}>{t('profileEdit.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('profileEdit.subtitle') || 'Customize your identity across the network'}</p>
        </div>

        {success && (
          <div style={{ padding: '1rem', background: 'rgba(63,185,80,0.1)', borderLeft: '4px solid var(--accent-success)', borderRadius: '8px', color: 'var(--accent-success)', marginBottom: '30px', animation: 'slideIn 0.3s ease' }}>
            <strong>✓</strong> {success}
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(248,81,73,0.1)', borderLeft: '4px solid var(--accent-danger)', borderRadius: '8px', color: 'var(--accent-danger)', marginBottom: '30px', animation: 'slideIn 0.3s ease' }}>
            <strong>⚠</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>🖼️ {t('profileEdit.media_title') || 'Profile Appearance'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <label className="form-label">{t('profileEdit.avatar_label') || 'Profile Picture'}</label>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '15px auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                  {form.avatar ? (
                    <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No Image</div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, 'avatar')} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to upload</p>
              </div>

              <div>
                <label className="form-label">{t('profileEdit.banner_label') || 'Profile Banner'}</label>
                <div style={{ position: 'relative', height: '120px', marginTop: '15px', borderRadius: '12px', overflow: 'hidden', border: '3px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                  {form.banner ? (
                    <img src={form.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No Banner</div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, 'banner')} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>Recommended size: 1200x400</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>📝 {t('profileEdit.info_title') || 'User Information'}</h3>
            
            <div className="form-group">
              <label className="form-label">{t('profileEdit.bio_label') || 'Biography'}</label>
              <textarea 
                className="form-textarea" 
                value={form.bio} 
                onChange={e => setForm({ ...form, bio: e.target.value })} 
                placeholder={t('profileEdit.bio_placeholder') || 'Tell the world about yourself...'}
                rows={5} 
                maxLength={500}
                style={{ resize: 'none' }}
              />
              <p className="form-hint" style={{ textAlign: 'right' }}>{form.bio.length}/500</p>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.minecraft_name')}</label>
              <input 
                className="form-input" 
                value={form.minecraftName} 
                onChange={e => setForm({ ...form, minecraftName: e.target.value })} 
                placeholder="Steve" 
                maxLength={16} 
              />
              <p className="form-hint">{t('auth.minecraft_hint')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              ← {t('common.back') || 'Go Back'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px', padding: '15px 30px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 10px 20px -5px var(--accent-primary-glow)' }}>
              {loading ? t('profileEdit.saving') : t('profileEdit.save_changes') || 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
