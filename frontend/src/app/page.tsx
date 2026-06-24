"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap, BarChart3, Calendar, Video, Brain, Repeat2, ChevronRight } from "lucide-react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
});

const FEATURES = [
  {
    icon: Zap,
    color: "from-violet-500 to-indigo-500",
    glow: "shadow-violet-500/20",
    title: "AI Content Engine",
    desc: "Claude generates platform-native posts in your brand voice. 3 variants per brief. Twitter threads, LinkedIn essays, Instagram captions — all optimized.",
  },
  {
    icon: Brain,
    color: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20",
    title: "Causal Inference",
    desc: "Not correlation — causation. Orbit runs OLS+DiD models on your post history to tell you what actually drives engagement, with statistical significance.",
  },
  {
    icon: Calendar,
    color: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/20",
    title: "Visual Scheduler",
    desc: "Drag content onto a calendar. Celery workers dispatch at the exact scheduled second. Never miss a post window again.",
  },
  {
    icon: Video,
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
    title: "Video Scripts",
    desc: "Scene-by-scene scripts with hooks, CTAs, and thumbnail concepts. Route directly to InVideo for one-click rendering.",
  },
  {
    icon: BarChart3,
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
    title: "Strategy Builder",
    desc: "Describe your brand. Get a 12-week plan: content pillars, posting cadence, KPIs, and week-by-week creative direction.",
  },
  {
    icon: Repeat2,
    color: "from-indigo-500 to-cyan-500",
    glow: "shadow-indigo-500/20",
    title: "Content Repurposing",
    desc: "One piece of content → native variants for every platform. Character limits, tone, hashtags — all adapted automatically.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: 0,
    desc: "Try before you commit",
    features: ["5 AI posts / month", "2 platforms", "Content calendar", "Basic analytics"],
  },
  {
    name: "Starter",
    price: 49,
    desc: "For growing brands",
    features: ["100 AI posts / month", "All 5 platforms", "Video scripts", "Analytics dashboard", "Email support"],
    popular: true,
  },
  {
    name: "Growth",
    price: 199,
    desc: "For serious marketers",
    features: ["Unlimited AI posts", "All platforms", "Causal insights", "Banner generation", "Strategy builder", "Priority support"],
  },
];

const LOGOS = ["Twitter / X", "LinkedIn", "Instagram", "Facebook", "TikTok"];

