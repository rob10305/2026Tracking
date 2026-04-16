"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACCENT_BG,
  ACCENT_TEXT,
  Card,
  DepartmentConfig,
  Section,
} from "../DepartmentView";
import { FY26_MONTHS, shortMonthLabel } from "@/lib/aop/months";
import RagPicker, { Rag } from "./RagPicker";

type Progress = { month: string; rag: Rag; note: string };
type Goal = {
  id?: string;
  order: number;
  number: string;
  title: string;
  description: string;
  progress: Progress[];
};

export default function EditableGoals({
  dept,
  config,
}: {
  dept: string;
  config: DepartmentConfig;
}) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];

  const [goals, setGoals] = useState<Goal[]>([]);
  const [draft, setDraft] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/aop/${dept}/goals`, { cache: "no-store" });
        const data = (await res.json()) as {
          goals: (Omit<Goal, "progress"> & { progress: Progress[] })[];
        };
        if (cancelled) return;
        const loaded: Goal[] = (data.goals ?? []).map((g) => ({
          ...g,
          progress: (g.progress ?? []).map((p) => ({
            month: p.month,
            rag: (p.rag ?? "") as Rag,
            note: p.note ?? "",
          })),
        }));
        const initial =
          loaded.length > 0
            ? loaded
            : config.goals.items.map((g, i) => ({
                order: i,
                number: g.number,
                title: g.title,
                description: g.description,
                progress: [],
              }));
        setGoals(initial);
        setDraft(initial);
      } catch (e) {
        console.error("Failed to load goals", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dept, config.goals.items]);

  const dirty = useMemo(
    () => JSON.stringify(goals) !== JSON.stringify(draft),
    [goals, draft]
  );

  const startEdit = () => {
    setDraft(goals);
    setEditing(true);
  };
  const cancel = () => {
    setDraft(goals);
    setEditing(false);
  };
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/aop/${dept}/goals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: draft.map((g, idx) => ({
            id: g.id,
            order: idx,
            number: g.number,
            title: g.title,
            description: g.description,
            // Only include progress rows with a RAG set to keep the table lean.
            progress: g.progress.filter((p) => p.rag !== ""),
          })),
        }),
      });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          if (body?.error) detail = body.error;
        } catch {}
        throw new Error(detail);
      }
      const r2 = await fetch(`/api/aop/${dept}/goals`, { cache: "no-store" });
      const data = await r2.json();
      const refreshed: Goal[] = (data.goals ?? []).map((g: Goal) => ({
        ...g,
        progress: (g.progress ?? []).map((p: Progress) => ({
          month: p.month,
          rag: (p.rag ?? "") as Rag,
          note: p.note ?? "",
        })),
      }));
      setGoals(refreshed);
      setDraft(refreshed);
      setEditing(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      console.error("Failed to save goals", e);
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(`Failed to save goals.\n\n${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () =>
    setDraft((prev) => [
      ...prev,
      {
        order: prev.length,
        number: String(prev.length + 1).padStart(2, "0"),
        title: "Goal Title",
        description:
          "Describe the specific FY26 objective, target metric, and why it matters to the plan.",
        progress: [],
      },
    ]);
  const removeGoal = (idx: number) =>
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  const updateGoal = (idx: number, patch: Partial<Goal>) =>
    setDraft((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));

  const setRag = (goalIdx: number, month: string, rag: Rag) => {
    setDraft((prev) =>
      prev.map((g, i) => {
        if (i !== goalIdx) return g;
        const existing = g.progress.find((p) => p.month === month);
        const nextProgress = existing
          ? g.progress.map((p) => (p.month === month ? { ...p, rag } : p))
          : [...g.progress, { month, rag, note: "" }];
        return { ...g, progress: nextProgress };
      })
    );
  };

  const ragFor = (g: Goal, month: string): Rag =>
    ((g.progress.find((p) => p.month === month)?.rag ?? "") as Rag);

  const source = editing ? draft : goals;

  return (
    <Section eyebrow="FY2026 Goals" title={config.goals.headline}>
      <p className="text-gray-400">{config.goals.subhead}</p>

      <div className="flex items-center justify-end gap-2 -mt-2">
        {savedAt && <span className="text-xs text-emerald-400">Saved</span>}
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
              loading ? "border-white/10 text-gray-500" : `border-current ${accentText} hover:bg-white/5`
            }`}
          >
            {loading ? "Loading…" : "Edit"}
          </button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/5 text-gray-300">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sticky left-0 bg-[#101729] z-10 min-w-[260px]">
                  Goal
                </th>
                {FY26_MONTHS.map((m) => (
                  <th
                    key={m}
                    className="text-center px-2 py-3 text-[11px] font-semibold uppercase tracking-wider min-w-[72px]"
                  >
                    {shortMonthLabel(m)}
                  </th>
                ))}
                {editing && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {source.length === 0 && (
                <tr>
                  <td
                    colSpan={FY26_MONTHS.length + (editing ? 2 : 1)}
                    className="px-4 py-6 text-sm text-gray-500 text-center"
                  >
                    No goals yet. {editing && "Click + Add goal below."}
                  </td>
                </tr>
              )}
              {source.map((g, idx) => (
                <tr key={g.id ?? `tmp-goal-${idx}`} className="border-t border-white/5 align-top">
                  <td className="px-4 py-3 sticky left-0 bg-[#0b1120] z-10 min-w-[260px]">
                    {editing ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            value={g.number}
                            onChange={(e) => updateGoal(idx, { number: e.target.value })}
                            className={`w-12 bg-[#050914] border border-white/10 rounded px-1.5 py-1 text-sm text-center font-bold ${accentText}`}
                          />
                          <input
                            value={g.title}
                            onChange={(e) => updateGoal(idx, { title: e.target.value })}
                            placeholder="Goal title"
                            className="flex-1 bg-[#050914] border border-white/10 rounded px-2 py-1 text-sm font-semibold text-white"
                          />
                        </div>
                        <textarea
                          value={g.description}
                          onChange={(e) => updateGoal(idx, { description: e.target.value })}
                          placeholder="Describe the objective"
                          rows={2}
                          className="w-full bg-[#050914] border border-white/10 rounded px-2 py-1 text-xs text-gray-300"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className={`font-bold ${accentText}`}>{g.number}</span>
                          <span className="text-sm font-semibold text-white">{g.title}</span>
                        </div>
                        {g.description && (
                          <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                            {g.description}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  {FY26_MONTHS.map((m) => (
                    <td key={m} className="px-2 py-3 text-center">
                      <RagPicker
                        value={ragFor(g, m)}
                        onChange={(r) => setRag(idx, m, r)}
                        editing={editing}
                        compact
                      />
                    </td>
                  ))}
                  {editing && (
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeGoal(idx)}
                        aria-label="Remove goal"
                        className="text-red-400 hover:text-red-300 text-lg leading-none"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <button
          type="button"
          onClick={addGoal}
          className={`mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md border border-current ${accentText} hover:bg-white/5`}
        >
          + Add goal
        </button>
      )}
    </Section>
  );
}
