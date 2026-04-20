import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { notifyTicketMessage, notifyTicketUpdate } from '@/lib/notifications';

export async function POST(request: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { ticketId } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });

  const body = await request.json();

  // Handle status change
  if (body.status && (session.user.isStaff || session.user.isAdmin)) {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: body.status } });
    await notifyTicketUpdate(ticket, body.status);
    return NextResponse.json({ success: true });
  }

  // Handle new message
  if (body.content) {
    const isStaff = session.user.isStaff || session.user.isAdmin;
    const message = await prisma.ticketMessage.create({
      data: {
        content: body.content,
        ticketId,
        authorId: session.user.id,
        isStaff,
      },
    });

    await prisma.ticket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });
    await notifyTicketMessage(ticket, session.user.id, session.user.username);

    return NextResponse.json({ id: message.id }, { status: 201 });
  }

  return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
}
