import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: string;
    roleColor: string;
    isAdmin: boolean;
    isStaff: boolean;
    avatar: string | null;
    banner?: string | null;
    emailVerified?: Date | null;
    rolePermissions?: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      roleColor: string;
      isAdmin: boolean;
      isStaff: boolean;
      avatar: string | null;
      banner?: string | null;
      emailVerified?: Date | null;
      rolePermissions?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    username: string;
    role: string;
    roleColor: string;
    isAdmin: boolean;
    isStaff: boolean;
    avatar: string | null;
    banner?: string | null;
    emailVerified?: Date | null;
    rolePermissions?: string;
  }
}
