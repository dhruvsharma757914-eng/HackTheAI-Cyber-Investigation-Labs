import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { findOrCreateGuestUser, findUserById, type UserRow } from "@/lib/db";
import {
  GUEST_COOKIE,
  GUEST_EMAIL_DOMAIN,
  guestCookieOptions,
  newGuestId,
} from "@/lib/guest";

export const SESSION_COOKIE = "vt_session";
const SESSION_DAYS = 30;

function loadSecret(): Uint8Array {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 16) {
    return new TextEncoder().encode(fromEnv);
  }

  // Fall back to a locally generated secret so dev sessions survive restarts.
  const dataDir = path.join(process.cwd(), "data");
  const secretFile = path.join(dataDir, ".session-secret");
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(secretFile)) {
      fs.writeFileSync(secretFile, crypto.randomBytes(48).toString("hex"), {
        mode: 0o600,
      });
    }
    return new TextEncoder().encode(fs.readFileSync(secretFile, "utf8").trim());
  } catch {
    // Last resort: ephemeral secret (sessions reset on restart).
    return new TextEncoder().encode(
      "vt-soc-ephemeral-development-secret-do-not-use-in-production",
    );
  }
}

let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (!cachedSecret) cachedSecret = loadSecret();
  return cachedSecret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: number): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("vt-soc")
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function readSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "vt-soc",
    });
    const uid = payload.uid;
    return typeof uid === "number" ? uid : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const userId = await readSessionUserId();
  if (userId !== null) {
    const user = findUserById(userId);
    if (user) return user;
  }

  // No account (or a stale session) — fall back to the anonymous guest identity
  // so labs, progress and the leaderboard work without a sign-in.
  const store = await cookies();
  const guestId = store.get(GUEST_COOKIE)?.value;
  if (!guestId) return null;
  return findOrCreateGuestUser(guestId);
}

/** True when the record belongs to an auto-provisioned guest, not an account. */
export function isGuestUser(user: Pick<UserRow, "email">): boolean {
  return user.email.endsWith(`@${GUEST_EMAIL_DOMAIN}`);
}

/**
 * Guarantees a guest cookie exists. Only callable where cookies are writable
 * (route handlers and server actions); the answer endpoint uses it so the very
 * first submitted answer is persisted even if middleware has not run yet.
 */
export async function ensureGuestIdentity(): Promise<void> {
  if ((await readSessionUserId()) !== null) return;

  const store = await cookies();
  if (store.get(GUEST_COOKIE)?.value) return;
  store.set(
    GUEST_COOKIE,
    newGuestId(),
    guestCookieOptions(process.env.NODE_ENV === "production"),
  );
}

export interface PublicUser {
  id: number;
  callsign: string;
  email: string;
}

export function toPublicUser(user: UserRow): PublicUser {
  return { id: user.id, callsign: user.callsign, email: user.email };
}

export async function setSessionCookie(userId: number): Promise<void> {
  const token = await createSessionToken(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
