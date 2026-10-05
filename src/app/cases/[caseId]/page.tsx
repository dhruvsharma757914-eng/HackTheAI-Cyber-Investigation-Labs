import { permanentRedirect } from "next/navigation";

/** Legacy URL: cases were renamed to rooms. */
export default async function LegacyCaseRedirect({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  permanentRedirect(`/rooms/${caseId}`);
}
