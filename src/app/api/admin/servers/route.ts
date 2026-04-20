import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  return NextResponse.json(await prisma.server.findMany({ orderBy: [{ isMain: 'desc' }, { order: 'asc' }], include: { gameMode: true } }));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const server = await prisma.server.create({ data: { name: body.name, host: body.host, port: body.port || 25565, gameModeId: body.gameModeId || null, isMain: body.isMain || false } });
  return NextResponse.json(server, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const server = await prisma.server.update({ where: { id: body.id }, data: { name: body.name, host: body.host, port: body.port, gameModeId: body.gameModeId || null, isMain: body.isMain } });
  return NextResponse.json(server);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const { id } = await request.json();
  await prisma.server.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
