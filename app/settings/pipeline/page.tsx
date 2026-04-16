'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, TrendingUp, Check, ArrowUp, ArrowDown } from 'lucide-react';

type PipelineView = {
  id: string;
  label: string;
  description: string;
  reportId: string;
  sortOrder: number;
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
              Paste a Salesforce report URL or a 15/18-char report ID.
            </p>
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
