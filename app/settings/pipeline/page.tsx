'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, TrendingUp, Check, ArrowUp, ArrowDown, Search, Loader2, AlertCircle } from 'lucide-react';

type PipelineView = {
  id: string;
  label: string;
  description: string;
  reportId: string;
  sortOrder: number;
};

type SfdcReportSummary = {
  id: string;
  name: string;
  developerName: string;
  folderName: string;
  format: string;
  description: string;
  lastModifiedDate: string;
};

const REPORT_ID_RE = /^[a-zA-Z0-9]{15,18}$/;

function extractReportId(raw: string): string {
  const trimmed = raw.trim();
  const urlMatch = trimmed.match(/\/([a-zA-Z0-9]{15,18})(?:\/|$|\?)/);
  return urlMatch ? urlMatch[1] : trimmed;
}

export default function PipelineSettingsPage() {
  const [views, setViews] = useState<PipelineView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newReportId, setNewReportId] = useState('');
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(0);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SfdcReportSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const existingIds = useMemo(
    () => new Set(views.map((v) => v.reportId)),
    [views],
  );

  const load = async () => {
    try {
      const res = await fetch('/api/settings/pipeline-views');
      const data = await res.json();
      setViews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load pipeline views', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!searchOpen) return;
    setSearchLoading(true);
    setSearchError('');
    const handle = setTimeout(async () => {
      try {
        const qs = new URLSearchParams();
        if (search.trim()) qs.set('q', search.trim());
        qs.set('limit', '25');
        const res = await fetch(`/api/salesforce/reports?${qs.toString()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setSearchError(
            typeof data?.detail === 'string'
              ? data.detail
              : data?.error ?? 'Failed to search reports',
          );
          setSearchResults([]);
        } else {
          setSearchResults(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (cancelled) return;
        setSearchError(e instanceof Error ? e.message : String(e));
        setSearchResults([]);
      }
      if (!cancelled) setSearchLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, searchOpen]);

  const selectReport = (r: SfdcReportSummary) => {
    setNewReportId(r.id);
    if (!newLabel.trim()) setNewLabel(r.name);
    if (!newDescription.trim() && r.description) setNewDescription(r.description);
    setSearchOpen(false);
  };

  const normalizedNewReportId = extractReportId(newReportId);
  const canAdd =
    newLabel.trim().length > 0 && REPORT_ID_RE.test(normalizedNewReportId);

  const handleAdd = async () => {
    if (!canAdd) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/settings/pipeline-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel.trim(),
          description: newDescription.trim(),
          reportId: normalizedNewReportId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Failed to add view');
      } else {
        setNewLabel('');
        setNewDescription('');
        setNewReportId('');
        setSavedAt(Date.now());
        await load();
      }
    } catch (e) {
      console.error(e);
      setError('Failed to add view');
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string, patch: Partial<PipelineView>) => {
    try {
      const res = await fetch(`/api/settings/pipeline-views/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? 'Update failed');
        return;
      }
      setSavedAt(Date.now());
      await load();
    } catch (e) {
      console.error(e);
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete pipeline view "${label}"?`)) return;
    try {
      const res = await fetch(`/api/settings/pipeline-views/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        alert('Delete failed');
        return;
      }
      setSavedAt(Date.now());
      await load();
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const handleMove = async (id: string, direction: -1 | 1) => {
    const idx = views.findIndex((v) => v.id === id);
    if (idx < 0) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= views.length) return;
    const a = views[idx];
    const b = views[swapIdx];
    await Promise.all([
      fetch(`/api/settings/pipeline-views/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
      fetch(`/api/settings/pipeline-views/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
    ]);
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Pipeline Views</h1>
        <p className="text-gray-500 mt-1">
          Configure which Salesforce reports appear as selectable views on{' '}
          <Link
            href="/sales-motion/pipeline"
            className="text-blue-600 hover:underline"
          >
            Pipeline → Overview
          </Link>
          .
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Plus size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Add a view</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse your Salesforce reports, or paste an ID / URL below.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Browse Salesforce reports
          </label>
          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-400">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search report name, folder, or developer name…"
                className="flex-1 text-sm outline-none bg-transparent"
              />
              {searchLoading && (
                <Loader2 size={14} className="text-gray-400 animate-spin flex-shrink-0" />
              )}
              {searchOpen && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Hide
                </button>
              )}
              {!searchOpen && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Browse
                </button>
              )}
            </div>

            {searchOpen && (
              <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm max-h-80 overflow-y-auto">
                {searchError ? (
                  <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Couldn&apos;t load reports</p>
                      <p className="text-xs mt-0.5 break-words">{searchError}</p>
                    </div>
                  </div>
                ) : searchResults.length === 0 && !searchLoading ? (
                  <p className="text-sm text-gray-500 p-3">
                    {search.trim() ? 'No reports match that search.' : 'No reports returned.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map((r) => {
                      const alreadyAdded = existingIds.has(r.id);
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => selectReport(r)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {r.name || r.developerName || r.id}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {r.folderName || 'Private'} · {r.format || 'TABULAR'}
                                  {r.lastModifiedDate && (
                                    <>
                                      {' · updated '}
                                      {new Date(r.lastModifiedDate).toLocaleDateString()}
                                    </>
                                  )}
                                </p>
                              </div>
                              {alreadyAdded && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                  Added
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Label
            </label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Open Pipeline"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Report ID or URL
            </label>
            <input
              value={newReportId}
              onChange={(e) => setNewReportId(e.target.value)}
              placeholder="00O8Z000001pQrZUAU"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
            />
            {newReportId && !REPORT_ID_RE.test(normalizedNewReportId) && (
              <p className="mt-1 text-xs text-amber-700">
                Couldn&apos;t find a valid report ID in that value.
              </p>
            )}
            {newReportId && REPORT_ID_RE.test(normalizedNewReportId) &&
              normalizedNewReportId !== newReportId.trim() && (
                <p className="mt-1 text-xs text-gray-500">
                  Will save as{' '}
                  <code className="bg-gray-100 px-1 rounded">
                    {normalizedNewReportId}
                  </code>
                </p>
              )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description (optional)
            </label>
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Shown as a subtitle under the view"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            disabled={!canAdd || saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            {saving ? 'Adding…' : 'Add view'}
          </button>
          {savedAt > 0 && Date.now() - savedAt < 2500 && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Configured views
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {views.length === 0
                ? 'No views yet — add one above.'
                : `${views.length} view${views.length === 1 ? '' : 's'} will appear in the pipeline selector.`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse h-4 w-40 bg-gray-100 rounded" />
          </div>
        ) : views.length === 0 ? null : (
          <ul className="divide-y divide-gray-100">
            {views.map((v, i) => (
              <li key={v.id} className="px-6 py-4">
                <ViewRow
                  view={v}
                  isFirst={i === 0}
                  isLast={i === views.length - 1}
                  onSave={(patch) => handleUpdate(v.id, patch)}
                  onDelete={() => handleDelete(v.id, v.label)}
                  onMove={(dir) => handleMove(v.id, dir)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ViewRow({
  view,
  isFirst,
  isLast,
  onSave,
  onDelete,
  onMove,
}: {
  view: PipelineView;
  isFirst: boolean;
  isLast: boolean;
  onSave: (patch: Partial<PipelineView>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [label, setLabel] = useState(view.label);
  const [description, setDescription] = useState(view.description);
  const [reportIdInput, setReportIdInput] = useState(view.reportId);

  useEffect(() => {
    setLabel(view.label);
    setDescription(view.description);
    setReportIdInput(view.reportId);
  }, [view.id, view.label, view.description, view.reportId]);

  const normalized = extractReportId(reportIdInput);
  const reportValid = REPORT_ID_RE.test(normalized);
  const dirty =
    label.trim() !== view.label ||
    description.trim() !== view.description ||
    normalized !== view.reportId;
  const canSave = dirty && label.trim().length > 0 && reportValid;

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col gap-1 pt-1">
        <button
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move up"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={isLast}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move down"
        >
          <ArrowDown size={14} />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Report ID
          </label>
          <input
            value={reportIdInput}
            onChange={(e) => setReportIdInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            onClick={() =>
              onSave({
                label: label.trim(),
                description: description.trim(),
                reportId: normalized,
              })
            }
            disabled={!canSave}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            aria-label="Delete view"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
