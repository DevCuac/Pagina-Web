import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default roles
  const memberRole = await prisma.role.upsert({
    where: { name: 'Miembro' },
    update: {},
    create: {
      name: 'Miembro',
      color: '#8b949e',
      weight: 0,
      isDefault: true,
      isAdmin: false,
      isStaff: false,
      permissions: JSON.stringify({
        canCreatePosts: true,
        canComment: true,
        canCreateTickets: true,
      }),
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      color: '#58a6ff',
      icon: '🛡️',
      weight: 50,
      isDefault: false,
      isAdmin: false,
      isStaff: true,
      permissions: JSON.stringify({
        canCreatePosts: true,
        canComment: true,
        canCreateTickets: true,
        canManageTickets: true,
        canPinPosts: true,
        canLockPosts: true,
        canDeletePosts: true,
        canEditWiki: true,
      }),
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      color: '#f85149',
      icon: '👑',
      weight: 100,
      isDefault: false,
      isAdmin: true,
      isStaff: true,
      permissions: JSON.stringify({ all: true }),
    },
  });

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'angelriveradeveloper@gmail.com' },
    update: {},
    create: {
      username: 'Admin',
      email: 'angelriveradeveloper@gmail.com',
      passwordHash: hashSync('admin123', 12),
      roleId: adminRole.id,
      bio: 'Administrador de CrossPixel',
    },
  });

  // Create default ticket category
  await prisma.ticketCategory.upsert({
    where: { id: 'default-general' },
    update: {},
    create: {
      id: 'default-general',
      name: 'General',
      description: 'Consultas generales sobre el servidor',
      icon: '💬',
      order: 0,
    },
  });

  // Create default forum category and forum
  const generalCategory = await prisma.forumCategory.upsert({
    where: { slug: 'general' },
    update: {},
    create: {
      name: 'General',
      description: 'Discusiones generales de la comunidad',
      slug: 'general',
      icon: '💬',
      order: 0,
    },
  });

  await prisma.forum.upsert({
    where: { slug: 'discusion-general' },
    update: {},
    create: {
      name: 'Discusión General',
      description: 'Habla sobre cualquier tema relacionado con CrossPixel',
      slug: 'discusion-general',
      icon: '🗣️',
      order: 0,
      categoryId: generalCategory.id,
    },
  });

  await prisma.forum.upsert({
    where: { slug: 'sugerencias' },
    update: {},
    create: {
      name: 'Sugerencias',
      description: 'Comparte tus ideas para mejorar el servidor',
      slug: 'sugerencias',
      icon: '💡',
      order: 1,
      categoryId: generalCategory.id,
    },
  });

  await prisma.forum.upsert({
    where: { slug: 'reportes-de-bugs' },
    update: {},
    create: {
      name: 'Reportes de Bugs',
      description: 'Reporta errores y fallos del servidor',
      slug: 'reportes-de-bugs',
      icon: '🐛',
      order: 2,
      categoryId: generalCategory.id,
    },
  });

  // Create main server
  await prisma.server.upsert({
    where: { id: 'main-server' },
    update: {},
    create: {
      id: 'main-server',
      name: 'CrossPixel Network',
      host: 'cross-pixel.de',
      port: 25565,
      isMain: true,
      order: 0,
    },
  });

  // Create default site settings
  const defaultSettings = [
    { key: 'site_name', value: 'CrossPixel' },
    { key: 'site_description', value: 'The Ultimate Minecraft Experience' },
    { key: 'site_ip', value: 'cross-pixel.de' },
    { key: 'discord_invite', value: 'https://discord.gg/crosspixel' },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Seed completed!');
  console.log(`   Admin user: angelriveradeveloper@gmail.com / admin123`);
  console.log(`   Roles: ${memberRole.name}, ${staffRole.name}, ${adminRole.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
