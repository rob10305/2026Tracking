"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACCENT_BG,
  ACCENT_TEXT,
  ACCENT_BORDER,
  AccentKey,
  Card,
  DepartmentConfig,
  Section,
} from "../DepartmentView";

type RetroKind = "onTarget" | "offTarget" | "needChange" | "lessons";

type Item = { id?: string; kind: RetroKind; order: number; body: string };

const QUADRANTS: Array<{ key: RetroKind; label: string; accent: AccentKey }> = [
  { key: "onTarget", label: "On Target Results", accent: "emerald" },
  { key: "offTarget", label: "Off Target Results", accent: "amber" },
  { key: "needChange", label: "In Need of Change", accent: "sky" },
  { key: "lessons", label: "Lessons Learned", accent: "violet" },
];

export default function EditableRetrospect({
  dept,
  config,
}: {
  dept: string;
  config: DepartmentConfig;
}) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];

  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/aop/${dept}/retrospect`, { cache: "no-store" });
        const data = (await res.json()) as { items: Item[] };
        if (cancelled) return;
        const loaded = (data.items ?? []) as Item[];
        let seed: Item[] = loaded;
        if (loaded.length === 0) {
          // Seed from the static config so users aren't editing a blank slate.
          seed = [];
          for (const q of QUADRANTS) {
            const source = config.retrospect[q.key] ?? [];
            source.forEach((body, order) => {
              seed.push({ kind: q.key, order, body });
            });
          }
        }
        setItems(seed);
        setDraft(seed);
      } catch (e) {
        console.error("Failed to load retrospect", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dept, config.retrospect]);

  const dirty = useMemo(
    () => JSON.stringify(items) !== JSON.stringify(draft),
    [items, draft]
  );

  const startEdit = () => {
    setDraft(items);
    setEditing(true);
  };
  const cancel = () => {
    setDraft(items);
    setEditing(false);
  };
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/aop/${dept}/retrospect`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: draft }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const r2 = await fetch(`/api/aop/${dept}/retrospect`, { cache: "no-store" });
      const data = await r2.json();
      setItems(data.items ?? []);
      setDraft(data.items ?? []);
      setEditing(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      console.error("Failed to save retrospect", e);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const itemsFor = (kind: RetroKind) =>
    (editing ? draft : items)
      .filter((i) => i.kind === kind)
      .sort((a, b) => a.order - b.order);

  const addItem = (kind: RetroKind) => {
    setDraft((prev) => {
      const sameKind = prev.filter((i) => i.kind === kind);
      return [...prev, { kind, order: sameKind.length, body: "" }];
    });
  };

  const updateItem = (kind: RetroKind, kindIdx: number, body: string) => {
    setDraft((prev) => {
      const result: Item[] = [];
      let counter = 0;
      for (const item of prev) {
        if (item.kind !== kind) {
          result.push(item);
          continue;
        }
        if (counter === kindIdx) {
          result.push({ ...item, body });
        } else {
          result.push(item);
        }
        counter += 1;
      }
      return result;
    });
  };

  const removeItem = (kind: RetroKind, kindIdx: number) => {
    setDraft((prev) => {
      const result: Item[] = [];
      let counter = 0;
      for (const item of prev) {
        if (item.kind !== kind) {
          result.push(item);
          continue;
        }
        if (counter !== kindIdx) {
          result.push(item);
        }
        counter += 1;
      }
      return result;
    });
  };

  return (
    <Section eyebrow="FY25 Retrospect" title="What worked, what didn't, what changes">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map((q) => {
          const list = itemsFor(q.key);
          const qAccent = ACCENT_TEXT[q.accent];
          return (
            <Card key={q.key} accent={q.accent}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${qAccent}`}>
                {q.label}
              </h3>
              <ul className="mt-3 space-y-2">
                {list.length === 0 && !editing && (
                  <li className="text-sm text-gray-600">No entries yet.</li>
                )}
                {list.map((item, kindIdx) => (
                  <li key={item.id ?? `tmp-${q.key}-${kindIdx}`} className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1 w-1 rounded-full ${ACCENT_BG[q.accent]} shrink-0`} />
                    {editing ? (
                      <div className="flex-1 flex items-start gap-2">
                        <textarea
                          value={item.body}
                          onChange={(e) => updateItem(q.key, kindIdx, e.target.value)}
                          rows={1}
                          className={`flex-1 bg-[#050914] border ${ACCENT_BORDER[q.accent]} border-opacity-30 rounded px-2 py-1 text-sm text-gray-200 resize-y`}
                          placeholder="Entry"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(q.key, kindIdx)}
                          aria-label="Remove entry"
                          className="text-red-400 hover:text-red-300 text-sm leading-none pt-1"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300 leading-relaxed">
                        {item.body}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {editing && (
                <button
                  type="button"
                  onClick={() => addItem(q.key)}
                  className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${qAccent} hover:opacity-80`}
                >
                  + Add entry
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
