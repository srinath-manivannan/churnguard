import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || "",
  };
}

export async function getSession() {
  return await getServerSession(authOptions);
}
