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
    <aside className="w-56 flex-shrink-0 bg-[#080810] border-r border-white/[0.06] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-xs">O</span>
          </div>
          <span className="font-bold text-white tracking-tight">Orbit</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn("sidebar-item", path.startsWith(href) && "active")}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06] space-y-0.5">
        <Link href="/settings" className="sidebar-item">
          <Settings className="w-4 h-4 flex-shrink-0" />
          Settings
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem("orbit_token");
            window.location.href = "/auth/login";
          }}
          className="sidebar-item w-full text-left text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08]"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
