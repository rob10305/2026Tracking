"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AiShowcasePage() {
  return (
    <div className="flex-1 min-h-[calc(100vh-60px)] bg-[#050914] text-gray-100">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
          FY2026
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center">
            <Sparkles size={22} className="text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">AI Showcase</h1>
        </div>
        <p className="mt-3 text-gray-400 max-w-2xl">
          A home for AI-powered demos, customer wins, and internal experiments.
          Use this space to curate what we&rsquo;re building, who&rsquo;s using it,
          and where it&rsquo;s heading.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlaceholderTile
            eyebrow="Demos"
            title="Live customer demos"
            description="Curated walkthroughs of AI features by product and motion."
            accent="sky"
          />
          <PlaceholderTile
            eyebrow="Wins"
            title="Customer outcomes"
            description="Named accounts, impact metrics, and quotes we can reuse."
            accent="emerald"
          />
          <PlaceholderTile
            eyebrow="Experiments"
            title="Internal prototypes"
            description="In-flight bets, what they're testing, and when they'll ship."
            accent="violet"
          />
        </div>

        <div className="mt-10 bg-[#0b1120] border border-white/5 border-l-4 border-l-sky-400 rounded-xl p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-400">
            What&rsquo;s next
          </p>
          <p className="mt-2 text-white font-semibold">
            This page is a placeholder. Tell me what you want here.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            A few directions I can build out quickly: a gallery of demo cards
            with links + tags, a table of customer wins tied to products, an
            experiment tracker with status RAGs, or an embedded video
            playlist. Mix and match.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300"
          >
            Back to home <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const ACCENT: Record<"sky" | "emerald" | "violet", { text: string; border: string; glow: string }> = {
  sky: { text: "text-sky-400", border: "border-sky-400", glow: "bg-sky-400/10" },
  emerald: { text: "text-emerald-400", border: "border-emerald-400", glow: "bg-emerald-400/10" },
  violet: { text: "text-violet-400", border: "border-violet-400", glow: "bg-violet-400/10" },
};

function PlaceholderTile({
  eyebrow,
  title,
  description,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent: "sky" | "emerald" | "violet";
}) {
  const a = ACCENT[accent];
  return (
    <div
      className={`relative overflow-hidden bg-[#0b1120] border border-white/5 ${a.border} border-l-4 rounded-xl p-6`}
    >
      <div
        className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${a.glow} blur-3xl pointer-events-none`}
      />
      <div className="relative">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${a.text}`}>
          {eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
