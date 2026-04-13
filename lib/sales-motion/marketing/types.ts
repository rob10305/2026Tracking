// ── Attendance status for events ────────────────────────────────
export type AttendanceStatus = 'Attending' | 'Sponsoring' | 'Co-Sponsoring' | 'Watching' | 'Not Attending' | '';
export const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['', 'Attending', 'Sponsoring', 'Co-Sponsoring', 'Watching', 'Not Attending'];

// ── Campaign status (shared across sections) ────────────────────
export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled' | '';
export const CAMPAIGN_STATUS_OPTIONS: CampaignStatus[] = ['', 'Draft', 'Active', 'Paused', 'Completed', 'Cancelled'];

// ── Content type ────────────────────────────────────────────────
export type ContentType = 'Blog Post' | 'Whitepaper' | 'Case Study' | 'Webinar' | 'Video' | 'Infographic' | 'eBook' | '';
export const CONTENT_TYPE_OPTIONS: ContentType[] = ['', 'Blog Post', 'Whitepaper', 'Case Study', 'Webinar', 'Video', 'Infographic', 'eBook'];

// ── Section: Industry Events ────────────────────────────────────
export interface MarketingEvent {
  id: string;
  name: string;
  link: string;
  attendance: AttendanceStatus;
  eventDate: string;
  location: string;
  owner: string;
  budget: string;
  notes: string;
}

// ── Section: Email Campaigns ────────────────────────────────────
export interface EmailCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  platform: string;
  audience: string;
  sendDate: string;
  openRate: string;
  clickRate: string;
  leads: string;
  notes: string;
}

// ── Section: Paid Ads ───────────────────────────────────────────
export interface AdCampaign {
  id: string;
  name: string;
  platform: string;
  status: CampaignStatus;
  monthlyBudget: string;
  spend: string;
  impressions: string;
  clicks: string;
  conversions: string;
  cpa: string;
  notes: string;
}

// ── Section: Content Marketing ──────────────────────────────────
export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: CampaignStatus;
  publishDate: string;
  author: string;
  targetKeywords: string;
  link: string;
  notes: string;
}

// ── Section: Social Media ───────────────────────────────────────
export interface SocialMediaEntry {
  id: string;
  platform: string;
  campaignName: string;
  status: CampaignStatus;
  postDate: string;
  reach: string;
  engagement: string;
  clicks: string;
  notes: string;
}

// ── Section: Webinars ───────────────────────────────────────────
export interface WebinarEntry {
  id: string;
  title: string;
  date: string;
  status: CampaignStatus;
  platform: string;
  registrations: string;
  attendees: string;
  recordingLink: string;
  leads: string;
  notes: string;
}

// ── Root marketing state ────────────────────────────────────────
export interface MarketingState {
  version: 1;
  events: MarketingEvent[];
  emailCampaigns: EmailCampaign[];
  adCampaigns: AdCampaign[];
  content: ContentItem[];
  socialMedia: SocialMediaEntry[];
  webinars: WebinarEntry[];
}

export type SectionKey = keyof Omit<MarketingState, 'version'>;

export function createFreshMarketingState(): MarketingState {
  return { version: 1, events: [], emailCampaigns: [], adCampaigns: [], content: [], socialMedia: [], webinars: [] };
}
