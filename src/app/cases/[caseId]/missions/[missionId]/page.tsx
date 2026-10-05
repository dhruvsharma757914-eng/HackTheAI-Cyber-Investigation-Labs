import { permanentRedirect } from "next/navigation";

/** Legacy URL: missions were renamed to tasks under rooms. */
export default async function LegacyMissionRedirect({
  params,
}: {
  params: Promise<{ caseId: string; missionId: string }>;
}) {
  const { caseId, missionId } = await params;
  permanentRedirect(`/rooms/${caseId}/tasks/${missionId}`);
}
