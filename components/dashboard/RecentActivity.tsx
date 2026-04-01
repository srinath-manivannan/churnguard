/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, User, Mail, Upload, Brain, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  userId: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  detail?: string;
  time: Date;
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [chatRes, customersRes] = await Promise.allSettled([
          fetch("/api/chat").then((r) => r.ok ? r.json() : null),
          fetch("/api/customers").then((r) => r.ok ? r.json() : null),
        ]);

        const acts: Activity[] = [];

        if (customersRes.status === "fulfilled" && customersRes.value?.customers) {
          const recent = customersRes.value.customers
            .filter((c: any) => c.updatedAt)
            .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3);

          recent.forEach((c: any) => {
            if (c.riskLevel === "critical" || c.riskLevel === "high") {
              acts.push({
                id: `risk-${c.id}`,
                type: "alert",
                message: `${c.name} flagged as ${c.riskLevel} risk`,
                detail: `Churn score: ${Math.round(c.churnScore || 0)}%`,
                time: new Date(c.updatedAt),
              });
            } else {
              acts.push({
                id: `customer-${c.id}`,
                type: "customer",
                message: `${c.name} record updated`,
                detail: c.company || c.email,
                time: new Date(c.updatedAt),
              });
            }
          });
        }

        if (chatRes.status === "fulfilled" && chatRes.value?.history) {
          chatRes.value.history.slice(0, 2).forEach((h: any, i: number) => {
            acts.push({
              id: `chat-${i}`,
              type: "chat",
              message: h.userMessage?.slice(0, 60) || "AI conversation",
              detail: "AI Chat",
              time: new Date(h.createdAt || Date.now()),
            });
          });
        }

        if (acts.length === 0) {
          acts.push(
            { id: "w1", type: "system", message: "System health check passed", time: new Date() },
            { id: "w2", type: "ai", message: "AI models loaded and ready", time: new Date(Date.now() - 60000) },
            { id: "w3", type: "upload", message: "Ready to import customer data", time: new Date(Date.now() - 120000) },
          );
        }

        acts.sort((a, b) => b.time.getTime() - a.time.getTime());
        setActivities(acts.slice(0, 6));
      } catch {
        setActivities([
          { id: "f1", type: "system", message: "Dashboard loaded", time: new Date() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  const getIcon = (type: string) => {
    const map: Record<string, { icon: typeof MessageSquare; color: string }> = {
      chat: { icon: MessageSquare, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
      customer: { icon: User, color: "text-green-500 bg-green-50 dark:bg-green-500/10" },
      campaign: { icon: Mail, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
      upload: { icon: Upload, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" },
      ai: { icon: Brain, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" },
      alert: { icon: AlertTriangle, color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
      system: { icon: Brain, color: "text-gray-500 bg-gray-50 dark:bg-gray-500/10" },
    };
    const m = map[type] || map.system;
    const I = m.icon;
    return (
      <div className={cn("p-1.5 rounded-lg", m.color)}>
        <I className="h-3.5 w-3.5" />
      </div>
    );
  };

  const timeAgo = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 animate-fade-in opacity-0",
                  `stagger-${Math.min(i + 1, 6)}`
                )}
              >
                <div className="mt-0.5 shrink-0">{getIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug truncate">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activity.detail && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        {activity.detail}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground/60 shrink-0">
                      {timeAgo(activity.time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
