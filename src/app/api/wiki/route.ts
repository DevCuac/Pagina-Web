import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (!hasPermission(session.user, 'wiki.edit') && !hasPermission(session.user, 'wiki.manage'))) {
    return NextResponse.json({ error: 'Permisos insuficientes para editar la Wiki' }, { status: 403 });
  }

  const { gameModeId, title, parentId } = await request.json();
  
  if (!gameModeId || !title) {
    return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 });
  }

  // Generar un slug único
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;

  const page = await prisma.wikiPage.create({
    data: {
      title,
      slug,
      content: '', // Initial empty content
      gameModeId,
      parentId: parentId || null
    }
  });

  return NextResponse.json(page, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || (!hasPermission(session.user, 'wiki.edit') && !hasPermission(session.user, 'wiki.manage'))) {
    return NextResponse.json({ error: 'Permisos insuficientes para editar la Wiki' }, { status: 403 });
  }

  const { id, content } = await request.json();

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const updatedPage = await prisma.wikiPage.update({
    where: { id },
    data: { content }
  });

  // Track revision historically
  await prisma.wikiRevision.create({
    data: {
      content,
      pageId: id,
      editorId: session.user.id,
      summary: 'Actualización en línea',
    }
  });

  return NextResponse.json(updatedPage);
}
