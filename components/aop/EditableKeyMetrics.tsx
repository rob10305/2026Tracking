"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACCENT_BG,
  ACCENT_TEXT,
  Card,
  DepartmentConfig,
  KeyMetricsSection,
  Section,
} from "./DepartmentView";
import { FY26_MONTHS, shortMonthLabel } from "@/lib/aop/months";

type Kind = "leading" | "lagging";

type MetricEntry = {
  kind: Kind;
  metric: string;
  month: string;
  value: number;
  notes?: string;
};

type ValuesMap = Record<string, number>; // key = `${kind}|${metric}|${month}`

const valKey = (kind: Kind, metric: string, month: string) =>
  `${kind}|${metric}|${month}`;

export default function EditableKeyMetrics({
  dept,
  config,
}: {
  dept: string;
  config: DepartmentConfig;
}) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];

  const [values, setValues] = useState<ValuesMap>({});
  const [draft, setDraft] = useState<ValuesMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Load initial monthly values.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/aop/${dept}/metrics`, { cache: "no-store" });
        const data = (await res.json()) as { entries: MetricEntry[] };
        if (cancelled) return;
        const map: ValuesMap = {};
        for (const e of data.entries ?? []) {
          if (e.kind !== "leading" && e.kind !== "lagging") continue;
          map[valKey(e.kind, e.metric, e.month)] = Number(e.value) || 0;
        }
        setValues(map);
        setDraft(map);
      } catch (e) {
        console.error("Failed to load AOP metrics", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dept]);

  const dirty = useMemo(() => {
    const keys = new Set([...Object.keys(values), ...Object.keys(draft)]);
    for (const k of keys) {
      if ((values[k] ?? 0) !== (draft[k] ?? 0)) return true;
    }
    return false;
  }, [values, draft]);

  const startEdit = () => {
    setDraft(values);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(values);
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    const entries: MetricEntry[] = [];
    const keys = new Set([...Object.keys(values), ...Object.keys(draft)]);
    for (const k of keys) {
      const newVal = draft[k] ?? 0;
      const oldVal = values[k] ?? 0;
      if (newVal === oldVal) continue;
      const [kind, metric, month] = k.split("|") as [Kind, string, string];
      entries.push({ kind, metric, month, value: newVal });
    }

    try {
      const res = await fetch(`/api/aop/${dept}/metrics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setValues(draft);
      setEditing(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      console.error("Failed to save AOP metrics", e);
      alert("Failed to save metrics. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const setCell = (kind: Kind, metric: string, month: string, raw: string) => {
    const num = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setDraft((prev) => ({ ...prev, [valKey(kind, metric, month)]: num }));
  };

  return (
    <>
      {/* Static cards for at-a-glance */}
      <KeyMetricsSection config={config} />

      {/* Editable monthly grid */}
      <Section
        eyebrow="Monthly Values"
        title="Track each metric by month"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-400">
            {loading
              ? "Loading saved values…"
              : editing
              ? "Edit values inline. Save to persist to the database."
              : "Click Edit to update monthly values."}
          </p>
          <div className="flex items-center gap-2">
            {savedAt && (
              <span className="text-xs text-emerald-400">Saved</span>
            )}
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancel}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !dirty}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md ${accentBg} text-[#050914] hover:opacity-90 disabled:opacity-40`}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border ${
                  loading
                    ? "border-white/10 text-gray-500"
                    : `border-current ${accentText} hover:bg-white/5`
                }`}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <MetricGrid
          eyebrow="Leading"
          accentColor={accentText}
          metrics={config.metrics.leading}
          kind="leading"
          months={FY26_MONTHS as readonly string[]}
          values={editing ? draft : values}
          editing={editing}
          onChange={setCell}
        />

        <MetricGrid
          eyebrow="Lagging"
          accentColor="text-amber-400"
          metrics={config.metrics.lagging}
          kind="lagging"
          months={FY26_MONTHS as readonly string[]}
          values={editing ? draft : values}
          editing={editing}
          onChange={setCell}
        />
      </Section>
    </>
  );
}

function MetricGrid({
  eyebrow,
  accentColor,
  metrics,
  kind,
  months,
  values,
  editing,
  onChange,
}: {
  eyebrow: string;
  accentColor: string;
  metrics: string[];
  kind: Kind;
  months: readonly string[];
  values: ValuesMap;
  editing: boolean;
  onChange: (kind: Kind, metric: string, month: string, raw: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${accentColor}`}>
        {eyebrow}
      </h3>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 pb-2 sticky left-0 bg-[#0b1120] z-10 pr-3">
                Metric
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400 pb-2 px-1 min-w-[60px]"
                >
                  {shortMonthLabel(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, i) => (
              <tr key={metric} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                <td className="text-sm text-gray-200 py-2 pr-3 sticky left-0 bg-[#0b1120] z-10 whitespace-nowrap">
                  {metric}
                </td>
                {months.map((m) => {
                  const v = values[valKey(kind, metric, m)] ?? 0;
                  return (
                    <td key={m} className="px-1 py-1.5">
                      {editing ? (
                        <input
                          type="number"
                          value={Number.isFinite(v) ? v : 0}
                          onChange={(e) => onChange(kind, metric, m, e.target.value)}
                          className="w-full bg-[#050914] border border-white/10 rounded px-1.5 py-1 text-xs text-right text-white focus:outline-none focus:border-white/30"
                          step="any"
                        />
                      ) : (
                        <div className="text-xs text-right text-gray-300 px-1.5 py-1">
                          {v === 0 ? <span className="text-gray-600">—</span> : v}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
