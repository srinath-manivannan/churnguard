"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, ExternalLink, CheckCircle, Download, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [lookerUrl, setLookerUrl] = useState<string>("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL;
    if (url) {
      setLookerUrl(url);
    }
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/looker/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (data.recordCount !== undefined) {
        toast.success(`✅ Synced ${data.recordCount} customers to Google Sheets!`);
        setLastSync(new Date().toLocaleString());

        // Give Sheets/sync a moment to settle before forcing the iframe reload.
        setTimeout(() => {
          const iframe = document.getElementById("looker-iframe") as HTMLIFrameElement;
          if (iframe) {
            iframe.src = iframe.src;
          }
        }, 2000);
      } else {
        toast.error("Sync failed");
      }
    } catch {
      toast.error("Failed to sync data");
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      window.open("/api/looker/export", "_blank");
      toast.success("📥 Downloading customer data...");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      const res = await fetch("/api/reports/send", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("📧 Report sent to your email!");
      } else {
        toast.error(data.error || "Failed to send report");
      }
    } catch {
      toast.error("Failed to send report");
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Advanced Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lookerUrl
                ? "Powered by Looker Studio • Auto-syncs every hour"
                : "Connect Looker Studio to view advanced analytics"
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastSync && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last synced: {lastSync}
              </div>
            )}

            {lookerUrl && (
              <>
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
                  onClick={() => window.open(lookerUrl, "_blank")}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Full Screen
                </Button>
              </>
            )}

            <Button
              onClick={handleExportCSV}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <Button
              onClick={handleSendReport}
              disabled={sendingReport}
              variant="default"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendingReport ? "Sending..." : "Email Report"}
            </Button>
          </div>
        </div>
      </div>

      {lookerUrl ? (
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <iframe
            id="looker-iframe"
            src={lookerUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title="Looker Studio Dashboard"
          />
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">📊</div>
            <h2 className="text-2xl font-bold">Looker Studio Not Connected</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Add NEXT_PUBLIC_LOOKER_STUDIO_URL to your .env.local file to view the embedded dashboard.
            </p>
            <div className="pt-4 space-y-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Data to Get Started
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Or manually sync data to Google Sheets
              </p>
              <Button
                onClick={handleManualSync}
                disabled={syncing}
                variant="default"
                size="sm"
              >
                {syncing ? "Syncing..." : "Sync to Google Sheets"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
