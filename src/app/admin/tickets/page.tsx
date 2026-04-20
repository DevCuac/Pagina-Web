'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';

export default function AdminTicketCategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '', icon: '💬' });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => { fetch('/api/tickets/categories').then(r => r.json()).then(setCategories); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing } : form;
    await fetch('/api/admin/ticket-categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setForm({ name: '', description: '', icon: '💬' });
    setEditing(null);
    setCategories(await fetch('/api/tickets/categories').then(r => r.json()));
  };

  const deleteCategory = async (id: string) => {
    if (!confirm(t('admin_ticket_cats.confirm_del'))) return;
    await fetch('/api/admin/ticket-categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_ticket_cats.title')}</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{editing ? t('admin_ticket_cats.edit_cat') : t('admin_ticket_cats.create_cat')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.name')}</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.desc')}</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">{t('admin_forums_page.icon')}</label><input className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary">{editing ? t('admin_games.btn_update') : t('admin_forums_page.btn_create')}</button>
              {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: '💬' }); }}>{t('admin_games.btn_cancel')}</button>}
            </div>
          </form>
        </div>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_ticket_cats.list')}</h3>
          {categories.map((cat: any) => (
            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <span>{cat.icon} {cat.name}</span>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '💬' }); setEditing(cat.id); }}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteCategory(cat.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
