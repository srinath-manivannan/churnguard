/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RiskBadge from "./RiskBadge";
import { MoreVertical, Eye, Trash2, Mail, ArrowUpDown } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  customers: any[];
  loading: boolean;
  onDelete: (customerId: string) => void;
  onRefresh: () => void;
}

export default function CustomerTable({ customers, loading, onDelete }: CustomerTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<string>("churnScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedCustomers = [...customers].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-4 w-40 rounded hidden sm:block" />
            <div className="skeleton h-4 w-20 rounded hidden md:block" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded hidden lg:block" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
              <span className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="hidden sm:table-cell">Contact</TableHead>
            <TableHead className="hidden md:table-cell">Segment</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("churnScore")}>
              <span className="flex items-center gap-1">Churn <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="hidden sm:table-cell">Risk</TableHead>
            <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort("totalRevenue")}>
              <span className="flex items-center gap-1">Revenue <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="hidden xl:table-cell">Last Active</TableHead>
            <TableHead className="text-right w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  {customer.company && (
                    <p className="text-[11px] text-muted-foreground">{customer.company}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="text-sm">
                  {customer.email && <p className="text-foreground text-xs truncate max-w-[180px]">{customer.email}</p>}
                  {customer.phone && <p className="text-muted-foreground text-[11px]">{customer.phone}</p>}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {customer.segment ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                    {customer.segment}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        (customer.churnScore || 0) >= 70 ? "bg-red-500" : (customer.churnScore || 0) >= 40 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(customer.churnScore || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">{Math.round(customer.churnScore || 0)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <RiskBadge riskLevel={customer.riskLevel || "low"} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(customer.totalRevenue || 0)}
                </span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="text-xs text-muted-foreground">
                  {customer.lastActivityDate ? formatDate(customer.lastActivityDate) : "Never"}
                </span>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                      <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/campaigns/new")}>
                      <Mail className="mr-2 h-3.5 w-3.5" /> Send Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(customer.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
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
