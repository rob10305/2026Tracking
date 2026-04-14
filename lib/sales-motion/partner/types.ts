// ── Partner status ───────────────────────────────────────────────
export type PartnerStatus = 'Active' | 'Recruit' | 'Dormant';
export const PARTNER_STATUS_OPTIONS: PartnerStatus[] = ['Active', 'Recruit', 'Dormant'];

// ── Partner tier ─────────────────────────────────────────────────
export type PartnerTier = 'Strategic' | 'Preferred' | 'Standard' | '';
export const PARTNER_TIER_OPTIONS: PartnerTier[] = ['', 'Strategic', 'Preferred', 'Standard'];

// ── Partner contact ──────────────────────────────────────────────
export interface PartnerContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
  notes: string;
}

// ── Partner activity log entry ───────────────────────────────────
export interface PartnerActivity {
  id: string;
  date: string;          // ISO date
  type: string;          // Call, Meeting, Email, QBR, etc.
  summary: string;
  owner: string;
}

// ── Partner GTM plan ─────────────────────────────────────────────
export interface PartnerGTMPlan {
  summary: string;
  targets: string;       // target accounts / segments
  jointOfferings: string;
  marketingInitiatives: string;
  keyMilestones: string;
}

// ── Partner impact / results ─────────────────────────────────────
export interface PartnerImpact {
  dealsInfluenced: string;
  revenueSourced: string;
  marketingContribution: string;
  notableWins: string;
}

// ── Partner (full record) ────────────────────────────────────────
export interface Partner {
  id: string;
  name: string;
  logo: string;             // URL to logo image
  website: string;
  status: PartnerStatus;
  tier: PartnerTier;
  owner: string;            // internal owner / DRI
  description: string;
  lastActivity: string;     // ISO date of last touch

  // Pipeline summary (baseball card metrics)
  pipelineDeals: string;    // # of open deals
  pipelineValue: string;    // $ value of pipeline
  activeContacts: string;   // # of active contacts
  wins: string;             // # of closed/won deals
  closedRevenue: string;    // $ closed won

  // Rich detail (to be expanded once spec arrives)
  gtmPlan: PartnerGTMPlan;
  impact: PartnerImpact;
  contacts: PartnerContact[];
  activities: PartnerActivity[];
  notes: string;
}

// ── Root partner state ───────────────────────────────────────────
export interface PartnerState {
  version: 1;
  partners: Partner[];
}

export function createFreshPartnerState(): PartnerState {
  return { version: 1, partners: [] };
}

export function createNewPartner(name = ''): Partner {
  return {
    id: crypto.randomUUID(),
    name,
    logo: '',
    website: '',
    status: 'Recruit',
    tier: '',
    owner: '',
    description: '',
    lastActivity: '',
    pipelineDeals: '',
    pipelineValue: '',
    activeContacts: '',
    wins: '',
    closedRevenue: '',
    gtmPlan: { summary: '', targets: '', jointOfferings: '', marketingInitiatives: '', keyMilestones: '' },
    impact: { dealsInfluenced: '', revenueSourced: '', marketingContribution: '', notableWins: '' },
    contacts: [],
    activities: [],
    notes: '',
  };
}
