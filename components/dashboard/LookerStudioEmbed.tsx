/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LookerStudioEmbed() {
  // Initialize from localStorage (no ESLint warning!)
  const [embedUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("looker_studio_url") || "";
    }
    return "";
  });

  const router = useRouter();

  if (!embedUrl) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Analytics Dashboard
        </h2>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">📊 Advanced Analytics</p>
            <p className="text-sm text-gray-400">
              Connect your Looker Studio report for detailed insights
            </p>
            <Button onClick={() => router.push("/dashboard/reports")}>
              Connect Looker Studio
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Convert view URL to embed URL if needed
  const displayUrl = embedUrl.includes("/embed/")
    ? embedUrl
    : embedUrl.replace("/reporting/", "/embed/reporting/");

  // Convert embed URL to view URL for full screen
  const viewUrl = embedUrl.includes("/embed/")
    ? embedUrl.replace("/embed/reporting/", "/reporting/")
    : embedUrl;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Advanced Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Powered by Looker Studio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(viewUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/reports")}
          >
            Change
          </Button>
        </div>
      </div>

      {/* Embedded Dashboard */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <iframe
          src={displayUrl}
          className="w-full h-[600px] border-0"
          allowFullScreen
          loading="lazy"
          title="Looker Studio Analytics Dashboard"
        />
      </div>

      {/* Tip */}
      <div className="mt-4 bg-blue-100 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Click "Full Screen" to view with all interactive features and filters.
        </p>
      </div>
    </Card>
  );
}