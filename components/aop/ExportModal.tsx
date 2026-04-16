"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACCENT_BG,
  ACCENT_BORDER,
  ACCENT_TEXT,
  DepartmentConfig,
} from "./DepartmentView";
import { FY26_MONTHS, shortMonthLabel } from "@/lib/aop/months";

type MetricEntry = {
  kind: "leading" | "lagging";
  metric: string;
  month: string;
  value: number;
  notes?: string;
};

export default function ExportModal({
  dept,
  config,
  open,
  onClose,
}: {
  dept: string;
  config: DepartmentConfig;
  open: boolean;
  onClose: () => void;
}) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];
  const accentBorder = ACCENT_BORDER[config.accent];

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(FY26_MONTHS as readonly string[])
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to all months whenever modal opens.
  useEffect(() => {
    if (open) {
      setSelected(new Set(FY26_MONTHS as readonly string[]));
      setError(null);
    }
  }, [open]);

  const toggle = (m: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(FY26_MONTHS as readonly string[]));
  const selectNone = () => setSelected(new Set());
  const selectQuarter = (q: 1 | 2 | 3 | 4) => {
    const months = FY26_MONTHS.slice((q - 1) * 3, q * 3);
    setSelected(new Set(months));
  };

  const orderedSelected = useMemo(
    () => (FY26_MONTHS as readonly string[]).filter((m) => selected.has(m)),
    [selected]
  );

  const generate = async () => {
    if (orderedSelected.length === 0) {
      setError("Pick at least one month to include.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/aop/${dept}/metrics`, { cache: "no-store" });
      const data = (await res.json()) as { entries: MetricEntry[] };
      const { exportDepartmentPPTX } = await import("@/lib/aop/export-pptx");
      await exportDepartmentPPTX({
        config,
        months: orderedSelected,
        metricEntries: data.entries ?? [],
      });
      onClose();
    } catch (e) {
      console.error("PPT export failed", e);
      setError("Failed to generate PowerPoint. See console for details.");
    } finally {
      setGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className={`relative w-full max-w-2xl bg-[#0b1120] border border-white/10 ${accentBorder} border-l-4 rounded-xl p-6`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>

        <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${accentText}`}>
          Export · {config.name}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Export AOP to PowerPoint
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Choose which FY2026 months to include in the Key Metrics slide. Cover,
          Goals, Retrospect, Initiatives, Operating Plan, Compensation, and
          Organisation slides are always included.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <button onClick={selectAll} className="px-2.5 py-1 border border-white/10 rounded text-gray-300 hover:bg-white/5">
            All
          </button>
          <button onClick={selectNone} className="px-2.5 py-1 border border-white/10 rounded text-gray-300 hover:bg-white/5">
            None
          </button>
          <span className="px-1 text-gray-600">|</span>
          {[1, 2, 3, 4].map((q) => (
            <button
              key={q}
              onClick={() => selectQuarter(q as 1 | 2 | 3 | 4)}
              className="px-2.5 py-1 border border-white/10 rounded text-gray-300 hover:bg-white/5"
            >
              Q{q}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {(FY26_MONTHS as readonly string[]).map((m) => {
            const on = selected.has(m);
            return (
              <button
                key={m}
                onClick={() => toggle(m)}
                className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-colors ${
                  on
                    ? `${accentBorder} ${accentBg} text-[#050914]`
                    : "border-white/10 text-gray-300 hover:bg-white/5"
                }`}
              >
                {shortMonthLabel(m)}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          {orderedSelected.length} of 12 months selected
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-white/10 rounded-md hover:bg-white/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={generating || orderedSelected.length === 0}
            className={`px-4 py-2 text-sm font-semibold rounded-md ${accentBg} text-[#050914] hover:opacity-90 disabled:opacity-40`}
          >
            {generating ? "Generating…" : "Generate .pptx"}
          </button>
        </div>
      </div>
    </div>
  );
}
