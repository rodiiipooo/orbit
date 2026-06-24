"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail } from "lucide-react";

const FOUNDER = {
  name: "Alex Rivera",
  title: "CEO & Founder",
  email: "alex@orbitmarketing.io",
  linkedin: "https://linkedin.com/in/alexrivera-orbit",
  twitter: "https://twitter.com/alexrivera_io",
  bio_paras: [
    "I spent 10 years as Creative Director at Meridian Digital, managing social strategy for 40+ brand accounts. Every Monday was the same: six platforms, six dashboards, six sets of gut-feel guesses about what was working.",
    "I built Orbit to end that. Now I know exactly what drives results — and so do our users.",
  ],
  backstory: "NYU journalism → ad agency copywriter → Creative Director → accidental SaaS founder.",
  initials: "AR",
  color: "#5c6bff",
};

const TEAM = [
  {
    name: "Jordan Lee",
    title: "Head of Customer Success",
    email: "jordan@orbitmarketing.io",
    bio: "5 years in agency account management before joining Orbit. Obsessed with making sure every user gets results, not just access to a dashboard.",
    initials: "JL",
    color: "#ff22af",
  },
  {
    name: "Casey Morgan",
    title: "Head of Product",
    email: "casey@orbitmarketing.io",
    bio: "Former product lead at two B2B SaaS companies. Believes the best analytics tools ask better questions, not just answer them.",
    initials: "CM",
    color: "#10b981",
  },
];

const VALUES = [
  {
    title: "Causation over correlation",
    body: "We built a causal inference engine because 'this post did well' is useless without 'here's why.' Every insight in Orbit points to a lever you can actually pull.",
  },
  {
    title: "Writers-first design",
    body: "Great content comes from creative people, not dashboards. Orbit handles the scheduling, the analytics, and the distribution — so you can focus on saying something worth reading.",
  },
  {
    title: "Honest about AI",
    body: "We use Claude to generate content, but we're clear about it. AI is a starting point, not a finish line. Your voice, your audience, your judgment — that's what makes it work.",
  },
];

function Avatar({ initials, color, size = 64 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <nav className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">O</div>
          <span className="font-bold text-lg">Orbit</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/auth/register" className="btn-primary text-sm">Start free</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Built by someone who got tired of guessing
          </h1>
          <p className="text-xl text-white/50 leading-relaxed max-w-2xl">
            Orbit started as an internal tool at an agency. When it started working better than everything we were paying for, we turned it into a product.
          </p>
        </motion.div>

        {/* Founder */}
        <section className="mb-20">
          <h2 className="text-sm font-semibold text-white/35 uppercase tracking-widest mb-8">Founder</h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card flex flex-col md:flex-row gap-8"
          >
            <Avatar initials={FOUNDER.initials} color={FOUNDER.color} size={80} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{FOUNDER.name}</h3>
                  <p className="text-indigo-400 text-sm font-medium">{FOUNDER.title}</p>
                  <p className="text-white/35 text-xs mt-1">{FOUNDER.backstory}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-white/50 hover:text-white">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={FOUNDER.twitter} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-white/50 hover:text-white">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href={`mailto:${FOUNDER.email}`} className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-white/50 hover:text-white">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
              {FOUNDER.bio_paras.map((p, i) => (
                <p key={i} className="text-white/70 leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Team */}
        <section className="mb-20">
          <h2 className="text-sm font-semibold text-white/35 uppercase tracking-widest mb-8">Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="card flex gap-5"
              >
                <Avatar initials={member.initials} color={member.color} size={56} />
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <a href={`mailto:${member.email}`} className="p-1.5 hover:bg-white/[0.04] rounded transition-colors text-white/35 hover:text-white/70">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-indigo-400 text-xs font-medium mb-2">{member.title}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <h2 className="text-sm font-semibold text-white/35 uppercase tracking-widest mb-8">What we believe</h2>
          <div className="space-y-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-6 p-6 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-white/[0.08] transition-colors"
              >
                <div className="w-0.5 bg-indigo-600 rounded-full flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{v.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="card bg-indigo-500/5 border-indigo-500/20 text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-3">Talk to a human</h2>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Questions about Orbit? Want to see a demo? Jordan or Alex will reply personally.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:hello@orbitmarketing.io" className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5">
              <Mail className="w-4 h-4" />
              hello@orbitmarketing.io
            </a>
            <Link href="/auth/register" className="btn-secondary px-6 py-2.5">
              Start free
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/[0.06] py-8 text-center text-white/35 text-sm">
        © 2025 Orbit Marketing, Inc. · Austin, TX ·{" "}
        <Link href="/" className="hover:text-white/70">Home</Link>
      </footer>
    </div>
  );
}
