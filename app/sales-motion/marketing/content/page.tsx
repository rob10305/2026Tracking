'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, Settings, ExternalLink, Search } from 'lucide-react';
import {
  CONTENT_CATEGORY_OPTIONS,
  type ContentCategory,
  type ContentLink,
  type MarketingSettings,
  effectiveContentLinks,
} from '@/lib/marketing/content-links';

type CategoryFilter = ContentCategory | 'All';
const FILTER_OPTIONS: CategoryFilter[] = ['All', ...CONTENT_CATEGORY_OPTIONS];

const CATEGORY_BADGE: Record<ContentCategory, string> = {
  'Sales Deck': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'One-Pager': 'bg-sky-50 text-sky-700 border-sky-200',
  'Battlecard': 'bg-rose-50 text-rose-700 border-rose-200',
  'Case Study': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Video': 'bg-purple-50 text-purple-700 border-purple-200',
  'Technical Doc': 'bg-slate-50 text-slate-700 border-slate-200',
  'Brochure': 'bg-amber-50 text-amber-700 border-amber-200',
  'Other': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function ContentPage() {
  const [links, setLinks] = useState<ContentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/marketing', { cache: 'no-store' });
        const data = (await res.json()) as MarketingSettings | null;
        setLinks(effectiveContentLinks(data));
      } catch (e) {
        console.error('Failed to load marketing content', e);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((l) => {
      if (category !== 'All' && l.category !== category) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q)
      );
    });
  }, [links, category, query]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-100 text-teal-600">
          <Archive size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Curated links to marketing content. Click a card to open it in a new tab.
          </p>
        </div>
        <Link
          href="/settings/marketing"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
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
      ) : links.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 p-6 space-y-4 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    category === c
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, description, URL…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
              No content matches the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LinkCard({ link }: { link: ContentLink }) {
  const badgeClass = link.category ? CATEGORY_BADGE[link.category] : '';
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 hover:border-purple-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-2">
          {link.title || 'Untitled'}
        </h3>
        <ExternalLink size={14} className="text-gray-400 group-hover:text-purple-600 shrink-0 mt-0.5" />
      </div>
      {link.category && (
        <span className={`inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
          {link.category}
        </span>
      )}
      {link.description && (
        <p className="text-xs text-gray-600 line-clamp-3">{link.description}</p>
      )}
      <p className="text-[11px] text-gray-400 truncate mt-auto">{link.url}</p>
    </a>
  );
}

function EmptyState() {
  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
          <Archive size={28} className="text-teal-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">No content links yet</h2>
        <p className="text-sm text-gray-500 mb-4">
          An admin can add OneDrive, SharePoint, or any web link in Marketing Settings to populate this page.
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
