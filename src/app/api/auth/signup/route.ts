import { NextResponse } from "next/server";
import { createUser, findUserByCallsign, findUserByEmail } from "@/lib/db";
import { hashPassword, setSessionCookie, toPublicUser } from "@/lib/auth";

const CALLSIGN_RE = /^[a-zA-Z0-9_.-]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { callsign, email, password } = (body ?? {}) as {
    callsign?: string;
    email?: string;
    password?: string;
  };

  const cleanCallsign = (callsign ?? "").trim();
  const cleanEmail = (email ?? "").trim().toLowerCase();

  if (!CALLSIGN_RE.test(cleanCallsign)) {
    return NextResponse.json(
      {
        error:
          "Callsign must be 3–24 characters: letters, numbers, dot, dash or underscore.",
      },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if ((password ?? "").length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (findUserByEmail(cleanEmail)) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  if (findUserByCallsign(cleanCallsign)) {
    return NextResponse.json(
      { error: "That callsign is already taken." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password!);
  const user = createUser(cleanCallsign, cleanEmail, passwordHash);
  await setSessionCookie(user.id);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
