import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { userId, roleId, username, bio, minecraftName } = await request.json();

  const updateData: any = {};
  if (roleId) updateData.roleId = roleId;
  if (username !== undefined) updateData.username = username;
  if (bio !== undefined) updateData.bio = bio;
  if (minecraftName !== undefined) updateData.minecraftName = minecraftName;

  await prisma.user.update({ where: { id: userId }, data: updateData });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
