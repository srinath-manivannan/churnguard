import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

export default async function TestEmailPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Email Debug</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Session exists:</strong> {session ? "✅ Yes" : "❌ No"}</p>
        <p><strong>User ID:</strong> {session?.user?.id || "Not found"}</p>
        <p><strong>User Email:</strong> {session?.user?.email || "❌ NOT FOUND!"}</p>
        <p><strong>User Name:</strong> {session?.user?.name || "Not found"}</p>
      </div>
      
      {!session?.user?.email && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-800 font-bold">⚠️ EMAIL IS MISSING FROM SESSION!</p>
          <p className="text-sm mt-2">This is why emails aren't sending. We need to add email to the session.</p>
        </div>
      )}
    </div>
  );
}