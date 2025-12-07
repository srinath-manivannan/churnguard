// ============================================
// NEXTAUTH TYPE EXTENSIONS
// ============================================
// Extends NextAuth types to include our custom fields

import NextAuth, { DefaultSession } from "next-auth";

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add user ID to session
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}