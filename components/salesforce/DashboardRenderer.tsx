'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ReportRenderer, type ReportResult } from './ReportRenderer';

type Aggregate = { label: string; value: number | string | null };

type ComponentData = {
  componentId: string;
  status?: string;
  reportResult?: ReportResult;
};

type DashboardComponent = {
  id: string;
  reportId?: string;
  header?: string;
  footer?: string;
  title?: string;
  properties?: {
    componentType?: string;
    visualizationType?: string;
    header?: string;
    footer?: string;
    title?: string;
  };
  // Flattened variants — SFDC returns both shapes across API versions.
  visualizationType?: string;
  componentType?: string;
};

type DashboardRunResult = {
  dashboardMetadata?: {
    id?: string;
    name?: string;
    description?: string;
    layoutType?: string;
    components?: DashboardComponent[];
    leftSection?: { components?: DashboardComponent[] };
    middleSection?: { components?: DashboardComponent[] };
    rightSection?: { components?: DashboardComponent[] };
  };
  componentData?: ComponentData[];
};

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
];

export function DashboardRenderer({ dashboard }: { dashboard: DashboardRunResult }) {
  const components = collectComponents(dashboard);
  const dataByComponentId = new Map<string, ComponentData>();
  for (const d of dashboard.componentData ?? []) {
    if (d.componentId) dataByComponentId.set(d.componentId, d);
  }

  if (components.length === 0) {
    return (
      <p className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4 bg-gray-50">
        This dashboard has no components, or Salesforce didn&apos;t return
        metadata for it.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {components.map((comp) => {
        const data = dataByComponentId.get(comp.id);
        return <DashboardComponentCard key={comp.id} component={comp} data={data} />;
      })}
    </div>
  );
}

function collectComponents(dashboard: DashboardRunResult): DashboardComponent[] {
  const meta = dashboard.dashboardMetadata ?? {};
  if (meta.components && meta.components.length > 0) return meta.components;
  // Fallback to column sections — the older layout shape.
  return [
    ...(meta.leftSection?.components ?? []),
    ...(meta.middleSection?.components ?? []),
    ...(meta.rightSection?.components ?? []),
  ];
}

function componentTitle(comp: DashboardComponent): string {
  return (
    comp.title ??
    comp.header ??
    comp.properties?.title ??
    comp.properties?.header ??
    'Untitled component'
  );
}

function componentVisualization(comp: DashboardComponent): string {
  return (
    comp.properties?.visualizationType ??
    comp.visualizationType ??
    comp.properties?.componentType ??
    comp.componentType ??
    'Unknown'
  );
}

function DashboardComponentCard({
  component,
  data,
}: {
  component: DashboardComponent;
  data?: ComponentData;
}) {
  const viz = componentVisualization(component);
  const report = data?.reportResult;
  const failed = data?.status && data.status !== 'SUCCESS';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {componentTitle(component)}
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
            {viz}
          </span>
        </div>
        {component.footer || component.properties?.footer ? (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {component.footer ?? component.properties?.footer}
          </p>
        ) : null}
      </div>
      <div className="p-4">
        {failed ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            Component failed to run ({data?.status}).
          </div>
        ) : !report ? (
          <p className="text-sm text-gray-400 italic">No data returned.</p>
        ) : (
          <ComponentBody viz={viz} report={report} />
        )}
      </div>
    </div>
  );
}

function ComponentBody({ viz, report }: { viz: string; report: ReportResult }) {
  const v = viz.toLowerCase();

  if (v.includes('metric')) return <MetricBody report={report} />;
  if (v.includes('gauge')) return <GaugeBody report={report} />;
  if (v.includes('pie') || v.includes('donut')) return <PieBody report={report} donut={v.includes('donut')} />;
  if (v.includes('line')) return <LineBody report={report} />;
  if (v.includes('bar') || v.includes('column') || v.includes('funnel')) {
    return <BarBody report={report} horizontal={v.includes('bar') && !v.includes('column')} />;
  }
  if (v.includes('table')) return <ReportRenderer report={report} compact />;

  // Default fallback — render the report with full metric cards + table.
  return <ReportRenderer report={report} compact />;
}

