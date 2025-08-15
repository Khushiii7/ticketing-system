// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'USER' | 'AGENT' | 'ADMIN';
    };
  }

  interface User {
    role?: 'USER' | 'AGENT' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'USER' | 'AGENT' | 'ADMIN';
  }
}