'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, Check, ExternalLink } from 'lucide-react';

export default function MarketingSettingsPage() {
  const [onedriveUrl, setOnedriveUrl] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/marketing');
        const data = await res.json();
        const url = data?.onedriveUrl ?? '';
        setOnedriveUrl(url);
        setDraft(url);
      } catch (e) {
        console.error('Failed to load marketing settings', e);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings/marketing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onedriveUrl: draft.trim() }),
      });
      setOnedriveUrl(draft.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Failed to save', e);
      alert('Failed to save. Please try again.');
    }
    setSaving(false);
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

  const dirty = draft.trim() !== onedriveUrl;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Marketing Settings</h1>
        <p className="text-gray-500 mt-1">Configure marketing integrations and embedded content.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Archive size={20} className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Content Library — OneDrive Folder</h2>
            <p className="text-sm text-gray-500 mt-0.5">The embedded folder rendered on <Link href="/sales-motion/marketing/content" className="text-blue-600 hover:underline">Marketing → Content</Link>.</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-700 mb-1.5">How to get a OneDrive embed URL</p>
          <ol className="text-xs text-gray-600 ml-4 list-decimal space-y-1">
            <li>In OneDrive, right-click the folder and choose <strong>Embed</strong> (or Share → Copy link).</li>
            <li>Copy the <code className="bg-white px-1 rounded border border-gray-200">src</code> URL from the iframe snippet (starts with <code className="bg-white px-1 rounded border border-gray-200">https://onedrive.live.com/embed?...</code> or a SharePoint URL).</li>
            <li>Paste it below. Permissions are enforced by the folder's sharing settings.</li>
          </ol>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">OneDrive Embed URL</label>
          <input
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://onedrive.live.com/embed?resid=..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          {draft && (
            <div className="mt-1.5 text-xs text-gray-500">
              <a href={draft} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Open in new tab <ExternalLink size={11} />
              </a>
              {' '}to verify the link before saving.
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Check size={14} /> Saved
            </span>
          )}
          {!dirty && onedriveUrl && !saved && (
            <span className="text-xs text-gray-400">No unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
