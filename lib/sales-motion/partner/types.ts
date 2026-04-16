// ── Partner status ───────────────────────────────────────────────
export type PartnerStatus = 'Active' | 'Recruit' | 'Dormant';
export const PARTNER_STATUS_OPTIONS: PartnerStatus[] = ['Active', 'Recruit', 'Dormant'];

// ── Partner tier ─────────────────────────────────────────────────
export type PartnerTier = 'Strategic' | 'Preferred' | 'Standard' | '';
export const PARTNER_TIER_OPTIONS: PartnerTier[] = ['', 'Strategic', 'Preferred', 'Standard'];

// ── Contacts ─────────────────────────────────────────────────────
export type ContactTag = 'Sales' | 'Technical' | 'Marketing' | 'Leadership';
export const CONTACT_TAG_OPTIONS: ContactTag[] = ['Sales', 'Technical', 'Marketing', 'Leadership'];

export interface PartnerContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
  notes: string;
  tags: ContactTag[];
}

// ── Activity log ─────────────────────────────────────────────────
export type ActivityType =
  | 'Call Notes'
  | 'Meeting Notes'
  | 'QBR'
  | 'Partner Review'
  | 'Email Summary'
  | 'General Insight'
  | 'Escalation'
  | 'Commitment'
  | 'Action Item'
  | 'Other';

export const ACTIVITY_TYPE_OPTIONS: ActivityType[] = [
  'Call Notes',
  'Meeting Notes',
  'QBR',
  'Partner Review',
  'Email Summary',
  'General Insight',
  'Escalation',
  'Commitment',
  'Action Item',
  'Other',
];

export interface PartnerActivity {
  id: string;
  date: string;
  type: string;
  summary: string;
  owner: string;
}

// ── GTM Strategy ─────────────────────────────────────────────────
export interface PartnerKeyDate {
  id: string;
  date: string;
  description: string;
}

export interface PartnerGTMPlan {
  summary: string;
  targets: string;
  offerings: string;
  partnerMargin: string;
  pricingModel: string;
  mdfBudget: string;
  competitiveContext: string;
  keyDates: PartnerKeyDate[];
}

// ── Leads ────────────────────────────────────────────────────────
export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Disqualified';
export const LEAD_STAGE_OPTIONS: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Disqualified'];

export type LeadSource = 'Event' | 'Referral' | 'Inbound' | 'Co-sell Intro' | 'Cold Outbound' | 'Other';
export const LEAD_SOURCE_OPTIONS: LeadSource[] = ['Event', 'Referral', 'Inbound', 'Co-sell Intro', 'Cold Outbound', 'Other'];

export interface PartnerLead {
  id: string;
  name: string;
  company: string;
  source: LeadSource | '';
  date: string; // YYYY-MM-DD
  stage: LeadStage | '';
  owner: string;
  sfLink: string;
}

// ── Active Campaigns ─────────────────────────────────────────────
export interface PartnerCampaignLink {
  id: string;
  label: string;
  url: string;
  addedAt: string;
}

// ── Deliverables ─────────────────────────────────────────────────
export type DeliverableStatus = 'Open' | 'In Progress' | 'Done';
export const DELIVERABLE_STATUS_OPTIONS: DeliverableStatus[] = ['Open', 'In Progress', 'Done'];

export interface PartnerDeliverable {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: DeliverableStatus;
  notes: string;
}

// ── Enablement & Certifications ──────────────────────────────────
export type CertificationStatus = 'Active' | 'Expired' | 'Pending' | '';
export const CERTIFICATION_STATUS_OPTIONS: CertificationStatus[] = ['', 'Active', 'Expired', 'Pending'];

export interface PartnerCertification {
  id: string;
  certification: string;
  holder: string;
  issued: string;
  expires: string;
  status: CertificationStatus;
}

export interface PartnerTraining {
  id: string;
  name: string;
  attendee: string;
  date: string;
  notes: string;
}

// ── Collateral ───────────────────────────────────────────────────
export type CollateralType =
  | 'Sales Deck'
  | 'One-Pager'
  | 'Battlecard'
  | 'Case Study'
  | 'Co-branded Asset'
  | 'Technical Doc'
  | 'Email Template'
  | 'Video'
  | 'Other';

export const COLLATERAL_TYPE_OPTIONS: CollateralType[] = [
  'Sales Deck',
  'One-Pager',
  'Battlecard',
  'Case Study',
  'Co-branded Asset',
  'Technical Doc',
  'Email Template',
  'Video',
  'Other',
];

export type CollateralAudience = 'Internal Only' | 'External' | 'Co-branded';
export const COLLATERAL_AUDIENCE_OPTIONS: CollateralAudience[] = ['Internal Only', 'External', 'Co-branded'];

export interface PartnerCollateral {
  id: string;
  title: string;
  type: CollateralType | '';
  audience: CollateralAudience | '';
  url: string;
  notes: string;
  createdAt: string;
}

