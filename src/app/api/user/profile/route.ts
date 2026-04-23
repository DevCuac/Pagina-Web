import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { validateMinecraftUsername } from '@/lib/minecraft';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const user = await (prisma.user as any).findUnique({ where: { id: session.user.id }, select: { bio: true, minecraftName: true, minecraftUuid: true, avatar: true, banner: true, instagram: true, twitter: true, discord: true, youtube: true, facebook: true } });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Block updates if not verified (except for admins)
  if (!session.user.emailVerified && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Email verification required' }, { status: 403 });
  }

  const body = await request.json();
  const updateData: any = {};

  if (body.bio !== undefined) updateData.bio = body.bio;
  if (body.avatar !== undefined) updateData.avatar = body.avatar || null;
  if (body.banner !== undefined) updateData.banner = body.banner || null;

  if (body.minecraftName !== undefined && body.minecraftName !== '') {
    const result = await validateMinecraftUsername(body.minecraftName);
    if (!result.valid) return NextResponse.json({ error: 'Nombre de Minecraft no encontrado' }, { status: 400 });
    updateData.minecraftName = body.minecraftName;
    updateData.minecraftUuid = result.uuid;
  } else if (body.minecraftName === '') {
    updateData.minecraftName = null;
    updateData.minecraftUuid = null;
  }

  if (body.instagram !== undefined) updateData.instagram = body.instagram;
  if (body.twitter !== undefined) updateData.twitter = body.twitter;
  if (body.discord !== undefined) updateData.discord = body.discord;
  if (body.youtube !== undefined) updateData.youtube = body.youtube;
  if (body.facebook !== undefined) updateData.facebook = body.facebook;

  await (prisma.user as any).update({ where: { id: session.user.id }, data: updateData });
  return NextResponse.json({ success: true });
}
