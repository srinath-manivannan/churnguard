/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CUSTOMER TABLE COMPONENT
// ============================================
// Displays customers in a sortable, filterable table

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RiskBadge from "./RiskBadge";
import { MoreVertical, Eye, Trash2, Mail } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface CustomerTableProps {
  customers: any[];
  loading: boolean;
  onDelete: (customerId: string) => void;
  onRefresh: () => void;
}

export default function CustomerTable({
  customers,
  loading,
  onDelete,
  onRefresh,
}: CustomerTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<string>("churnScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Sort customers
  const sortedCustomers = [...customers].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle null/undefined
    if (aVal === null || aVal === undefined) aVal = 0;
    if (bVal === null || bVal === undefined) bVal = 0;

    // Compare
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle view customer
  const handleView = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("name")}
            >
              Name
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Segment</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("churnScore")}
            >
              Churn Score
            </TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort("totalRevenue")}
            >
              Revenue
            </TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-gray-50">
              {/* Name */}
              <TableCell className="font-medium">
                <div>
                  <p className="text-gray-900">{customer.name}</p>
                  {customer.company && (
                    <p className="text-xs text-gray-500">{customer.company}</p>
                  )}
                </div>
              </TableCell>

              {/* Contact */}
              <TableCell>
                <div className="text-sm">
                  {customer.email && (
                    <p className="text-gray-900">{customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-gray-500">{customer.phone}</p>
                  )}
                </div>
              </TableCell>

              {/* Segment */}
              <TableCell>
                {customer.segment ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {customer.segment}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>

              {/* Churn Score */}
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div
                      className={`h-2 rounded-full ${
                        customer.churnScore >= 70
                          ? "bg-red-600"
                          : customer.churnScore >= 40
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${customer.churnScore || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {customer.churnScore || 0}
                  </span>
                </div>
              </TableCell>

              {/* Risk Level */}
              <TableCell>
                <RiskBadge riskLevel={customer.riskLevel || "low"} />
              </TableCell>

              {/* Revenue */}
              <TableCell>
                <span className="font-medium text-gray-900">
                  {formatCurrency(customer.totalRevenue || 0)}
                </span>
              </TableCell>

              {/* Last Activity */}
              <TableCell>
                <span className="text-sm text-gray-600">
                  {customer.lastActivityDate
                    ? formatDate(customer.lastActivityDate)
                    : "Never"}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(customer.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(customer.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}