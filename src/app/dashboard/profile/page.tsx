'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/components/I18nProvider';
import { useToast } from '@/components/providers/ToastProvider';


export default function ProfileEditPage() {
  const { data: session, update } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({ 
    bio: '', 
    minecraftName: '', 
    avatar: '', 
    banner: '',
    instagram: '',
    twitter: '',
    discord: '',
    youtube: '',
    facebook: ''
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile', { cache: 'no-store' }).then(r => r.json()).then(data => {
      setForm({ 
         bio: data.bio || '', 
         minecraftName: data.minecraftName || '',
         avatar: data.avatar || '',
         banner: data.banner || '',
         instagram: data.instagram || '',
         twitter: data.twitter || '',
         discord: data.discord || '',
         youtube: data.youtube || '',
         facebook: data.facebook || ''
      });
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('File is too large (max 2MB)', 'error');
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

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(t('profileEdit.success'), 'success');
        await update();
      } else {
        showToast(data.error || 'Error saving profile', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setPassLoading(true);

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passForm),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(t('profileEdit.pass_success') || 'Password updated!', 'success');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.error || 'Error updating password', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
    setPassLoading(false);
  };

  return (
    <div className="page-content" style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '10px' }}>{t('profileEdit.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('profileEdit.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="card" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>🖼️ {t('profileEdit.media_title')}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div style={{ textAlign: 'center' }}>
                  <label className="form-label">{t('profileEdit.avatar_label')}</label>
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
                  <label className="form-label">{t('profileEdit.banner_label')}</label>
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
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>📝 {t('profileEdit.info_title')}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">{t('profileEdit.bio_label')}</label>
                    <textarea 
                      className="form-textarea" 
                      value={form.bio} 
                      onChange={e => setForm({ ...form, bio: e.target.value })} 
                      placeholder={t('profileEdit.bio_placeholder')}
                      rows={4} 
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

                <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ marginBottom: '15px', display: 'block' }}>Skin Preview</label>
                  {form.minecraftName ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={`https://mc-heads.net/body/${form.minecraftName}/right`} 
                        alt="Skin Body" 
                        style={{ height: '180px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{form.minecraftName}</span>
                    </div>
                  ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Enter your name to see your skin
                    </div>
                  )}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />
              
              <h4 style={{ marginBottom: '15px', fontSize: '1rem', color: 'var(--text-muted)' }}>Social Networks</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Instagram Username</label>
                  <input className="form-input" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@username" />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter/X Username</label>
                  <input className="form-input" value={form.twitter} onChange={e => setForm({...form, twitter: e.target.value})} placeholder="@username" />
                </div>
                <div className="form-group">
                  <label className="form-label">Discord Tag</label>
                  <input className="form-input" value={form.discord} onChange={e => setForm({...form, discord: e.target.value})} placeholder="user#0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">YouTube Channel Name</label>
                  <input className="form-input" value={form.youtube} onChange={e => setForm({...form, youtube: e.target.value})} placeholder="Channel Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Facebook Profile Link</label>
                  <input className="form-input" value={form.facebook} onChange={e => setForm({...form, facebook: e.target.value})} placeholder="facebook.com/user" />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '200px' }}>
                  {loading ? t('profileEdit.saving') : t('profileEdit.save_changes')}
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={handlePasswordSubmit} className="card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>🔐 {t('profileEdit.security_title') || 'Security'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">{t('profileEdit.current_password') || 'Current Password'}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={passForm.currentPassword} 
                  onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} 
                  required
                />
              </div>
              <div />
              <div className="form-group">
                <label className="form-label">{t('profileEdit.new_password') || 'New Password'}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={passForm.newPassword} 
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profileEdit.confirm_password') || 'Confirm New Password'}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={passForm.confirmPassword} 
                  onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} 
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button type="submit" className="btn btn-secondary" disabled={passLoading} style={{ minWidth: '200px' }}>
                {passLoading ? t('profileEdit.saving') : t('profileEdit.update_password') || 'Update Password'}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button type="button" onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
              ← {t('common.back')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
