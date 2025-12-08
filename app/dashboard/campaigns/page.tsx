/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CAMPAIGNS LIST PAGE
// ============================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, RefreshCw, Send } from "lucide-react";
import { formatDate, formatPercent } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

// ============================================
// ADD RECIPIENTS MODAL COMPONENT (with search)
// ============================================
function AddRecipientsModal({
  campaignId,
  onRecipientsAdded,
}: {
  campaignId: string;
  onRecipientsAdded: () => void;
}) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 search inside modal

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to load customers");
    }
  };

  const handleAddRecipients = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/recipients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerIds: selectedIds }),
      });

      if (res.ok) {
        toast.success("Recipients added successfully!");
        setOpen(false);
        setSelectedIds([]);
        onRecipientsAdded();
      } else {
        toast.error("Failed to add recipients");
      }
    } catch (error) {
      console.error("Failed to add recipients:", error);
      toast.error("Failed to add recipients");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter customers by name / email / riskLevel
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(q) ||
      customer.email?.toLowerCase().includes(q) ||
      customer.riskLevel?.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add Recipients
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Recipients</DialogTitle>
        </DialogHeader>

        {/* 🔍 Search inside recipients modal */}
        <div className="mb-3">
          <Input
            placeholder="Search by name, email, or risk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No customers found. Add customers first.
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recipients match your search.
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(customer.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds((prev) => [...prev, customer.id]);
                    } else {
                      setSelectedIds((prev) =>
                        prev.filter((id) => id !== customer.id)
                      );
                    }
                  }}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">
                    {customer.email}
                  </div>
                </div>
                {customer.riskLevel && (
                  <Badge
                    variant={
                      customer.riskLevel === "high" ||
                      customer.riskLevel === "critical"
                        ? "destructive"
                        : "outline"
                    }
                    className="capitalize"
                  >
                    {customer.riskLevel}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedIds.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRecipients}
              disabled={loading || selectedIds.length === 0}
            >
              {loading ? "Adding..." : "Add Recipients"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN CAMPAIGNS PAGE COMPONENT
// ============================================
export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 search on campaigns table

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/campaigns");
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Send campaign
  const handleSendCampaign = async (
    campaignId: string,
    campaignName: string
  ) => {
    if (!confirm(`Are you sure you want to send "${campaignName}"?`)) return;

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchCampaigns();
      } else {
        toast.error(data.error || "Failed to send campaign");
      }
    } catch (error) {
      console.error("Failed to send campaign:", error);
      toast.error("Failed to send campaign");
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "completed":
        return "bg-green-100 text-green-800";
      case "sending":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 🔍 Filter campaigns by search (name, type, status)
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      campaign.name?.toLowerCase().includes(q) ||
      campaign.type?.toLowerCase().includes(q) ||
      campaign.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">
            Create and manage retention campaigns
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* 🔍 Search box for campaigns */}
          <Input
            placeholder="Search by name, type, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />

          <Button variant="outline" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => router.push("/dashboard/campaigns/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-gray-500">Loading campaigns...</p>
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-gray-500 mb-4">No campaigns yet</p>
                    <Button
                      onClick={() => router.push("/dashboard/campaigns/new")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-gray-500">
                      No campaigns match your search.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const openRate =
                    campaign.sentCount > 0
                      ? (campaign.openedCount / campaign.sentCount) * 100
                      : 0;

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {campaign.type}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{campaign.recipientCount || 0}</TableCell>

                      <TableCell>{campaign.sentCount || 0}</TableCell>

                      <TableCell>{campaign.openedCount || 0}</TableCell>

                      <TableCell>
                        <span
                          className={
                            openRate > 30
                              ? "text-green-600 font-medium"
                              : openRate > 15
                              ? "text-yellow-600"
                              : "text-red-600"
                          }
                        >
                          {formatPercent(openRate)}
                        </span>
                      </TableCell>

                      <TableCell className="text-sm text-gray-600">
                        {formatDate(campaign.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <AddRecipientsModal
                            campaignId={campaign.id}
                            onRecipientsAdded={fetchCampaigns}
                          />

                          {campaign.status === "draft" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                handleSendCampaign(
                                  campaign.id,
                                  campaign.name
                                )
                              }
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/campaigns/${campaign.id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
