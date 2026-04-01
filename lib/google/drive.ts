/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db/turso";
import { googleTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TOKEN_REFRESH_BUFFER_MS = 60_000;

export async function getUserDriveToken(userId: string): Promise<string | null> {
  const [tokenRow] = await db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.userId, userId));

  if (!tokenRow) return null;

  const nowMs = Date.now();
  const expiryMs = tokenRow.expiryDate ? tokenRow.expiryDate.getTime() : 0;

  if (expiryMs && expiryMs > nowMs + TOKEN_REFRESH_BUFFER_MS) {
    return tokenRow.accessToken;
  }

  if (!tokenRow.refreshToken) {
    return tokenRow.accessToken;
  }

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
