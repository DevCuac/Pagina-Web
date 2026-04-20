import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  return NextResponse.json(await prisma.gameMode.findMany({ orderBy: { order: 'asc' } }));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const mode = await prisma.gameMode.create({ data: { name: body.name, slug: body.slug, description: body.description, icon: body.icon || null, image: body.image || null } });
  return NextResponse.json(mode, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const mode = await prisma.gameMode.update({ where: { id: body.id }, data: { name: body.name, slug: body.slug, description: body.description, icon: body.icon || null, image: body.image || null } });
  return NextResponse.json(mode);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const { id } = await request.json();
  await prisma.gameMode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
