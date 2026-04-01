"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface Segment {
  name: string;
  count: number;
  avgRevenue: number;
  color: string;
}

interface SegmentChartProps {
  segments: Segment[];
}

export default function SegmentChart({ segments }: SegmentChartProps) {
  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No segment data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Customer Segments (RFM)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={segments} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={75}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "count") return [value, "Customers"];
                return [value, name];
              }}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