const STATS = [
  { value: "4.2×", label: "avg engagement lift" },
  { value: "87%", label: "time saved on content" },
  { value: "12 wk", label: "strategy in 30 seconds" },
  { value: "5", label: "platforms, one dashboard" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-indigo-600/20 -top-48 -left-32" />
        <div className="orb w-[500px] h-[500px] bg-violet-600/15 top-1/2 -right-48" />
        <div className="orb w-[400px] h-[400px] bg-pink-600/10 bottom-0 left-1/3" />
        <div className="absolute inset-0 bg-grid opacity-100" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-black text-xs">O</span>
            </div>
            <span className="font-bold text-white tracking-tight">Orbit</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <a href="#features" className="hover:text-white/90 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white/90 transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-white/90 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign in</Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Get started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
        <motion.div {...fade(0)}>
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-8 text-xs font-medium text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Claude AI · Causal inference built in
          </div>
        </motion.div>

        <motion.h1 {...fade(0.08)} className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
          <span className="gradient-text">Marketing that</span>
          <br />
          <span className="gradient-text-indigo">knows why it works</span>
        </motion.h1>

        <motion.p {...fade(0.15)} className="text-lg sm:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
          Write content, schedule across every platform, generate video scripts — then
          run causal inference to discover what <em>actually</em> drives results.
          Not correlation. Causation.
        </motion.p>

        <motion.div {...fade(0.22)} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/auth/register" className="btn-primary px-7 py-3 text-base shadow-2xl shadow-indigo-600/30">
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="btn-secondary px-7 py-3 text-base">
            View demo
          </Link>
        </motion.div>

        <motion.p {...fade(0.28)} className="mt-5 text-xs text-white/25">
          No credit card required · Free forever plan
        </motion.p>
      </section>

      {/* ── Platform logos strip ── */}
      <div className="relative z-10 border-y border-white/[0.06] py-5">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8">
          <span className="text-xs text-white/25 uppercase tracking-widest font-medium">Works with</span>
          {LOGOS.map(l => (
            <span key={l} className="text-sm font-semibold text-white/30 hover:text-white/60 transition-colors cursor-default">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fade(i * 0.07)} className="card-hover text-center py-8">
              <div className="text-3xl font-black gradient-text-indigo mb-1">{s.value}</div>
              <div className="text-xs text-white/40 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fade()} className="text-center mb-16">
          <div className="badge-indigo inline-flex mb-4">Features</div>
          <h2 className="text-4xl font-black tracking-tight gradient-text mb-4">
            One platform. Every channel.
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            From AI copywriting to causal analytics — everything your marketing team needs, nothing it doesn't.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fade(i * 0.07)} className="card-hover group p-7 flex flex-col gap-5">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} shadow-lg ${f.glow} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Causal insight callout ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-10 mb-10">
        <motion.div {...fade()} className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-10 md:p-14">
          <div className="orb w-80 h-80 bg-indigo-500/20 -top-20 -right-20" />
          <div className="relative z-10 max-w-2xl">
            <div className="badge-indigo inline-flex mb-5">
              <Brain className="w-3 h-3" /> Causal Inference
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 gradient-text">
              Stop guessing what works.
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              Every marketing platform shows you what performed. Orbit is the only one that tells you <strong className="text-white/80">why</strong>.
              We run a battery of OLS regression and difference-in-differences models on your post history
              to surface causal drivers — with confidence intervals, not just bar charts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { stat: "+34%", label: "avg lift from posting mornings" },
                { stat: "2.1×", label: "engagement with media attached" },
                { stat: "−12%", label: "impact of >5 hashtags" },
              ].map(item => (
                <div key={item.label} className="glass rounded-xl p-4">
                  <div className="text-2xl font-black text-indigo-300 mb-1">{item.stat}</div>
                  <div className="text-xs text-white/40">{item.label}</div>
                </div>
              ))}
            </div>
            <Link href="/auth/register" className="btn-primary">
              See your data <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <motion.div {...fade()} className="text-center mb-16">
          <div className="badge-indigo inline-flex mb-4">Pricing</div>
          <h2 className="text-4xl font-black tracking-tight gradient-text mb-4">Simple, transparent pricing</h2>
          <p className="text-white/40">Scale as you grow. No hidden fees. Cancel any time.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} {...fade(i * 0.1)} className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 ${
              plan.popular
                ? "bg-indigo-600/10 border-indigo-500/40 shadow-2xl shadow-indigo-500/15"
                : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]"
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-indigo px-4 py-1 text-xs font-semibold shadow-lg shadow-indigo-500/20">Most popular</span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-semibold text-white/50 mb-1">{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-white/30 text-sm mb-1.5">/mo</span>
                </div>
                <p className="text-xs text-white/35">{plan.desc}</p>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/auth/register" className={plan.popular ? "btn-primary justify-center" : "btn-secondary justify-center"}>
                Get started
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.div {...fade()}>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight gradient-text mb-5">
            Ready to orbit your competition?
          </h2>
          <p className="text-white/40 mb-8 text-lg">
            Join marketers who know what drives results — not just what looks good in a spreadsheet.
          </p>
          <Link href="/auth/register" className="btn-primary px-8 py-3.5 text-base shadow-2xl shadow-indigo-600/30">
            Start free today <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-[10px]">O</span>
            </div>
            <span className="font-bold text-sm text-white/60">Orbit</span>
          </div>
          <p className="text-xs text-white/25">© 2025 Orbit. Built with Claude AI.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <a href="mailto:team@orbitmarketing.io" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
