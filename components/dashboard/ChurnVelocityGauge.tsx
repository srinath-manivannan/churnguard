"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChurnVelocityGaugeProps {
  velocity: number;
  totalRevenueAtRisk: number;
  criticalCount: number;
  highCount: number;
}

export default function ChurnVelocityGauge({
  velocity,
  totalRevenueAtRisk,
  criticalCount,
  highCount,
}: ChurnVelocityGaugeProps) {
  const getVelocityStatus = () => {
    if (velocity >= 40) return { label: "Critical", color: "text-red-600", bg: "bg-red-500" };
    if (velocity >= 25) return { label: "High", color: "text-orange-600", bg: "bg-orange-500" };
    if (velocity >= 15) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-500" };
    return { label: "Healthy", color: "text-emerald-600", bg: "bg-emerald-500" };
  };

  const status = getVelocityStatus();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          Churn Velocity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <span className={cn("text-4xl font-bold", status.color)}>
              {velocity}%
            </span>
            <span className={cn("text-sm font-medium mb-1", status.color)}>
              {status.label}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn("h-2.5 rounded-full transition-all", status.bg)}
              style={{ width: `${Math.min(100, velocity)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-500">Revenue at Risk</p>
              <p className="text-lg font-semibold text-gray-900">
                ${totalRevenueAtRisk.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Critical / High</p>
              <p className="text-lg font-semibold text-gray-900">
                {criticalCount} / {highCount}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
