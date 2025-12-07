// // ============================================
// // NEXTAUTH MIDDLEWARE - ROUTE PROTECTION
// // ============================================

// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token, // logged in → allow
//     },
//     pages: {
//       signIn: "/login",
//     },
//   }
// );

// // ============================================
// // PROTECTED ROUTES
// // ============================================
// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/upload/:path*",
//     "/customers/:path*",
//     "/chat/:path*",
//     "/campaigns/:path*",
//     "/images/:path*",
//     "/reports/:path*",

//     // API protected routes
//     "/api/customers/:path*",
//     "/api/upload/:path*",
//     "/api/chat/:path*",
//     "/api/campaigns/:path*",
//     "/api/images/:path*",
//     "/api/reports/:path*",
//   ],
// };
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/customers/:path*",
    "/chat/:path*",
    "/campaigns/:path*",
    "/images/:path*",
    "/reports/:path*",

    // Protected API routes
    "/api/customers/:path*",
    "/api/upload/:path*",
    "/api/chat/:path*",
    "/api/campaigns/:path*",
    "/api/images/:path*",
    "/api/reports/:path*",
  ],
};
