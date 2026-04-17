import { withSalesforce } from './client';

/**
 * Salesforce Analytics Dashboard REST API helpers.
 *
 * Dashboard IDs look like `01Z...` and are 15- or 18-char alphanumeric strings,
 * identical in shape to report IDs. You can find one in the URL when viewing a
 * dashboard in Salesforce.
 *
 * Endpoints used:
 *  - GET /analytics/dashboards/{id}/results — runs the dashboard, returns
 *    metadata + each component's data
 *  - GET /analytics/dashboards/{id}/describe — structure only (no run)
 *  - Dashboard sobject via SOQL — for listing
 */

type Aggregate = { label: string; value: number | string | null };
type ReportRow = { dataCells: Array<{ label: string; value: unknown }> };

export type DashboardComponentResult = {
  componentId: string;
  status?: string;
  reportResult?: {
    allData?: boolean;
    factMap?: Record<string, { aggregates?: Aggregate[]; rows?: ReportRow[] }>;
    reportMetadata?: {
      name?: string;
      reportFormat?: string;
      detailColumns?: string[];
      aggregates?: string[];
      groupingsDown?: Array<{ name: string }>;
      groupingsAcross?: Array<{ name: string }>;
    };
    reportExtendedMetadata?: {
      detailColumnInfo?: Record<string, { label?: string; dataType?: string }>;
      aggregateColumnInfo?: Record<string, { label?: string; dataType?: string }>;
      groupingColumnInfo?: Record<string, { label?: string; dataType?: string }>;
    };
    groupingsDown?: { groupings?: Array<{ key: string; label: string; value: unknown }> };
  };
};

export type DashboardComponent = {
  id: string;
  reportId?: string;
  properties?: {
    componentType?: string;
    visualizationType?: string;
    visualizationProperties?: Record<string, unknown>;
    displayUnits?: string;
    header?: string;
    footer?: string;
    title?: string;
  };
  visualizationType?: string;
  componentType?: string;
  header?: string;
  footer?: string;
  title?: string;
};

export type DashboardRunResult = {
  dashboardMetadata?: {
    id?: string;
    name?: string;
    description?: string;
    layoutType?: string;
    components?: DashboardComponent[];
    leftSection?: { components?: DashboardComponent[]; columnSize?: string; columnIndex?: number };
    middleSection?: { components?: DashboardComponent[]; columnSize?: string; columnIndex?: number };
    rightSection?: { components?: DashboardComponent[]; columnSize?: string; columnIndex?: number };
  };
  componentData?: DashboardComponentResult[];
};

const ID_RE = /^[a-zA-Z0-9]{15,18}$/;

export async function runDashboard(dashboardId: string): Promise<DashboardRunResult> {
  if (!ID_RE.test(dashboardId)) {
    throw new Error('Invalid Salesforce dashboard ID');
  }
  return withSalesforce(async (conn) => {
    const version = (process.env.SFDC_API_VERSION || '62.0').replace(/^v/i, '');
    const path = `/services/data/v${version}/analytics/dashboards/${dashboardId}/results`;
    const result = (await conn.request(path)) as DashboardRunResult;
    return result;
  });
}

export async function getDashboardMetadata(dashboardId: string): Promise<unknown> {
  if (!ID_RE.test(dashboardId)) {
    throw new Error('Invalid Salesforce dashboard ID');
  }
  return withSalesforce(async (conn) => {
    const version = (process.env.SFDC_API_VERSION || '62.0').replace(/^v/i, '');
    const path = `/services/data/v${version}/analytics/dashboards/${dashboardId}/describe`;
    return conn.request(path);
  });
}

export type SfdcDashboardSummary = {
  id: string;
  name: string;
  developerName: string;
  folderName: string;
  description: string;
  lastModifiedDate: string;
};

type DashboardRow = {
  Id: string;
  Title: string | null;
  DeveloperName: string | null;
  FolderName: string | null;
  Description: string | null;
  LastModifiedDate: string | null;
};

export async function listDashboards(
  opts: { q?: string; limit?: number } = {}
): Promise<SfdcDashboardSummary[]> {
  const limit = Math.max(1, Math.min(opts.limit ?? 50, 200));
  const q = (opts.q ?? '').trim();
  const escaped = q.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const where = escaped
    ? `WHERE Title LIKE '%${escaped}%' OR DeveloperName LIKE '%${escaped}%' OR FolderName LIKE '%${escaped}%'`
    : '';

  const soql = `SELECT Id, Title, DeveloperName, FolderName, Description, LastModifiedDate FROM Dashboard ${where} ORDER BY LastModifiedDate DESC LIMIT ${limit}`.trim();

  return withSalesforce(async (conn) => {
    const res = await conn.query<DashboardRow>(soql);
    return res.records.map((r) => ({
      id: r.Id,
      name: r.Title ?? '',
      developerName: r.DeveloperName ?? '',
      folderName: r.FolderName ?? '',
      description: r.Description ?? '',
      lastModifiedDate: r.LastModifiedDate ?? '',
    }));
  });
}
