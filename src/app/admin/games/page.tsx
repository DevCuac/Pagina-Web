'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';
import { useRouter } from 'next/navigation';

export default function AdminGamesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [modes, setModes] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', image: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/games').then(r => r.json()).then(setModes);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing } : form;
    await fetch('/api/admin/games', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setForm({ name: '', slug: '', description: '', icon: '', image: '' });
    setEditing(null);
    setLoading(false);
    const updated = await fetch('/api/admin/games').then(r => r.json());
    setModes(updated);
  };

  const editMode = (mode: any) => {
    setForm({ name: mode.name, slug: mode.slug, description: mode.description, icon: mode.icon || '', image: mode.image || '' });
    setEditing(mode.id);
  };

  const deleteMode = async (id: string) => {
    if (!confirm(t('admin_games.confirm_del'))) return;
    await fetch('/api/admin/games', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setModes(modes.filter(m => m.id !== id));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_games.title')}</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{editing ? t('admin_games.edit') : t('admin_games.create')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('admin_games.name')}</label>
              <input className="form-input" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }); }} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin_games.slug')}</label>
              <input className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin_games.desc')}</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">{t('admin_games.icon')}</label>
                <input className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="⚔️" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin_games.image')}</label>
                <input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{editing ? t('admin_games.btn_update') : t('admin_games.btn_create')}</button>
              {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', icon: '', image: '' }); }}>{t('admin_games.btn_cancel')}</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_games.existing')}</h3>
          {modes.map((mode: any) => (
            <div key={mode.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{mode.icon} {mode.name}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{mode.slug}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => editMode(mode)}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteMode(mode.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {modes.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('admin_games.empty')}</p>}
        </div>
      </div>
    </div>
  );
}
