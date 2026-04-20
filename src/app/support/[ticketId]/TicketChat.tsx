'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  isStaff: boolean;
  createdAt: string;
  author: {
    username: string;
    avatar: string | null;
    role: { color: string; name: string; isStaff: boolean };
  } | null;
}

export default function TicketChat({
  ticketId, messages: initialMessages, isClosed, isStaff, currentStatus
}: {
  ticketId: string;
  messages: Message[];
  isClosed: boolean;
  isStaff: boolean;
  currentStatus: string;
}) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setLoading(true);

    await fetch(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });

    setNewMessage('');
    setLoading(false);
    router.refresh();
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  return (
    <div>
      {/* Staff Actions */}
      {isStaff && (
        <div style={{
          display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)',
          padding: 'var(--space-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 'auto' }}>
            Acciones de Staff:
          </span>
          {currentStatus !== 'in_progress' && (
            <button className="btn btn-sm btn-warning" onClick={() => handleStatusChange('in_progress')}>En Progreso</button>
          )}
          {currentStatus !== 'closed' && (
            <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange('closed')}>Cerrar</button>
          )}
          {currentStatus === 'closed' && (
            <button className="btn btn-sm btn-success" onClick={() => handleStatusChange('open')}>Reabrir</button>
          )}
        </div>
      )}

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {initialMessages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex', gap: 'var(--space-md)',
            padding: 'var(--space-md) var(--space-lg)',
            background: msg.isStaff ? 'var(--accent-primary-bg)' : 'var(--bg-surface)',
            border: `1px solid ${msg.isStaff ? 'rgba(79,125,249,0.2)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-overlay)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: msg.author?.role.color || 'var(--text-muted)',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {msg.author?.avatar ? (
                <img src={msg.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : msg.author?.username?.[0] || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: msg.author?.role.color || 'var(--text-muted)', fontSize: '0.9375rem' }}>
                  {msg.author?.username || 'Usuario Desconocido'}
                </span>
                {msg.isStaff && <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>STAFF</span>}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(msg.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {!isClosed ? (
        <form onSubmit={handleSend} className="card">
          <textarea
            className="form-textarea"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            rows={4}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          🔒 Este ticket está cerrado
        </div>
      )}
    </div>
  );
}
