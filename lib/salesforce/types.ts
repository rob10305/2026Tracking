// ── Salesforce integration types ────────────────────────────────

/** Subset of Opportunity fields we pull back for dashboards. */
export interface SfdcOpportunity {
  Id: string;
  Name: string;
  StageName: string;
  Amount: number | null;
  Probability: number | null;
  CloseDate: string;        // ISO yyyy-MM-dd
  CreatedDate: string;      // ISO datetime
  LastModifiedDate: string; // ISO datetime
  IsClosed: boolean;
  IsWon: boolean;
  Type: string | null;
  LeadSource: string | null;
  OwnerId: string;
  AccountId: string | null;
  Owner?: { Id: string; Name: string };
  Account?: { Id: string; Name: string };
}

/** Roll-up metrics across a set of opportunities. */
export interface SfdcPipelineRollup {
  totalOpportunities: number;
  openOpportunities: number;
  closedWon: number;
  closedLost: number;
  totalPipelineAmount: number;
  closedWonAmount: number;
  byStage: Record<string, { count: number; amount: number }>;
}

export interface SfdcOpportunityQuery {
  /** "open" = IsClosed = false, "closed" = IsClosed = true, "won" = IsWon = true */
  status?: 'open' | 'closed' | 'won' | 'all';
  ownerId?: string;
  accountId?: string;
  limit?: number;
  /** Only opportunities modified after this ISO datetime */
  modifiedSince?: string;
}

export interface SfdcHealth {
  connected: boolean;
  instanceUrl: string | null;
  userId: string | null;
  organizationId: string | null;
  apiVersion: string;
  error?: string;
}
