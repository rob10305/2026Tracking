'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Archive, Settings, ExternalLink } from 'lucide-react';

export default function ContentPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/marketing');
        const data = await res.json();
        setUrl(data?.onedriveUrl ?? '');
      } catch (e) {
        console.error('Failed to load marketing settings', e);
      }
      setLoading(false);
    })();
  }, []);

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
      ) : (
        <div className="flex-1 p-6">
          <div className="mb-3 flex items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
              Open in OneDrive <ExternalLink size={12} />
            </a>
          </div>
          <div className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            <iframe
              src={url}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 220px)' }}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
