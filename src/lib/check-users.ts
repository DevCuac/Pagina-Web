import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('Total Users:', users.length);
  users.forEach(u => {
    console.log(`- ${u.username} (${u.email}): Role=${u.role?.name || 'NONE'}, IsAdmin=${u.role?.isAdmin || false}`);
  });
}

main().catch(console.error);
