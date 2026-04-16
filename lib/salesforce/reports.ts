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
