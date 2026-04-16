"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACCENT_BG,
  ACCENT_TEXT,
  Card,
  DepartmentConfig,
  Section,
} from "../DepartmentView";
import RagPicker, { Rag } from "./RagPicker";

type Initiative = {
  id?: string;
  order: number;
  number: string;
  description: string;
  owner: string;
  q1Rag: Rag;
  q2Rag: Rag;
  q3Rag: Rag;
  q4Rag: Rag;
  q1Note: string;
  q2Note: string;
  q3Note: string;
  q4Note: string;
};

type Insight = {
  id?: string;
  order: number;
  body: string;
};

const QUARTERS: Array<{ key: "q1" | "q2" | "q3" | "q4"; label: string }> = [
  { key: "q1", label: "Q1" },
  { key: "q2", label: "Q2" },
  { key: "q3", label: "Q3" },
  { key: "q4", label: "Q4" },
];

export default function EditableInitiatives({
  dept,
  config,
}: {
  dept: string;
  config: DepartmentConfig;
}) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];

  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [draftInit, setDraftInit] = useState<Initiative[]>([]);
  const [draftIns, setDraftIns] = useState<Insight[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/aop/${dept}/initiatives`, { cache: "no-store" });
        const data = (await res.json()) as {
          initiatives: Initiative[];
          insights: Insight[];
        };
        if (cancelled) return;
        const init = data.initiatives ?? [];
        const ins = data.insights ?? [];
        // Seed with 6 empty rows if DB is empty to match the original placeholder.
        const seed: Initiative[] =
          init.length > 0
            ? init
            : Array.from({ length: 6 }, (_, i) => ({
                order: i,
                number: String(i + 1).padStart(2, "0"),
                description: "",
                owner: "",
                q1Rag: "",
                q2Rag: "",
                q3Rag: "",
                q4Rag: "",
                q1Note: "",
                q2Note: "",
                q3Note: "",
                q4Note: "",
              }));
        setInitiatives(seed);
        setDraftInit(seed);
        setInsights(ins);
        setDraftIns(ins);
      } catch (e) {
        console.error("Failed to load initiatives", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dept]);

  const dirty = useMemo(
    () =>
      JSON.stringify(initiatives) !== JSON.stringify(draftInit) ||
      JSON.stringify(insights) !== JSON.stringify(draftIns),
    [initiatives, draftInit, insights, draftIns]
  );

  const startEdit = () => {
    setDraftInit(initiatives);
    setDraftIns(insights);
    setEditing(true);
  };
  const cancel = () => {
    setDraftInit(initiatives);
    setDraftIns(insights);
    setEditing(false);
  };
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/aop/${dept}/initiatives`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiatives: draftInit.map((i, idx) => ({ ...i, order: idx })),
          insights: draftIns.map((i, idx) => ({ ...i, order: idx })),
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const r2 = await fetch(`/api/aop/${dept}/initiatives`, { cache: "no-store" });
      const data = await r2.json();
      setInitiatives(data.initiatives ?? []);
      setDraftInit(data.initiatives ?? []);
      setInsights(data.insights ?? []);
      setDraftIns(data.insights ?? []);
      setEditing(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      console.error("Failed to save initiatives", e);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (idx: number, patch: Partial<Initiative>) =>
    setDraftInit((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRow = () =>
    setDraftInit((prev) => [
      ...prev,
      {
        order: prev.length,
        number: String(prev.length + 1).padStart(2, "0"),
        description: "",
        owner: "",
        q1Rag: "",
        q2Rag: "",
        q3Rag: "",
        q4Rag: "",
        q1Note: "",
        q2Note: "",
        q3Note: "",
        q4Note: "",
      },
    ]);

  const removeRow = (idx: number) =>
    setDraftInit((prev) => prev.filter((_, i) => i !== idx));

  const addInsight = () =>
    setDraftIns((prev) => [...prev, { order: prev.length, body: "" }]);
  const updateInsight = (idx: number, body: string) =>
    setDraftIns((prev) => prev.map((r, i) => (i === idx ? { ...r, body } : r)));
  const removeInsight = (idx: number) =>
    setDraftIns((prev) => prev.filter((_, i) => i !== idx));

  const rows = editing ? draftInit : initiatives;
  const insightRows = editing ? draftIns : insights;

  return (
    <>
      <Section eyebrow="Departmental Initiatives" title="Cross-quarter execution">
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

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  {["#", "Description", "Q1", "Q2", "Q3", "Q4", "Who", ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id ?? idx} className="border-t border-white/5 align-top">
                    <td className="px-3 py-2 w-14">
                      {editing ? (
                        <input
                          value={r.number}
                          onChange={(e) => updateRow(idx, { number: e.target.value })}
                          className={`w-12 bg-[#050914] border border-white/10 rounded px-1.5 py-1 text-sm text-center ${accentText}`}
                        />
                      ) : (
                        <span className={`font-semibold ${accentText}`}>{r.number || "—"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[260px]">
                      {editing ? (
                        <textarea
                          value={r.description}
                          onChange={(e) => updateRow(idx, { description: e.target.value })}
                          placeholder="Describe the initiative"
                          rows={2}
                          className="w-full bg-[#050914] border border-white/10 rounded px-2 py-1 text-sm text-gray-200"
                        />
                      ) : (
                        <span className="text-gray-300">
                          {r.description || <span className="text-gray-600">—</span>}
                        </span>
                      )}
                    </td>
                    {QUARTERS.map((q) => (
                      <td key={q.key} className="px-3 py-2 w-28">
                        <div className="flex flex-col gap-1">
                          <RagPicker
                            value={r[`${q.key}Rag`] as Rag}
                            onChange={(next) => updateRow(idx, { [`${q.key}Rag`]: next } as Partial<Initiative>)}
                            editing={editing}
                          />
                          {editing && (
                            <input
                              value={r[`${q.key}Note`] as string}
                              onChange={(e) => updateRow(idx, { [`${q.key}Note`]: e.target.value } as Partial<Initiative>)}
                              placeholder="Note"
                              className="w-full bg-[#050914] border border-white/10 rounded px-1.5 py-1 text-[11px] text-gray-200"
                            />
                          )}
                          {!editing && (r[`${q.key}Note`] as string) && (
                            <span className="text-[11px] text-gray-400 italic">{r[`${q.key}Note`] as string}</span>
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-2 min-w-[120px]">
                      {editing ? (
                        <input
                          value={r.owner}
                          onChange={(e) => updateRow(idx, { owner: e.target.value })}
                          placeholder="Who"
                          className="w-full bg-[#050914] border border-white/10 rounded px-2 py-1 text-sm text-gray-200"
                        />
                      ) : (
                        <span className="text-gray-200">
                          {r.owner || <span className="text-gray-600">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 w-12 text-right">
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          aria-label="Remove"
                          className="text-red-400 hover:text-red-300 text-lg leading-none"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {editing && (
          <button
            type="button"
            onClick={addRow}
            className={`mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md border border-current ${accentText} hover:bg-white/5`}
          >
            + Add initiative
          </button>
        )}
      </Section>

      <Section eyebrow="Insights" title="Observations related to these initiatives">
        <div className="space-y-2">
          {insightRows.length === 0 && !editing && (
            <Card accent={config.accent}>
              <p className="text-sm text-gray-400">No insights yet.</p>
            </Card>
          )}
          {insightRows.map((row, idx) => (
            <Card key={row.id ?? `tmp-${idx}`} accent={config.accent}>
              {editing ? (
                <div className="flex items-start gap-3">
                  <textarea
                    value={row.body}
                    onChange={(e) => updateInsight(idx, e.target.value)}
                    rows={2}
                    placeholder="Insight / observation…"
                    className="flex-1 bg-[#050914] border border-white/10 rounded px-3 py-2 text-sm text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeInsight(idx)}
                    aria-label="Remove insight"
                    className="text-red-400 hover:text-red-300 text-lg leading-none pt-1"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-200 whitespace-pre-wrap">
                  {row.body || <span className="text-gray-600">(empty)</span>}
                </p>
              )}
            </Card>
          ))}
        </div>

        {editing && (
          <button
            type="button"
            onClick={addInsight}
            className={`mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md border border-current ${accentText} hover:bg-white/5`}
          >
            + Add insight
          </button>
        )}
      </Section>
    </>
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
