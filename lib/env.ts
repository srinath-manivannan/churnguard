import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  TURSO_DATABASE_URL: z.string().min(1, "Database URL is required"),
  TURSO_AUTH_TOKEN: z.string().min(1, "Database auth token is required"),

  GEMINI_API_KEY: z.string().min(1, "Gemini API key is required"),

  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().default("churn-customers"),

  NEXTAUTH_SECRET: z.string().min(1, "NextAuth secret is required"),
  NEXTAUTH_URL: z.string().url().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("onboarding@resend.dev"),

  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),

  GOOGLE_SERVICE_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEETS_ID: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  HUGGINGFACE_API_KEY: z.string().optional(),
  REPLICATE_API_KEY: z.string().optional(),
});

const _clientSchema = z.object({
  NEXT_PUBLIC_LOOKER_STUDIO_URL: z.string().url().optional(),
});

function validateEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(
      `\n[env] Invalid environment variables:\n${formatted}\n`
    );

    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
  }

  return parsed.data ?? (process.env as unknown as z.infer<typeof serverSchema>);
}

export const env = validateEnv();
export type Env = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof _clientSchema>;
