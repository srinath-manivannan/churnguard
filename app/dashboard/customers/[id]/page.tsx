/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  MessageSquare,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  segment: string;
  status: string;
  lastActivityDate: string;
  totalRevenue: number;
  supportTickets: number;
  churnScore: number;
  riskLevel: string;
  riskFactors: string;
  createdAt: string;
  updatedAt: string;
}

function MetricCard({ label, value, icon: Icon, trend, color }: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <span className="text-[11px] text-muted-foreground">{trend}</span>
        )}
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
    high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    critical: "bg-red-100 text-red-900 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", styles[level] || styles.low)}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
}

function TimelineItem({ icon: Icon, title, detail, time, color }: {
  icon: any; title: string; detail?: string; time: string; color: string;
}) {
  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={cn("p-1.5 rounded-lg shrink-0", color)}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="w-px flex-1 bg-border group-last:bg-transparent mt-1" />
      </div>
      <div className="pb-5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
        <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" /> {time}
        </p>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${params.id}`);
        const data = await res.json();
        if (data.success !== false) {
          setCustomer(data.customer || data);
        }
      } catch (err) {
        console.error("Failed to load customer:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchCustomer();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Customer Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">The customer you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push("/dashboard/customers")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Customers
        </Button>
      </div>
    );
  }

  const healthScore = Math.max(0, 100 - (customer.churnScore || 0));
  const riskFactors = customer.riskFactors ? JSON.parse(customer.riskFactors) : [];
  const daysActive = customer.createdAt
    ? Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const timelineEvents = [
    {
      icon: Activity,
      title: "Last Activity",
      detail: customer.lastActivityDate || "No recent activity",
      time: customer.lastActivityDate || "N/A",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    },
    {
      icon: AlertTriangle,
      title: `Risk Level: ${customer.riskLevel}`,
      detail: `Churn score: ${Math.round(customer.churnScore || 0)}%`,
      time: new Date(customer.updatedAt || Date.now()).toLocaleDateString(),
      color: customer.riskLevel === "high" || customer.riskLevel === "critical"
        ? "text-red-500 bg-red-50 dark:bg-red-500/10"
        : "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10",
    },
    {
      icon: DollarSign,
      title: `Revenue: $${(customer.totalRevenue || 0).toLocaleString()}`,
      detail: customer.segment ? `Segment: ${customer.segment}` : undefined,
      time: "Lifetime",
      color: "text-green-500 bg-green-50 dark:bg-green-500/10",
    },
    {
      icon: MessageSquare,
      title: `${customer.supportTickets || 0} Support Tickets`,
      detail: customer.supportTickets && customer.supportTickets > 5 ? "High support usage" : "Normal support usage",
      time: "All time",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
    },
    {
      icon: Calendar,
      title: "Customer Since",
      detail: `Active for ${daysActive} days`,
      time: new Date(customer.createdAt || Date.now()).toLocaleDateString(),
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/customers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">{customer.name}</h1>
            <RiskBadge level={customer.riskLevel || "low"} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {customer.company && `${customer.company} · `}{customer.email || "No email"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Health Score"
          value={`${healthScore}%`}
          icon={Shield}
          color={healthScore >= 70 ? "text-green-500 bg-green-50 dark:bg-green-500/10" : healthScore >= 40 ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "text-red-500 bg-red-50 dark:bg-red-500/10"}
        />
        <MetricCard
          label="Total Revenue"
          value={`$${(customer.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={customer.totalRevenue > 1000 ? "Above avg" : "Below avg"}
          color="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard
          label="Churn Risk"
          value={`${Math.round(customer.churnScore || 0)}%`}
          icon={customer.churnScore > 50 ? TrendingDown : TrendingUp}
          color={customer.churnScore > 70 ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"}
        />
        <MetricCard
          label="Support Tickets"
          value={customer.supportTickets || 0}
          icon={MessageSquare}
          color="text-purple-500 bg-purple-50 dark:bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {[
                { icon: Mail, label: "Email", value: customer.email },
                { icon: Phone, label: "Phone", value: customer.phone },
                { icon: Building2, label: "Company", value: customer.company },
                { icon: Activity, label: "Segment", value: customer.segment },
                { icon: Calendar, label: "Member Since", value: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A" },
                { icon: Clock, label: "Last Activity", value: customer.lastActivityDate || "N/A" },
              ].map((field) => (
                <div key={field.label} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-muted shrink-0 mt-0.5">
                    <field.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium text-foreground truncate">{field.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>

            {riskFactors.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3">Risk Factors</p>
                <div className="flex flex-wrap gap-2">
                  {riskFactors.map((factor: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs rounded-full border border-red-200 dark:border-red-500/20">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineEvents.map((event, i) => (
              <TimelineItem key={i} {...event} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => router.push("/dashboard/chat")}>
          <MessageSquare className="h-3.5 w-3.5" /> Ask AI About Customer
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => router.push("/dashboard/campaigns/new")}>
          <Mail className="h-3.5 w-3.5" /> Create Campaign
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" /> View Full History
        </Button>
      </div>
    </div>
  );
}
