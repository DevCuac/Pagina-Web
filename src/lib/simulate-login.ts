import { compareSync } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function authorize(email: string, pass: string) {
  try {
    console.log(`Attempting login for: ${email}`);
    const user = await (prisma.user as any).findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      console.log('User not found');
      return null;
    }
    
    if (!user.passwordHash) {
      console.log('No password hash found');
      return null;
    }

    const isValid = compareSync(pass, user.passwordHash);
    if (!isValid) {
      console.log('Invalid password');
      return null;
    }

    console.log('Login SUCCESSFUL');
    console.log('User Data:', {
      id: user.id,
      username: user.username,
      role: user.role.name,
      isAdmin: user.role.isAdmin
    });
    return user;
  } catch (error) {
    console.error('Authorize error:', error);
    return null;
  }
}

// Test with a non-admin user from the previous check
// User: Cuac (angelriveradeveloper2005@outlook.com)
// Note: I don't know the password, but I can check if the function crashes or fails for any other reason.
// Since I can't know the password, I'll just check if it finds the user and reaches the comparison.
authorize('angelriveradeveloper2005@outlook.com', 'some_password').then(() => prisma.$disconnect());
