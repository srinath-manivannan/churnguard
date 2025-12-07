// ============================================
// STATISTICS CARD COMPONENT
// ============================================
// Displays a single statistic with icon and trend

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("border-0 text-white", className)}>
      <CardContent className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center space-x-1 text-sm bg-white/20 px-2 py-1 rounded">
              {trend.isPositive ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm opacity-90">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}