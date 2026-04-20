import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import styles from '../games.module.css';
import WikiClient from './WikiClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mode = await prisma.gameMode.findUnique({ where: { slug } });
  if (!mode) return { title: 'No encontrado' };
  return { title: mode.name, description: mode.description };
}

export default async function GameWikiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  
  // Checking granular permission for Wiki administration
  const canEdit = session ? hasPermission(session.user, 'wiki.manage') || hasPermission(session.user, 'wiki.edit') : false;

  const mode = await prisma.gameMode.findUnique({
    where: { slug },
    include: {
      wikiPages: { orderBy: { order: 'asc' } },
      servers: true,
    },
  });

  if (!mode) notFound();

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="breadcrumbs">
          <Link href="/games">Modos de Juego</Link>
          <span>›</span>
          <span>{mode.name}</span>
        </div>

        {mode.image && (
          <img src={mode.image} alt={mode.name} className={styles.wikiBanner} style={{ borderRadius: 'var(--radius-lg)' }} />
        )}

        <div style={{ marginTop: 'var(--space-md)' }}>
          <span className={styles.wikiBadge}>CROSSPIXEL WIKI</span>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>{mode.description}</p>
        </div>

        {/* 
          Instead of rendering a monolithic static content layout,
          we delegate the GitBook style nested tree to the unified WikiClient.
        */}
        <WikiClient gameMode={mode} pages={mode.wikiPages} canEdit={canEdit} />

      </div>
    </div>
  );
}
