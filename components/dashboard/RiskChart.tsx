/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// RISK DISTRIBUTION CHART (FIXED)
// ============================================
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface RiskChartProps {
  userId: string;
}

export default function RiskChart({ userId }: RiskChartProps) {
  const [data, setData] = useState([
    { name: "Low Risk", value: 0, color: "#10b981" },
    { name: "Medium Risk", value: 0, color: "#f59e0b" },
    { name: "High Risk", value: 0, color: "#ef4444" },
    { name: "Critical Risk", value: 0, color: "#dc2626" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer risk distribution
    const fetchData = async () => {
      try {
        const response = await fetch("/api/customers");
        const result = await response.json();
        
        if (result.success) {
          const customers = result.customers;

          // Count customers by risk level
          const riskCounts = {
            low: customers.filter((c: any) => c.riskLevel === "low").length,
            medium: customers.filter((c: any) => c.riskLevel === "medium").length,
            high: customers.filter((c: any) => c.riskLevel === "high").length,
            critical: customers.filter((c: any) => c.riskLevel === "critical").length,
          };

          setData([
            { name: "Low Risk", value: riskCounts.low, color: "#10b981" },
            { name: "Medium Risk", value: riskCounts.medium, color: "#f59e0b" },
            { name: "High Risk", value: riskCounts.high, color: "#ef4444" },
            { name: "Critical Risk", value: riskCounts.critical, color: "#dc2626" },
          ]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load risk chart:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading chart...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  typeof percent === 'number'
                    ? `${name}: ${(percent * 100).toFixed(0)}%`
                    : `${name}: 0%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}