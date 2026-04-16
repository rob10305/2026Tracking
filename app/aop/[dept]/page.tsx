import { notFound } from "next/navigation";
import DepartmentSummaryWithExport from "@/components/aop/DepartmentSummaryWithExport";
import { getConfig } from "@/lib/aop/configs";

export default async function DepartmentSummaryPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const config = getConfig(dept);
  if (!config) notFound();
  return <DepartmentSummaryWithExport dept={dept} config={config} />;
}
