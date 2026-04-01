"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Users,
  MessageSquare,
  Mail,
  Image,
  BarChart3,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "AI Insights", href: "/dashboard/ai-insights", icon: Brain },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Customers", href: "/dashboard/customers", icon: Users },
      { title: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
      { title: "Upload Data", href: "/dashboard/upload", icon: Upload },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
      { title: "Images", href: "/dashboard/images", icon: Image },
      { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (mobile && onClose) {
      const handleResize = () => {
        if (window.innerWidth >= 1024) onClose();
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [mobile, onClose]);

  const sidebarWidth = collapsed && !mobile ? "w-[68px]" : "w-64";

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        sidebarWidth,
        mobile && "fixed inset-y-0 left-0 z-50 shadow-2xl animate-slide-in-left"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {(!collapsed || mobile) && (
            <span className="text-lg font-bold text-foreground truncate">
              ChurnGuard
            </span>
          )}
        </Link>

        {mobile ? (
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {(!collapsed || mobile) && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={mobile ? onClose : undefined}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      collapsed && !mobile && "justify-center px-2",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
                    {(!collapsed || mobile) && <span className="truncate">{item.title}</span>}
                    {isActive && (!collapsed || mobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border shrink-0">
        {(!collapsed || mobile) ? (
          <div className="rounded-lg bg-primary/5 dark:bg-primary/10 p-3">
            <p className="text-xs font-medium text-foreground mb-0.5">Pro Tip</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Use Cmd+K to quickly search customers, pages, and actions.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" title="System Healthy" />
          </div>
        )}
      </div>
    </aside>
  );
}
