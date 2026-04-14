// Query the database directly via Prisma to see the marketing state
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const row = await prisma.appSettings.findUnique({ where: { key: 'marketing-dashboard-state' } });
  if (!row) {
    console.log('No marketing-dashboard-state row in the database.');
    return;
  }
  const state = row.value;
  console.log('Version:', state.version);
  console.log('Events count:', (state.events || []).length);
  console.log('First 3 events:');
  (state.events || []).slice(0, 3).forEach(e => console.log(`  - ${e.name} (${e.eventDate}) — ${e.attendance}`));
  console.log('\nDatabase:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
})().finally(() => prisma.$disconnect());
