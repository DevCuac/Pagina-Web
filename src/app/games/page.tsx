import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import styles from './games.module.css';

export const metadata: Metadata = {
  title: 'Modos de Juego',
  description: 'Explora los modos de juego disponibles en CrossPixel Network',
};

export default async function GamesPage() {
  const gameModes = await prisma.gameMode.findMany({
    orderBy: { order: 'asc' },
  });

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.header}>
          <h1>{t('games.title')}</h1>
          <p className={styles.subtitle}>{t('games.subtitle')}</p>
        </div>

        {gameModes.length > 0 ? (
          <div className="grid grid-3 stagger">
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
                <div className={styles.gameContent}>
                  <h3>{mode.icon} {mode.name}</h3>
                  <p>{mode.description}</p>
                  <div className={styles.wikiLink}>
                    {t('games.go_wiki')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🎮</div>
              <h3 className="empty-state-title">{t('games.no_games')}</h3>
              <p className="empty-state-text">{t('games.no_games_desc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
