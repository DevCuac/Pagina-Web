import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { validateMinecraftUsername } from '@/lib/minecraft';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { bio: true, minecraftName: true, minecraftUuid: true, avatar: true, banner: true } });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

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

  await prisma.user.update({ where: { id: session.user.id }, data: updateData });
  return NextResponse.json({ success: true });
}
