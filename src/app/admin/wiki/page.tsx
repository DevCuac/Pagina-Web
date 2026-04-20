'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';

const formReset = { title: '', slug: '', summary: '', content: '', image: '', gameModeId: '' };

export default function AdminWikiPage() {
  const { t } = useTranslation();
  const [pages, setPages] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [form, setForm] = useState(formReset);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/wiki').then(r => r.json()).then(setPages);
    fetch('/api/admin/games').then(r => r.json()).then(setGames);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing } : form;
    
    try {
      const res = await fetch('/api/admin/wiki', { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) throw new Error('Error al guardar');
      
      setForm(formReset);
      setEditing(null);
      const updated = await fetch('/api/admin/wiki').then(r => r.json());
      setPages(updated);
    } catch (err) {
      alert('Hubo un error guardando el artículo de Wiki.');
    } finally {
      setLoading(false);
    }
  };

  const editPage = (page: any) => {
    setForm({ 
      title: page.title, 
      slug: page.slug, 
      summary: page.summary || '', 
      content: page.content, 
      image: page.image || '', 
      gameModeId: page.gameModeId || '' 
    });
    setEditing(page.id);
  };

  const deletePage = async (id: string) => {
    if (!confirm('¿Eliminar definitivamente esta página de la Wiki?')) return;
    await fetch('/api/admin/wiki', { 
      method: 'DELETE', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id }) 
    });
    setPages(pages.filter(p => p.id !== id));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin.wiki_manage')}</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{editing ? t('admin.wiki_edit') : t('admin.wiki_new')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('admin.wiki_title')}</label>
              <input 
                className="form-input" 
                value={form.title} 
                onChange={e => { 
                  setForm({ 
                    ...form, 
                    title: e.target.value, 
                    slug: editing ? form.slug : e.target.value.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
                  }); 
                }} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">{t('admin.wiki_slug')}</label>
                <input className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.wiki_mode')}</label>
                <select className="form-input" value={form.gameModeId} onChange={e => setForm({ ...form, gameModeId: e.target.value })}>
                  <option value="">{t('admin.wiki_global')}</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.wiki_summary')}</label>
              <input className="form-input" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.wiki_content')}</label>
              <textarea 
                className="form-textarea" 
                value={form.content} 
                onChange={e => setForm({ ...form, content: e.target.value })} 
                rows={12} 
                required 
                style={{ fontFamily: 'monospace' }} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.wiki_image')}</label>
              <input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {editing ? t('admin.wiki_update') : t('admin.wiki_publish')}
              </button>
              {editing && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(formReset); }}>
                  {t('admin.wiki_cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin.wiki_published')}</h3>
          {pages.map((page: any) => (
            <div key={page.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block', fontSize: '1.1rem' }}>{page.title}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                 /{page.gameMode?.name ? `games/${page.gameMode.name.toLowerCase()}` : 'wiki'}/{page.slug}
                </span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {page.summary?.length > 60 ? page.summary.substring(0, 60) + '...' : page.summary}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => editPage(page)}>{t('admin.wiki_edit_btn')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deletePage(page.id)} style={{ color: 'var(--accent-danger)' }}>🗑️</button>
              </div>
            </div>
          ))}
          {pages.length === 0 && (
             <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <div className="empty-state-icon">📄</div>
                <h3 className="empty-state-title">{t('admin.wiki_empty')}</h3>
                <p className="empty-state-text">{t('admin.wiki_empty_desc')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
