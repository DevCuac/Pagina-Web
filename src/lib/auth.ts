import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync } from 'bcryptjs';
import prisma from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = compareSync(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        // Block login if unverified and internal verification is enforced (Exempt Admins)
        if (!user.emailVerified && !user.role.isAdmin) {
          const isVerificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === 'true';
          if (isVerificationRequired) {
             throw new Error('UnverifiedEmail');
          }
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.avatar,
        } as any;
      },
    }),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Execute the database lookup on initial login OR when triggering manual session update
      if (user || trigger === 'update') {
        const fetchEmail = user?.email || token.email; // Fallback to token email if updating
        if (fetchEmail) {
          const dbUser = await prisma.user.findUnique({
            where: { email: fetchEmail },
            include: { role: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
            token.username = dbUser.username;
            token.role = dbUser.role.name;
            token.roleColor = dbUser.role.color;
            token.isAdmin = dbUser.role.isAdmin;
            token.isStaff = dbUser.role.isStaff;
            token.avatar = dbUser.avatar;
            token.banner = dbUser.banner;
            token.emailVerified = dbUser.emailVerified;
            token.rolePermissions = dbUser.role.permissions;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.roleColor = token.roleColor as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isStaff = token.isStaff as boolean;
        // Don't store large base64 strings in the session cookie to avoid size limits
        session.user.avatar = null; 
        session.user.banner = null;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.rolePermissions = token.rolePermissions as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true;
      
      // For OAuth providers, check if user exists; if not, create with default role
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser) {
          const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
          if (!defaultRole) return false;
          
          await prisma.user.create({
            data: {
              username: user.name || user.email.split('@')[0],
              email: user.email,
              avatar: user.image,
              roleId: defaultRole.id,
              ...(account?.provider === 'discord' ? { discordId: account.providerAccountId } : {}),
              ...(account?.provider === 'google' ? { googleId: account.providerAccountId } : {}),
            },
          });
        }
      }
      
      return true;
    },
  },
});
