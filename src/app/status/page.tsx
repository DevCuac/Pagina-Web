import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getServerStatus } from '@/lib/minecraft';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import styles from './status.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);
  return { title: t('status.title') };
}

export const revalidate = 30;

export default async function StatusPage() {
  const servers = await prisma.server.findMany({
    orderBy: [{ isMain: 'desc' }, { order: 'asc' }],
    include: { gameMode: true },
  });

  const statuses = await Promise.all(
    servers.map(async (server) => ({
      ...server,
      status: await getServerStatus(server.host, server.port),
    }))
  );

  const mainServer = statuses.find(s => s.isMain);
  const subServers = statuses.filter(s => !s.isMain);

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  return (
    <div className="page-content">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('status.title')}</h1>

        {/* Main Server */}
        {mainServer && (
          <div className={styles.mainServer}>
            <div className={styles.mainHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span className={`status-dot ${mainServer.status.online ? 'online' : 'offline'}`} />
                <div>
                  <h2>{mainServer.name}</h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {mainServer.host}:{mainServer.port}
                  </p>
                </div>
              </div>
              <div className={styles.mainStats}>
                <div className={styles.mainStat}>
                  <span className={styles.mainStatValue}>
                    {mainServer.status.online ? mainServer.status.players.online : '—'}
                  </span>
                  <span className={styles.mainStatLabel}>{t('status.players')}</span>
                </div>
                <div className={styles.mainStat}>
                  <span className={styles.mainStatValue}>
                    {mainServer.status.online ? mainServer.status.players.max : '—'}
                  </span>
                  <span className={styles.mainStatLabel}>{t('status.max')}</span>
                </div>
                <div className={styles.mainStat}>
                  <span className={styles.mainStatValue}>
                    {mainServer.status.online ? `${mainServer.status.latency}ms` : '—'}
                  </span>
                  <span className={styles.mainStatLabel}>{t('status.latency')}</span>
                </div>
              </div>
            </div>
            {mainServer.status.online && (
              <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${mainServer.status.players.online / mainServer.status.players.max > 0.8 ? 'high' : ''}`}
                    style={{ width: `${(mainServer.status.players.online / mainServer.status.players.max) * 100}%` }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                  {mainServer.status.players.online}/{mainServer.status.players.max} {t('status.players')}
                  {mainServer.status.version && ` · ${mainServer.status.version}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sub Servers */}
        {subServers.length > 0 && (
          <>
            <h2 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>{t('status.by_mode')}</h2>
            <div className="grid grid-3 stagger">
              {subServers.map((server) => (
                <div key={server.id} className={styles.serverCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <span className={`status-dot ${server.status.online ? 'online' : 'offline'}`} />
                    <h3 style={{ fontSize: '1rem' }}>{server.name}</h3>
                  </div>
                  {server.gameMode && (
                    <span className="badge badge-info" style={{ marginBottom: 'var(--space-sm)' }}>
                      {server.gameMode.name}
                    </span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
                    <span>{server.status.online ? `${server.status.players.online}/${server.status.players.max}` : 'Offline'}</span>
                    <span>{server.status.online ? `${server.status.latency}ms` : ''}</span>
                  </div>
                  {server.status.online && (
                    <div className="progress-bar" style={{ marginTop: 'var(--space-sm)' }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${server.status.players.max > 0 ? (server.status.players.online / server.status.players.max) * 100 : 0}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {servers.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🖥️</div>
              <h3 className="empty-state-title">{t('status.no_servers')}</h3>
              <p className="empty-state-text">{t('status.no_servers_desc')}</p>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {t('status.update_notice')}
        </p>
      </div>
    </div>
  );
}
