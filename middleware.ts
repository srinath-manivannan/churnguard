import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
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
    "/api/customers/:path*",
    "/api/upload/:path*",
    "/api/chat/:path*",
    "/api/campaigns/:path*",
    "/api/images/:path*",
    "/api/reports/:path*",
  ],
};
