/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CUSTOMERS LIST PAGE
// ============================================
// Displays all customers with filtering and search

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerTable from "@/components/customers/CustomerTable";
import { Search, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (riskFilter !== "all") {
        params.append("riskLevel", riskFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      // Fetch from API
      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Failed to fetch customers:", error);
      toast({
        variant: "destructive",
        title: "Failed to load customers",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [riskFilter]); // Reload when filter changes

  // Handle search (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle delete customer
  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      toast({
        title: "Customer deleted",
        description: "Customer has been removed successfully",
      });

      // Refresh list
      fetchCustomers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">
            Manage and analyze your customer base
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={fetchCustomers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push("/dashboard/upload")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customers
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Risk Level Filter */}
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full md:w-48">
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

      {/* Customer Table */}
      <Card>
        <CustomerTable
          customers={customers}
          loading={loading}
          onDelete={handleDelete}
          onRefresh={fetchCustomers}
        />
      </Card>

      {/* Empty State */}
      {!loading && customers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No customers found</p>
          <Button onClick={() => router.push("/dashboard/upload")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Customer Data
          </Button>
        </div>
      )}
    </div>
  );
}

