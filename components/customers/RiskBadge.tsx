// ============================================
// RISK BADGE COMPONENT
// ============================================
// Color-coded badge showing customer risk level

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface RiskBadgeProps {
  riskLevel: string;
  className?: string;
}

export default function RiskBadge({ riskLevel, className }: RiskBadgeProps) {
  // Get badge styling based on risk level
  const getBadgeStyle = () => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Show warning icon for high/critical risk
  const showWarning = riskLevel === "high" || riskLevel === "critical";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getBadgeStyle(),
        className
      )}
    >
      {showWarning && <AlertTriangle className="h-3 w-3 mr-1" />}
      {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
    </span>
  );
}