import { withSalesforce } from './client';
import type { SfdcOpportunity, SfdcOpportunityQuery, SfdcPipelineRollup } from './types';

const OPPORTUNITY_FIELDS = [
  'Id',
  'Name',
  'StageName',
  'Amount',
  'Probability',
  'CloseDate',
  'CreatedDate',
  'LastModifiedDate',
  'IsClosed',
  'IsWon',
  'Type',
  'LeadSource',
  'OwnerId',
  'AccountId',
  'Owner.Id',
  'Owner.Name',
  'Account.Id',
  'Account.Name',
];

/** Build a WHERE clause from the query options. */
function buildWhere(q: SfdcOpportunityQuery): string {
  const clauses: string[] = [];
  switch (q.status) {
    case 'open':
      clauses.push('IsClosed = false');
      break;
    case 'closed':
      clauses.push('IsClosed = true');
      break;
    case 'won':
      clauses.push('IsWon = true');
      break;
    // 'all' or undefined → no filter
  }
  if (q.ownerId) clauses.push(`OwnerId = '${escape(q.ownerId)}'`);
  if (q.accountId) clauses.push(`AccountId = '${escape(q.accountId)}'`);
  if (q.modifiedSince) clauses.push(`LastModifiedDate >= ${q.modifiedSince}`);
  return clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
}

function escape(v: string): string {
  return v.replace(/'/g, "\\'");
}

export async function fetchOpportunities(
  query: SfdcOpportunityQuery = {},
): Promise<SfdcOpportunity[]> {
  const limit = Math.min(Math.max(query.limit ?? 200, 1), 2000);
  const soql =
    `SELECT ${OPPORTUNITY_FIELDS.join(', ')} ` +
    `FROM Opportunity${buildWhere(query)} ` +
    `ORDER BY CloseDate DESC LIMIT ${limit}`;

  return withSalesforce(async (conn) => {
    const result = await conn.query<SfdcOpportunity>(soql);
    return result.records;
  });
}

export async function fetchPipelineRollup(
  query: SfdcOpportunityQuery = {},
): Promise<SfdcPipelineRollup> {
  const opps = await fetchOpportunities({ ...query, limit: 2000 });

  const rollup: SfdcPipelineRollup = {
    totalOpportunities: opps.length,
    openOpportunities: 0,
    closedWon: 0,
    closedLost: 0,
    totalPipelineAmount: 0,
    closedWonAmount: 0,
    byStage: {},
  };

  for (const o of opps) {
    const amount = o.Amount ?? 0;
    if (!o.IsClosed) {
      rollup.openOpportunities++;
      rollup.totalPipelineAmount += amount;
    } else if (o.IsWon) {
      rollup.closedWon++;
      rollup.closedWonAmount += amount;
    } else {
      rollup.closedLost++;
    }
    const stage = o.StageName || 'Unknown';
    if (!rollup.byStage[stage]) rollup.byStage[stage] = { count: 0, amount: 0 };
    rollup.byStage[stage].count++;
    rollup.byStage[stage].amount += amount;
  }

  return rollup;
}
