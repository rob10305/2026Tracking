'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ExternalLink, RefreshCw, Settings, TrendingUp } from 'lucide-react';

type PipelineView = {
  id: string;
  label: string;
  description: string;
  reportId: string;
  sortOrder: number;
};

type ReportResult = {
  allData?: boolean;
  factMap?: Record<
    string,
    {
      aggregates?: Array<{ label: string; value: number | string | null }>;
      rows?: Array<{ dataCells: Array<{ label: string; value: unknown }> }>;
    }
  >;
  reportMetadata?: {
    name?: string;
    reportFormat?: 'TABULAR' | 'SUMMARY' | 'MATRIX' | string;
    detailColumns?: string[];
    aggregates?: string[];
  };
  reportExtendedMetadata?: {
    detailColumnInfo?: Record<string, { label?: string; dataType?: string }>;
    aggregateColumnInfo?: Record<string, { label?: string; dataType?: string }>;
  };
};

const INSTANCE_URL =
  process.env.NEXT_PUBLIC_SFDC_INSTANCE_URL ?? 'https://itmethods.my.salesforce.com';

export default function PipelinePage() {
  const [views, setViews] = useState<PipelineView[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [report, setReport] = useState<ReportResult | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
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
      return;
    }
    let cancelled = false;
    setReportLoading(true);
    setReportError('');
    setReport(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/salesforce/reports/${selected.reportId}`,
          { cache: 'no-store' },
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setReportError(
            typeof data?.detail === 'string'
              ? data.detail
              : data?.error ?? 'Failed to run report',
          );
        } else {
          setReport(data);
        }
      } catch (e) {
        if (cancelled) return;
        setReportError(e instanceof Error ? e.message : String(e));
      }
      if (!cancelled) setReportLoading(false);
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
                Live Salesforce reports. Switch views below.
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
            <ViewSelector
              views={views}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {selected && (
              <ReportPane
                view={selected}
                loading={reportLoading}
                error={reportError}
                report={report}
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
        Add Salesforce reports in{' '}
        <Link
          href="/settings/pipeline"
          className="text-blue-600 hover:underline"
        >
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
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              active
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            title={v.description || undefined}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

function ReportPane({
  view,
  loading,
  error,
  report,
  onReload,
}: {
  view: PipelineView;
  loading: boolean;
  error: string;
  report: ReportResult | null;
  onReload: () => void;
}) {
  const reportUrl = `${INSTANCE_URL.replace(/\/$/, '')}/lightning/r/Report/${view.reportId}/view`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            {report?.reportMetadata?.name ?? view.label}
          </h2>
          {view.description && (
            <p className="text-sm text-gray-500 mt-0.5">{view.description}</p>
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
            href={reportUrl}
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
              <p className="font-medium">Failed to run report</p>
              <p className="text-xs mt-0.5 break-words">{error}</p>
            </div>
          </div>
        ) : report ? (
          <ReportContent report={report} />
        ) : null}
      </div>
    </div>
  );
}

function ReportContent({ report }: { report: ReportResult }) {
  const format = report.reportMetadata?.reportFormat ?? 'TABULAR';
  const grand = report.factMap?.['T!T'];
  const aggregateNames = report.reportMetadata?.aggregates ?? [];
  const aggregateInfo = report.reportExtendedMetadata?.aggregateColumnInfo ?? {};

  return (
    <div className="space-y-5">
      {grand?.aggregates && grand.aggregates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {grand.aggregates.map((agg, i) => {
            const apiName = aggregateNames[i];
            const label = apiName
              ? aggregateInfo[apiName]?.label ?? agg.label ?? apiName
              : agg.label ?? `Total ${i + 1}`;
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-xl font-semibold text-gray-800 mt-1 break-words">
                  {agg.label ?? String(agg.value ?? '')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {format === 'TABULAR' ? (
        <TabularTable report={report} />
      ) : (
        <div className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4 bg-gray-50">
          This report is in <code className="bg-white px-1 rounded">{format}</code>{' '}
          format. Only totals are shown here. Use a{' '}
          <strong>Tabular</strong> report format in Salesforce to render full
          detail rows.
        </div>
      )}

      {report.allData === false && (
        <p className="text-xs text-amber-700">
          Results were truncated by Salesforce (more rows exist than the API
          returned).
        </p>
      )}
    </div>
  );
}

function TabularTable({ report }: { report: ReportResult }) {
  const detailColumns = report.reportMetadata?.detailColumns ?? [];
  const detailInfo = report.reportExtendedMetadata?.detailColumnInfo ?? {};
  const rows = report.factMap?.['T!T']?.rows ?? [];

  if (detailColumns.length === 0 || rows.length === 0) {
    return (
      <p className="text-sm text-gray-500">No detail rows returned.</p>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[560px]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {detailColumns.map((col) => (
                <th
                  key={col}
                  className="text-left font-medium text-gray-600 px-3 py-2 border-b border-gray-200 whitespace-nowrap"
                >
                  {detailInfo[col]?.label ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-white even:bg-gray-50/50">
                {row.dataCells.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 text-gray-800 border-b border-gray-100 whitespace-nowrap"
                  >
                    {cell.label ?? String(cell.value ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        {rows.length} row{rows.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
