/* eslint-disable react/no-unescaped-entities */
// ============================================
// DASHBOARD HOME PAGE
// ============================================

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getDashboardStats } from "@/lib/db/queries";
import StatsCard from "@/components/dashboard/StatsCard";
import RiskChart from "@/components/dashboard/RiskChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LookerStudioEmbed from "@/components/dashboard/LookerStudioEmbed";
import { Users, AlertTriangle, DollarSign, Mail } from "lucide-react";

export default async function DashboardPage() {
  // Get session
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // Get dashboard statistics
  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's an overview of your customer retention metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          className="bg-gradient-to-br from-blue-500 to-blue-600"
        />

        {/* High Risk Customers */}
        <StatsCard
          title="High Risk"
          value={stats.highRiskCount}
          icon={AlertTriangle}
          trend={{ value: 8, isPositive: false }}
          className="bg-gradient-to-br from-red-500 to-red-600"
        />

        {/* Revenue at Risk */}
        <StatsCard
          title="Revenue at Risk"
          value={`$${Math.round(stats.revenueAtRisk).toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: false }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />

        {/* Active Campaigns */}
        <StatsCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          icon={Mail}
          trend={{ value: 5, isPositive: true }}
          className="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <RiskChart userId={session.user.id} />

        {/* Recent Activity */}
        <RecentActivity userId={session.user.id} />
      </div>

      {/* Looker Studio Dashboard */}
      <LookerStudioEmbed />
    </div>
  );
}