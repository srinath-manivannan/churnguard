// ============================================
// SIDEBAR NAVIGATION
// ============================================
// Left sidebar with navigation links

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
  FileText,
  BarChart3,
} from "lucide-react";

// Navigation items configuration
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Data",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "AI Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Campaigns",
    href: "/dashboard/campaigns",
    icon: Mail,
  },
  {
    title: "Images",
    href: "/dashboard/images",
    icon: Image,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export default function Sidebar() {
  // Get current pathname to highlight active link
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">ChurnGuard</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Check if this link is active
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // Base styles
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                // Active state
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section - Help/Support */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-900 mb-1">
            Need Help?
          </p>
          <p className="text-xs text-blue-700">
            Check our documentation for guides and tutorials.
          </p>
        </div>
      </div>
    </aside>
  );
}