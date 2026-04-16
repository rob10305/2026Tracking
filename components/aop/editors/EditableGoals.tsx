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
        // Seed from static config if DB is empty.
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
            progress: g.progress,
          })),
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      // Refetch to get server IDs.
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
      alert("Failed to save goals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    setDraft((prev) => [
      ...prev,
      {
        order: prev.length,
        number: String(prev.length + 1).padStart(2, "0"),
        title: "Goal Title",
        description: "Describe the specific FY26 objective, target metric, and why it matters to the plan.",
        progress: [],
      },
    ]);
  };

  const removeGoal = (idx: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateGoal = (idx: number, patch: Partial<Goal>) => {
    setDraft((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const updateProgress = (goalIdx: number, month: string, patch: Partial<Progress>) => {
    setDraft((prev) =>
      prev.map((g, i) => {
        if (i !== goalIdx) return g;
        const existing = g.progress.find((p) => p.month === month);
        const nextProgress = existing
          ? g.progress.map((p) => (p.month === month ? { ...p, ...patch } : p))
          : [...g.progress, { month, rag: "", note: "", ...patch } as Progress];
        return { ...g, progress: nextProgress };
      })
    );
  };

  const source = editing ? draft : goals;

  const keyFor = (g: Goal, i: number) => g.id ?? `tmp-goal-${i}`;

  return (
    <Section eyebrow="FY2026 Goals" title={config.goals.headline}>
      <p className="text-gray-400">{config.goals.subhead}</p>

      <EditControls
        editing={editing}
        loading={loading}
        saving={saving}
        dirty={dirty}
        savedAt={savedAt}
        accentText={accentText}
        accentBg={accentBg}
        onEdit={startEdit}
        onCancel={cancel}
        onSave={save}
      />

      {source.length === 0 && !editing && (
        <Card accent={config.accent}>
          <p className="text-sm text-gray-400">No goals yet. Click Edit to add one.</p>
        </Card>
      )}

      <div className="space-y-4">
        {source.map((g, idx) => (
          <Card key={keyFor(g, idx)} accent={config.accent}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-16">
                {editing ? (
                  <input
                    value={g.number}
                    onChange={(e) => updateGoal(idx, { number: e.target.value })}
                    className={`w-full bg-[#050914] border border-white/10 rounded px-2 py-1 text-2xl font-bold text-center ${accentText}`}
                  />
                ) : (
                  <p className={`text-3xl font-bold ${accentText}`}>{g.number}</p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <>
                    <input
                      value={g.title}
                      onChange={(e) => updateGoal(idx, { title: e.target.value })}
                      className="w-full bg-[#050914] border border-white/10 rounded px-3 py-2 text-lg font-semibold text-white"
                    />
                    <textarea
                      value={g.description}
                      onChange={(e) => updateGoal(idx, { description: e.target.value })}
                      rows={2}
                      className="mt-2 w-full bg-[#050914] border border-white/10 rounded px-3 py-2 text-sm text-gray-200"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-white">{g.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 leading-relaxed">{g.description}</p>
                  </>
                )}
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => removeGoal(idx)}
                  className="shrink-0 text-xs text-red-400 hover:text-red-300 uppercase tracking-wider font-semibold"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Monthly progress grid */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
                Monthly Progress
              </p>
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="text-left pb-2 pr-3 w-20">Month</th>
                      <th className="text-left pb-2 pr-3 w-32">Status</th>
                      <th className="text-left pb-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FY26_MONTHS.map((month) => {
                      const entry = g.progress.find((p) => p.month === month);
                      const rag: Rag = (entry?.rag ?? "") as Rag;
                      const note = entry?.note ?? "";
                      return (
                        <tr key={month} className="border-t border-white/5">
                          <td className="py-1.5 pr-3 text-gray-400">
                            {shortMonthLabel(month)}
                          </td>
                          <td className="py-1.5 pr-3">
                            <RagPicker
                              value={rag}
                              onChange={(r) => updateProgress(idx, month, { rag: r })}
                              editing={editing}
                            />
                          </td>
                          <td className="py-1.5">
                            {editing ? (
                              <input
                                value={note}
                                onChange={(e) => updateProgress(idx, month, { note: e.target.value })}
                                placeholder="Optional note"
                                className="w-full bg-[#050914] border border-white/10 rounded px-2 py-1 text-xs text-gray-200"
                              />
                            ) : (
                              <span className="text-gray-300">
                                {note || <span className="text-gray-600">—</span>}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        ))}
      </div>

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

function EditControls({
  editing,
  loading,
  saving,
  dirty,
  savedAt,
  accentText,
  accentBg,
  onEdit,
  onCancel,
  onSave,
}: {
  editing: boolean;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  savedAt: number | null;
  accentText: string;
  accentBg: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 -mt-2">
      {savedAt && <span className="text-xs text-emerald-400">Saved</span>}
      {editing ? (
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md ${accentBg} text-[#050914] hover:opacity-90 disabled:opacity-40`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border ${
            loading ? "border-white/10 text-gray-500" : `border-current ${accentText} hover:bg-white/5`
          }`}
        >
          {loading ? "Loading…" : "Edit"}
        </button>
      )}
    </div>
  );
}

