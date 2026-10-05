import { NextResponse } from "next/server";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { allRooms } from "@/lib/content";
import { getOverallSummary, getRoomSummaryForUser } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  const rooms: Record<string, unknown> = {};
  for (const room of allRooms) {
    rooms[room.id] = getRoomSummaryForUser(user?.id ?? null, room);
  }

  return NextResponse.json({
    user: user ? toPublicUser(user) : null,
    rooms,
    overall: getOverallSummary(user?.id ?? null),
  });
}
