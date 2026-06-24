"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { generateStrategy } from "@/lib/api";
import { ALL_PLATFORMS, cn } from "@/lib/utils";
import { Target, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const GOALS = [
  "Increase brand awareness",
  "Drive website traffic",
  "Generate leads",
  "Grow followers",
  "Boost product sales",
  "Build community",
  "Establish thought leadership",
];

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <h3 className="font-semibold text-white">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function StrategyPage() {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [audience, setAudience] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["linkedin", "twitter"]);
  const [budget, setBudget] = useState("");
  const [weeks, setWeeks] = useState(12);

  async function handleGenerate() {
    if (!brandName || !industry || !audience) {
      toast.error("Fill in brand name, industry, and target audience");
      return;
    }
    setLoading(true); setStrategy(null);
    try {
      const r = await generateStrategy({
        brand_name: brandName,
        industry,
        goal,
        target_audience: audience,
        platforms,
        budget_range: budget || undefined,
        timeline_weeks: weeks,
      });
      setStrategy(r.data);
      toast.success("Strategy generated");
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen bg-[#080810]">
      <Sidebar />
      <div className="flex-1 p-8 max-w-6xl">
        <h1 className="text-2xl font-bold text-white mb-2">Strategy Builder</h1>
        <p className="text-white/50 text-sm mb-8">Generate a full marketing strategy with content pillars, posting schedule, and KPIs</p>

        {!strategy ? (
          <div className="card max-w-2xl space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Brand name</label>
                <input className="input" placeholder="e.g. Acme Inc" value={brandName} onChange={e => setBrandName(e.target.value)} />
              </div>
              <div>
                <label className="label">Industry</label>
                <input className="input" placeholder="e.g. B2B SaaS, e-commerce, healthcare" value={industry} onChange={e => setIndustry(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Primary goal</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)} className={cn("btn-secondary text-xs px-3 py-1.5", goal === g && "bg-indigo-600 text-white")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Target audience</label>
              <textarea className="input resize-none" rows={2} placeholder="e.g. Marketing managers at mid-size B2B companies, age 28-45, interested in automation" value={audience} onChange={e => setAudience(e.target.value)} />
            </div>

            <div>
              <label className="label">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map(p => (
                  <button key={p} onClick={() => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} className={cn("btn-secondary text-xs px-3 py-1.5 capitalize", platforms.includes(p) && "bg-indigo-600 text-white")}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Monthly budget (optional)</label>
                <input className="input" placeholder="e.g. $500–$2000" value={budget} onChange={e => setBudget(e.target.value)} />
              </div>
              <div>
                <label className="label">Timeline: {weeks} weeks</label>
                <input type="range" min={4} max={52} value={weeks} onChange={e => setWeeks(+e.target.value)} className="w-full accent-indigo-500 mt-2" />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating strategy...</>
                : <><Target className="w-4 h-4" /> Generate {weeks}-week strategy</>
              }
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{brandName} — {weeks}-Week Strategy</h2>
              <button onClick={() => setStrategy(null)} className="btn-secondary text-sm">← Regenerate</button>
            </div>

            {/* Summary */}
            <div className="card bg-indigo-500/5 border-indigo-500/20">
              <p className="text-gray-200 leading-relaxed">{strategy.executive_summary}</p>
            </div>

            {/* Brand voice */}
            <CollapsibleSection title="Brand Voice">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-white/35 uppercase tracking-wide mb-2">Tone</div>
                  <p className="text-white text-sm">{strategy.brand_voice?.tone}</p>
                </div>
                <div>
                  <div className="text-xs text-white/35 uppercase tracking-wide mb-2">Do</div>
                  <ul className="space-y-1">{strategy.brand_voice?.do_list?.map((d: string) => <li key={d} className="text-sm text-green-400 flex items-start gap-1.5"><span>✓</span>{d}</li>)}</ul>
                </div>
                <div>
                  <div className="text-xs text-white/35 uppercase tracking-wide mb-2">Don&apos;t</div>
                  <ul className="space-y-1">{strategy.brand_voice?.dont_list?.map((d: string) => <li key={d} className="text-sm text-red-400 flex items-start gap-1.5"><span>✗</span>{d}</li>)}</ul>
                </div>
              </div>
            </CollapsibleSection>

            {/* Content pillars */}
            <CollapsibleSection title="Content Pillars">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategy.content_pillars?.map((p: any) => (
                  <div key={p.pillar_name} className="p-4 bg-white/[0.04] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white text-sm">{p.pillar_name}</span>
                      <span className="badge bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">{p.content_ratio_pct}%</span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Posting schedule */}
            <CollapsibleSection title="Posting Schedule">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(strategy.posting_schedule || {}).map(([plat, sched]: [string, any]) => (
                  <div key={plat} className="p-3 bg-white/[0.04] rounded-lg">
                    <div className="font-medium text-white text-sm capitalize mb-2">{plat}</div>
                    <div className="text-xs text-white/50 space-y-1">
                      <div>{sched.frequency_per_week}×/week</div>
                      <div>{sched.best_days?.join(", ")}</div>
                      <div>{sched.best_times?.join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Weekly plan */}
            <CollapsibleSection title="Week-by-Week Plan">
              <div className="space-y-3">
                {strategy.weekly_plan?.slice(0, 4).map((w: any) => (
                  <div key={w.week} className="p-4 bg-white/[0.04] rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="badge bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">Week {w.week}</span>
                      <span className="font-medium text-white text-sm">{w.theme}</span>
                    </div>
                    <p className="text-xs text-white/50 mb-2">{w.goals}</p>
                    <ul className="space-y-1">
                      {w.content_ideas?.slice(0, 3).map((idea: string) => (
                        <li key={idea} className="text-xs text-white/70 flex items-start gap-1.5"><span className="text-indigo-400">•</span>{idea}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* KPIs */}
            <CollapsibleSection title="KPIs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {strategy.kpis?.map((k: any) => (
                  <div key={k.metric} className="p-3 bg-white/[0.04] rounded-lg">
                    <div className="font-medium text-white text-sm mb-1">{k.metric}</div>
                    <div className="text-indigo-400 text-sm font-bold mb-1">{k.target}</div>
                    <div className="text-xs text-white/35">{k.measurement_method}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}
