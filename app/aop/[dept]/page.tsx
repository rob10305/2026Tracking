import { notFound } from "next/navigation";
import { DepartmentSummary } from "@/components/aop/DepartmentView";
import { getConfig } from "@/lib/aop/configs";

export default async function DepartmentSummaryPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const config = getConfig(dept);
  if (!config) notFound();
  return <DepartmentSummary config={config} />;
}
