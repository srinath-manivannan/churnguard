// ============================================
// NEXTAUTH API ROUTE HANDLER
// ============================================
// This creates the NextAuth API endpoints:
// - POST /api/auth/signin
// - POST /api/auth/signout
// - GET /api/auth/session
// - GET /api/auth/csrf
// - GET /api/auth/providers

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Export for Next.js App Router
export { handler as GET, handler as POST };