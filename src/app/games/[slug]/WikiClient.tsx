'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type WikiPageProps = {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  children?: WikiPageProps[];
};

export default function WikiClient({
  gameMode,
  pages,
  canEdit
}: {
  gameMode: { id: string; name: string; slug: string; description: string };
  pages: WikiPageProps[];
  canEdit: boolean;
}) {
  const [activePageId, setActivePageId] = useState<string | null>(pages.length > 0 ? pages[0].id : null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reconstruct tree if flattened
  const buildTree = (flatPages: WikiPageProps[]) => {
    const rootNodes: WikiPageProps[] = [];
    const idMapping = flatPages.reduce((acc, el) => {
      acc[el.id] = { ...el, children: [] };
      return acc;
    }, {} as Record<string, WikiPageProps>);

    flatPages.forEach((el) => {
      if (el.parentId && idMapping[el.parentId]) {
        idMapping[el.parentId].children!.push(idMapping[el.id]);
      } else {
        rootNodes.push(idMapping[el.id]);
      }
    });
    return rootNodes;
  };

  const tree = buildTree(pages);
  const activePage = pages.find((p) => p.id === activePageId);

  const startEditing = () => {
    if (!activePage) return;
    setEditContent(activePage.content);
    setEditingId(activePage.id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/wiki', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, content: editContent })
      });
      // Mutate local state for immediate feedback
      const pg = pages.find((p) => p.id === editingId);
      if (pg) pg.content = editContent;
      setEditingId(null);
    } catch(err) {
      alert('Error guardando página');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubpage = async (parentId: string | null = null) => {
    const newTitle = prompt('Nombre de la nueva página:');
    if (!newTitle) return;

    try {
      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameModeId: gameMode.id, title: newTitle, parentId })
      });
      if (res.ok) {
        window.location.reload(); // Quick refresh to load the new tree
      }
    } catch(err) {
      alert('Error creando página');
    }
  };

  const renderTree = (nodes: WikiPageProps[], level = 0) => {
    return (
      <ul style={{ listStyle: 'none', paddingLeft: level === 0 ? '0' : '1rem', margin: 0 }}>
        {nodes.map((node) => (
          <li key={node.id} style={{ marginBottom: '0.25rem' }}>
            <div 
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: activePageId === node.id ? 'var(--accent-primary-20)' : 'transparent',
                color: activePageId === node.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: activePageId === node.id ? 600 : 400,
              }}
            >
              <span onClick={() => { setActivePageId(node.id); setEditingId(null); }}>
                {node.title}
              </span>
              {canEdit && activePageId === node.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCreateSubpage(node.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                  title="Añadir sub-página"
                >
                  +
                </button>
              )}
            </div>
            {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', minHeight: 'calc(100vh - 200px)', borderTop: '1px solid var(--border-muted)', paddingTop: '2rem' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ borderRight: '1px solid var(--border-muted)', paddingRight: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Documentación
          {canEdit && (
            <button onClick={() => handleCreateSubpage(null)} className="btn btn-ghost btn-sm" title="Añadir Página Raíz">
              + Nueva
            </button>
          )}
        </h3>
        
        {pages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No hay páginas en esta Wiki.{canEdit ? ' ¡Crea la primera!' : ''}
          </p>
        ) : (
          renderTree(tree)
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ paddingBottom: '4rem' }}>
        {activePage ? (
          editingId === activePage.id ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                value={activePage.title} 
                disabled 
                className="form-input" 
                style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'transparent' }} 
              />
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="form-textarea"
                style={{ minHeight: '500px', fontFamily: 'monospace', lineHeight: '1.6' }}
                placeholder="Usa Markdown para estilizar tu contenido..."
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditingId(null)} className="btn btn-secondary" disabled={isSaving}>Cancelar</button>
                <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{activePage.title}</h1>
                {canEdit && (
                  <button onClick={startEditing} className="btn btn-primary btn-sm">
                    Editar Página
                  </button>
                )}
              </div>
              
              <div className="markdown-body" style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                {activePage.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activePage.content}
                  </ReactMarkdown>
                ) : (
                  <em style={{ opacity: 0.5 }}>Esta página está vacía.</em>
                )}
              </div>
            </div>
          )
        ) : (
           <div className="empty-state" style={{ padding: 'var(--space-2xl) 0' }}>
            <div className="empty-state-icon">📚</div>
            <h3 className="empty-state-title">Wiki de {gameMode.name}</h3>
            <p className="empty-state-text">Selecciona un tema del menú de la izquierda para comenzar a leer.</p>
          </div>
        )}
      </div>

    </div>
  );
}
