'use client';

import type { Partner } from '@/lib/sales-motion/partner/types';

export type SectionProps = {
  partner: Partner;
  updateField: <K extends keyof Partner>(key: K, value: Partner[K]) => void;
  readOnly: boolean;
};

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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} />
        </div>
        <h2 className="text-sm font-semibold text-gray-800 flex-1">{title}</h2>
        {right}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
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
      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 disabled:opacity-40"
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
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
