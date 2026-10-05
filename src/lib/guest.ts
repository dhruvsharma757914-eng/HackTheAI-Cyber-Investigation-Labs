/**
 * Anonymous ("guest") identity support.
 *
 * The labs are meant to be usable without an account: the browser is issued a
 * persistent guest id cookie and progress is stored against an auto-provisioned
 * analyst record. This module stays dependency-free so it can be imported from
 * edge middleware as well as the Node-side auth/db helpers.
 */
export const GUEST_COOKIE = "vt_guest";

/** Email domain used to recognise guest records. */
export const GUEST_EMAIL_DOMAIN = "guest.hacktheai.local";

const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year

export function guestCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  };
}

export function newGuestId(): string {
  return crypto.randomUUID();
}
