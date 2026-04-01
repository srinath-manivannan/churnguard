"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  score: number;
  grade: string;
  alertCount: number;
  distribution?: Record<string, number>;
}

const gradeColors: Record<string, string> = {
  A: "text-emerald-600",
  B: "text-blue-600",
  C: "text-yellow-600",
  D: "text-orange-600",
  F: "text-red-600",
};

const gradeBg: Record<string, string> = {
  A: "from-emerald-500 to-emerald-600",
  B: "from-blue-500 to-blue-600",
  C: "from-yellow-500 to-yellow-600",
  D: "from-orange-500 to-orange-600",
  F: "from-red-500 to-red-600",
};

export default function HealthScoreCard({
  score,
  grade,
  alertCount,
  distribution,
}: HealthScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          Customer Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-20 w-20 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
              gradeBg[grade] || gradeBg.C
            )}
          >
            <div className="text-center">
              <div className="text-2xl font-bold">{grade}</div>
              <div className="text-xs opacity-90">{score}/100</div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {distribution && (
              <div className="flex gap-1 h-3">
                {Object.entries(distribution).map(([g, count]) =>
                  count > 0 ? (
                    <div
                      key={g}
                      className={cn(
                        "rounded-full transition-all",
                        g === "A" && "bg-emerald-500",
                        g === "B" && "bg-blue-500",
                        g === "C" && "bg-yellow-500",
                        g === "D" && "bg-orange-500",
                        g === "F" && "bg-red-500"
                      )}
                      style={{
                        width: `${(count / Object.values(distribution).reduce((a, b) => a + b, 0)) * 100}%`,
                      }}
                      title={`${g}: ${count}`}
                    />
                  ) : null
                )}
              </div>
            )}

            {distribution && (
              <div className="flex gap-3 text-xs text-gray-500">
                {Object.entries(distribution)
                  .filter(([, v]) => v > 0)
                  .map(([g, count]) => (
                    <span key={g} className={cn("font-medium", gradeColors[g])}>
                      {g}: {count}
                    </span>
                  ))}
              </div>
            )}

            {alertCount > 0 && (
              <p className="text-xs text-orange-600 font-medium">
                {alertCount} alert{alertCount > 1 ? "s" : ""} require attention
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
