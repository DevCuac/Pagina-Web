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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('AUTH_DEBUG: Missing email or password');
            return null;
          }

          // Use findFirst to avoid potential issues with findUnique if there are glitches
          const user = await (prisma.user as any).findFirst({
            where: { 
              email: {
                equals: credentials.email as string,
              }
            },
            include: { role: true },
          });

          if (!user) {
            console.error('AUTH_DEBUG: User not found in DB:', credentials.email);
            return null;
          }
          
          if (!user.passwordHash) {
            console.error('AUTH_DEBUG: User found but has no passwordHash (likely OAuth-only user):', credentials.email);
            return null;
          }

          const isValid = compareSync(credentials.password as string, user.passwordHash);
          if (!isValid) {
            console.error('AUTH_DEBUG: Invalid password for:', credentials.email);
            return null;
          }

          console.log('AUTH_DEBUG: Successful authorization for:', user.username);
          
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            image: user.avatar,
          };
        } catch (error: any) {
          console.error('AUTH_DEBUG_CRITICAL_ERROR:', error.message);
          console.error(error.stack);
          throw new Error('AUTH_INTERNAL_ERROR');
        }
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
      try {
        if (user || trigger === 'update') {
          const fetchEmail = user?.email || token.email;
          if (fetchEmail) {
            const dbUser = await (prisma.user as any).findUnique({
              where: { email: fetchEmail },
              include: { role: true },
            });
            if (dbUser) {
              token.userId = dbUser.id;
              token.username = dbUser.username;
              token.role = dbUser.role?.name || 'User';
              token.roleColor = dbUser.role?.color || '#8b949e';
              token.isAdmin = dbUser.role?.isAdmin || false;
              token.isStaff = dbUser.role?.isStaff || false;
              token.avatar = dbUser.avatar;
              token.banner = dbUser.banner;
              token.emailVerified = dbUser.emailVerified;
              token.rolePermissions = dbUser.role?.permissions || '{}';
            }
          }
        }
      } catch (error) {
        console.error('AUTH_JWT_CALLBACK_ERROR:', error);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.roleColor = token.roleColor as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isStaff = token.isStaff as boolean;
        session.user.avatar = null; 
        session.user.banner = null;
        session.user.emailVerified = token.emailVerified as any;
        session.user.rolePermissions = token.rolePermissions as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'credentials') return true;
        
        if (user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (!existingUser) {
            const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
            if (!defaultRole) {
              console.error('AUTH_SIGNIN_ERROR: No default role found for new OAuth user');
              return false;
            }
            
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
      } catch (error) {
        console.error('AUTH_SIGNIN_CALLBACK_ERROR:', error);
        return false;
      }
    },
  },
});
