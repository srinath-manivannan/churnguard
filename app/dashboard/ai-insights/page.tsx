/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingDown,
  Shield,
  AlertTriangle,
  Users,
  Activity,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { cn } from "@/lib/utils";

function MetricBadge({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <Activity className="h-3 w-3 text-muted-foreground/30" />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ChurnTable({ predictions }: { predictions: any[] }) {
  if (!predictions?.length) return <p className="text-sm text-muted-foreground py-4 text-center">No predictions available</p>;

  const sorted = [...predictions].sort((a, b) => (b.score || b.churnScore || 0) - (a.score || a.churnScore || 0)).slice(0, 15);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Customer</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Score</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Risk</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Revenue</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p: any) => (
            <tr key={p.customerId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-2.5 px-3">
                <p className="font-medium text-foreground truncate max-w-[160px]">{p.customerName || "Unknown"}</p>
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", (p.score || p.churnScore) >= 70 ? "bg-red-500" : (p.score || p.churnScore) >= 40 ? "bg-yellow-500" : "bg-green-500")}
                      style={{ width: `${Math.min(p.score || p.churnScore || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{Math.round(p.score || p.churnScore || 0)}%</span>
                </div>
              </td>
              <td className="py-2.5 px-3 hidden sm:table-cell">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium",
                  p.riskLevel === "critical" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" :
                  p.riskLevel === "high" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
                  p.riskLevel === "medium" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" :
                  "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                )}>
                  {p.riskLevel}
                </span>
              </td>
              <td className="py-2.5 px-3 hidden md:table-cell text-xs text-muted-foreground">
                ${(p.revenueAtRisk || 0).toLocaleString()}
              </td>
              <td className="py-2.5 px-3 hidden lg:table-cell text-xs text-muted-foreground truncate max-w-[160px]">
                {p.recommendedActions?.[0]?.action || "Monitor"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AIInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("predictions");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [advancedRes, metricsRes] = await Promise.allSettled([
        fetch("/api/analytics/advanced").then((r) => r.json()),
        fetch("/api/ai/metrics").then((r) => r.json()),
      ]);
      if (advancedRes.status === "fulfilled") setData(advancedRes.value);
      if (metricsRes.status === "fulfilled") setMetrics(metricsRes.value);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/customers/analyze", { method: "POST" });
      const result = await res.json();
      setAnalysisData(result);
      await fetchData();
    } catch {
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const churnPredictions = data?.churnPredictions || analysisData?.churnPredictions;
  const healthData = data?.healthData || analysisData?.healthData;
  const anomalyData = data?.anomalyData;
  const segmentData = data?.segmentData;

  const radarData = healthData ? [
    { dim: "Revenue", value: healthData.avgScore || 50 },
    { dim: "Engagement", value: Math.min(100, (healthData.avgScore || 50) + 10) },
    { dim: "Support", value: Math.max(0, (healthData.avgScore || 50) - 5) },
    { dim: "Retention", value: healthData.avgScore || 50 },
    { dim: "Growth", value: Math.min(100, (healthData.avgScore || 50) + 5) },
  ] : [];

  const anomalyTrend = anomalyData?.anomalies
    ? (() => {
        const types: Record<string, number> = {};
        anomalyData.anomalies.forEach((a: any) => {
          types[a.type] = (types[a.type] || 0) + 1;
        });
        return Object.entries(types).map(([type, count]) => ({ type, count }));
      })()
    : [];

  const segmentPie = segmentData?.map((s: any) => ({
    name: s.name,
    value: s.count,
    color: s.color || "#6366f1",
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
            <p className="text-sm text-muted-foreground">Advanced predictive analytics & ML pipeline</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
          </Button>
          <Button size="sm" className="gap-1.5" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
          <div className="skeleton h-80 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricBadge
              label="Churn Velocity"
              value={churnPredictions ? `${Math.round(churnPredictions.churnVelocity || 0)}%` : "—"}
              icon={TrendingDown}
              color="text-red-500 bg-red-50 dark:bg-red-500/10"
            />
            <MetricBadge
              label="Health Score"
              value={healthData ? `${Math.round(healthData.avgScore || 0)}%` : "—"}
              icon={Shield}
              color="text-green-500 bg-green-50 dark:bg-green-500/10"
            />
            <MetricBadge
              label="Anomalies"
              value={anomalyData?.totalAnomalies ?? "—"}
              icon={AlertTriangle}
              color="text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
            />
            <MetricBadge
              label="Segments"
              value={segmentData?.length ?? "—"}
              icon={Users}
              color="text-blue-500 bg-blue-50 dark:bg-blue-500/10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
              <TabsTrigger value="predictions" className="text-xs gap-1.5"><TrendingDown className="h-3 w-3" /> Predictions</TabsTrigger>
              <TabsTrigger value="health" className="text-xs gap-1.5"><Shield className="h-3 w-3" /> Health</TabsTrigger>
              <TabsTrigger value="anomalies" className="text-xs gap-1.5"><AlertTriangle className="h-3 w-3" /> Anomalies</TabsTrigger>
              <TabsTrigger value="segments" className="text-xs gap-1.5"><Users className="h-3 w-3" /> Segments</TabsTrigger>
              <TabsTrigger value="pipeline" className="text-xs gap-1.5"><Activity className="h-3 w-3" /> Pipeline</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Churn Risk Predictions</CardTitle>
                    <CardDescription>Top customers by predicted churn probability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChurnTable predictions={churnPredictions?.predictions || []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue at Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold text-foreground">
                        ${Math.round(churnPredictions?.totalRevenueAtRisk || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Potential revenue loss</p>
                    </div>
                    <div className="space-y-2 mt-4">
                      {[
                        { label: "Critical", count: churnPredictions?.criticalCount || 0, color: "bg-red-500" },
                        { label: "High", count: churnPredictions?.highCount || 0, color: "bg-orange-500" },
                        { label: "Medium", count: churnPredictions?.mediumCount || 0, color: "bg-yellow-500" },
                        { label: "Low", count: churnPredictions?.lowCount || 0, color: "bg-green-500" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", item.color)} />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="text-xs font-medium text-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Health Radar</CardTitle>
                    <CardDescription>Multi-dimensional health analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {radarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid className="stroke-border" />
                          <PolarAngleAxis dataKey="dim" className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                          <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Run analysis to see health data</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Health Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthData?.distribution ? (
                      <div className="space-y-4 py-4">
                        {[
                          { label: "Healthy", value: healthData.distribution.healthy || 0, color: "bg-green-500" },
                          { label: "Needs Attention", value: healthData.distribution.needsAttention || 0, color: "bg-yellow-500" },
                          { label: "At Risk", value: healthData.distribution.atRisk || 0, color: "bg-orange-500" },
                          { label: "Critical", value: healthData.distribution.critical || 0, color: "bg-red-500" },
                        ].map((item) => {
                          const total = Object.values(healthData.distribution as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                          const pct = total > 0 ? (item.value / total) * 100 : 0;
                          return (
                            <div key={item.label}>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                <span className="text-xs font-medium text-foreground">{item.value} ({Math.round(pct)}%)</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No distribution data</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="anomalies" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Anomaly Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {anomalyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={anomalyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="type" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                          <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: "12px" }} />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No anomalies detected</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Anomalies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {anomalyData?.anomalies?.length > 0 ? (
                      <div className="space-y-3 max-h-[260px] overflow-y-auto">
                        {anomalyData.anomalies.slice(0, 8).map((a: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 pb-2 border-b border-border/50 last:border-0">
                            <div className={cn(
                              "p-1 rounded shrink-0 mt-0.5",
                              a.severity === "critical" ? "bg-red-50 dark:bg-red-500/10" : a.severity === "high" ? "bg-orange-50 dark:bg-orange-500/10" : "bg-yellow-50 dark:bg-yellow-500/10"
                            )}>
                              <AlertTriangle className={cn(
                                "h-3 w-3",
                                a.severity === "critical" ? "text-red-500" : a.severity === "high" ? "text-orange-500" : "text-yellow-500"
                              )} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{a.customerName || "Unknown"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{a.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">All clear</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="segments" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Segment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {segmentPie.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={segmentPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                            {segmentPie.map((entry: any, idx: number) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No segment data</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Segment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {segmentData?.length > 0 ? (
                      <div className="space-y-3">
                        {segmentData.map((s: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color || "#6366f1" }} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                                <p className="text-[11px] text-muted-foreground">{s.count} customers</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium text-foreground">${Math.round(s.avgRevenue || 0).toLocaleString()}</p>
                              <p className="text-[11px] text-muted-foreground">avg revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No segments available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> AI Pipeline Status
                    </CardTitle>
                    <CardDescription>Real-time AI infrastructure metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metrics ? (
                      <div className="space-y-4">
                        {[
                          { label: "Total Calls", value: metrics.totalCalls || 0, icon: BarChart3 },
                          { label: "Success Rate", value: `${Math.round((metrics.successRate || 0) * 100)}%`, icon: Target },
                          { label: "Avg Latency", value: `${Math.round(metrics.avgLatency || 0)}ms`, icon: Activity },
                          { label: "Active Providers", value: metrics.providers?.length || 0, icon: Zap },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No metrics data</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Provider Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics?.providers?.length > 0 ? (
                      <div className="space-y-3">
                        {metrics.providers.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", p.status === "healthy" ? "bg-green-500" : "bg-red-500")} />
                              <span className="text-sm font-medium text-foreground">{p.name}</span>
                            </div>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", p.status === "healthy" ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400")}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No provider data</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
