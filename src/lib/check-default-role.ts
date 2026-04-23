import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log('Roles found:');
  roles.forEach(r => {
    console.log(`- ${r.name}: isDefault=${r.isDefault}, isAdmin=${r.isAdmin}`);
  });
  
  const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
  if (!defaultRole) {
    console.log('CRITICAL: No default role found!');
  } else {
    console.log('Default role is:', defaultRole.name);
  }
}

main().catch(console.error);
