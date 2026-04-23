import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import prisma from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { validateMinecraftUsername } from '@/lib/minecraft';
import { sendVerificationEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: (parsed.error as any).issues[0].message },
        { status: 400 }
      );
    }

    const { username, email, password, minecraftName } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Este nombre de usuario ya existe' }, { status: 400 });
    }

    let minecraftUuid: string | undefined;
    if (minecraftName) {
      const mcResult = await validateMinecraftUsername(minecraftName);
      if (!mcResult.valid) {
        return NextResponse.json({ error: 'Nombre de Minecraft no encontrado' }, { status: 400 });
      }
      minecraftUuid = mcResult.uuid;
    }

    const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
    if (!defaultRole) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    const settingMap = await prisma.siteSetting.findMany({
      where: { key: { in: ['email_verification_enabled', 'registration_enabled'] } }
    });
    const config = settingMap.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as any);

    if (config['registration_enabled'] === 'false') {
      return NextResponse.json({ error: 'Los registros están cerrados temporalmente' }, { status: 403 });
    }

    const verificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === 'true' || config['email_verification_enabled'] === 'true';

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashSync(password, 12),
        roleId: defaultRole.id,
        minecraftName: minecraftName || null,
        minecraftUuid: minecraftUuid || null,
        emailVerified: verificationRequired ? null : new Date(),
      },
    });

    if (verificationRequired) {
      try {
        const token = crypto.randomBytes(32).toString('hex');
        
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          }
        });

        const userLocale = request.cookies.get('NEXT_LOCALE')?.value || 'de';
        await sendVerificationEmail(email, username, token, userLocale);
      } catch (err) {
        console.error('Email sending error:', err);
      }
    }

    return NextResponse.json({ success: true, userId: user.id, verificationRequired }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error details:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
