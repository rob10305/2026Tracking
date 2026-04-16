import { notFound } from "next/navigation";
import {
  CompensationSection,
  DepartmentCover,
  OrganisationSection,
  PageShell,
} from "@/components/aop/DepartmentView";
import EditableKeyMetrics from "@/components/aop/EditableKeyMetrics";
import EditableGoals from "@/components/aop/editors/EditableGoals";
import EditableInitiatives from "@/components/aop/editors/EditableInitiatives";
import EditableRetrospect from "@/components/aop/editors/EditableRetrospect";
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
      {section === "goals" && <EditableGoals dept={dept} config={config} />}
      {section === "initiatives" && <EditableInitiatives dept={dept} config={config} />}
      {section === "retrospect" && <EditableRetrospect dept={dept} config={config} />}
      {section === "key-metrics" && <EditableKeyMetrics dept={dept} config={config} />}
      {section === "compensation" && <CompensationSection config={config} />}
      {section === "organisation" && <OrganisationSection config={config} />}
    </PageShell>
  );
}
