import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  return NextResponse.json(await prisma.forumCategory.findMany({ orderBy: { order: 'asc' }, include: { forums: { orderBy: { order: 'asc' } } } }));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const forum = await prisma.forum.create({ data: { name: body.name, slug: body.slug, description: body.description || null, icon: body.icon || null, image: body.image || null, rules: body.rules || null, categoryId: body.categoryId } });
  return NextResponse.json(forum, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const forum = await prisma.forum.update({ where: { id: body.id }, data: { name: body.name, slug: body.slug, description: body.description, icon: body.icon, image: body.image, rules: body.rules, categoryId: body.categoryId } });
  return NextResponse.json(forum);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const { id } = await request.json();
  await prisma.forum.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
