import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import PostCommentForm from './CommentForm';
import styles from '../../forums.module.css';

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string; postId: string }> }) {
  const { slug, postId } = await params;
  
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          username: true, avatar: true, bio: true,
          role: { select: { name: true, color: true } },
          _count: { select: { forumPosts: true } },
        },
      },
      forum: { select: { name: true, slug: true, category: { select: { name: true } } } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              username: true, avatar: true,
              role: { select: { name: true, color: true } },
            },
          },
        },
      },
    },
  });

  if (!post) notFound();

  // Increment views
  await prisma.forumPost.update({ where: { id: postId }, data: { views: { increment: 1 } } });

  const session = await auth();
  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/forums">{t('forums.title')}</Link>
          <span>›</span>
          <Link href={`/forums/${slug}`}>{post.forum.name}</Link>
          <span>›</span>
          <span>{post.title}</span>
        </div>

        <div className={styles.postDetail}>
          {/* Main Post */}
          <div className={styles.postMain}>
            <div className={styles.postHeader}>
              <h1 style={{ fontSize: '1.375rem' }}>{post.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {new Date(post.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
                {' · '}{post.views} {t('forums.views')}
              </p>
            </div>
            <div className={styles.postBody}>
              <div className={styles.postAuthorSide}>
                <div className="avatar-placeholder avatar-lg" style={{ width: 64, height: 64, fontSize: '1.5rem', borderColor: post.author.role.color }}>
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    post.author.username[0]
                  )}
                </div>
                <span className={styles.name} style={{ color: post.author.role.color }}>{post.author.username}</span>
                <span className="badge badge-role" style={{ background: post.author.role.color + '22', color: post.author.role.color }}>
                  {post.author.role.name}
                </span>
                <span className={styles.postCount}>{post.author._count.forumPosts} {t('forums.posts')}</span>
              </div>
              <div className={styles.postContentArea}>
                {post.content}
              </div>
            </div>
          </div>

          {/* Comments */}
          {post.comments.length > 0 && (
            <div className={styles.commentSection}>
              <div className={styles.commentSectionHeader}>
                💬 {post.comments.length} {t('forums.replies')}
              </div>
              {post.comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentAuthor}>
                    <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
                      {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        comment.author.username[0]
                      )}
                    </div>
                    <span style={{ color: comment.author.role.color, fontWeight: 600 }}>
                      {comment.author.username}
                    </span>
                  </div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentMeta}>
                      {new Date(comment.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <div className={styles.commentContent}>{comment.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          {session && !post.isLocked && (
            <PostCommentForm postId={postId} />
          )}

          {post.isLocked && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-lg)' }}>
              🔒 {t('forums.locked')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