function grandAggregates(report: ReportResult): Aggregate[] {
  return report.factMap?.['T!T']?.aggregates ?? [];
}

function firstGrandValue(report: ReportResult): { label: string; value: string } {
  const aggs = grandAggregates(report);
  const aggregateNames = report.reportMetadata?.aggregates ?? [];
  const aggregateInfo = report.reportExtendedMetadata?.aggregateColumnInfo ?? {};
  const first = aggs[0];
  const apiName = aggregateNames[0];
  const label = apiName
    ? aggregateInfo[apiName]?.label ?? first?.label ?? apiName
    : first?.label ?? 'Total';
  const value = first?.label ?? String(first?.value ?? '—');
  return { label, value };
}

function MetricBody({ report }: { report: ReportResult }) {
  const { label, value } = firstGrandValue(report);
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1 break-words text-center">{value}</p>
    </div>
  );
}

function GaugeBody({ report }: { report: ReportResult }) {
  const { label, value } = firstGrandValue(report);
  const numeric = Number(String(value).replace(/[^0-9.\-]/g, ''));
  const pct = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;
  return (
    <div className="space-y-2 py-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

/** Extract (label, value) pairs from the first grouping column, using the
 * first aggregate as the value. Works for reports grouped by a single column. */
function extractGroupSeries(report: ReportResult): Array<{ name: string; value: number; raw: string }> {
  const groupings = report.groupingsDown?.groupings ?? [];
  if (groupings.length === 0) {
    // No grouping — fall back to detail rows where first col = label, second col = number.
    const rows = report.factMap?.['T!T']?.rows ?? [];
    const result: Array<{ name: string; value: number; raw: string }> = [];
    for (const row of rows.slice(0, 20)) {
      const cells = row.dataCells ?? [];
      if (cells.length < 2) continue;
      const name = cells[0]?.label ?? String(cells[0]?.value ?? '');
      const rawValue = cells[1]?.label ?? String(cells[1]?.value ?? '');
      const value = parseNumber(cells[1]?.value ?? rawValue);
      if (Number.isFinite(value)) result.push({ name, value, raw: rawValue });
    }
    return result;
  }
  return groupings.map((g) => {
    const agg = report.factMap?.[`${g.key}!T`]?.aggregates?.[0];
    const raw = agg?.label ?? String(agg?.value ?? '0');
    const value = parseNumber(agg?.value ?? raw);
    return {
      name: g.label || String(g.value ?? ''),
      value: Number.isFinite(value) ? value : 0,
      raw,
    };
  });
}

function parseNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^0-9.\-]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function BarBody({ report, horizontal }: { report: ReportResult; horizontal?: boolean }) {
  const series = extractGroupSeries(report);
  if (series.length === 0) {
    return <p className="text-sm text-gray-400 italic">No chartable values.</p>;
  }
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart
          data={series}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 8, left: horizontal ? 40 : 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11 }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
            </>
          )}
          <Tooltip
            formatter={(_v, _n, item) => {
              const p = (item && (item.payload as { raw?: string })) || {};
              return [p.raw ?? String(_v), ''];
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {series.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieBody({ report, donut }: { report: ReportResult; donut?: boolean }) {
  const series = extractGroupSeries(report);
  if (series.length === 0) {
    return <p className="text-sm text-gray-400 italic">No chartable values.</p>;
  }
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={series}
            dataKey="value"
            nameKey="name"
            innerRadius={donut ? 48 : 0}
            outerRadius={90}
            paddingAngle={2}
          >
            {series.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(_v, _n, item) => {
              const p = (item && (item.payload as { raw?: string })) || {};
              return [p.raw ?? String(_v), ''];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineBody({ report }: { report: ReportResult }) {
  const series = extractGroupSeries(report);
  if (series.length === 0) {
    return <p className="text-sm text-gray-400 italic">No chartable values.</p>;
  }
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(_v, _n, item) => {
              const p = (item && (item.payload as { raw?: string })) || {};
              return [p.raw ?? String(_v), ''];
            }}
          />
          <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
