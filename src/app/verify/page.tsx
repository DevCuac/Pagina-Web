import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
       <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
         <h1 style={{ color: 'var(--accent-danger)' }}>Petición Inválida</h1>
         <p>Faltan parámetros de verificación en el enlace.</p>
       </div>
    );
  }

  // Find verification token
  const vToken = await prisma.verificationToken.findFirst({
        where: { identifier: email, token }
  });

  if (!vToken) {
    return (
       <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
         <h1 style={{ color: 'var(--accent-danger)' }}>Enlace Inválido</h1>
         <p>Este código de verificación no existe o ya ha sido utilizado.</p>
       </div>
    );
  }

  // Check expiration
  if (new Date() > new Date(vToken.expires)) {
      // Delete expired token to keep DB clean
      await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } });
      return (
         <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
           <h1 style={{ color: 'var(--accent-warning)' }}>Enlace Expirado</h1>
           <p>Este enlace de confirmación ha caducado. Inicia sesión para solicitar uno nuevo.</p>
         </div>
      );
  }

  // Validate User Action
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
      return <div className="container">Usuario no encontrado en los registros.</div>;
  }

  // Execute Verification
  await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
  });

  await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } }
  });

  return (
    <div className="container" style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
      <h1 style={{ color: 'var(--accent-success)', marginBottom: '10px' }}>¡Cuenta Verificada Exitosamente!</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Gracias por confirmar tu correo electrónico. Ahora tienes acceso completo a la creación de Tickets y a los Foros de la comunidad.
      </p>
      <Link href="/login" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
        Ir a Iniciar Sesión
      </Link>
    </div>
  );
}
