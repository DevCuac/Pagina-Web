'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';

export default function AdminForumsPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: '' });
  const [forumForm, setForumForm] = useState({ name: '', slug: '', description: '', icon: '', rules: '', categoryId: '' });
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingForum, setEditingForum] = useState<string | null>(null);

  const refresh = async () => { setCategories(await fetch('/api/admin/forums').then(r => r.json())); };
  useEffect(() => { refresh(); }, []);

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCat ? 'PATCH' : 'POST';
    await fetch('/api/admin/forums/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCat ? { ...catForm, id: editingCat } : catForm) });
    setCatForm({ name: '', slug: '', description: '', icon: '' }); setEditingCat(null); refresh();
  };

  const submitForum = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingForum ? 'PATCH' : 'POST';
    await fetch('/api/admin/forums', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingForum ? { ...forumForm, id: editingForum } : forumForm) });
    setForumForm({ name: '', slug: '', description: '', icon: '', rules: '', categoryId: '' }); setEditingForum(null); refresh();
  };

  const deleteCat = async (id: string) => { if (!confirm('¿Eliminar categoría y sus foros?')) return; await fetch('/api/admin/forums/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); refresh(); };
  const deleteForum = async (id: string) => { if (!confirm('¿Eliminar foro?')) return; await fetch('/api/admin/forums', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); refresh(); };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_forums_page.title')}</h1>

      <div className="grid grid-2" style={{ alignItems: 'start', marginBottom: 'var(--space-xl)' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{editingCat ? t('admin_games.edit') : t('admin_forums_page.create_cat')}</h3>
          <form onSubmit={submitCategory}>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.name')}</label><input className="form-input" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value, slug: editingCat ? catForm.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.slug')}</label><input className="form-input" value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.icon')}</label><input className="form-input" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary">{editingCat ? t('admin_games.btn_update') : t('admin_forums_page.btn_create')}</button>
              {editingCat && <button type="button" className="btn btn-secondary" onClick={() => { setEditingCat(null); setCatForm({ name: '', slug: '', description: '', icon: '' }); }}>{t('admin_games.btn_cancel')}</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{editingForum ? t('admin_games.edit') : t('admin_forums_page.create_forum')}</h3>
          <form onSubmit={submitForum}>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.category')}</label>
              <select className="form-select" value={forumForm.categoryId} onChange={e => setForumForm({ ...forumForm, categoryId: e.target.value })} required>
                <option value="">{t('admin_forums_page.sel_category')}</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.name')}</label><input className="form-input" value={forumForm.name} onChange={e => setForumForm({ ...forumForm, name: e.target.value, slug: editingForum ? forumForm.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.slug')}</label><input className="form-input" value={forumForm.slug} onChange={e => setForumForm({ ...forumForm, slug: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.desc')}</label><input className="form-input" value={forumForm.description} onChange={e => setForumForm({ ...forumForm, description: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.icon')}</label><input className="form-input" value={forumForm.icon} onChange={e => setForumForm({ ...forumForm, icon: e.target.value })} placeholder="Emoji o URL de imagen" /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.rules')}</label><textarea className="form-textarea" value={forumForm.rules} onChange={e => setForumForm({ ...forumForm, rules: e.target.value })} rows={3} /></div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary">{editingForum ? t('admin_games.btn_update') : t('admin_forums_page.btn_create')}</button>
              {editingForum && <button type="button" className="btn btn-secondary" onClick={() => { setEditingForum(null); setForumForm({ name: '', slug: '', description: '', icon: '', rules: '', categoryId: '' }); }}>{t('admin_games.btn_cancel')}</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_forums_page.struct')}</h3>
        {categories.map((cat: any) => (
          <div key={cat.id} style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm) 0', borderBottom: '2px solid var(--border-default)' }}>
              <h4>{cat.icon} {cat.name}</h4>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '' }); setEditingCat(cat.id); }}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteCat(cat.id)}>🗑️</button>
              </div>
            </div>
            {cat.forums?.map((forum: any) => (
              <div key={forum.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0 0.5rem var(--space-lg)', borderBottom: '1px solid var(--border-muted)' }}>
                <span>{forum.icon} {forum.name}</span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setForumForm({ name: forum.name, slug: forum.slug, description: forum.description || '', icon: forum.icon || '', rules: forum.rules || '', categoryId: cat.id }); setEditingForum(forum.id); }}>✏️</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteForum(forum.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
