'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, Settings, ExternalLink, AlertTriangle } from 'lucide-react';
import { analyzeOneDriveUrl } from '@/lib/onedrive/embed-url';

export default function ContentPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [iframeFailed, setIframeFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/marketing', { cache: 'no-store' });
        const data = await res.json();
        setUrl(data?.onedriveUrl ?? '');
      } catch (e) {
        console.error('Failed to load marketing settings', e);
      }
      setLoading(false);
    })();
  }, []);

  // Re-derive analysis client-side so the warning shows even if the stored URL
  // bypassed the API normalization (older saved values).
  const analysis = useMemo(() => analyzeOneDriveUrl(url), [url]);
  const renderUrl = analysis.embedUrl;

  // If the iframe doesn't fire `load` quickly, X-Frame-Options has likely
  // blocked it cross-origin. Browsers don't expose that as an event we can
  // listen to, so we use a tolerant timeout as a fallback signal.
  useEffect(() => {
    if (!renderUrl) return;
    setIframeFailed(false);
    let loaded = false;
    const onLoad = () => { loaded = true; };
    const iframe = document.getElementById('onedrive-embed') as HTMLIFrameElement | null;
    iframe?.addEventListener('load', onLoad);
    const t = setTimeout(() => {
      if (!loaded) setIframeFailed(true);
    }, 6000);
    return () => {
      clearTimeout(t);
      iframe?.removeEventListener('load', onLoad);
    };
  }, [renderUrl]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-100 text-teal-600">
          <Archive size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500 mt-0.5">OneDrive content library — permissions are enforced by the shared folder settings.</p>
        </div>
        {renderUrl && (
          <a
            href={renderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open in OneDrive <ExternalLink size={14} />
          </a>
        )}
        <Link href="/settings/marketing" className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
          <Settings size={14} /> Configure
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      ) : !url ? (
        <EmptyState />
      ) : (
        <div className="flex-1 p-6 space-y-3">
          {analysis.warning && (
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Heads-up about this URL</p>
                <p className="text-xs mt-0.5">{analysis.warning}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
            <iframe
              id="onedrive-embed"
              src={renderUrl}
              className="w-full border-0"
              style={{ minHeight: 'calc(100vh - 260px)' }}
              allowFullScreen
            />
            {iframeFailed && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 p-6">
                <div className="max-w-md text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle size={22} className="text-amber-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">
                    The folder didn't load in this iframe
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    OneDrive often blocks embedding when the folder isn't shared
                    publicly or when the URL isn't an embed URL. Open it in a new
                    tab, or update the URL in Marketing Settings.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <a
                      href={renderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Open in OneDrive <ExternalLink size={14} />
                    </a>
                    <Link
                      href="/settings/marketing"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      <Settings size={14} /> Update URL
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
          <Archive size={28} className="text-teal-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">No content folder configured</h2>
        <p className="text-sm text-gray-500 mb-4">
          An admin needs to configure the OneDrive embed URL in settings before the content library will render here.
        </p>
        <Link
          href="/settings/marketing"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <Settings size={14} /> Go to Marketing Settings
        </Link>
      </div>
    </div>
  );
}
