"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface Anomaly {
  type: string;
  severity: string;
  customerName: string;
  description: string;
  suggestedAction: string;
}

interface AnomalyFeedProps {
  anomalies: Anomaly[];
}

const severityConfig: Record<string, { icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  high: { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
  medium: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  low: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function AnomalyFeed({ anomalies }: AnomalyFeedProps) {
  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Anomaly Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-400">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No anomalies detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Anomaly Detection</CardTitle>
          <span className="text-xs text-gray-500">
            {anomalies.length} detected
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {anomalies.slice(0, 8).map((anomaly, index) => {
          const config = severityConfig[anomaly.severity] || severityConfig.low;
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={cn("rounded-lg p-3 border", config.bg, "border-transparent")}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold uppercase", config.color)}>
                      {anomaly.severity}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {anomaly.customerName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">
                    {anomaly.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    → {anomaly.suggestedAction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
