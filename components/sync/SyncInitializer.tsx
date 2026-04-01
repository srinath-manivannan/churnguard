"use client";

import { useEffect } from "react";

export default function SyncInitializer() {
  useEffect(() => {
    fetch("/api/cron/looker-sync")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Auto-sync initialized:", data);
      })
      .catch((error) => {
        console.error("❌ Auto-sync initialization failed:", error);
      });
  }, []);

  return null;
}
