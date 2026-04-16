import { notFound } from "next/navigation";
import {
  CompensationSection,
  DepartmentCover,
  GoalsSection,
  InitiativesSection,
  OrganisationSection,
  PageShell,
} from "@/components/aop/DepartmentView";
import EditableKeyMetrics from "@/components/aop/EditableKeyMetrics";
import { getConfig, isSection } from "@/lib/aop/configs";

export default async function DepartmentSectionPage({
  params,
}: {
  params: Promise<{ dept: string; section: string }>;
}) {
  const { dept, section } = await params;
  const config = getConfig(dept);
  if (!config || !isSection(section)) notFound();

  return (
    <PageShell>
      <DepartmentCover config={config} />
      {section === "goals" && <GoalsSection config={config} />}
      {section === "initiatives" && <InitiativesSection />}
      {section === "key-metrics" && <EditableKeyMetrics dept={dept} config={config} />}
      {section === "compensation" && <CompensationSection config={config} />}
      {section === "organisation" && <OrganisationSection config={config} />}
    </PageShell>
  );
}
