"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3 } from "lucide-react";

export default function LookerStudioEmbed() {
  const lookerUrl = process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL;

  if (!lookerUrl) {
    return (
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 rounded-full p-3">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Looker Studio Analytics
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Connect Looker Studio for advanced visualizations
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/dashboard/reports"}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Setup Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white">
            Looker Studio Dashboard
          </h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(lookerUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Full Screen
        </Button>
      </div>
      
      <div className="h-[600px] bg-gray-50">
        <iframe
          src={lookerUrl}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </Card>
  );
}