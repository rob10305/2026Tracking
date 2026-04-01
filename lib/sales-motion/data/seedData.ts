import type { AppState, Motion, Category, Task, KPIRow, Priority, RAG } from '@/lib/sales-motion/types';
import { MONTHS } from '@/lib/sales-motion/types';

function makeTask(
  activityText: string,
  priority: Priority,
  keyDependency: string,
  kpiMetric: string,
  target: string,
): Task {
  return {
    id: crypto.randomUUID(),
    activityText,
    assignedTo: '',
    status: 'Not Started',
    priority,
    dueDate: '',
    completedDate: '',
    keyDependency,
    dependencyStatus: 'Not Started',
    kpiMetric,
    target,
    actual: '',
    rag: '',
    notes: '',
  };
}

function makeCategory(name: string, tasks: Task[]): Category {
  return {
    id: crypto.randomUUID(),
    name,
    assignedTo: '',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '',
    completedDate: '',
    target: '',
    rag: '',
    notes: '',
    tasks,
  };
}

function makeKPIRow(metric: string, annualTarget: string): KPIRow {
  const monthly: Record<string, string> = {};
  for (const m of MONTHS) {
    monthly[m] = '';
  }
  return {
    id: crypto.randomUUID(),
    metric,
    annualTarget,
    monthly,
  };
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function makeEventsCategory(): Category {
  return {
    id: crypto.randomUUID(),
    name: 'Events/In Person',
    tasks: [],
    assignedTo: '',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '',
    completedDate: '',
    target: '',
    rag: '' as RAG,
    notes: '',
  };
}

function makeMotion(
  id: string,
  name: string,
  type: string,
  description: string,
  color: string,
  categories: Category[],
  kpiRows: KPIRow[],
): Motion {
  return {
    id,
    name,
    type,
    description,
    color,
    owner: '',
    reportingMonth: getCurrentMonth(),
    focusNote: '',
    ragStatus: '' as RAG,
    sellers: '',
    contributionGoal: '',
    leads: '',
    wins: '',
    actual: '',
    categories: [makeEventsCategory(), ...categories],
    kpiRows,
  };
}

// ---------------------------------------------------------------------------
// Motion 1: Archera
// ---------------------------------------------------------------------------
function createArchera(): Motion {
  const icpTargeting = makeCategory('ICP & Targeting', [
    makeTask('Define ICP criteria — industry, company size, tech stack, geo', 'High', 'ICP workshop / strategy session complete', '# ICPs Defined', '1'),
    makeTask('Build target contact list (import or source via ZoomInfo/Apollo)', 'High', 'ICP criteria finalised', '# Contacts in List', '500'),
    makeTask('Segment contacts by persona (Buyer / Champion / Influencer)', 'Medium', 'Contact list built', '# Personas', '3'),
    makeTask('Enrich contact data — email, phone, LinkedIn URL', 'Medium', 'Segmentation complete', '% Contacts Enriched', '80%'),
    makeTask('QA contact list — remove duplicates, invalid emails, opted-out', 'High', 'Data enrichment complete', 'Bounce Rate (post-send)', '<2%'),
    makeTask('Load contacts into HubSpot and tag with Archera campaign', 'High', 'QA complete', '# Loaded to HubSpot', ''),
  ]);

  const contentMessaging = makeCategory('Content & Messaging', [
    makeTask('Develop campaign messaging framework and value proposition', 'High', 'ICP & personas defined', '', ''),
    makeTask('Write email Touchpoint 1 — Intro / Hook', 'High', 'Messaging framework approved', '', ''),
    makeTask('Write email Touchpoint 2 — Problem / Pain Agitation', 'High', 'TP1 approved', '', ''),
    makeTask('Write email Touchpoint 3 — Social Proof / Case Study', 'Medium', 'TP2 approved', '', ''),
    makeTask('Write email Touchpoint 4 — Offer / CTA', 'Medium', 'TP3 approved', '', ''),
    makeTask('Write email Touchpoint 5 — Breakup / Last Touch', 'Low', 'TP4 approved', '', ''),
    makeTask('Design LinkedIn ad creative (images + copy, 3 variations)', 'Medium', 'Messaging framework approved', '# Ad Variations', '3'),
    makeTask('Build / update campaign landing page with tracking', 'Medium', 'Messaging approved', '', ''),
    makeTask('Stakeholder review and content sign-off', 'High', 'All content drafted', '', ''),
  ]);

  const hubspotAutomation = makeCategory('HubSpot Automation Setup', [
    makeTask('Build email enrollment workflow in HubSpot', 'High', 'Email copy approved', '', ''),
    makeTask('Configure enrollment triggers, time delays and branch logic', 'High', 'Workflow skeleton built', '', ''),
    makeTask('Set up suppression lists (customers, competitors, opt-outs)', 'High', 'Workflow built', '', ''),
    makeTask('Configure UTM tracking parameters on all links', 'Medium', 'Landing page live', '', ''),
    makeTask('Set up HubSpot lead scoring rules for MQL threshold', 'Medium', 'Workflow built', '', ''),
    makeTask('End-to-end QA test — send test emails, check tracking & branching', 'High', 'Full workflow built', '', ''),
    makeTask('Set up campaign performance dashboard in HubSpot', 'Medium', 'Workflow live and QA\'d', '', ''),
  ]);

  const linkedinCampaign = makeCategory('LinkedIn Campaign', [
    makeTask('Set up LinkedIn Campaign Manager project', 'Medium', 'Ad creative approved', '', ''),
    makeTask('Define audience targeting — titles, industries, company size', 'Medium', 'Campaign Manager set up', 'Audience Size', '10,000+'),
    makeTask('Upload ad creative and configure A/B variations', 'Medium', 'Audience defined', '# Ad Variations Live', ''),
    makeTask('Set campaign budget, bid strategy and schedule', 'Medium', 'Ads uploaded', 'Daily Budget ($)', ''),
    makeTask('Launch LinkedIn campaign', 'High', 'All setup complete', '', ''),
    makeTask('Week 1 LinkedIn performance check — impressions, CTR, CPL', 'Medium', 'Campaign live 7 days', 'LinkedIn CTR', '0.5%'),
  ]);

  const launchManagement = makeCategory('Launch & Ongoing Management', [
    makeTask('Campaign go-live — enroll first batch into HubSpot workflow', 'High', 'HubSpot QA passed + LinkedIn live', '', ''),
    makeTask('Day 7 check — deliverability, bounces, open rate', 'High', 'Campaign live 7 days', 'Bounce Rate', '<2%'),
    makeTask('Week 2 review — open rates and click rates vs. target', 'High', 'Campaign live 14 days', 'Open Rate', '25%'),
    makeTask('A/B test analysis and copy / creative optimisation', 'Medium', '4 weeks of data collected', '', ''),
    makeTask('MQL handoff to BDR — notify rep when lead threshold reached', 'High', 'Lead scoring active', '# MQLs Handed Off', ''),
    makeTask('Monthly campaign performance report (email + LinkedIn)', 'High', 'Month complete', '', ''),
  ]);

  const kpiRows = [
    makeKPIRow('Emails Sent', ''),
    makeKPIRow('Email Open Rate', '25%'),
    makeKPIRow('Email CTR', '3%'),
    makeKPIRow('Reply Rate', '5%'),
    makeKPIRow('LinkedIn CTR', '0.5%'),
    makeKPIRow('Meetings Booked', ''),
    makeKPIRow('MQLs Generated', ''),
    makeKPIRow('Opps Created', ''),
    makeKPIRow('Pipeline $ Created', ''),
  ];

  return makeMotion(
    'archera',
    'Archera',
    'Digital Automated Partner Campaign',
    'Fully automated, HubSpot-driven campaign for Archera. 100% digital: email sequences + LinkedIn ads. Success depends on clean ICP, strong personas, and workflow QA.',
    '#1A56DB',
    [icpTargeting, contentMessaging, hubspotAutomation, linkedinCampaign, launchManagement],
    kpiRows,
  );
}

// ---------------------------------------------------------------------------
// Motion 2: Named List
// ---------------------------------------------------------------------------
function createNamedList(): Motion {
  const accountPlanning = makeCategory('Account & Contact Planning', [
    makeTask('Define named account list criteria — revenue, industry, signals, region', 'High', 'Sales strategy / territory plan complete', '', ''),
    makeTask('Build and gain approval on the named account list', 'High', 'Criteria defined', '# Target Accounts', ''),
    makeTask('Deep research per account — key initiatives, pain points, recent news', 'High', 'Account list approved', '', ''),
    makeTask('Identify decision makers, champions and influencers per account', 'High', 'Account research complete', 'Avg Contacts per Account', '3+'),
    makeTask('Source and verify contact info — email, LinkedIn, direct phone', 'High', 'Decision makers identified', '% with Valid Email', '90%'),
    makeTask('Load all contacts into CRM with campaign and account tags', 'High', 'Contacts sourced and verified', '# Contacts in CRM', ''),
    makeTask('Assign accounts to reps / map by territory or vertical', 'Medium', 'Contacts in CRM', '', ''),
  ]);

  const outreachPrep = makeCategory('Outreach Preparation', [
    makeTask('Write personalised email templates by persona / pain point (3 minimum)', 'High', 'Personas and pain points defined', '# Email Templates', '3'),
    makeTask('Create LinkedIn connection request + message templates', 'Medium', 'Messaging framework agreed', '# LinkedIn Templates', '2'),
    makeTask('Build discovery call script and qualifying question framework', 'High', 'Messaging approved', '', ''),
    makeTask('Prepare account-specific research briefs for top 10 accounts', 'Medium', 'Account research complete', '', ''),
    makeTask('Brief sales reps on goals, messaging, process and CRM expectations', 'High', 'All prep materials ready', '', ''),
    makeTask('Set up CRM task sequences / reminders for multi-touch cadence', 'Medium', 'Templates approved', '', ''),
  ]);

  const outreachExecution = makeCategory('Outreach Execution — Multi-Touch Cadence', [
    makeTask('Touchpoint 1 — personalised intro email sent', 'High', 'Prep complete, reps briefed', 'TP1 Emails Sent', ''),
    makeTask('LinkedIn connection requests sent to all target contacts', 'Medium', 'LinkedIn templates ready', 'LinkedIn Requests Sent', ''),
    makeTask('Touchpoint 2 — follow-up call / voicemail (Day 3–5)', 'High', 'TP1 sent', 'Calls Made', ''),
    makeTask('LinkedIn message to connected contacts (Day 5)', 'Medium', 'LinkedIn connection accepted', 'LinkedIn Messages Sent', ''),
    makeTask('Touchpoint 3 — value-add / insight email (Day 7)', 'High', 'No reply to TP1 or TP2', 'TP3 Emails Sent', ''),
    makeTask('Touchpoint 4 — social proof email (Day 14)', 'Medium', 'No reply to TP3', 'TP4 Emails Sent', ''),
    makeTask('Touchpoint 5 — breakup / final touch email (Day 21)', 'Low', 'No reply to TP4', 'TP5 Emails Sent', ''),
    makeTask('Log ALL touches in CRM same day — email, call, LinkedIn', 'High', 'Ongoing — every touch', '', ''),
  ]);

  const pipelineCRM = makeCategory('Pipeline & CRM Management', [
    makeTask('Book discovery meetings with all positive / interested responses', 'High', 'Positive response received', 'Meetings Booked', ''),
    makeTask('Conduct discovery call — qualify against MEDDIC / BANT criteria', 'High', 'Meeting confirmed', '', ''),
    makeTask('Create opportunity in CRM with stage, value, close date and next step', 'High', 'Opportunity qualified', 'Opps Created', ''),
    makeTask('Update deal stage in CRM after every significant interaction', 'High', 'Opportunity in pipeline', '', ''),
    makeTask('Weekly pipeline review with sales manager', 'High', 'Weekly cadence', '', ''),
    makeTask('Identify stalled deals (>2 weeks same stage) and apply re-engagement', 'Medium', 'Pipeline review complete', '', ''),
  ]);

  const kpiRows = [
    makeKPIRow('Accounts Worked', ''),
    makeKPIRow('Contacts Reached', ''),
    makeKPIRow('Email Response Rate', '8%'),
    makeKPIRow('LinkedIn Reply Rate', '10%'),
    makeKPIRow('Connect → Meeting %', '30%'),
    makeKPIRow('Meetings Held', ''),
    makeKPIRow('Opps Created', ''),
    makeKPIRow('Weighted Pipeline $', ''),
    makeKPIRow('Closed Won $', ''),
  ];

  return makeMotion(
    'named-list',
    'Named List',
    'Manual Account-Based Outreach',
    'Highly personalised, rep-owned outreach to a curated named account list. Manual and relationship-driven. Requires CRM discipline, research depth, and a structured multi-touch cadence.',
    '#137333',
    [accountPlanning, outreachPrep, outreachExecution, pipelineCRM],
    kpiRows,
  );
}

// ---------------------------------------------------------------------------
// Motion 3: Plane
// ---------------------------------------------------------------------------
function createPlane(): Motion {
  const partnerAlignment = makeCategory('Partner Alignment & Setup', [
    makeTask('Identify and confirm strategic partner(s) for this motion', 'High', 'Partner strategy / go-to-market plan defined', '# Partners Engaged', ''),
    makeTask('Conduct partner alignment call — agree on goals, ICP, and joint value prop', 'High', 'Partner identified and willing to engage', '', ''),
    makeTask('Document joint messaging, differentiated value prop and talk tracks', 'High', 'Alignment call complete', '', ''),
    makeTask('Agree co-sell rules of engagement — lead ownership, deal registration, splits', 'High', 'Alignment call complete', '', ''),
    makeTask('Partner NDA / co-marketing agreement signed (if required)', 'Medium', 'Rules of engagement agreed', '', ''),
    makeTask('Set up partner in CRM — partner type, contacts, territory, attributed revenue tracking', 'Medium', 'Agreement in place', '', ''),
  ]);

  const contentEnablement = makeCategory('Content & Enablement', [
    makeTask('Create co-branded one-pager / solution brief', 'High', 'Joint messaging agreed and approved', '', ''),
    makeTask('Develop joint use case or customer story (if available)', 'Medium', 'Customer story / reference identified', '', ''),
    makeTask('Build partner enablement deck — how to sell together, key differentiators', 'Medium', 'Co-sell agreement signed', '', ''),
    makeTask('Create co-branded email outreach templates for joint campaigns', 'Medium', 'Messaging and branding approved', '# Email Templates', '2'),
    makeTask('Set up partner co-marketing landing page (if applicable)', 'Low', 'Content approved by both parties', '', ''),
    makeTask('Obtain stakeholder approval from both parties on all materials', 'High', 'All content drafted', '', ''),
  ]);

  const jointOutreach = makeCategory('Joint Outreach & Pipeline Generation', [
    makeTask('Build joint target account list — merge both sides\' ICPs and deduplicate', 'High', 'Partner alignment done, ICP agreed', '# Joint Target Accounts', ''),
    makeTask('Identify warm introductions partner can provide from their customer base', 'High', 'Joint account list built', '# Warm Intros Committed', ''),
    makeTask('Execute joint outreach — co-branded emails to partner installed base', 'High', 'Content and templates ready', 'Outreach Volume', ''),
    makeTask('Host joint webinar, lunch & learn or roundtable event', 'Medium', 'Content ready, date confirmed', '# Registrants', ''),
    makeTask('Register all partner-sourced leads into CRM with correct attribution', 'High', 'Leads received from partner', '# Partner-Sourced Leads', ''),
    makeTask('Submit co-sell opportunity registrations with partner portal', 'Medium', 'Opportunity qualified', '# Opps Registered', ''),
  ]);

  const pipelinePartnerCadence = makeCategory('Pipeline Management & Partner Cadence', [
    makeTask('Weekly partner pipeline sync — review open opportunities and blockers', 'High', 'Opportunities in CRM pipeline', '', ''),
    makeTask('Tag all CRM opportunities correctly — partner-sourced vs. partner-influenced', 'Medium', 'CRM tagging standards agreed', '', ''),
    makeTask('Joint opportunity reviews for deals above threshold value', 'Medium', 'High-value opportunities active', '', ''),
    makeTask('Quarterly business review (QBR) with partner', 'Medium', 'Quarter complete', '', ''),
    makeTask('Escalation path agreed for stuck or at-risk partner deals', 'Low', 'Weekly sync cadence running', '', ''),
  ]);

  const kpiRows = [
    makeKPIRow('Partner Syncs', ''),
    makeKPIRow('Joint Accounts Worked', ''),
    makeKPIRow('Warm Intros Received', ''),
    makeKPIRow('Partner-Sourced Leads', ''),
    makeKPIRow('Opps (Partner Sourced)', ''),
    makeKPIRow('Opps (Partner Influenced)', ''),
    makeKPIRow('Sourced Pipeline $', ''),
    makeKPIRow('Influenced Pipeline $', ''),
    makeKPIRow('Closed Won $', ''),
  ];

  return makeMotion(
    'plane',
    'Plane',
    'Partner / Platform Co-Sell Motion',
    'Partner-led and co-sell motion. Leverages a strategic partner relationship to access a shared addressable market. Requires joint messaging, co-branded content, and disciplined pipeline tracking split by source vs. influence.',
    '#6A0DAD',
    [partnerAlignment, contentEnablement, jointOutreach, pipelinePartnerCadence],
    kpiRows,
  );
}

// ---------------------------------------------------------------------------
// Motion 4: Reign
// ---------------------------------------------------------------------------
function createReign(): Motion {
  const campaignStrategy = makeCategory('Campaign Strategy & Segmentation', [
    makeTask('Define Reign-specific ICP — buyer profile, use case, tech stack fit', 'High', 'Product positioning and messaging agreed internally', '', ''),
    makeTask('Align with Product Marketing on Reign messaging, differentiators and proof points', 'High', 'Reign product roadmap reviewed', '', ''),
    makeTask('Build Reign target account list — new logo and expansion opportunities', 'High', 'ICP defined', '# Target Accounts', ''),
    makeTask('Segment accounts — new logo vs. expansion / upsell, by region', 'High', 'Account list built', '', ''),
    makeTask('Assign accounts to reps and map to event regions / territories', 'Medium', 'Segmentation complete', '', ''),
  ]);

  const digitalEmail = makeCategory('Digital — Email Sequences (HubSpot)', [
    makeTask('Write new logo email sequence — 5 touchpoints', 'High', 'Reign messaging approved', '', ''),
    makeTask('Write expansion / upsell email sequence — 3 touchpoints', 'Medium', 'Reign messaging approved', '', ''),
    makeTask('Build HubSpot workflow for new logo sequence', 'High', 'New logo email copy approved', '', ''),
    makeTask('Build HubSpot workflow for expansion sequence', 'Medium', 'Expansion email copy approved', '', ''),
    makeTask('Configure suppression lists and CRM sync for Reign campaign', 'High', 'Both workflows built', '', ''),
    makeTask('End-to-end QA test all Reign HubSpot workflows', 'High', 'Both workflows built', '', ''),
    makeTask('Set up Reign campaign dashboard in HubSpot', 'Medium', 'Workflows live and QA\'d', '', ''),
  ]);

  const digitalLinkedIn = makeCategory('Digital — LinkedIn & Paid Social', [
    makeTask('Create Reign-branded LinkedIn ad creative — 3 variations', 'Medium', 'Reign messaging approved', '# Ad Variations', '3'),
    makeTask('Set up LinkedIn Campaign Manager for Reign', 'Medium', 'Ad creative approved', '', ''),
    makeTask('Define LinkedIn audience — titles, industries, company size, geos', 'Medium', 'Campaign Manager set up', 'Audience Size', ''),
    makeTask('Launch LinkedIn campaign and monitor first 7 days', 'Medium', 'All LinkedIn setup complete', '', ''),
    makeTask('Weekly LinkedIn performance review and optimisation', 'Medium', 'Campaign live', 'LinkedIn CTR', '0.5%'),
  ]);

  const eventStrategy = makeCategory('Event Strategy & Selection', [
    makeTask('Build event calendar — identify 3–5 target events for the quarter', 'High', 'Sales and marketing alignment on event strategy', '# Events Identified', '3–5'),
    makeTask('Score events on: audience fit, expected attendance, cost, competitor presence', 'High', 'Event longlist created', '', ''),
    makeTask('Confirm event registrations, booth space or sponsorship packages', 'High', 'Events selected and budget approved', '# Events Confirmed', ''),
    makeTask('Submit speaker proposals where applicable', 'Medium', 'Events confirmed', '# Speaker Submissions', ''),
    makeTask('Set meeting and demo targets per event', 'High', 'Events confirmed', 'Target Meetings per Event', '5'),
  ]);

  const preEvent = makeCategory('Pre-Event Execution', [
    makeTask('Design and order booth / display materials (Reign branded)', 'High', 'Event confirmed, brand assets available', '', ''),
    makeTask('Order swag and promotional items', 'Medium', 'Budget approved', '', ''),
    makeTask('Set up lead capture tool — badge scanner, app or form', 'High', 'Event confirmed', '', ''),
    makeTask('Pre-event email campaign to registered attendees', 'High', 'Attendee list available, HubSpot set up', 'Pre-event Emails Sent', ''),
    makeTask('Book pre-scheduled meetings with target accounts (10–14 days prior)', 'High', 'Target accounts identified in event region', 'Pre-Sched Meetings Booked', ''),
    makeTask('Brief attending sales reps — targets, messaging, lead capture process', 'High', 'All materials and meeting list ready', '', ''),
    makeTask('Confirm travel, accommodation and logistics for all attendees', 'Medium', 'Events confirmed', '', ''),
  ]);

  const atEvent = makeCategory('At-Event Execution', [
    makeTask('Run all pre-scheduled meetings at event', 'High', 'Meetings booked pre-event', 'Pre-Sched Meetings Held', ''),
    makeTask('Capture ALL leads via lead capture tool — no paper business cards', 'High', 'Lead capture tool configured and tested', 'Leads Captured', ''),
    makeTask('Add qualifying notes to every lead in real-time (hot / warm / cold)', 'High', 'Lead capture tool active', '', ''),
    makeTask('Host or attend networking dinners and roundtables', 'Medium', 'Invites sent and confirmed', '# Dinners / Events Attended', ''),
    makeTask('Run Reign product demos at booth and track demo count', 'Medium', 'Booth set up', '# Demos Run', ''),
    makeTask('Daily team debrief — assess pipeline and adjust approach', 'High', 'Event ongoing', '', ''),
  ]);

  const postEvent = makeCategory('Post-Event Follow-Up', [
    makeTask('Upload all event leads to CRM within 24 hours of event end', 'High', 'Event complete, leads captured in tool', 'Leads in CRM (24h)', ''),
    makeTask('Segment leads into Hot / Warm / Cold based on qualifying notes', 'High', 'Leads uploaded to CRM', '', ''),
    makeTask('Send personalised follow-up emails to Hot leads within 48 hours', 'High', 'Leads segmented', 'Hot Follow-ups Sent', ''),
    makeTask('Enrol Warm / Cold leads into HubSpot post-event nurture sequence', 'High', 'Post-event HubSpot sequence built', 'Nurture Enrolments', ''),
    makeTask('Follow-up calls to Hot leads within 5 business days', 'High', 'Hot follow-up emails sent', 'Follow-up Calls Made', ''),
    makeTask('Create CRM opportunities for all qualified event leads', 'High', 'Qualification confirmed in follow-up', 'Opps from Event', ''),
    makeTask('Produce event ROI report — leads, meetings, opps, pipeline vs. cost', 'High', '4 weeks post-event', '', ''),
  ]);

  const kpiRows = [
    makeKPIRow('Email Open Rate', '25%'),
    makeKPIRow('Email Reply Rate', '5%'),
    makeKPIRow('LinkedIn CTR', '0.5%'),
    makeKPIRow('Events Attended', ''),
    makeKPIRow('Event Leads Captured', ''),
    makeKPIRow('Pre-Sched Meetings Held', ''),
    makeKPIRow('Total Meetings Booked', ''),
    makeKPIRow('Opps Created', ''),
    makeKPIRow('Pipeline $ (Reign)', ''),
    makeKPIRow('Closed Won $', ''),
  ];

  return makeMotion(
    'reign',
    'Reign',
    'Product Campaign — Digital + Events',
    'Multi-channel campaign for the Reign product. Combines HubSpot email automation and LinkedIn ads with a targeted in-person event strategy. Requires tight coordination between marketing, sales and events.',
    '#C0392B',
    [campaignStrategy, digitalEmail, digitalLinkedIn, eventStrategy, preEvent, atEvent, postEvent],
    kpiRows,
  );
}

// ---------------------------------------------------------------------------
// Motion 5: Custom
// ---------------------------------------------------------------------------
function createCustom(): Motion {
  const strategyPlanning = makeCategory('Strategy & Planning', [
    makeTask('[ Add your activity / task here ]', 'High', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'High', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'Medium', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'Low', '[ Add dependency here ]', '[ Add KPI here ]', ''),
  ]);

  const execution = makeCategory('Execution', [
    makeTask('[ Add your activity / task here ]', 'High', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'High', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'Medium', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'Medium', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'Low', '[ Add dependency here ]', '[ Add KPI here ]', ''),
  ]);

  const pipelineReporting = makeCategory('Pipeline & Reporting', [
    makeTask('[ Add your activity / task here ]', 'High', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'High', '[ Add dependency here ]', '[ Add KPI here ]', ''),
    makeTask('[ Add your activity / task here ]', 'Medium', '[ Add dependency here ]', '[ Add KPI here ]', ''),
  ]);

  const kpiRows = [
    makeKPIRow('Metric 1', ''),
    makeKPIRow('Metric 2', ''),
    makeKPIRow('Metric 3', ''),
    makeKPIRow('Metric 4', ''),
    makeKPIRow('Metric 5', ''),
  ];

  return makeMotion(
    'custom',
    'Custom',
    'Custom Sales Motion (User Defined)',
    'Blank template for a custom sales motion. Edit the category names, activities, dependencies and KPIs below. Add or delete rows as needed.',
    '#37474F',
    [strategyPlanning, execution, pipelineReporting],
    kpiRows,
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function createSeedData(): AppState {
  return {
    reportingMonths: [getCurrentMonth()],
    motions: [
      createArchera(),
      createNamedList(),
      createPlane(),
      createReign(),
      createCustom(),
    ],
  };
}
