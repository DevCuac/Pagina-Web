import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import { getLocaleObj, getTranslation } from '@/lib/i18n';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;
  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  if (!token || !email) {
    return (
       <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
         <h1 style={{ color: 'var(--accent-danger)' }}>{t('verify.invalid_request')}</h1>
         <p>{t('verify.invalid_request_desc')}</p>
       </div>
    );
  }

  const vToken = await prisma.verificationToken.findFirst({
        where: { identifier: email, token }
  });

  if (!vToken) {
    return (
       <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
         <h1 style={{ color: 'var(--accent-danger)' }}>{t('verify.invalid_link')}</h1>
         <p>{t('verify.invalid_link_desc')}</p>
       </div>
    );
  }

  if (new Date() > new Date(vToken.expires)) {
      await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } });
      return (
         <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
           <h1 style={{ color: 'var(--accent-warning)' }}>{t('verify.expired_link')}</h1>
           <p>{t('verify.expired_link_desc')}</p>
         </div>
      );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
      return <div className="container">{t('verify.user_not_found')}</div>;
  }

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
      <h1 style={{ color: 'var(--accent-success)', marginBottom: '10px' }}>{t('verify.title_success')}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        {t('verify.desc_success')}
      </p>
      <Link href="/login" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
        {t('verify.btn_login')}
      </Link>
    </div>
  );
}
