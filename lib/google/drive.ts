/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db/turso";
import { googleTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserDriveToken(userId: string): Promise<string | null> {
  // We store exactly one row per userId
  const [tokenRow] = await db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.userId, userId));

  if (!tokenRow) return null;

  const nowMs = Date.now();
  const expiryMs = tokenRow.expiryDate ? tokenRow.expiryDate.getTime() : 0;

  // ✅ If token still valid ( > 60s left ) → just use it
  if (expiryMs && expiryMs > nowMs + 60_000) {
    return tokenRow.accessToken;
  }

  // No refresh token → best we can do is return old access token
  if (!tokenRow.refreshToken) {
    return tokenRow.accessToken;
  }

  // ✅ Refresh access token using refresh_token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenRow.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data: any = await res.json();

  if (!res.ok || !data.access_token) {
    console.error("Refresh token error:", data);
    // fall back to old token so UI can show “reconnect” etc.
    return tokenRow.accessToken;
  }

  const newExpiry = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  await db
    .update(googleTokens)
    .set({
      accessToken: data.access_token,
      expiryDate: newExpiry,
      updatedAt: new Date(),
    })
    .where(eq(googleTokens.userId, userId));

  return data.access_token as string;
}
