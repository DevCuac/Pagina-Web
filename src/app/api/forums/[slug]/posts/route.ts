import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { forumPostSchema } from '@/lib/validations';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Block creation if not verified (except for admins)
  if (!session.user.emailVerified && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Email verification required' }, { status: 403 });
  }

  const { slug } = await params;
  const forum = await prisma.forum.findUnique({ where: { slug } });
  if (!forum) return NextResponse.json({ error: 'Foro no encontrado' }, { status: 404 });

  const body = await request.json();
  const parsed = forumPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: (parsed.error as any).issues[0].message }, { status: 400 });

  const post = await prisma.forumPost.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      image: parsed.data.image && parsed.data.image.trim() !== '' ? parsed.data.image : null,
      forumId: forum.id,
      authorId: session.user.id,
    },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}
