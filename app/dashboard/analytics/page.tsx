"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/looker/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (data.recordCount !== undefined) {
        toast.success(`Synced ${data.recordCount} customers to Google Sheets!`);
        setLastSync(new Date().toLocaleString());
      } else {
        toast.error("Sync failed");
      }
    } catch (error) {
      toast.error("Failed to sync data");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Advanced Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Powered by Looker Studio • Auto-syncs every hour
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastSync && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last synced: {lastSync}
              </div>
            )}

            <Button
              onClick={handleManualSync}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>

            <Button
              onClick={() => {
                window.open(
                  process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL,
                  "_blank"
                );
              }}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Screen
            </Button>
          </div>
        </div>
      </div>

      {/* Embedded Looker Studio Dashboard */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <iframe
          src={process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}