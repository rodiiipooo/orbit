"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PenLine, Calendar, BarChart3, Target, Globe, LogOut, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/content", icon: PenLine, label: "Content" },
  { href: "/schedule", icon: Calendar, label: "Schedule" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/strategy", icon: Target, label: "Strategy" },
  { href: "/platforms", icon: Globe, label: "Platforms" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm">O</div>
          <span className="font-bold text-white">Orbit</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn("sidebar-item", path.startsWith(href) && "active")}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link href="/settings" className="sidebar-item">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem("orbit_token");
            window.location.href = "/auth/login";
          }}
          className="sidebar-item w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
