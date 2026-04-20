import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ count: 0 }, { status: 401 });

  const count = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  const latest = await prisma.notification.findFirst({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ count, latest });
}
