// ============================================
// NEXT.JS MIDDLEWARE - ROUTE PROTECTION
// ============================================
// This middleware runs BEFORE every request
// It protects dashboard routes from unauthenticated users

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// ============================================
// PROTECTED ROUTES CONFIGURATION
// ============================================
export default withAuth(
  // Middleware function
  function middleware(req) {
    // You can add custom logic here
    // For now, just continue to the route
    return NextResponse.next();
  },
  {
    // Callbacks
    callbacks: {
      // Determine if user is authorized to access route
      authorized: ({ token }) => {
        // If token exists, user is authenticated
        return !!token;
      },
    },
    // Pages configuration
    pages: {
      signIn: "/login", // Redirect to login if not authenticated
    },
  }
);

// ============================================
// MATCHER - WHICH ROUTES TO PROTECT
// ============================================
// Only run middleware on these paths
export const config = {
  matcher: [
    // Protect all dashboard routes
    "/dashboard/:path*",
    "/upload/:path*",
    "/customers/:path*",
    "/chat/:path*",
    "/campaigns/:path*",
    "/images/:path*",
    "/reports/:path*",
    
    // Also protect API routes (except auth routes)
    "/api/customers/:path*",
    "/api/upload/:path*",
    "/api/chat/:path*",
    "/api/campaigns/:path*",
    "/api/images/:path*",
    "/api/reports/:path*",
  ],
};