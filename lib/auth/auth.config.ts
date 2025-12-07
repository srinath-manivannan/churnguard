// ============================================
// NEXTAUTH CONFIGURATION
// ============================================
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/turso";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  // Session strategy - we use JWT tokens
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ✅ Cookie configuration for production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Pages configuration
  pages: {
    signIn: "/login", // Custom login page
    // signOut: "/login", // Redirect after logout
    // error: "/login", // Error page
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Incorrect password");
          }

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

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  // Secret for JWT encryption (from env)
  secret: process.env.NEXTAUTH_SECRET,
  
  // ✅ Enable debug in development only
  debug: process.env.NODE_ENV === "development",
};