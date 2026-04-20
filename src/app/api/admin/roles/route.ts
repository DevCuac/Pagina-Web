import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  const roles = await prisma.role.findMany({ orderBy: { weight: 'desc' }, include: { _count: { select: { users: true } } } });
  return NextResponse.json(roles);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const perms = body.permissions ? typeof body.permissions === 'string' ? body.permissions : JSON.stringify(body.permissions) : '{}';

  if (body.isDefault) {
    await prisma.role.updateMany({ data: { isDefault: false } });
  }

  const role = await prisma.role.create({ 
    data: { 
      name: body.name, 
      color: body.color, 
      weight: body.weight || 0, 
      isStaff: body.isStaff || false, 
      isAdmin: body.isAdmin || false,
      isDefault: body.isDefault || false,
      permissions: perms
    } 
  });
  return NextResponse.json(role, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const body = await request.json();
  const perms = body.permissions ? typeof body.permissions === 'string' ? body.permissions : JSON.stringify(body.permissions) : null;

  const updateData: any = { 
    name: body.name, 
    color: body.color, 
    weight: body.weight, 
    isStaff: body.isStaff, 
    isAdmin: body.isAdmin 
  };

  if (body.isDefault !== undefined) {
    if (body.isDefault === true) {
      await prisma.role.updateMany({ data: { isDefault: false } });
    }
    updateData.isDefault = body.isDefault;
  }

  if (perms !== null) {
    updateData.permissions = perms;
  }

  const role = await prisma.role.update({ 
    where: { id: body.id }, 
    data: updateData
  });
  return NextResponse.json(role);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  const { id } = await request.json();
  const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
  if (defaultRole) { await prisma.user.updateMany({ where: { roleId: id }, data: { roleId: defaultRole.id } }); }
  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
