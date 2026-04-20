import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getMinecraftHeadUrl } from '@/lib/minecraft';
import { getLocaleObj, getTranslation } from '@/lib/i18n';

export const revalidate = 0; // Evitar el Caché mortal de Vercel en la página de Perfil

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { username: true } });
  if (!user) return { title: 'Usuario no encontrado' };
  return { title: user.username, description: `Perfil de ${user.username} en CrossPixel` };
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      _count: { select: { forumPosts: true, forumComments: true } },
      forumPosts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { forum: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!user) notFound();

  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Profile Header */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            height: '120px',
            background: user.banner
              ? `url(${user.banner}) center/cover`
              : `linear-gradient(135deg, ${user.role.color}33, var(--bg-elevated))`,
          }} />
          <div style={{ padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-end', marginTop: '-48px' }}>
            <div className="avatar-placeholder avatar-2xl" style={{
              width: 96, height: 96, fontSize: '2rem',
              borderColor: user.role.color, borderWidth: '3px',
              background: 'var(--bg-surface)',
            }}>
              {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.username[0]}
            </div>
            <div style={{ flex: 1, paddingBottom: 'var(--space-sm)' }}>
              <h1 style={{ fontSize: '1.5rem', color: user.role.color }}>{user.username}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: '0.25rem' }}>
                <span className="badge badge-role" style={{ background: user.role.color + '22', color: user.role.color }}>
                  {user.role.icon} {user.role.name}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {t('members.joined')} {new Date(user.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          {user.bio && (
            <div style={{ padding: '0 var(--space-lg) var(--space-lg)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {user.bio}
            </div>
          )}
        </div>

        <div className="grid grid-2">
          {/* Stats */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('members.stats')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user._count.forumPosts}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('members.posts')}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user._count.forumComments}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('members.replies')}</div>
              </div>
            </div>
          </div>

          {/* Minecraft Info */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('members.minecraft')}</h3>
            {user.minecraftName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                {user.minecraftUuid && (
                  <img
                    src={getMinecraftHeadUrl(user.minecraftUuid, 48)}
                    alt={user.minecraftName}
                    style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', imageRendering: 'pixelated' }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{user.minecraftName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {user.minecraftUuid || 'UUID no disponible'}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('members.no_minecraft')}</p>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        {user.forumPosts.length > 0 && (
          <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('members.recent_posts')}</h3>
            {user.forumPosts.map((post) => (
              <Link
                key={post.id}
                href={`/forums/${post.forum.slug}/${post.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--border-muted)',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{post.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{locale === 'en' ? 'in' : 'in'} {post.forum.name}</div>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {new Date(post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
