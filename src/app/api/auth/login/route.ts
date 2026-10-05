import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { setSessionCookie, toPublicUser, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: string;
    password?: string;
  };

  const cleanEmail = (email ?? "").trim().toLowerCase();
  const user = findUserByEmail(cleanEmail);

  // Same response for unknown user and wrong password.
  const failure = NextResponse.json(
    { error: "Invalid credentials." },
    { status: 401 },
  );

  if (!user || !password) return failure;
  if (!(await verifyPassword(password, user.password_hash))) return failure;

  await setSessionCookie(user.id);
  return NextResponse.json({ user: toPublicUser(user) });
}
