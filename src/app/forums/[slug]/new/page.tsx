'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/forums/${slug}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, image }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Error al crear la publicación');
      setLoading(false);
      return;
    }

    router.push(`/forums/${slug}/${data.id}`);
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="breadcrumbs">
          <Link href="/forums">Foros</Link>
          <span>›</span>
          <Link href={`/forums/${slug}`}>{slug}</Link>
          <span>›</span>
          <span>Nueva Publicación</span>
        </div>

        <h1 style={{ marginBottom: 'var(--space-lg)' }}>Nueva Publicación</h1>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--accent-danger-bg)',
            border: '1px solid rgba(248,81,73,0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-danger)',
            fontSize: '0.875rem',
            marginBottom: 'var(--space-lg)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">Título</label>
            <input
              id="post-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de tu publicación"
              minLength={3}
              maxLength={200}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-image">Imagen de Portada (Opcional)</label>
            <input
              id="post-image"
              type="url"
              className="form-input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://i.imgur.com/... (URL de imagen horizontal para Noticias)"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-content">Contenido</label>
            <textarea
              id="post-content"
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido de tu publicación..."
              rows={12}
              minLength={10}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
            <Link href={`/forums/${slug}`} className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
