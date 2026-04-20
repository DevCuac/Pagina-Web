'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';

export default function GeneralSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((s: any) => map[s.key] = s.value);
        setSettings(map);
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert(t('admin_settings.success'));
    } catch(err) {
      alert(t('admin_settings.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_settings.title')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-2" style={{ alignItems: 'start' }}>
        
        {/* Módulo de Identidad de Sitio */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_settings.identity_title')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {t('admin_settings.identity_desc')}
          </p>

          <div className="form-group">
            <label className="form-label">{t('admin_settings.site_name')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={settings['site_name'] || ''} 
              onChange={e => handleChange('site_name', e.target.value)} 
              placeholder="Ej: CrossPixel Network" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin_settings.seo_desc')}</label>
            <textarea 
              className="form-input form-textarea" 
              value={settings['site_description'] || ''} 
              onChange={e => handleChange('site_description', e.target.value)} 
              placeholder="Ej: Bienvenido a CrossPixel The Ultimate Minecraft..." 
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin_settings.favicon')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={settings['site_favicon'] || ''} 
              onChange={e => handleChange('site_favicon', e.target.value)} 
              placeholder="Ej: https://via.placeholder.com/64.png o /favicon.ico" 
            />
          </div>
        </div>

        {/* Módulo de Correos Electrónicos */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_settings.smtp_title')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {t('admin_settings.smtp_desc')}
          </p>
          
          <div className="form-group">
            <label className="form-label">{t('admin_settings.smtp_host')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={settings['smtp_host'] || ''} 
              onChange={e => handleChange('smtp_host', e.target.value)} 
              placeholder="Ej: smtp.resend.com o smtp-relay.brevo.com" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('admin_settings.smtp_port')}</label>
              <input 
                type="number" 
                className="form-input" 
                value={settings['smtp_port'] || '465'} 
                onChange={e => handleChange('smtp_port', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin_settings.smtp_secure')}</label>
              <select className="form-input" value={settings['smtp_secure'] || 'true'} onChange={e => handleChange('smtp_secure', e.target.value)}>
                <option value="true">{t('admin_settings.secure_yes')}</option>
                <option value="false">{t('admin_settings.secure_no')}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin_settings.smtp_user')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={settings['smtp_user'] || ''} 
              onChange={e => handleChange('smtp_user', e.target.value)} 
              placeholder="Ej: resend" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin_settings.smtp_pass')}</label>
            <input 
              type="password" 
              className="form-input" 
              value={settings['smtp_pass'] || ''} 
              onChange={e => handleChange('smtp_pass', e.target.value)} 
              placeholder="••••••••••••••••" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin_settings.smtp_from')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={settings['smtp_from'] || ''} 
              onChange={e => handleChange('smtp_from', e.target.value)} 
              placeholder="Ej: noreply@crosspixel.net" 
            />
          </div>
        </div>

        {/* Políticas de Registro */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_settings.security_title')}</h3>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings['email_verification_enabled'] === 'true'} 
                onChange={e => handleChange('email_verification_enabled', e.target.checked ? 'true' : 'false')} 
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--accent-warning)' }}>{t('admin_settings.force_verify')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('admin_settings.force_verify_desc')}</span>
              </div>
            </label>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings['registration_enabled'] !== 'false'} 
                onChange={e => handleChange('registration_enabled', e.target.checked ? 'true' : 'false')} 
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>{t('admin_settings.allow_reg')}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('admin_settings.allow_reg_desc')}</span>
              </div>
            </label>
          </div>

          <div style={{ marginTop: 'var(--space-2xl)' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={saving}>
              {saving ? t('admin_settings.saving_btn') : t('admin_settings.save_btn')}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
