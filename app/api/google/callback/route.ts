/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/turso";
import { googleTokens } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const nextUrl = req.nextUrl;

  const redirectTo = (pathAndQuery: string) =>
    NextResponse.redirect(new URL(pathAndQuery, nextUrl.origin));

  try {
    const code = nextUrl.searchParams.get("code");
    const error = nextUrl.searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      return redirectTo(`/images?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return redirectTo("/images?error=no_code");
    }

    const user = await requireAuth();

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson: any = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Token error:", tokenJson);
      return redirectTo("/images?error=token_exchange_failed");
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      scope,
      token_type,
    } = tokenJson;

    const expiryDate = new Date(Date.now() + expires_in * 1000);

    await db
      .insert(googleTokens)
      .values({
        userId: user.id,
        accessToken: access_token,
        refreshToken: refresh_token ?? null,
        scope,
        tokenType: token_type,
        expiryDate,
      })
      .onConflictDoUpdate({
        target: googleTokens.userId,
        set: {
          accessToken: access_token,
          refreshToken: refresh_token ?? null,
          scope,
          tokenType: token_type,
          expiryDate,
        },
      });

    return redirectTo("/images?drive=connected");
  } catch (err: any) {
    console.error("Google callback error:", err);
    return redirectTo("/images?error=google_callback");
  }
}
