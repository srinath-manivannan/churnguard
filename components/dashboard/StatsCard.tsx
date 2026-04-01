"use client";

import {
  Users,
  AlertTriangle,
  DollarSign,
  Mail,
  TrendingUp,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Users,
  AlertTriangle,
  DollarSign,
  Mail,
  TrendingUp,
  ShieldCheck,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  iconName,
  trend,
  subtitle,
  className,
}: StatsCardProps) {
  const Icon = iconMap[iconName] || Users;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

      <div className="flex items-start justify-between mb-3 relative">
        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
              trend.isPositive
                ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
            )}
          >
            {trend.isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="relative">
        <p className="text-2xl font-bold text-foreground tracking-tight animate-count-up">
          {value}
        </p>
        <p className="text-xs font-medium text-muted-foreground mt-1">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
