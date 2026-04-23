import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const user = await (prisma.user as any).findUnique({
    where: { id: session.user.id }
  });

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: 'Ya verificado' }, { status: 400 });

  try {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Delete old tokens for this email first
    await (prisma.verificationToken as any).deleteMany({
      where: { identifier: user.email }
    });

    // Create new token
    await (prisma.verificationToken as any).create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      }
    });

    const userLocale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
    await sendVerificationEmail(user.email, user.username, token, userLocale);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email sending error:', err);
    return NextResponse.json({ error: 'Error enviando el correo' }, { status: 500 });
  }
}
