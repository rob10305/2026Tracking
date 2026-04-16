import { withSalesforce } from './client';

/**
 * Run a Salesforce analytics report by ID and return the executed result.
 *
 * Salesforce report IDs are 15- or 18-character alphanumeric strings, e.g.
 * `00O8Z000001pQrZUAU`. Find them in the URL when viewing a report in Salesforce.
 */
export async function runReport(reportId: string): Promise<unknown> {
  if (!/^[a-zA-Z0-9]{15,18}$/.test(reportId)) {
    throw new Error('Invalid Salesforce report ID');
  }

  return withSalesforce(async (conn) => {
    const report = conn.analytics.report(reportId);
    return report.execute({ details: true });
  });
}

export async function getReportMetadata(reportId: string): Promise<unknown> {
  if (!/^[a-zA-Z0-9]{15,18}$/.test(reportId)) {
    throw new Error('Invalid Salesforce report ID');
  }

  return withSalesforce(async (conn) => {
    const report = conn.analytics.report(reportId);
    return report.describe();
  });
}

export type SfdcReportSummary = {
  id: string;
  name: string;
  developerName: string;
  folderName: string;
  format: string;
  description: string;
  lastModifiedDate: string;
};

type ReportRow = {
  Id: string;
  Name: string | null;
  DeveloperName: string | null;
  FolderName: string | null;
  Format: string | null;
  Description: string | null;
  LastModifiedDate: string | null;
};

/**
 * Search / list Salesforce reports via SOQL against the Report object.
 * Matches Name, DeveloperName, or FolderName (case-insensitive) when `q` is set.
 * Ordered by most recently modified first.
 */
export async function listReports(opts: { q?: string; limit?: number } = {}): Promise<SfdcReportSummary[]> {
  const limit = Math.max(1, Math.min(opts.limit ?? 50, 200));
  const q = (opts.q ?? '').trim();
  // SOQL LIKE is case-insensitive. Escape single quotes + backslashes to avoid injection.
  const escaped = q.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const where = escaped
    ? `WHERE Name LIKE '%${escaped}%' OR DeveloperName LIKE '%${escaped}%' OR FolderName LIKE '%${escaped}%'`
    : '';

  const soql = `SELECT Id, Name, DeveloperName, FolderName, Format, Description, LastModifiedDate FROM Report ${where} ORDER BY LastModifiedDate DESC LIMIT ${limit}`.trim();

  return withSalesforce(async (conn) => {
    const res = await conn.query<ReportRow>(soql);
    return res.records.map((r) => ({
      id: r.Id,
      name: r.Name ?? '',
      developerName: r.DeveloperName ?? '',
      folderName: r.FolderName ?? '',
      format: r.Format ?? '',
      description: r.Description ?? '',
      lastModifiedDate: r.LastModifiedDate ?? '',
    }));
  });
}
