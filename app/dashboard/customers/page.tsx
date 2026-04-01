/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerTable from "@/components/customers/CustomerTable";
import { Search, Plus, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (riskFilter !== "all") params.append("riskLevel", riskFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to load customers", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [riskFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete customer");
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (error: any) {
      toast.error("Delete failed", { description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and analyze your customer base
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard/upload")}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Customers
          </Button>
        </div>
      </div>

      <Card className="p-4 border border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="critical">Critical Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border border-border">
        <CustomerTable
          customers={customers}
          loading={loading}
          onDelete={handleDelete}
          onRefresh={fetchCustomers}
        />
      </Card>

      {!loading && customers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No customers found</p>
          <p className="text-xs text-muted-foreground mb-4">Upload a CSV file to get started</p>
          <Button size="sm" onClick={() => router.push("/dashboard/upload")}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Upload Customer Data
          </Button>
        </div>
      )}
    </div>
  );
}
