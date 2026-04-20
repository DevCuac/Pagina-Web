import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const categories = await prisma.ticketCategory.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(categories);
}
