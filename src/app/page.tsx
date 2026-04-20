import Link from 'next/link';
import styles from './page.module.css';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';

export const revalidate = 30; // Regenerar el index cada 30 segundos (Descongela los Foros)

async function getStats() {
  const [userCount, postCount, serverData] = await Promise.all([
    prisma.user.count(),
    prisma.forumPost.count(),
    prisma.server.findFirst({ where: { isMain: true } }),
  ]);

  let serverStatus = null;
  if (serverData) {
    try {
      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${serverData.host}:${serverData.port}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        serverStatus = await res.json();
      }
    } catch {}
  }

  return { userCount, postCount, serverStatus, serverIp: serverData?.host || 'cross-pixel.de' };
}

async function getLatestPosts() {
  return prisma.forumPost.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { username: true, avatar: true, role: { select: { color: true } } } },
      forum: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });
}

async function getGameModes() {
  return prisma.gameMode.findMany({
    orderBy: { order: 'asc' },
    take: 4,
  });
}

export default async function HomePage() {
  const { userCount, postCount, serverStatus, serverIp } = await getStats();
  const latestPosts = await getLatestPosts();
  const gameModes = await getGameModes();
  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroText}>CROSS</span>
            <span className={styles.heroAccent}>PIXEL</span>
          </h1>
          <p className={styles.heroSubtitle}>{t('home.subtitle')}</p>

          <div className={styles.heroActions}>
            <button
              className={styles.ipButton}
              onClick={undefined}
              id="copy-ip-btn"
            >
              <span className={styles.ipLabel}>IP:</span>
              <span className={styles.ipValue}>{serverIp}</span>
              <span className={styles.ipCopy}>{t('home.copy')}</span>
            </button>

            <a
              href="https://discord.gg/crosspixel"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.discordBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Discord
            </a>
          </div>

          {/* Server Status */}
          {serverStatus && (
            <div className={styles.serverStatus}>
              <span className={`status-dot ${serverStatus.online ? 'online' : 'offline'}`} />
              <span>
                {serverStatus.online
                  ? `${serverStatus.players?.online || 0} ${t('home.online')}`
                  : t('home.offline')}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <section className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{userCount}</span>
              <span className={styles.statLabel}>{t('home.stats_members')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{postCount}</span>
              <span className={styles.statLabel}>{t('home.stats_posts')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{serverStatus?.players?.online || 0}</span>
              <span className={styles.statLabel}>{t('home.stats_playing')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{gameModes.length}</span>
              <span className={styles.statLabel}>{t('home.stats_gamemodes')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      {gameModes.length > 0 && (
        <section className="container mt-xl">
          <div className={styles.sectionHeader}>
            <h2>{t('home.gamemodes_title')}</h2>
            <Link href="/games" className="btn btn-ghost">{t('home.gamemodes_all')}</Link>
          </div>
          <div className="grid grid-4 stagger">
            {gameModes.map((mode) => (
              <Link key={mode.id} href={`/games/${mode.slug}`} className={styles.gameCard}>
                <div className={styles.gameImage}>
                  {mode.image ? (
                    <img src={mode.image} alt={mode.name} />
                  ) : (
                    <div className={styles.gamePlaceholder}>
                      <span>{mode.icon || '🎮'}</span>
                    </div>
                  )}
                </div>
                <div className={styles.gameInfo}>
                  <h3>{mode.icon} {mode.name}</h3>
                  <p>{mode.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Forum Posts */}
      <section className="container mt-xl">
        <div className={styles.sectionHeader}>
          <h2>{t('home.latest_posts')}</h2>
          <Link href="/forums" className="btn btn-ghost">{t('home.go_forum')}</Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className={styles.postList}>
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/forums/${post.forum.slug}/${post.id}`} className={styles.postItem}>
                <div className={styles.postAvatar}>
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt="" className="avatar-sm" />
                  ) : (
                    <div className="avatar-placeholder avatar-sm" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {post.author.username[0]}
                    </div>
                  )}
                </div>
                <div className={styles.postContent}>
                  <h4 className={styles.postTitle}>{post.title}</h4>
                  <p className={styles.postMeta}>
                    <span style={{ color: post.author.role.color }}>{post.author.username}</span>
                    {' · '}
                    {post.forum.name}
                    {' · '}
                    {post._count.comments} {t('home.replies')}
                  </p>
                </div>
                <span className={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">{t('home.no_posts')}</h3>
              <p className="empty-state-text">{t('home.first_post')}</p>
              <Link href="/forums" className="btn btn-primary mt-md">{t('home.go_forum')}</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
