'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { analyzeOneDriveUrl } from '@/lib/onedrive/embed-url';

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

  const analysis = useMemo(() => analyzeOneDriveUrl(draft), [draft]);
  const willSaveAs = analysis.embedUrl;
  const transformed = willSaveAs && willSaveAs !== draft.trim();

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings/marketing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onedriveUrl: willSaveAs }),
      });
      setOnedriveUrl(willSaveAs);
      setDraft(willSaveAs);
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

  const dirty = willSaveAs !== onedriveUrl;
  const previewUrl = willSaveAs;

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
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Supported URL formats</p>
          <ul className="text-xs text-gray-600 ml-4 list-disc space-y-1">
            <li><strong>OneDrive Personal embed:</strong> <code className="bg-white px-1 rounded border border-gray-200">https://onedrive.live.com/embed?cid=...&amp;resid=...</code> (use the Embed dialog → copy the iframe src URL).</li>
            <li><strong>OneDrive Personal share link:</strong> <code className="bg-white px-1 rounded border border-gray-200">https://onedrive.live.com/?cid=...&amp;id=...&amp;authkey=...</code> — we'll auto-convert to the embed URL on save.</li>
            <li><strong>SharePoint / OneDrive for Business folder:</strong> we'll append <code className="bg-white px-1 rounded border border-gray-200">&amp;action=embedview</code>. The folder must be shared as "Anyone with the link".</li>
            <li><strong>1drv.ms short links won't work</strong> — open them in a browser and copy the long URL instead.</li>
          </ul>
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

          {analysis.warning && (
            <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-2">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{analysis.warning}</span>
            </div>
          )}

          {transformed && (
            <div className="mt-2 text-xs text-gray-500">
              <p className="font-semibold text-gray-700">We'll save this URL:</p>
              <code className="block mt-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 break-all">
                {willSaveAs}
              </code>
            </div>
          )}

          {willSaveAs && (
            <div className="mt-1.5 text-xs text-gray-500">
              <a href={willSaveAs} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Open in new tab <ExternalLink size={11} />
              </a>
              {' '}to verify the link before saving.
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={!dirty || saving || !willSaveAs}
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

        {previewUrl && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Live preview</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <iframe
                key={previewUrl}
                src={previewUrl}
                className="w-full"
                style={{ height: 360, border: 0 }}
                allowFullScreen
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              If the preview is blank, the folder isn't shared publicly or the URL isn't an embed URL. Check the warnings above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
