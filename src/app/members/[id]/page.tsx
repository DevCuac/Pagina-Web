import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import ProfileActions from '@/components/profile/ProfileActions';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await (prisma.user as any).findUnique({ where: { id }, select: { username: true } });
  if (!user) return { title: 'Usuario no encontrado' };
  return { title: user.username, description: `Perfil de ${user.username} en CrossPixel` };
}



export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await (prisma.user as any).findUnique({
    where: { id },
    select: {
      id: true, username: true, bio: true, avatar: true, banner: true, createdAt: true,
      minecraftName: true, minecraftUuid: true,
      instagram: true, twitter: true, discord: true, youtube: true, facebook: true,
      role: { select: { name: true, color: true, icon: true } },
      _count: { select: { forumPosts: true, forumComments: true } },
      forumPosts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { forum: { select: { name: true, slug: true } } },
      },
    }
  });

  if (!user) notFound();

  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content" style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Profile Header */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-lg)', position: 'relative' }}>
          <div style={{
            height: '180px',
            background: user.banner
              ? `url(${user.banner}) center/cover`
              : `linear-gradient(135deg, ${user.role.color}44, var(--bg-elevated))`,
          }} />
          
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <ProfileActions userId={user.id} />
          </div>

          <div style={{ padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-end', marginTop: '-60px' }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar-placeholder avatar-2xl" style={{
                width: 120, height: 120, fontSize: '2.5rem',
                borderColor: user.role.color, borderWidth: '4px',
                background: 'var(--bg-surface)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', overflow: 'hidden'
              }}>
                {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username[0]}
              </div>
            </div>
            
            <div style={{ flex: 1, paddingBottom: 'var(--space-sm)' }}>
              <h1 style={{ fontSize: '2rem', color: user.role.color, fontWeight: 800 }}>{user.username}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: '0.5rem' }}>
                <span className="badge" style={{ background: user.role.color + '22', color: user.role.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {user.role.icon} {user.role.name.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  🗓️ {t('members.joined')} {new Date(user.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
            {user.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px', maxWidth: '600px' }}>
                {user.bio}
              </p>
            )}

            {/* Social Links Icons */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {user.instagram && (
                <a href={`https://instagram.com/${user.instagram.replace('@','')}`} target="_blank" title="Instagram" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>📸</a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter.replace('@','')}`} target="_blank" title="Twitter/X" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>🐦</a>
              )}
              {user.discord && (
                <span title={`Discord: ${user.discord}`} style={{ fontSize: '1.2rem', cursor: 'help' }}>💬</span>
              )}
              {user.youtube && (
                <a href={`https://youtube.com/${user.youtube}`} target="_blank" title="YouTube" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>📺</a>
              )}
              {user.facebook && (
                <a href={user.facebook.startsWith('http') ? user.facebook : `https://${user.facebook}`} target="_blank" title="Facebook" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>👥</a>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-lg)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Post Feed Style */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('members.recent_posts')}
            </h3>
            
            {user.forumPosts.length > 0 ? (
              user.forumPosts.map((post: any) => (
                <Link 
                  key={post.id} 
                  href={`/forums/${post.forum.slug}/${post.id}`}
                  className="card"
                  style={{ 
                    padding: '20px', 
                    textDecoration: 'none', 
                    transition: 'transform 0.2s',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>#{post.forum.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{post.title}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                    Click to read the full post...
                  </div>
                </Link>
              ))
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent activity to show.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Minecraft Body Preview */}
            <div className="card" style={{ textAlign: 'center', padding: '25px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>🎮 {t('members.minecraft')}</h3>
              {user.minecraftName ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={`https://mc-heads.net/body/${user.minecraftName}/right`} 
                    alt="Minecraft Body" 
                    style={{ height: '220px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.minecraftName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '5px' }}>
                      {user.minecraftUuid?.substring(0, 18)}...
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('members.no_minecraft')}</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>📊 {t('members.stats')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user._count.forumPosts}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('members.posts').toUpperCase()}</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user._count.forumComments}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('members.replies').toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
