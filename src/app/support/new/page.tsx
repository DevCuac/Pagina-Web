'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ subject: '', categoryId: '', priority: 'normal', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tickets/categories').then(r => r.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al crear ticket');
      setLoading(false);
      return;
    }

    router.push(`/support/${data.id}`);
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumbs">
          <Link href="/support">Soporte</Link>
          <span>›</span>
          <span>Nuevo Ticket</span>
        </div>

        <h1 style={{ marginBottom: 'var(--space-lg)' }}>Crear Ticket de Soporte</h1>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--accent-danger-bg)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Selecciona una categoría</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Prioridad</label>
            <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">🟢 Baja</option>
              <option value="normal">🟡 Normal</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Asunto</label>
            <input type="text" className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Describe brevemente tu problema" minLength={5} required />
          </div>

          <div className="form-group">
            <label className="form-label">Mensaje</label>
            <textarea className="form-textarea" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe tu problema en detalle..." rows={8} minLength={10} required />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
            <Link href="/support" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
