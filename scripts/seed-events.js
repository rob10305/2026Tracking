// One-time script to populate Marketing Events from the 2026 Events spreadsheet.
// Usage: node scripts/seed-events.js [http://localhost:3000]

const XLSX = require('xlsx');
const crypto = require('crypto');

const SPREADSHEET = 'C:/Users/rob.stevens/OneDrive - O365/2026 ITM GTM/2026 GTM AOp Docs/2026 Events.xlsx';
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api/sales-motion/marketing/state`;

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

function parseDate(s) {
  if (!s) return '';
  const m = String(s).trim().match(/^(\d{1,2})-(\w{3})$/);
  if (!m) return '';
  const mm = MONTHS[m[2]];
  if (!mm) return '';
  return `2026-${mm}-${m[1].padStart(2, '0')}`;
}

function mapAttendance(status, participationType) {
  const s = String(status || '').trim().toLowerCase();
  const p = String(participationType || '').trim().toLowerCase();

  if (s === 'attending' || s === 'in progress') return 'Attending';
  if (s === 'sponsoring' || p === 'sponsor') return 'Sponsoring';
  if (s === 'co-sponsoring') return 'Co-Sponsoring';
  if (s === 'not attending') return 'Not Attending';
  if (s.startsWith('waiting') || s === 'maybe' || s === 'hold' || s === 'joined waitlist' || s === 'tbd') return 'Watching';
  return '';
}

function buildNotes(row) {
  const parts = [];
  if (row['Quarter']) parts.push(`[${row['Quarter']}]`);
  if (row['Focus/Vertical']) parts.push(`Focus: ${row['Focus/Vertical']}`);
  if (row['Participation Type']) parts.push(`Participation: ${row['Participation Type']}`);
  if (row['Region']) parts.push(`Region: ${row['Region']}`);
  if (row['Why attend?']) parts.push(`Why: ${String(row['Why attend?']).replace(/\s+/g, ' ').trim()}`);
  if (row['Partners']) parts.push(`Partners: ${row['Partners']}`);
  if (row['Sponsorship Level']) parts.push(`Sponsorship: ${row['Sponsorship Level']}`);
  if (row['Deadline']) parts.push(`Deadline: ${row['Deadline']}`);
  if (row['No. of Attendees']) parts.push(`Attendees: ${row['No. of Attendees']}`);
  if (row['Status'] && !['attending', 'sponsoring', 'co-sponsoring'].includes(String(row['Status']).toLowerCase())) {
    parts.push(`Status: ${row['Status']}`);
  }
  if (row['Notes']) parts.push(`Notes: ${row['Notes']}`);
  return parts.join(' | ');
}

function buildBudget(row) {
  const cost = String(row['Cost to attend'] || '').trim();
  const total = String(row['Total cost'] || '').trim();
  if (total && total !== cost && total.toLowerCase() !== 'tbd') return total;
  return cost;
}

(async () => {
  const wb = XLSX.readFile(SPREADSHEET);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  const events = rows.filter(r => r['Event Name']).map(r => ({
    id: crypto.randomUUID(),
    name: String(r['Event Name']).trim(),
    link: '',
    attendance: mapAttendance(r['Status'], r['Participation Type']),
    eventDate: parseDate(r['Start Date']),
    location: String(r['Location'] || '').trim(),
    owner: '',
    budget: buildBudget(r),
    notes: buildNotes(r),
  }));

  console.log(`Parsed ${events.length} events. Fetching current marketing state...`);

  const getRes = await fetch(API);
  const current = (await getRes.json()) || {};
  const currentState = current && current.version === 1 ? current : {
    version: 1, events: [], emailCampaigns: [], adCampaigns: [], content: [], socialMedia: [], webinars: [],
  };

  const existing = currentState.events || [];
  console.log(`Current events in DB: ${existing.length}`);

  // Replace events with the spreadsheet data
  const newState = { ...currentState, events };

  const putRes = await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newState),
  });
  const putJson = await putRes.json();
  console.log('Save response:', putJson);
  console.log(`Saved ${events.length} events to the database.`);
})().catch(e => { console.error(e); process.exit(1); });
