import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getLocaleObj, getTranslation } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);
  return { title: t('support.title') };
}

export default async function SupportPage() {
  const session = await auth();

  const categories = await prisma.ticketCategory.findMany({ orderBy: { order: 'asc' } });

  let tickets: any[] = [];
  if (session) {
    const isStaff = hasPermission(session.user, 'tickets.staff');
    tickets = await prisma.ticket.findMany({
      where: isStaff ? {} : { authorId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        author: { select: { username: true, role: { select: { color: true } } } },
        _count: { select: { messages: true } },
      },
      take: 50,
    });
  }

  const statusColors: Record<string, string> = {
    open: 'badge-success',
    in_progress: 'badge-warning',
    closed: 'badge-danger',
  };

  const { dict, locale } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  const statusLabels: Record<string, string> = {
    open: t('admin.open'),
    in_progress: t('admin.in_progress'),
    closed: t('admin.closed'),
  };

  const priorityLabels: Record<string, string> = {
    low: locale === 'en' ? 'Low' : 'Niedrig',
    normal: locale === 'en' ? 'Normal' : 'Normal',
    high: locale === 'en' ? 'High' : 'Hoch',
    urgent: locale === 'en' ? 'Urgent' : 'Dringend',
  };

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1>{t('support.title')}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{t('support.subtitle')}</p>
          </div>
          {session && (
            <Link href="/support/new" className="btn btn-primary">
              {t('support.new_ticket')}
            </Link>
          )}
        </div>

        {!session ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <h3 className="empty-state-title">{t('support.login_prompt')}</h3>
              <Link href="/login" className="btn btn-primary mt-md">{t('navbar.login') || 'Login'}</Link>
            </div>
          </div>
        ) : tickets.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('support.subject')}</th>
                  <th>{t('support.category')}</th>
                  <th>{t('support.status')}</th>
                  <th>{t('support.priority')}</th>
                  <th>{t('support.messages')}</th>
                  <th>{t('support.last_updated')}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link href={`/support/${ticket.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none' }}>
                        {ticket.subject}
                      </Link>
                      {hasPermission(session.user, 'tickets.staff') && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          por <span style={{ color: ticket.author.role.color }}>{ticket.author.username}</span>
                        </div>
                      )}
                    </td>
                    <td><span className="badge badge-info">{ticket.category.name}</span></td>
                    <td><span className={`badge ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span></td>
                    <td>{priorityLabels[ticket.priority]}</td>
                    <td>{ticket._count.messages}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(ticket.updatedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🎫</div>
              <h3 className="empty-state-title">{t('support.no_tickets')}</h3>
              <p className="empty-state-text">{t('support.no_tickets_desc')}</p>
              <Link href="/support/new" className="btn btn-primary mt-md">{t('support.create_ticket')}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
