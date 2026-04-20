import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const cat = await prisma.forumCategory.create({ data: { name: body.name, slug: body.slug, description: body.description || null, icon: body.icon || null } });
  return NextResponse.json(cat, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const cat = await prisma.forumCategory.update({ where: { id: body.id }, data: { name: body.name, slug: body.slug, description: body.description, icon: body.icon } });
  return NextResponse.json(cat);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const { id } = await request.json();
  await prisma.forumCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
