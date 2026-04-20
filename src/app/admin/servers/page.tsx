'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';

export default function AdminServersPage() {
  const { t } = useTranslation();
  const [servers, setServers] = useState<any[]>([]);
  const [modes, setModes] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', host: '', port: 25565, gameModeId: '', isMain: false });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/servers').then(r => r.json()).then(setServers);
    fetch('/api/admin/games').then(r => r.json()).then(setModes);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing } : form;
    await fetch('/api/admin/servers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setForm({ name: '', host: '', port: 25565, gameModeId: '', isMain: false });
    setEditing(null);
    setLoading(false);
    setServers(await fetch('/api/admin/servers').then(r => r.json()));
  };

  const deleteServer = async (id: string) => {
    if (!confirm(t('admin_servers.confirm_del'))) return;
    await fetch('/api/admin/servers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setServers(servers.filter(s => s.id !== id));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_servers.title')}</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{editing ? t('admin_servers.edit') : t('admin_servers.create')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">{t('admin_servers.name')}</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group"><label className="form-label">{t('admin_servers.host')}</label><input className="form-input" value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">{t('admin_servers.port')}</label><input type="number" className="form-input" value={form.port} onChange={e => setForm({ ...form, port: parseInt(e.target.value) || 25565 })} /></div>
            </div>
            <div className="form-group"><label className="form-label">{t('admin_servers.gamemode')}</label>
              <select className="form-select" value={form.gameModeId} onChange={e => setForm({ ...form, gameModeId: e.target.value })}>
                <option value="">{t('admin_servers.none')}</option>
                {modes.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer', fontSize: '0.9375rem', marginBottom: 'var(--space-lg)' }}>
              <input type="checkbox" checked={form.isMain} onChange={e => setForm({ ...form, isMain: e.target.checked })} /> {t('admin_servers.main')}
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{editing ? t('admin_games.btn_update') : t('admin_servers.btn_add')}</button>
              {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', host: '', port: 25565, gameModeId: '', isMain: false }); }}>{t('admin_games.btn_cancel')}</button>}
            </div>
          </form>
        </div>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_servers.servers_list')}</h3>
          {servers.map((s: any) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{s.name} {s.isMain && '⭐'}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.host}:{s.port}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ name: s.name, host: s.host, port: s.port, gameModeId: s.gameModeId || '', isMain: s.isMain }); setEditing(s.id); }}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteServer(s.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {servers.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('admin_servers.empty')}</p>}
        </div>
      </div>
    </div>
  );
}
