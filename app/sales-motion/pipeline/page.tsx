'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ExternalLink,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { ReportRenderer, type ReportResult } from '@/components/salesforce/ReportRenderer';
import { DashboardRenderer } from '@/components/salesforce/DashboardRenderer';

type ViewKind = 'report' | 'dashboard';

type PipelineView = {
  id: string;
  label: string;
  description: string;
  kind: ViewKind;
  reportId: string;
  sortOrder: number;
};

type DashboardRunResult = {
  dashboardMetadata?: { name?: string };
  componentData?: unknown[];
};

const INSTANCE_URL =
  process.env.NEXT_PUBLIC_SFDC_INSTANCE_URL ?? 'https://itmethods.my.salesforce.com';

export default function PipelinePage() {
  const [views, setViews] = useState<PipelineView[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [report, setReport] = useState<ReportResult | null>(null);
  const [dashboard, setDashboard] = useState<DashboardRunResult | null>(null);
  const [paneLoading, setPaneLoading] = useState(false);
  const [paneError, setPaneError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/pipeline-views');
        const data: PipelineView[] = await res.json();
        setViews(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (e) {
        console.error('Failed to load pipeline views', e);
      }
      setViewsLoading(false);
    })();
  }, []);

  const selected = useMemo(
    () => views.find((v) => v.id === selectedId) ?? null,
    [views, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setReport(null);
      setDashboard(null);
      return;
    }
    let cancelled = false;
    setPaneLoading(true);
    setPaneError('');
    setReport(null);
    setDashboard(null);
    (async () => {
      try {
        const endpoint =
          selected.kind === 'dashboard'
            ? `/api/salesforce/dashboards/${selected.reportId}`
            : `/api/salesforce/reports/${selected.reportId}`;
        const res = await fetch(endpoint, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setPaneError(
            typeof data?.detail === 'string'
              ? data.detail
              : data?.error ?? `Failed to run ${selected.kind}`,
          );
        } else if (selected.kind === 'dashboard') {
          setDashboard(data);
        } else {
          setReport(data);
        }
      } catch (e) {
        if (cancelled) return;
        setPaneError(e instanceof Error ? e.message : String(e));
      }
      if (!cancelled) setPaneLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [selected, reloadToken]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pipeline</h1>
              <p className="text-sm text-gray-500">
                Live Salesforce reports and dashboards. Switch views below.
              </p>
            </div>
          </div>
          <Link
            href="/settings/pipeline"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg bg-white"
          >
            <Settings size={14} /> Manage views
          </Link>
        </div>

        {viewsLoading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="animate-pulse h-4 w-40 bg-gray-100 rounded" />
          </div>
        ) : views.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ViewSelector views={views} selectedId={selectedId} onSelect={setSelectedId} />
            {selected && (
              <Pane
                view={selected}
                loading={paneLoading}
                error={paneError}
                report={report}
                dashboard={dashboard}
                onReload={() => setReloadToken((t) => t + 1)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center mb-3">
        <TrendingUp size={22} className="text-blue-600" />
      </div>
      <h2 className="font-semibold text-gray-800 mb-1">No pipeline views yet</h2>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
        Add Salesforce reports or dashboards in{' '}
        <Link href="/settings/pipeline" className="text-blue-600 hover:underline">
          Settings → Pipeline Views
        </Link>{' '}
        and they&apos;ll appear here as selectable views.
      </p>
      <Link
        href="/settings/pipeline"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        <Settings size={14} /> Configure views
      </Link>
    </div>
  );
}

function ViewSelector({
  views,
  selectedId,
  onSelect,
}: {
  views: PipelineView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {views.map((v) => {
        const active = v.id === selectedId;
        const Icon = v.kind === 'dashboard' ? LayoutDashboard : FileText;
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
              active
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            title={v.description || undefined}
          >
            <Icon size={12} className={active ? 'opacity-80' : 'opacity-60'} />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

function Pane({
  view,
  loading,
  error,
  report,
  dashboard,
  onReload,
}: {
  view: PipelineView;
  loading: boolean;
  error: string;
  report: ReportResult | null;
  dashboard: DashboardRunResult | null;
  onReload: () => void;
}) {
  const isDashboard = view.kind === 'dashboard';
  const sfPath = isDashboard ? 'Dashboard' : 'Report';
  const sfUrl = `${INSTANCE_URL.replace(/\/$/, '')}/lightning/r/${sfPath}/${view.reportId}/view`;
  const displayName = isDashboard
    ? dashboard?.dashboardMetadata?.name ?? view.label
    : report?.reportMetadata?.name ?? view.label;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                isDashboard ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isDashboard ? <LayoutDashboard size={10} /> : <FileText size={10} />}
              {isDashboard ? 'Dashboard' : 'Report'}
            </span>
            <h2 className="text-base font-semibold text-gray-800 truncate">{displayName}</h2>
          </div>
          {view.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{view.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onReload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href={sfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 px-2.5 py-1.5 border border-blue-200 rounded-lg bg-blue-50"
          >
            Open in Salesforce <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to run {isDashboard ? 'dashboard' : 'report'}</p>
              <p className="text-xs mt-0.5 break-words">{error}</p>
            </div>
          </div>
        ) : isDashboard ? (
          dashboard ? <DashboardRenderer dashboard={dashboard} /> : null
        ) : report ? (
          <ReportRenderer report={report} />
        ) : null}
      </div>
    </div>
  );
}
