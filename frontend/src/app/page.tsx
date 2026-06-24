"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, Calendar, BarChart3, Video, Brain, Globe, ArrowRight, Check
} from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "AI Content Engine",
    desc: "Claude-powered post writer that nails your brand voice across every platform — Twitter, LinkedIn, Instagram, TikTok, and more.",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Visual Scheduler",
    desc: "Drag-and-drop calendar. Schedule weeks of content in minutes. Auto-dispatch runs in the background.",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Video Scripts & Banners",
    desc: "Generate full video scripts with scene-by-scene direction, plus AI-designed banners optimized per platform.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Causal Inference Analytics",
    desc: "Not just 'what performed well' — Orbit runs causal inference to tell you WHAT CAUSED the result. Act on drivers, not noise.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Campaign Strategy Builder",
    desc: "Describe your brand and goal. Get a full 12-week content strategy with content pillars, posting schedule, and KPIs.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Content Repurposing",
    desc: "Turn one piece of content into platform-native variants in seconds. Write once, publish everywhere.",
  },
];

const PLANS = [
  { name: "Free", price: 0, features: ["5 AI posts/month", "2 platforms", "Basic analytics", "Content calendar"] },
  { name: "Starter", price: 49, features: ["100 AI posts/month", "All platforms", "Analytics dashboard", "Video scripts", "Email support"], popular: true },
  { name: "Growth", price: 199, features: ["Unlimited AI posts", "All platforms", "Causal insights", "Banner generation", "Strategy builder", "Priority support"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-sm">O</div>
          <span className="font-bold text-lg">Orbit</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/auth/register" className="btn-primary text-sm">Start free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-brand-400 text-sm font-medium">Powered by Claude AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none">
            Marketing that{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              knows why
            </span>
            {" "}it works
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Orbit writes your content, schedules it across every platform, generates videos,
            and uses causal inference to show you exactly what drives engagement — not just what correlates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-base px-8 py-3">
              View demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need, nothing you don&apos;t</h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          One platform. All your social channels. AI that actually understands causality.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-gray-400 text-center mb-16">Scale as you grow. Cancel any time.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card flex flex-col ${plan.popular ? "border-brand-500 ring-1 ring-brand-500/30" : ""}`}
            >
              {plan.popular && (
                <span className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30 self-start mb-4">
                  Most popular
                </span>
              )}
              <div className="mb-6">
                <div className="text-gray-400 text-sm font-medium mb-1">{plan.name}</div>
                <div className="text-4xl font-bold">
                  ${plan.price}
                  <span className="text-gray-400 text-lg font-normal">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={plan.popular ? "btn-primary text-center" : "btn-secondary text-center"}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-brand-500 flex items-center justify-center text-xs font-bold">O</div>
          <span className="font-semibold text-white">Orbit</span>
        </div>
        © 2025 Orbit. Built with Claude AI.
      </footer>
    </div>
  );
}
