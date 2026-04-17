'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

export type ReportResult = {
  allData?: boolean;
  factMap?: Record<
    string,
    {
      aggregates?: Array<{ label: string; value: number | string | null }>;
      rowCount?: number;
      rows?: Array<{ dataCells: Array<{ label: string; value: unknown }> }>;
    }
  >;
  reportMetadata?: {
    name?: string;
    reportFormat?: 'TABULAR' | 'SUMMARY' | 'MATRIX' | string;
    detailColumns?: string[];
    aggregates?: string[];
    groupingsDown?: Array<{ name: string }>;
  };
  reportExtendedMetadata?: {
    detailColumnInfo?: Record<string, { label?: string; dataType?: string }>;
    aggregateColumnInfo?: Record<string, { label?: string; dataType?: string }>;
    groupingColumnInfo?: Record<string, { label?: string; dataType?: string }>;
  };
  groupingsDown?: {
    groupings?: Array<{ key: string; label: string; value: unknown }>;
  };
};

/**
 * Renders a Salesforce analytics report result, handling TABULAR, SUMMARY,
 * and MATRIX formats. For SUMMARY/MATRIX we render the top-level grand totals
 * plus each first-level grouping with its own aggregate strip + detail rows.
 */
export function ReportRenderer({ report, compact = false }: { report: ReportResult; compact?: boolean }) {
  const format = report.reportMetadata?.reportFormat ?? 'TABULAR';
  const grandTotals = useMemo(() => {
    const grand = report.factMap?.['T!T'];
    if (!grand?.aggregates || grand.aggregates.length === 0) return [];
    const aggregateNames = report.reportMetadata?.aggregates ?? [];
    const aggregateInfo = report.reportExtendedMetadata?.aggregateColumnInfo ?? {};
    return grand.aggregates.map((agg, i) => {
      const apiName = aggregateNames[i];
      const label = apiName
        ? aggregateInfo[apiName]?.label ?? agg.label ?? apiName
        : agg.label ?? `Total ${i + 1}`;
      return { label, value: agg.label ?? String(agg.value ?? '') };
    });
  }, [report]);

  return (
    <div className={compact ? 'space-y-3' : 'space-y-5'}>
      {grandTotals.length > 0 && (
        <div
          className={`grid gap-2 ${
            compact
              ? 'grid-cols-2 md:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
          }`}
        >
          {grandTotals.map((t, i) => (
            <MetricTile key={i} label={t.label} value={t.value} />
          ))}
        </div>
      )}

      {format === 'TABULAR' && <TabularTable report={report} compact={compact} />}
      {format === 'SUMMARY' && <SummaryRender report={report} compact={compact} />}
      {format === 'MATRIX' && (
        <div className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4 bg-gray-50">
          Matrix reports show grand totals above. Switch the source report to{' '}
          <strong>Tabular</strong> or <strong>Summary</strong> format to see
          detail rows here.
        </div>
      )}

      {report.allData === false && (
        <p className="text-xs text-amber-700">
          Results were truncated by Salesforce (more rows exist than the API returned).
        </p>
      )}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide line-clamp-2">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-900 mt-1 break-words">{value}</p>
    </div>
  );
}

function TabularTable({ report, compact }: { report: ReportResult; compact?: boolean }) {
  const detailColumns = report.reportMetadata?.detailColumns ?? [];
  const detailInfo = report.reportExtendedMetadata?.detailColumnInfo ?? {};
  const rows = report.factMap?.['T!T']?.rows ?? [];

  if (detailColumns.length === 0 || rows.length === 0) {
    return <p className="text-sm text-gray-500">No detail rows returned.</p>;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className={`overflow-x-auto ${compact ? 'max-h-[300px]' : 'max-h-[560px]'}`}>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {detailColumns.map((col) => (
                <th
                  key={col}
                  className="text-left font-semibold text-gray-600 px-3 py-2 border-b border-gray-200 whitespace-nowrap text-xs uppercase tracking-wide"
                >
                  {detailInfo[col]?.label ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/40">
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

function SummaryRender({ report, compact }: { report: ReportResult; compact?: boolean }) {
  const groupings = report.groupingsDown?.groupings ?? [];
  const detailColumns = report.reportMetadata?.detailColumns ?? [];
  const detailInfo = report.reportExtendedMetadata?.detailColumnInfo ?? {};
  const aggregateNames = report.reportMetadata?.aggregates ?? [];
  const aggregateInfo = report.reportExtendedMetadata?.aggregateColumnInfo ?? {};

  if (groupings.length === 0) {
    return <TabularTable report={report} compact={compact} />;
  }

  return (
    <div className="space-y-3">
      {groupings.map((g) => {
        const key = g.key;
        const bucket = report.factMap?.[`${key}!T`];
        const aggregates = bucket?.aggregates ?? [];
        const rows = bucket?.rows ?? [];
        return (
          <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap">
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">{g.label || String(g.value ?? '')}</span>
              <span className="text-xs text-gray-500">
                ({bucket?.rowCount ?? rows.length} row{(bucket?.rowCount ?? rows.length) === 1 ? '' : 's'})
              </span>
              <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                {aggregates.map((agg, i) => {
                  const apiName = aggregateNames[i];
                  const label = apiName
                    ? aggregateInfo[apiName]?.label ?? agg.label ?? apiName
                    : agg.label ?? `Total ${i + 1}`;
                  const value = agg.label ?? String(agg.value ?? '');
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] bg-white border border-gray-200 rounded px-2 py-0.5"
                    >
                      <span className="text-gray-500">{label}:</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            {detailColumns.length > 0 && rows.length > 0 && (
              <div className="overflow-x-auto max-h-[360px]">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {detailColumns.map((col) => (
                        <th
                          key={col}
                          className="text-left font-semibold text-gray-600 px-3 py-2 border-b border-gray-200 whitespace-nowrap text-xs uppercase tracking-wide"
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
            )}
          </div>
        );
      })}
    </div>
  );
}
