// ============================================
// NEXTAUTH CONFIGURATION
// ============================================
// This file configures authentication for the entire app
// It handles login, session management, and JWT tokens

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/turso";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// NEXTAUTH CONFIGURATION OPTIONS
// ============================================
export const authOptions: NextAuthOptions = {
  // Session strategy - we use JWT tokens (no database sessions)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Pages configuration - custom auth pages
  pages: {
    signIn: "/login", // Custom login page
    error: "/login", // Redirect errors to login
  },

  // Authentication providers
  providers: [
    // Credentials provider - email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      // Authorize function - validates user credentials
      async authorize(credentials) {
        // Check if credentials provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          // Find user in database by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          // If user not found
          if (!user) {
            throw new Error("No user found with this email");
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          // If password incorrect
          if (!isPasswordValid) {
            throw new Error("Incorrect password");
          }

          // Return user object (without password hash)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],

  // Callbacks - modify tokens and sessions
  callbacks: {
    // JWT callback - called when token is created or updated
    async jwt({ token, user }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    // Session callback - called when session is checked
    async session({ session, token }) {
      // Add user ID to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },

    // ✅ ADD THIS - Redirect callback for login/logout
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default redirect to dashboard after login
      return `${baseUrl}/dashboard`;
    },
  },

  // Secret for JWT encryption (from env)
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
};