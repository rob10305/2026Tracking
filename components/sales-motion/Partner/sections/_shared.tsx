'use client';

import type { Partner } from '@/lib/sales-motion/partner/types';

export type SectionProps = {
  partner: Partner;
  updateField: <K extends keyof Partner>(key: K, value: Partner[K]) => void;
  readOnly: boolean;
};

// Translate legacy "bg-*-100 text-*-600" color pairs from callers into
// our dark-theme accent tokens. Callers still pass strings so we just do a
// simple lookup and fall back to a neutral tile.
const ICON_ACCENTS: Record<string, string> = {
  // purple → violet accent
  'bg-purple-100 text-purple-600':   'bg-accent-violet/10 border border-accent-violet/30 text-accent-violet',
  // indigo → violet accent (close enough)
  'bg-indigo-100 text-indigo-600':   'bg-accent-violet/10 border border-accent-violet/30 text-accent-violet',
  // sky / cyan → sky accent
  'bg-sky-100 text-sky-600':         'bg-accent-sky/10 border border-accent-sky/30 text-accent-sky',
  'bg-cyan-100 text-cyan-600':       'bg-accent-sky/10 border border-accent-sky/30 text-accent-sky',
  'bg-blue-100 text-blue-600':       'bg-accent-sky/10 border border-accent-sky/30 text-accent-sky',
  // teal / emerald / green → emerald accent
  'bg-teal-100 text-teal-600':       'bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald',
  'bg-emerald-100 text-emerald-600': 'bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald',
  'bg-green-100 text-green-600':     'bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald',
  // amber / orange → amber accent
  'bg-amber-100 text-amber-600':     'bg-accent-amber/10 border border-accent-amber/30 text-accent-amber',
  'bg-orange-100 text-orange-600':   'bg-accent-amber/10 border border-accent-amber/30 text-accent-amber',
  // rose / red → rose accent
  'bg-rose-100 text-rose-600':       'bg-accent-rose/10 border border-accent-rose/30 text-accent-rose',
  'bg-red-100 text-red-600':         'bg-accent-rose/10 border border-accent-rose/30 text-accent-rose',
};

function accentForColor(color: string): string {
  return ICON_ACCENTS[color] ??
    'bg-white/[0.04] border border-white/10 text-gray-300';
}

export function Section({
  icon: Icon,
  title,
  color,
  right,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  color: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas-raised rounded-xl border border-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentForColor(color)}`}>
          <Icon size={15} />
        </div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white flex-1">{title}</h2>
        {right}
      </div>
      <div className="p-4 space-y-3 text-gray-300">{children}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em] mb-1">
      {children}
    </div>
  );
}

export function AddButton({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-accent-violet transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
        active
          ? 'bg-accent-violet/15 text-accent-violet border-accent-violet/40'
          : 'bg-white/[0.03] text-gray-400 border-white/10 hover:bg-white/[0.06] hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export function currentYear() {
  return new Date().getFullYear();
}

export function isoMonth(date: Date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isInThisMonth(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function isInThisQuarter(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const qOf = (dt: Date) => Math.floor(dt.getMonth() / 3);
  return d.getFullYear() === now.getFullYear() && qOf(d) === qOf(now);
}

export function isInThisYear(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === new Date().getFullYear();
}
