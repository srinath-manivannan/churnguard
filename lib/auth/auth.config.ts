// // ============================================
// // NEXTAUTH CONFIG (CREDENTIALS)
// // ============================================

// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { db } from "@/lib/db/turso";
// import { users } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";

// export const authOptions: NextAuthOptions = {
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60,
//   },

//   pages: {
//     signIn: "/login",
//   },

//   providers: [
//     CredentialsProvider({
//       name: "Credentials",

//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials) {
//         if (!credentials?.email || !credentials.password) {
//           throw new Error("Missing email or password");
//         }

//         const [user] = await db
//           .select()
//           .from(users)
//           .where(eq(users.email, credentials.email))
//           .limit(1);

//         if (!user) throw new Error("User not found");

//         const valid = await bcrypt.compare(
//           credentials.password,
//           user.passwordHash
//         );

//         if (!valid) throw new Error("Invalid password");

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           image: user.avatarUrl,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//         token.image = user.image;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.email = token.email as string;
//         session.user.name = token.name as string;
//         session.user.image = token.image as string;
//       }
//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
//   debug: process.env.NODE_ENV === "development",
// };
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/turso";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user) {
          throw new Error("No user found");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
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
      if (session.user) {
        session.user.id = `${token.id}`;
        session.user.email = `${token.email}`;
        session.user.name = `${token.name}`;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
