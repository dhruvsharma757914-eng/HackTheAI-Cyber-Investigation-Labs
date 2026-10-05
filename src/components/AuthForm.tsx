"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [callsign, setCallsign] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSignup ? { callsign, email, password } : { email, password },
          ),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Request failed.");
        setBusy(false);
        return;
      }

      router.refresh();
      router.push("/");
    } catch {
      setError("Network error — could not reach the SOC.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">
            {isSignup ? "Analyst enrolment" : "SOC authentication"}
          </span>
          <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
            {isSignup ? "NEW RECORD" : "SECURE"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {isSignup && (
            <div>
              <label htmlFor="callsign" className="label">
                Callsign
              </label>
              <input
                id="callsign"
                className="field"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="e.g. ghostwire"
                autoComplete="username"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@vantaris.local"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </div>

          {error && (
            <div className="rounded border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy
              ? "Transmitting..."
              : isSignup
                ? "Create analyst record"
                : "Authenticate"}
          </button>

          <p className="text-center text-[11px] text-slate-500">
            {isSignup ? "Already have a record? " : "No record yet? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="text-signal-green hover:underline"
            >
              {isSignup ? "Sign in" : "Enlist now"}
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-600">
        Progress already saves automatically to this browser — an account keeps
        it across devices. This is a training environment, so do not reuse a real
        password.
      </p>
    </div>
  );
}
