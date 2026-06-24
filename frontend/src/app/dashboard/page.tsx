"use client";
import { useEffect, useState } from "react";
import { getOverview, listPosts, listPlatforms, getCausalInsights } from "@/lib/api";
import { formatNumber, formatPct, PLATFORM_COLORS } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { TrendingUp, Eye, MousePointerClick, Users, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverview(30).then(r => setOverview(r.data)),
      listPosts("published").then(r => setPosts(r.data.slice(0, 5))),
      listPlatforms().then(r => setPlatforms(r.data)),
      getCausalInsights().then(r => setInsights(r.data.slice(0, 3))),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = overview ? [
    { label: "Total Posts", value: overview.total_posts, icon: TrendingUp, delta: null },
    { label: "Impressions", value: formatNumber(overview.total_impressions), icon: Eye, delta: null },
    { label: "Engagements", value: formatNumber(overview.total_engagements), icon: MousePointerClick, delta: null },
    { label: "Eng. Rate", value: formatPct(overview.engagement_rate_pct), icon: Users, delta: null },
  ] : [];

  const platformData = overview
    ? Object.entries(overview.platform_breakdown || {}).map(([p, d]: [string, any]) => ({
        name: p,
        engagements: d.engagements,
        impressions: d.impressions,
        fill: PLATFORM_COLORS[p] || "#5c6bff",
      }))
    : [];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Last 30 days overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{s.label}</span>
              <s.icon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform breakdown */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-white mb-4">Engagements by Platform</h2>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformData}>
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                  labelStyle={{ color: "#f9fafb" }}
                />
                <Bar dataKey="engagements" fill="#5c6bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p className="text-sm">No platform data yet</p>
              <Link href="/platforms" className="text-brand-400 text-sm mt-2 hover:underline">
                Connect platforms →
              </Link>
            </div>
          )}
        </div>

        {/* Connected platforms */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Connected Platforms</h2>
          {platforms.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-gray-500 text-sm">No platforms connected yet.</p>
              <Link href="/platforms" className="btn-primary text-sm text-center">
                Connect platforms
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {platforms.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: PLATFORM_COLORS[p.platform] || "#5c6bff" }}
                  >
                    {p.platform[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white capitalize">{p.platform}</div>
                    <div className="text-xs text-gray-500">@{p.platform_username}</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
                </div>
              ))}
              <Link href="/platforms" className="btn-ghost text-sm w-full text-center mt-2">
                Manage →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Causal insights */}
      {insights.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              <h2 className="font-semibold text-white">Top Causal Drivers</h2>
            </div>
            <Link href="/analytics" className="text-sm text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {insights.map((ins: any) => (
              <div key={ins.treatment} className="flex items-start gap-4 p-3 bg-gray-800 rounded-lg">
                <div className={`badge mt-0.5 ${ins.significant ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-gray-700 text-gray-400"}`}>
                  {ins.significant ? "Significant" : "Weak"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white capitalize">
                    {ins.treatment.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                    {ins.interpretation}
                  </div>
                </div>
                <div className={`text-sm font-bold ${ins.ate > 0 ? "text-green-400" : "text-red-400"}`}>
                  {ins.ate > 0 ? "+" : ""}{ins.ate.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent posts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Published Posts</h2>
          <Link href="/schedule" className="text-sm text-brand-400 hover:underline">View all →</Link>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-3">No published posts yet.</p>
            <Link href="/content" className="btn-primary text-sm">Create your first post</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p: any) => (
              <div key={p.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white line-clamp-2">{p.body}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {p.platforms.map((pl: string) => (
                      <span key={pl} className="text-xs text-gray-500 capitalize">{pl}</span>
                    ))}
                  </div>
                </div>
                {p.ai_generated && (
                  <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 flex-shrink-0">AI</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
