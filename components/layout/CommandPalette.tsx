/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Brain,
  MessageSquare,
  Mail,
  Upload,
  Image,
  BarChart3,
  Settings,
  Search,
  ArrowRight,
  Sparkles,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  category: string;
  action: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pageItems: CommandItem[] = [
    { id: "nav-dash", label: "Dashboard", description: "Overview & stats", icon: LayoutDashboard, category: "Pages", action: () => router.push("/dashboard") },
    { id: "nav-ai", label: "AI Insights", description: "Predictions & analytics", icon: Brain, category: "Pages", action: () => router.push("/dashboard/ai-insights") },
    { id: "nav-customers", label: "Customers", description: "Manage customer base", icon: Users, category: "Pages", action: () => router.push("/dashboard/customers") },
    { id: "nav-campaigns", label: "Campaigns", description: "Email & SMS campaigns", icon: Mail, category: "Pages", action: () => router.push("/dashboard/campaigns") },
    { id: "nav-chat", label: "AI Chat", description: "Ask AI about your data", icon: MessageSquare, category: "Pages", action: () => router.push("/dashboard/chat") },
    { id: "nav-upload", label: "Upload Data", description: "Import CSV data", icon: Upload, category: "Pages", action: () => router.push("/dashboard/upload") },
    { id: "nav-images", label: "Images", description: "Image management", icon: Image, category: "Pages", action: () => router.push("/dashboard/images") },
    { id: "nav-reports", label: "Reports", description: "Analytics & exports", icon: BarChart3, category: "Pages", action: () => router.push("/dashboard/reports") },
    { id: "nav-settings", label: "Settings", description: "Account preferences", icon: Settings, category: "Pages", action: () => router.push("/dashboard/settings") },
  ];

  const actionItems: CommandItem[] = [
    { id: "act-analyze", label: "Run Churn Analysis", description: "Analyze all customers", icon: Sparkles, category: "Actions", action: () => { router.push("/dashboard/ai-insights"); } },
    { id: "act-campaign", label: "Create New Campaign", description: "Start a retention campaign", icon: Mail, category: "Actions", action: () => router.push("/dashboard/campaigns/new") },
    { id: "act-upload", label: "Import Customers", description: "Upload CSV data", icon: Upload, category: "Actions", action: () => router.push("/dashboard/upload") },
    { id: "act-report", label: "Generate Report", description: "Create analytics report", icon: FileText, category: "Actions", action: () => router.push("/dashboard/reports") },
  ];

  const customerItems: CommandItem[] = customers.map((c) => ({
    id: `cust-${c.id}`,
    label: c.name,
    description: c.company || c.email || `${c.riskLevel} risk`,
    icon: Users,
    category: "Customers",
    action: () => router.push(`/dashboard/customers/${c.id}`),
  }));

  const allItems = [...pageItems, ...actionItems, ...customerItems];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [...pageItems, ...actionItems];

  const groupedItems = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(groupedItems).flat();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIdx(0);
      if (customers.length === 0) {
        setLoadingCustomers(true);
        fetch("/api/customers")
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.customers) {
              setCustomers(data.customers.slice(0, 20));
            }
          })
          .catch(() => {})
          .finally(() => setLoadingCustomers(false));
      }
    }
  }, [open, customers.length]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && flatFiltered[selectedIdx]) {
        flatFiltered[selectedIdx].action();
        setOpen(false);
      }
    },
    [flatFiltered, selectedIdx]
  );

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative max-w-lg mx-auto mt-[15vh] animate-scale-in">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, customers, actions..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-mono rounded border border-border">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
            {loadingCustomers && query && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading customers...
              </div>
            )}

            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-2 last:mb-0">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </p>
                {items.map((item) => {
                  flatIdx++;
                  const idx = flatIdx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      onClick={() => { item.action(); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        idx === selectedIdx
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ))}

            {flatFiltered.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">↵</kbd> Select</span>
            </div>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">⌘K</kbd> Toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
