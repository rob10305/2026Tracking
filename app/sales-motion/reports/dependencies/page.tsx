import { DependencyReport } from '@/components/sales-motion/Reports/DependencyReport';

export default function DependenciesReportPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Dependency Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            All outstanding activity dependencies grouped by team — showing which campaigns and activities each group is blocking.
          </p>
        </div>
        <DependencyReport />
      </div>
    </div>
  );
}