// ── Notes feed ───────────────────────────────────────────────────
export interface PartnerNote {
  id: string;
  body: string;
  author: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// ── Partner (full record) ────────────────────────────────────────
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  status: PartnerStatus;
  tier: PartnerTier;
  description: string;
  lastActivity: string;

  // Baseball card metrics
  pipelineDeals: string;
  pipelineValue: string;
  activeContacts: string;
  wins: string;
  closedRevenue: string;

  // Sections
  gtmPlan: PartnerGTMPlan;
  contacts: PartnerContact[];
  activities: PartnerActivity[];
  leads: PartnerLead[];
  campaignLinks: PartnerCampaignLink[];
  deliverables: PartnerDeliverable[];
  certifications: PartnerCertification[];
  trainings: PartnerTraining[];
  enablementNotes: string;
  collateral: PartnerCollateral[];
  notesList: PartnerNote[];
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
    description: '',
    lastActivity: '',
    pipelineDeals: '',
    pipelineValue: '',
    activeContacts: '',
    wins: '',
    closedRevenue: '',
    gtmPlan: {
      summary: '',
      targets: '',
      offerings: '',
      partnerMargin: '',
      pricingModel: '',
      mdfBudget: '',
      competitiveContext: '',
      keyDates: [],
    },
    contacts: [],
    activities: [],
    leads: [],
    campaignLinks: [],
    deliverables: [],
    certifications: [],
    trainings: [],
    enablementNotes: '',
    collateral: [],
    notesList: [],
  };
}

// ── Backward-compatibility normalizer ────────────────────────────
// Existing partners persisted in AppSettings may have the old shape
// (owner, impact, jointOfferings, marketingInitiatives, keyMilestones,
// notes string). Coerce everything into the new shape without losing data.
type LegacyPartner = Partner & {
  owner?: string;
  notes?: string;
  impact?: {
    dealsInfluenced?: string;
    revenueSourced?: string;
    marketingContribution?: string;
    notableWins?: string;
  };
  gtmPlan?: PartnerGTMPlan & {
    jointOfferings?: string;
    marketingInitiatives?: string;
    keyMilestones?: string;
  };
};

export function normalizePartner(raw: unknown): Partner {
  const p = (raw ?? {}) as LegacyPartner;
  const gtmIn = (p.gtmPlan ?? {}) as NonNullable<LegacyPartner['gtmPlan']>;

  // Carry legacy fields into the new structure where it makes sense.
  const legacyNotesList: PartnerNote[] = p.notes
    ? [
        {
          id: crypto.randomUUID(),
          body: String(p.notes),
          author: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    : [];

  return {
    id: p.id ?? crypto.randomUUID(),
    name: p.name ?? '',
    logo: p.logo ?? '',
    website: p.website ?? '',
    status: (p.status as PartnerStatus) ?? 'Recruit',
    tier: (p.tier as PartnerTier) ?? '',
    description: p.description ?? '',
    lastActivity: p.lastActivity ?? '',
    pipelineDeals: p.pipelineDeals ?? '',
    pipelineValue: p.pipelineValue ?? '',
    activeContacts: p.activeContacts ?? '',
    wins: p.wins ?? '',
    closedRevenue: p.closedRevenue ?? '',
    gtmPlan: {
      summary: gtmIn.summary ?? '',
      targets: gtmIn.targets ?? '',
      offerings: gtmIn.offerings ?? gtmIn.jointOfferings ?? '',
      partnerMargin: gtmIn.partnerMargin ?? '',
      pricingModel: gtmIn.pricingModel ?? '',
      mdfBudget: gtmIn.mdfBudget ?? '',
      competitiveContext: gtmIn.competitiveContext ?? '',
      keyDates: Array.isArray(gtmIn.keyDates) ? gtmIn.keyDates : [],
    },
    contacts: Array.isArray(p.contacts)
      ? p.contacts.map((c) => ({
          id: c.id ?? crypto.randomUUID(),
          name: c.name ?? '',
          role: c.role ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          active: c.active ?? true,
          notes: c.notes ?? '',
          tags: Array.isArray(c.tags) ? (c.tags.filter((t) => CONTACT_TAG_OPTIONS.includes(t as ContactTag)) as ContactTag[]) : [],
        }))
      : [],
    activities: Array.isArray(p.activities) ? p.activities : [],
    leads: Array.isArray(p.leads) ? p.leads : [],
    campaignLinks: Array.isArray(p.campaignLinks) ? p.campaignLinks : [],
    deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
    certifications: Array.isArray(p.certifications) ? p.certifications : [],
    trainings: Array.isArray(p.trainings) ? p.trainings : [],
    enablementNotes: p.enablementNotes ?? '',
    collateral: Array.isArray(p.collateral) ? p.collateral : [],
    notesList: Array.isArray(p.notesList) && p.notesList.length > 0 ? p.notesList : legacyNotesList,
  } satisfies Partner;
}

export function normalizePartnerState(raw: unknown): PartnerState {
  const s = (raw ?? {}) as Partial<PartnerState>;
  const partners = Array.isArray(s.partners) ? s.partners.map(normalizePartner) : [];
  return { version: 1, partners };
}
