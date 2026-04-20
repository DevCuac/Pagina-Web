import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      avatar: true,
      banner: true,
      bio: true,
      minecraftName: true,
    }
  });

  return NextResponse.json(user || {});
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { avatar, banner, bio, minecraftName } = body;

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatar: avatar || null,
        banner: banner || null,
        bio: bio || null,
        minecraftName: minecraftName || null
      }
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Error interno actualizando perfil' }, { status: 500 });
  }
}
