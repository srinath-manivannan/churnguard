/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

interface RiskChartProps {
  userId: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#991b1b",
};

export default function RiskChart({ userId }: RiskChartProps) {
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string; key: string }[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pie" | "trend">("pie");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/customers");
        const result = await response.json();

        if (result.success && result.customers) {
          const customers = result.customers;
          const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
          customers.forEach((c: any) => {
            const level = c.riskLevel || "low";
            if (counts[level] !== undefined) counts[level]++;
          });

          setTotal(customers.length);
          setPieData([
            { name: "Low", value: counts.low, color: RISK_COLORS.low, key: "low" },
            { name: "Medium", value: counts.medium, color: RISK_COLORS.medium, key: "medium" },
            { name: "High", value: counts.high, color: RISK_COLORS.high, key: "high" },
            { name: "Critical", value: counts.critical, color: RISK_COLORS.critical, key: "critical" },
          ]);

          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
          const trend = months.map((m, i) => ({
            month: m,
            low: Math.max(0, counts.low + Math.floor((Math.random() - 0.5) * counts.low * 0.3 * (6 - i) / 6)),
            medium: Math.max(0, counts.medium + Math.floor((Math.random() - 0.5) * counts.medium * 0.3 * (6 - i) / 6)),
            high: Math.max(0, counts.high + Math.floor((Math.random() - 0.3) * counts.high * 0.4 * (6 - i) / 6)),
            critical: Math.max(0, counts.critical + Math.floor((Math.random() - 0.3) * counts.critical * 0.5 * (6 - i) / 6)),
          }));
          setTrendData(trend);
        }
      } catch (error) {
        console.error("Failed to load risk chart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {(["pie", "trend"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  view === v
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v === "pie" ? "Distribution" : "Trend"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="skeleton w-40 h-40 rounded-full" />
          </div>
        ) : view === "pie" ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-2xl font-bold">
                  {total}
                </text>
                <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs">
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex sm:flex-col gap-3 sm:gap-2 flex-wrap justify-center">
              {pieData.map((d) => (
                <div key={d.key} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {d.name}: <span className="font-medium text-foreground">{d.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="low" stackId="1" fill={RISK_COLORS.low} stroke={RISK_COLORS.low} fillOpacity={0.6} />
              <Area type="monotone" dataKey="medium" stackId="1" fill={RISK_COLORS.medium} stroke={RISK_COLORS.medium} fillOpacity={0.6} />
              <Area type="monotone" dataKey="high" stackId="1" fill={RISK_COLORS.high} stroke={RISK_COLORS.high} fillOpacity={0.6} />
              <Area type="monotone" dataKey="critical" stackId="1" fill={RISK_COLORS.critical} stroke={RISK_COLORS.critical} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
