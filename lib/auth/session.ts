// // ============================================
// // SESSION HELPER FUNCTIONS
// // ============================================
// // Utility functions for getting user session in API routes and pages

// import { getServerSession } from "next-auth/next";
// import { authOptions } from "./auth.config";
// import { NextRequest } from "next/server";

// // ============================================
// // GET CURRENT SESSION
// // ============================================
// // Use this in API routes to get current user
// export async function getCurrentUser() {
//   const session = await getServerSession(authOptions);
//   return session?.user;
// }

// // ============================================
// // REQUIRE AUTHENTICATION
// // ============================================
// // Use this in API routes that need authentication
// // Throws error if user not logged in
// export async function requireAuth() {
//   const user = await getCurrentUser();
  
//   if (!user) {
//     throw new Error("Unauthorized - Please sign in");
//   }
  
//   return user;
// }

// // ============================================
// // GET USER ID FROM SESSION
// // ============================================
// // Returns just the user ID (most common use case)
// export async function getUserId() {
//   const user = await getCurrentUser();
//   return user?.id;
// }

// // ============================================
// // CHECK IF USER IS AUTHENTICATED
// // ============================================
// // Returns boolean - useful for conditional logic
// export async function isAuthenticated() {
//   const user = await getCurrentUser();
//   return !!user;
// }


import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Return user with email
  return {
    id: session.user.id,
    email: session.user.email || "", // ✅ Include email
    name: session.user.name || "",
  };
}

export async function getSession() {
  return await getServerSession(authOptions);
}