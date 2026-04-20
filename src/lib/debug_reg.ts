import prisma from './src/lib/db';

async function check(email: string) {
  console.log('Checking database for:', email);
  
  const user = await prisma.user.findUnique({ where: { email } });
  console.log('User found:', user ? 'YES' : 'NO');
  if (user) console.log('User ID:', user.id);

  const tokens = await prisma.verificationToken.findMany({ where: { identifier: email } });
  console.log('Verification tokens found:', tokens.length);

  const roles = await prisma.role.findMany();
  console.log('Total roles:', roles.length);
  console.log('Is there a default role?', roles.some(r => r.isDefault) ? 'YES' : 'NO');

  const settings = await prisma.siteSetting.findMany();
  console.log('Site settings found:', settings.length);
  
  process.exit(0);
}

const emailToCheck = process.argv[2];
if (!emailToCheck) {
  console.error('Provide an email');
  process.exit(1);
}

check(emailToCheck);
