"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getOverview, getCausalInsights, getTopPosts } from "@/lib/api";
import { formatNumber, formatPct, PLATFORM_COLORS } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell
} from "recharts";
import { Brain, TrendingUp, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const DAYS_OPTIONS = [7, 14, 30, 90, 180];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  const fetchAll = async (d = days) => {
    setLoading(true);
    try {
      const [ov, ins, tp] = await Promise.all([
        getOverview(d).then(r => r.data),
        getCausalInsights().then(r => r.data),
        getTopPosts(5, "engagements").then(r => r.data),
      ]);
      setOverview(ov);
      setInsights(ins);
      setTopPosts(tp);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDaysChange = (d: number) => { setDays(d); fetchAll(d); };

  const handleRefreshInsights = async () => {
    setRefreshingInsights(true);
    try {
      const r = await getCausalInsights(true);
      setInsights(r.data);
      toast.success("Causal analysis updated");
    } catch { toast.error("Analysis failed — need 30+ published posts"); }
    finally { setRefreshingInsights(false); }
  };

  const platformData = overview
    ? Object.entries(overview.platform_breakdown || {}).map(([p, d]: [string, any]) => ({
        name: p, engagements: d.engagements, impressions: d.impressions,
        fill: PLATFORM_COLORS[p] || "#5c6bff",
      }))
    : [];

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Performance insights + causal drivers</p>
          </div>
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {DAYS_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => handleDaysChange(d)}
                className={`px-3 py-1.5 rounded text-sm transition-all ${days === d ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Posts", value: overview?.total_posts || 0 },
                { label: "Impressions", value: formatNumber(overview?.total_impressions || 0) },
                { label: "Engagements", value: formatNumber(overview?.total_engagements || 0) },
                { label: "Eng. Rate", value: formatPct(overview?.engagement_rate_pct || 0) },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="text-gray-400 text-sm">{s.label}</div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Engagements by Platform</h2>
                {platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={platformData}>
                      <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} labelStyle={{ color: "#f9fafb" }} />
                      {platformData.map((d, i) => (
                        <Bar key={d.name} dataKey="engagements" fill={d.fill} radius={[4, 4, 0, 0]}>
                          <Cell fill={d.fill} />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No data yet</div>
                )}
              </div>

              <div className="card">
                <h2 className="font-semibold text-white mb-4">Top Posts</h2>
                {topPosts.length > 0 ? (
                  <div className="space-y-3">
                    {topPosts.map((p: any, i) => (
                      <div key={p.id} className="flex items-start gap-3">
                        <span className="text-lg font-bold text-gray-700 w-6">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white line-clamp-1">{p.body}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatNumber(p.score)} engagements</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No published posts yet</div>
                )}
              </div>
            </div>

            {/* Causal Insights */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-brand-400" />
                  <div>
                    <h2 className="font-semibold text-white">Causal Inference Insights</h2>
                    <p className="text-xs text-gray-500 mt-0.5">What actually CAUSES changes in your outcomes, not just correlates</p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshInsights}
                  disabled={refreshingInsights}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingInsights ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {insights.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Brain className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm mb-1">Need 30+ published posts to run causal analysis</p>
                  <p className="text-xs text-gray-600">Keep posting — insights will appear automatically</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((ins: any) => (
                    <div key={ins.treatment} className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          {ins.significant
                            ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            : <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          }
                          <span className="font-medium text-white capitalize text-sm">
                            {ins.treatment.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${ins.ate > 0 ? "text-green-400" : "text-red-400"}`}>
                              {ins.ate > 0 ? "+" : ""}{ins.ate.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">ATE on {ins.outcome}</div>
                          </div>
                          <span className={`badge text-xs ${ins.significant ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-gray-700 text-gray-400"}`}>
                            p={ins.p_value.toFixed(3)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{ins.interpretation}</p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                        <span>95% CI: [{ins.ci_lower.toFixed(1)}, {ins.ci_upper.toFixed(1)}]</span>
                        <span>Method: {ins.method}</span>
                        <span className="capitalize">{ins.outcome.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
