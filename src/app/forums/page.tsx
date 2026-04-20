import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import styles from './forums.module.css';

export const metadata: Metadata = {
  title: 'Foros',
  description: 'Foros de la comunidad CrossPixel. Discute, comparte y conecta con otros jugadores.',
};

export default async function ForumsPage() {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      forums: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { posts: true } },
          posts: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              author: { select: { username: true, role: { select: { color: true } } } },
            },
          },
        },
      },
    },
  });

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.header}>
          <h1>{t('forums.title')}</h1>
          <p>{t('forums.subtitle')}</p>
        </div>

        {categories.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3 className="empty-state-title">{t('forums.no_forums')}</h3>
              <p className="empty-state-text">{t('forums.no_forums_desc')}</p>
            </div>
          </div>
        ) : (
          <div className={styles.categories}>
            {categories.map((category) => (
              <div key={category.id} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <h2>{category.icon} {category.name}</h2>
                  {category.description && <p>{category.description}</p>}
                </div>

                <div className={styles.forumList}>
                  {category.forums.map((forum) => {
                    const latestPost = forum.posts[0];
                    return (
                      <Link key={forum.id} href={`/forums/${forum.slug}`} className={styles.forumItem}>
                        <div className={styles.forumIcon}>
                          <span>{forum.icon || '💬'}</span>
                        </div>
                        <div className={styles.forumInfo}>
                          <h3>{forum.name}</h3>
                          <p>{forum.description}</p>
                        </div>
                        <div className={styles.forumStats}>
                          <span className={styles.forumCount}>{forum._count.posts}</span>
                          <span>{t('forums.posts_count')}</span>
                        </div>
                        <div className={styles.forumLatest}>
                          {latestPost ? (
                            <>
                              <span className={styles.latestTitle}>{latestPost.title}</span>
                              <span className={styles.latestAuthor}>
                                {t('admin.by')} <span style={{ color: latestPost.author.role.color }}>{latestPost.author.username}</span>
                              </span>
                            </>
                          ) : (
                            <span className={styles.noPost}>{t('home.no_posts')}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
