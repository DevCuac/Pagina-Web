import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import TicketChat from './TicketChat';

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session) redirect('/login');

  const { ticketId } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      category: true,
      author: { select: { id: true, username: true, role: { select: { color: true, name: true } } } },
      assignedTo: { select: { username: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { username: true, avatar: true, role: { select: { color: true, name: true, isStaff: true } } } },
        },
      },
    },
  });

  if (!ticket) notFound();

  const isOwner = ticket.authorId === session.user.id;
  const isStaff = session.user.isStaff || session.user.isAdmin;
  if (!isOwner && !isStaff) notFound();

  const statusLabels: Record<string, string> = { open: 'Abierto', in_progress: 'En Progreso', closed: 'Cerrado' };
  const statusColors: Record<string, string> = { open: 'badge-success', in_progress: 'badge-warning', closed: 'badge-danger' };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="breadcrumbs">
          <Link href="/support">Soporte</Link>
          <span>›</span>
          <span>{ticket.subject}</span>
        </div>

        {/* Ticket Header */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', marginBottom: '0.375rem' }}>{ticket.subject}</h1>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                <span className="badge badge-info">{ticket.category.name}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  por <span style={{ color: ticket.author.role.color }}>{ticket.author.username}</span>
                  {' · '}
                  {new Date(ticket.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <TicketChat
          ticketId={ticket.id}
          messages={ticket.messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })) as any}
          isClosed={ticket.status === 'closed'}
          isStaff={isStaff}
          currentStatus={ticket.status}
        />
      </div>
    </div>
  );
}
