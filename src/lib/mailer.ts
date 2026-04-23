import nodemailer from 'nodemailer';
import prisma from '@/lib/db';

export async function getMailerTransport() {
  const envConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
  };

  if (envConfig.host && envConfig.user && envConfig.pass) {
    return {
      transporter: nodemailer.createTransport({
        host: envConfig.host,
        port: parseInt(envConfig.port || '587'),
        secure: envConfig.secure === 'true' || envConfig.port === '465', 
        auth: {
          user: envConfig.user,
          pass: envConfig.pass,
        }
      }),
      from: envConfig.from || 'noreply@cross-pixel.de'
    };
  }

  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'smtp_from'] }
    }
  });

  const config = settings.reduce((acc, obj) => ({ ...acc, [obj.key]: obj.value }), {} as Record<string, string>);

  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    throw new Error('SMTP not configured');
  }

  return {
    transporter: nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port || '587'),
      secure: config.smtp_secure === 'true', 
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
      tls: {
          rejectUnauthorized: false
      }
    }),
    from: config.smtp_from || 'noreply@cross-pixel.de'
  };
}

export async function sendVerificationEmail(email: string, username: string, token: string, locale: string = 'de') {
  const { transporter, from } = await getMailerTransport();

  const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationLink = `${domain}/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const texts = {
    de: {
      title: 'Verifiziere dein Konto',
      greeting: `Hallo, ${username}!`,
      body: 'Du hast dich erfolgreich auf der CrossPixel-Webplattform registriert. Bitte klicke auf den folgenden Link, um dein Konto zu verifizieren:',
      btn: 'Konto Verifizieren',
      fallback: 'Wenn die Schaltfläche nicht funktioniert, kopiere den folgenden Link und füge ihn in deinen Browser ein:',
      footer: 'Dies ist eine automatisch generierte Nachricht. Bitte antworte nicht auf diese E-Mail.',
      subject: 'Verifiziere dein CrossPixel-Konto'
    },
    en: {
      title: 'Verify your account',
      greeting: `Hello, ${username}!`,
      body: 'You have successfully registered on the CrossPixel web platform. Please click on the following link to verify your account:',
      btn: 'Verify Account',
      fallback: 'If the button doesn\'t work, copy and paste the following link into your browser:',
      footer: 'This is an automated message. Please do not reply to this email.',
      subject: 'Verify your CrossPixel account'
    }
  };

  const currentLang = texts[locale as keyof typeof texts] || texts['de'];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${currentLang.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 20px; margin: 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px;">
              <!-- Cabecera / Logo -->
              <tr>
                <td align="center" style="background-color: #1a1a2e; padding: 30px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">
                    <span style="color: #ffffff;">CROSS</span><span style="color: #4f7df9;">PIXEL</span>
                  </h1>
                </td>
              </tr>
              
              <!-- Cuerpo -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin-top: 0; font-size: 24px;">${currentLang.greeting}</h2>
                  <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    ${currentLang.body}
                  </p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${verificationLink}" style="background-color: #4f7df9; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">${currentLang.btn}</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #888888; font-size: 14px; margin-top: 40px; line-height: 1.5;">
                    ${currentLang.fallback}<br>
                    <a href="${verificationLink}" style="color: #4f7df9; word-break: break-all;">${verificationLink}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f9f9f9; padding: 20px; color: #aaaaaa; font-size: 12px;">
                  ${currentLang.footer}<br>
                  &copy; ${new Date().getFullYear()} CrossPixel Network.
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"CrossPixel" <${from}>`,
    to: email,
    subject: currentLang.subject,
    text: `${currentLang.greeting}\n\n${currentLang.body}\n${verificationLink}`,
    html: html,
  });
}
