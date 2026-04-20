import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { commentSchema } from '@/lib/validations';
import { notifyPostReply } from '@/lib/notifications';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { postId } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
  if (post.isLocked) return NextResponse.json({ error: 'Este hilo está cerrado' }, { status: 403 });

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: (parsed.error as any).issues[0].message }, { status: 400 });

  const comment = await prisma.forumComment.create({
    data: {
      content: parsed.data.content,
      postId,
      authorId: session.user.id,
    },
  });

  // Notify post author
  await notifyPostReply(post, session.user.id, session.user.username);

  return NextResponse.json({ id: comment.id }, { status: 201 });
}
