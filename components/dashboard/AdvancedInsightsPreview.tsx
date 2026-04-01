/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Activity, AlertTriangle, Users, TrendingDown, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvancedInsightsPreview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((result) => setData(result))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.advanced) return null;

  const { churnPredictions, healthData, anomalyData, segmentData } = data.advanced;
  if (!churnPredictions && !healthData) return null;

  const insights = [
    healthData && {
      label: "Health Score",
      value: `${Math.round(healthData.avgScore)}%`,
      icon: ShieldCheck,
      color: healthData.avgScore >= 70 ? "text-green-500" : healthData.avgScore >= 50 ? "text-yellow-500" : "text-red-500",
      bg: healthData.avgScore >= 70 ? "bg-green-50 dark:bg-green-500/10" : healthData.avgScore >= 50 ? "bg-yellow-50 dark:bg-yellow-500/10" : "bg-red-50 dark:bg-red-500/10",
      detail: `${healthData.distribution?.healthy || 0} healthy`,
    },
    churnPredictions && {
      label: "Churn Velocity",
      value: `${Math.round(churnPredictions.churnVelocity)}%`,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      detail: `$${Math.round(churnPredictions.totalRevenueAtRisk || 0).toLocaleString()} at risk`,
    },
    anomalyData && {
      label: "Anomalies",
      value: anomalyData.totalAnomalies,
      icon: AlertTriangle,
      color: anomalyData.criticalCount > 0 ? "text-red-500" : "text-yellow-500",
      bg: anomalyData.criticalCount > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-yellow-50 dark:bg-yellow-500/10",
      detail: `${anomalyData.affectedCustomers} customers`,
    },
    segmentData?.length > 0 && {
      label: "Top Segment",
      value: segmentData[0].name,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      detail: `${segmentData[0].count} customers`,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">AI-Powered Insights</h2>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10">
            <Zap className="h-3 w-3 text-green-500" />
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Live</span>
          </div>
        </div>
        <Link href="/dashboard/ai-insights">
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((item: any, i: number) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className={cn(
                "border border-border hover:border-primary/20 transition-all duration-200 cursor-default animate-fade-in opacity-0",
                `stagger-${i + 1}`
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn("p-1.5 rounded-lg", item.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", item.color)} />
                  </div>
                  <Activity className="h-3 w-3 text-muted-foreground/40" />
                </div>
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
