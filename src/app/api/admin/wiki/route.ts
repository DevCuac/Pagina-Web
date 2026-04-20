import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session || (!session.user.isAdmin && !session.user.isStaff)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const pages = await prisma.wikiPage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      gameMode: { select: { name: true } },
    },
  });

  return NextResponse.json(pages);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (!session.user.isAdmin && !session.user.isStaff)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const body = await request.json();

  const page = await prisma.wikiPage.create({
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content,
      summary: body.summary || null,
      image: body.image || null,
      gameModeId: body.gameModeId || null,
      revisions: {
        create: {
          content: body.content,
          summary: 'Creación inicial dictada por administrador',
          editorId: session.user.id,
        }
      }
    },
    include: { gameMode: { select: { name: true } } }
  });

  return NextResponse.json(page, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || (!session.user.isAdmin && !session.user.isStaff)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const body = await request.json();

  const page = await prisma.wikiPage.update({
    where: { id: body.id },
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content,
      summary: body.summary || null,
      image: body.image || null,
      gameModeId: body.gameModeId || null,
      revisions: {
        create: {
          content: body.content,
          summary: 'Edición dictada por administrador',
          editorId: session.user.id,
        }
      }
    },
    include: { gameMode: { select: { name: true } } }
  });

  return NextResponse.json(page);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || (!session.user.isAdmin && !session.user.isStaff)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { id } = await request.json();
  await prisma.wikiPage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
