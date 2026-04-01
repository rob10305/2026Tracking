import { UpcomingReport } from '@/components/sales-motion/Reports/UpcomingReport';

export default function UpcomingReportPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Upcoming Deliverables</h1>
          <p className="text-sm text-gray-500 mt-1">
            Activities and deliverables grouped by due date — overdue, this week, next 2 weeks, next month, and later.
          </p>
        </div>
        <UpcomingReport />
      </div>
    </div>
  );
}
