/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { googleTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getValidAccessToken(userId: string) {
  const [row] = await db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.userId, userId));

  if (!row) throw new Error("Google Drive not connected");

  const now = Date.now();
  const expiry = row.expiryDate ? new Date(row.expiryDate).getTime() : 0;

  // If expired and we have refresh token → refresh
  if (expiry && expiry - now < 60_000 && row.refreshToken) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: row.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const json: any = await res.json();
    if (!res.ok) {
      console.error("Refresh token error:", json);
      throw new Error("Failed to refresh Google token");
    }

    const newExpiry = new Date(Date.now() + json.expires_in * 1000);

    await db
      .update(googleTokens)
      .set({
        accessToken: json.access_token,
        expiryDate: newExpiry,
      })
      .where(eq(googleTokens.userId, userId));

    return json.access_token as string;
  }

  return row.accessToken as string;
}

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();
    const accessToken = await getValidAccessToken(user.id);

    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files" +
        "?q=mimeType contains 'image/' and trashed = false" +
        "&pageSize=20&fields=files(id,name,mimeType,thumbnailLink,webViewLink)",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data: any = await res.json();
    if (!res.ok) {
      console.error("Drive list error:", data);
      return NextResponse.json(
        { error: "Failed to load Drive images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      files: data.files ?? [],
    });
  } catch (err: any) {
    if (err.message === "Google Drive not connected") {
      return NextResponse.json({ error: "Not connected" }, { status: 401 });
    }
    console.error("Drive images API error:", err);
    return NextResponse.json(
      { error: "Failed to load Drive images" },
      { status: 500 }
    );
  }
}
