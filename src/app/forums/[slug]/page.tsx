import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import styles from '../forums.module.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const forum = await prisma.forum.findUnique({ where: { slug } });
  if (!forum) return { title: 'Foro no encontrado' };
  return { title: forum.name, description: forum.description || undefined };
}

export default async function ForumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const forum = await prisma.forum.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!forum) notFound();

  const posts = await prisma.forumPost.findMany({
    where: { forumId: forum.id },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { username: true, avatar: true, role: { select: { color: true, name: true } } } },
      _count: { select: { comments: true } },
    },
  });

  const session = await auth();

  return (
    <div className="page-content">
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/forums">Foros</Link>
          <span>›</span>
          <Link href="/forums">{forum.category.name}</Link>
          <span>›</span>
          <span>{forum.name}</span>
        </div>

        <div className={styles.forumHeader}>
          <h1>{forum.icon} {forum.name}</h1>
          {forum.description && <p style={{ color: 'var(--text-muted)' }}>{forum.description}</p>}
        </div>

        {forum.rules && (
          <div className={styles.rules}>
            <h3>📋 Reglas del Foro</h3>
            <p>{forum.rules}</p>
          </div>
        )}

        <div className={styles.forumActions}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {posts.length} publicaciones
          </span>
          {session && (
            <Link href={`/forums/${slug}/new`} className="btn btn-primary">
              + Nueva Publicación
            </Link>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/forums/${slug}/${post.id}`} className={`${styles.postRow} ${post.isPinned ? styles.pinned : ''}`}>
                <div className={styles.postAuthorAvatar}>
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt="" />
                  ) : (
                    post.author.username[0]
                  )}
                </div>
                <div className={styles.postInfo}>
                  <h3>
                    {post.isPinned && <span className="badge badge-primary">📌 Fijado</span>}
                    {post.isLocked && <span className="badge badge-warning">🔒</span>}
                    {post.title}
                  </h3>
                  <p>
                    por <span style={{ color: post.author.role.color }}>{post.author.username}</span>
                    {' · '}
                    {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className={styles.postStat}>
                  <span className={styles.postStatVal}>{post._count.comments}</span>
                  respuestas
                </div>
                <div className={styles.postStat}>
                  <span className={styles.postStatVal}>{post.views}</span>
                  vistas
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">Sin publicaciones</h3>
              <p className="empty-state-text">¡Sé el primero en publicar en este foro!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
