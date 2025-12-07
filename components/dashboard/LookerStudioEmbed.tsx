"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LookerStudioEmbed() {
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("looker_studio_url");
    if (saved) {
      setEmbedUrl(saved);
    }
  }, []);

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

  // Convert embed URL to view URL
  const viewUrl = embedUrl.includes("/embed/")
    ? embedUrl.replace("/embed/reporting/", "/reporting/")
    : embedUrl;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Advanced Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Powered by Looker Studio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/reports")}
        >
          Change
        </Button>
      </div>

      <div className="space-y-4">
        {/* Preview Features */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Risk Trends</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Customer Charts</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <ExternalLink className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Full Reports</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            View Your Complete Dashboard
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Access detailed charts, filters, and interactive analytics
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open(viewUrl, "_blank")}
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Open Looker Studio Dashboard
          </Button>
        </div>
      </div>
    </Card>
  );
}