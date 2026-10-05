import { NextResponse, type NextRequest } from "next/server";
import { GUEST_COOKIE, guestCookieOptions, newGuestId } from "@/lib/guest";

/**
 * Ensures every browser has a durable guest id so labs, XP and the leaderboard
 * work without an account. The id is opaque and only used to load or create an
 * anonymous analyst record on the server.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(GUEST_COOKIE)) return NextResponse.next();

  const guestId = newGuestId();

  // Forward the new cookie on the request as well so the very first render can
  // already resolve the guest (server components cannot set cookies themselves).
  const headers = new Headers(request.headers);
  const existing = headers.get("cookie");
  headers.set(
    "cookie",
    existing
      ? `${existing}; ${GUEST_COOKIE}=${guestId}`
      : `${GUEST_COOKIE}=${guestId}`,
  );

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(
    GUEST_COOKIE,
    guestId,
    guestCookieOptions(process.env.NODE_ENV === "production"),
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
