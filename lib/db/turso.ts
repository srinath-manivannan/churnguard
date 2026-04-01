import { drizzle } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";
import * as schema from "./schema";

let _client: Client | null = null;

function getTursoClient() {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;

    if (url && url !== "libsql://your-db.turso.io" && !url.includes("your-db")) {
      _client = createClient({
        url,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      });
    } else {
      _client = createClient({
        url: "file:local.db",
      });
    }
  }
  return _client;
}

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
let _db: DrizzleDB | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(getTursoClient(), { schema });
  }
  return _db;
}

export const db: DrizzleDB = new Proxy({} as DrizzleDB, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export async function testConnection() {
  try {
    await getTursoClient().execute("SELECT 1 as test");
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
