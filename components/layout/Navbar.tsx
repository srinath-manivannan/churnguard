"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, Settings, User, Moon, Sun, Menu, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onMenuClick?: () => void;
}

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/ai-insights": "AI Insights",
  "/dashboard/customers": "Customers",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/upload": "Upload Data",
  "/dashboard/chat": "AI Chat",
  "/dashboard/images": "Images",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
  "/dashboard/campaigns/new": "New Campaign",
};

export default function Navbar({ user, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [hasNotifications] = useState(true);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const breadcrumbs = (() => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let path = "";
    for (const part of parts) {
      path += `/${part}`;
      const label = breadcrumbMap[path] || part.charAt(0).toUpperCase() + part.slice(1);
      crumbs.push({ label, href: path });
    }
    return crumbs;
  })();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden md:flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground truncate">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground truncate">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <h1 className="md:hidden text-sm font-medium text-foreground truncate">
          {breadcrumbMap[pathname] || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground" aria-label="Search">
          <Search className="h-[18px] w-[18px]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full ring-2 ring-card" />
          )}
        </Button>

        <div className="w-px h-6 bg-border mx-1 hidden md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-medium leading-none text-foreground">
                  {user.name || "User"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
