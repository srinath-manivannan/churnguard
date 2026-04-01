import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getDashboardStats } from "@/lib/db/queries";
import StatsCard from "@/components/dashboard/StatsCard";
import RiskChart from "@/components/dashboard/RiskChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AdvancedInsightsPreview from "@/components/dashboard/AdvancedInsightsPreview";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);

  const retentionRate = stats.totalCustomers > 0
    ? Math.round(((stats.totalCustomers - stats.highRiskCount) / stats.totalCustomers) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered customer retention intelligence
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          iconName="Users"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="High Risk"
          value={stats.highRiskCount}
          iconName="AlertTriangle"
          trend={{ value: 8, isPositive: false }}
          subtitle="Need attention"
        />
        <StatsCard
          title="Revenue at Risk"
          value={`$${Math.round(stats.revenueAtRisk).toLocaleString()}`}
          iconName="DollarSign"
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          iconName="Mail"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Retention Rate"
          value={`${retentionRate}%`}
          iconName="TrendingUp"
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Health Score"
          value={retentionRate >= 80 ? "Good" : retentionRate >= 60 ? "Fair" : "Poor"}
          iconName="ShieldCheck"
          subtitle={`${retentionRate}% healthy`}
        />
      </div>

      <AdvancedInsightsPreview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskChart userId={session.user.id} />
        <RecentActivity userId={session.user.id} />
      </div>
    </div>
  );
}
