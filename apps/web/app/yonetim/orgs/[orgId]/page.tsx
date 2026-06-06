import { SuperOrgDetail } from "@/components/admin/super/SuperOrgDetail";

export default async function YonetimOrgDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <SuperOrgDetail orgId={orgId} />;
}
