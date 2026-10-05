import Link from "next/link";
import { getCurrentUser, isGuestUser } from "@/lib/auth";
import { getOverallSummary } from "@/lib/progress";
import { LogoutButton } from "./LogoutButton";

export async function NavBar() {
  const user = await getCurrentUser();
  const overall = getOverallSummary(user?.id ?? null);
  const isGuest = user ? isGuestUser(user) : false;

  return (
    <header className="sticky top-0 z-30 border-b border-void-600 bg-void-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-signal-green text-sm font-black text-void-950">
            &gt;_
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[13px] font-black tracking-[0.16em] text-slate-100 group-hover:text-white">
              HACKTHE<span className="text-signal-green">AI</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.24em] text-slate-600">
              Cyber Labs
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <Link
            href="/start"
            className="rounded px-3 py-2 transition hover:bg-void-800 hover:text-slate-200"
          >
            Rooms
          </Link>
          <Link
            href="/leaderboard"
            className="hidden rounded px-3 py-2 transition hover:bg-void-800 hover:text-slate-200 sm:block"
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="hidden rounded px-3 py-2 transition hover:bg-void-800 hover:text-slate-200 sm:block"
          >
            Profile
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login" className="btn-ghost !px-3 !py-1.5">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary !px-3 !py-1.5">
                Join
              </Link>
            </>
          ) : (
            <>
              <div className="hidden w-40 md:block">
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <span>Progress</span>
                  <span className="text-signal-green">{overall.percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-void-700">
                  <div
                    className="h-full rounded-full bg-signal-green transition-all duration-500"
                    style={{ width: `${overall.percent}%` }}
                  />
                </div>
              </div>

              <span className="chip border-signal-amber/40 bg-signal-amber/10 text-signal-amber">
                ★ {overall.totalXp}
              </span>

              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-signal-green/40 bg-signal-green/10 text-[11px] font-bold text-signal-green"
                title={user.callsign}
              >
                {user.callsign.slice(0, 2).toUpperCase()}
              </Link>

              {isGuest ? (
                <Link href="/signup" className="btn-primary !px-3 !py-1.5">
                  Save progress
                </Link>
              ) : (
                <LogoutButton />
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
