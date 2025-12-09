"use client";

import { useEffect } from "react";

export default function SyncInitializer() {
  useEffect(() => {
    // Initialize auto-sync when app loads (only once)
    fetch("/api/cron/looker-sync")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Auto-sync initialized:", data);
      })
      .catch((error) => {
        console.error("❌ Auto-sync initialization failed:", error);
      });
  }, []);

  return null; // This component doesn't render anything
}