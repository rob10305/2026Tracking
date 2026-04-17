'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, Check, ExternalLink, Plus, Trash2, GripVertical } from 'lucide-react';
import {
  CONTENT_CATEGORY_OPTIONS,
  type ContentCategory,
  type ContentLink,
  type MarketingSettings,
  makeContentLink,
  effectiveContentLinks,
} from '@/lib/marketing/content-links';

export default function MarketingSettingsPage() {
  const [saved, setSaved] = useState<ContentLink[]>([]);
  const [draft, setDraft] = useState<ContentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hadLegacy, setHadLegacy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/marketing', { cache: 'no-store' });
        const data = (await res.json()) as MarketingSettings | null;
        const initial = effectiveContentLinks(data);
        setSaved(initial);
        setDraft(initial);
        setHadLegacy(Boolean(data?.onedriveUrl && !(data?.contentLinks?.length)));
      } catch (e) {
        console.error('Failed to load marketing settings', e);
      }
      setLoading(false);
    })();
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(saved) !== JSON.stringify(draft),
    [saved, draft]
  );

  const save = async () => {
    setSaving(true);
    setSavedAt(null);
    try {
      // Clear `onedriveUrl` once the admin has saved the new list so we
      // stop showing the legacy migration hint on subsequent loads.
      const body: MarketingSettings = {
        contentLinks: draft.map((l) => ({
          ...l,
          id: l.id.startsWith('legacy-') ? crypto.randomUUID() : l.id,
          addedAt: l.addedAt || new Date().toISOString(),
        })),
        // Retire the legacy single-iframe URL now that we've moved to the list.
        onedriveUrl: '',
      };
      const res = await fetch('/api/settings/marketing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaved(draft);
      setHadLegacy(false);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (e) {
      console.error('Failed to save', e);
      alert('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const addLink = () => setDraft((prev) => [...prev, makeContentLink()]);
  const removeLink = (id: string) =>
    setDraft((prev) => prev.filter((l) => l.id !== id));
  const updateLink = (id: string, patch: Partial<ContentLink>) =>
    setDraft((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const moveLink = (id: string, dir: -1 | 1) => {
    setDraft((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Marketing Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage the curated list of content links shown on{' '}
          <Link href="/sales-motion/marketing/content" className="text-blue-600 hover:underline">
            Marketing → Content
          </Link>
          .
        </p>
      </div>

      {hadLegacy && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Archive size={16} />
          </div>
          <div className="text-sm text-amber-900">
            <p className="font-semibold">We migrated your existing OneDrive URL into the new list.</p>
            <p className="mt-0.5 text-amber-800">
              Review the entry below, tweak the title/description, and hit Save to finalize. The old
              iframe-embed setting is being retired in favor of this link list.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
            <Archive size={20} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-800">Content Links</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Paste any OneDrive, SharePoint, Google Drive, or web URL. Each entry becomes a card on the Content page; clicking it opens the link in a new tab.
            </p>
          </div>
        </div>

        {draft.length === 0 ? (
          <p className="text-sm text-gray-500 italic border border-dashed border-gray-200 rounded-lg p-6 text-center">
            No links yet. Click &ldquo;+ Add Link&rdquo; below to create your first one.
          </p>
        ) : (
          <div className="space-y-3">
            {draft.map((link, idx) => (
              <LinkRow
                key={link.id}
                link={link}
                isFirst={idx === 0}
                isLast={idx === draft.length - 1}
                onChange={(patch) => updateLink(link.id, patch)}
                onRemove={() => removeLink(link.id)}
                onMoveUp={() => moveLink(link.id, -1)}
                onMoveDown={() => moveLink(link.id, 1)}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-purple-700 hover:border-purple-300"
        >
          <Plus size={14} /> Add Link
        </button>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Check size={14} /> Saved
            </span>
          )}
          {!dirty && !savedAt && (
            <span className="text-xs text-gray-400">No unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkRow({
  link,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  link: ContentLink;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<ContentLink>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move up"
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
          >
            <GripVertical size={14} className="rotate-90" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move down"
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
          >
            <GripVertical size={14} className="-rotate-90" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Title</label>
            <input
              type="text"
              value={link.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. GitLab Partnership Overview Deck"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Category</label>
            <select
              value={link.category}
              onChange={(e) => onChange({ category: e.target.value as ContentCategory | '' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-blue-400"
            >
              <option value="">— Uncategorized —</option>
              {CONTENT_CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={link.url}
                onChange={(e) => onChange({ url: e.target.value })}
                placeholder="https://…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-blue-400"
              />
              {link.url && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0"
                >
                  Open <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Description (optional)</label>
            <textarea
              value={link.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Short note about what this link contains…"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove link"
          className="text-gray-400 hover:text-red-500 mt-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
