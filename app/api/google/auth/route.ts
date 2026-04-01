import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  const user = await requireAuth();

  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const scope =
    process.env.GOOGLE_DRIVE_SCOPE ||
    "https://www.googleapis.com/auth/drive.readonly";

  // state binds OAuth to the logged-in user and carries a nonce for CSRF protection
  const state = encodeURIComponent(
    JSON.stringify({
      u: user.id,
      t: Math.random().toString(36).slice(2),
    })
  );

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      access_type: "offline",
      prompt: "consent",
      state,
    });

  return NextResponse.redirect(url);
}
