import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { ticketSchema, ticketMessageSchema } from '@/lib/validations';
import { notifyStaffNewTicket } from '@/lib/notifications';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const isStaff = session.user.isStaff || session.user.isAdmin;
  const tickets = await prisma.ticket.findMany({
    where: isStaff ? {} : { authorId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { category: true, author: { select: { username: true } }, _count: { select: { messages: true } } },
  });

  return NextResponse.json(tickets);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Block creation if not verified (except for admins)
  if (!session.user.emailVerified && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Email verification required' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: (parsed.error as any).issues[0].message }, { status: 400 });

  const ticket = await prisma.ticket.create({
    data: {
      subject: parsed.data.subject,
      categoryId: parsed.data.categoryId,
      priority: parsed.data.priority,
      authorId: session.user.id,
      messages: {
        create: {
          content: parsed.data.message,
          authorId: session.user.id,
        },
      },
    },
  });

  // Notify all staff and admins
  await notifyStaffNewTicket(ticket, session.user.username || session.user.name || 'Un usuario');

  return NextResponse.json({ id: ticket.id }, { status: 201 });
}
