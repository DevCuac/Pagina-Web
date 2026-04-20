'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/I18nProvider';
import styles from '../../forums.module.css';

export default function PostCommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/forums/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      setContent('');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className={styles.replyForm}>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem' }}>{t('forums.reply')}</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('forums.reply_placeholder')}
          rows={4}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : t('forums.reply')}
          </button>
        </div>
      </form>
    </div>
  );
}
