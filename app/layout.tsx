// ============================================
// ROOT LAYOUT (FIXED - NO useEffect)
// ============================================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import SyncInitializer from "@/components/sync/SyncInitializer"; // ✅ Import client component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChurnGuard - AI-Powered Customer Retention",
  description: "Predict and prevent customer churn with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <SyncInitializer /> {/* ✅ Client component handles useEffect */}
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}