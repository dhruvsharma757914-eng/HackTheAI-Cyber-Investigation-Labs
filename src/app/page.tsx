import Link from "next/link";
import { allRooms, roomTotalXp } from "@/lib/content";

export const metadata = {
  title: "HackTheAI // Cover",
};

const BOOT_LINES: Array<{ tag: string; text: string; tone?: string }> = [
  { tag: "boot", text: "VT-SOC training range · initialising" },
  { tag: "ok", text: "identity provider ............ online" },
  { tag: "ok", text: "cloud archive ............... mounted" },
  { tag: "ok", text: "dns range ................... reachable" },
  { tag: "ok", text: "automation hub .............. armed" },
  { tag: "warn", text: "2 decommissioned systems still responding" },
  { tag: "boot", text: "handing control to the analyst…" },
];

export default function CoverPage() {
  const totalTasks = allRooms.reduce((n, room) => n + room.tasks.length, 0);
  const totalXp = allRooms.reduce((n, room) => n + roomTotalXp(room), 0);

  return (
    <div className="relative">
      <section className="relative overflow-hidden rounded-lg border border-void-600 bg-void-900/70 px-6 py-12 backdrop-blur-sm sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-green/60 to-transparent" />

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="chip border-signal-green/40 bg-signal-green/10 tracking-[0.3em] text-signal-green">
            ● system ready
          </p>

          <h1 className="title-glow mt-7 text-4xl font-black leading-none tracking-tight text-slate-100 sm:text-6xl">
            HACK<span className="text-signal-green">THE</span>AI
            <span className="animate-blink text-signal-green">_</span>
          </h1>

          <p className="mt-4 text-[11px] uppercase tracking-[0.42em] text-slate-500">
            Cyber Investigation Labs
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400">
            Two interconnected investigations. {allRooms.length} case files,{" "}
            {totalTasks} missions and {totalXp.toLocaleString()} XP of hands-on
            security work. Every answer you find unlocks the next lead.
          </p>

          {/* Boot sequence */}
          <div className="mt-10 w-full max-w-2xl text-left">
            <div className="panel">
              <div className="panel-head">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-signal-red/70" />
                  <span className="h-2 w-2 rounded-full bg-signal-amber/70" />
                  <span className="h-2 w-2 rounded-full bg-signal-green/70" />
                </div>
                <span className="panel-title truncate">vantaris-soc // boot.log</span>
                <span className="w-10" />
              </div>
              <div className="space-y-1.5 p-4 font-mono text-[11.5px] leading-relaxed sm:text-xs">
                {BOOT_LINES.map((line, i) => (
                  <div
                    key={line.text}
                    className="boot-line flex gap-3"
                    style={{ animationDelay: `${0.15 + i * 0.18}s` }}
                  >
                    <span className="shrink-0 text-slate-600">
                      {String(i).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        line.tone === "warn"
                          ? "text-signal-amber"
                          : line.tag === "ok"
                            ? "text-slate-400"
                            : "text-signal-green"
                      }
                    >
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="mt-10 w-full max-w-2xl">
            <div className="grid gap-px overflow-hidden rounded border border-void-600 bg-void-600 sm:grid-cols-3">
              {[
                { k: "Case files", v: String(allRooms.length) },
                { k: "Missions", v: String(totalTasks) },
                { k: "Difficulty", v: "Pro" },
              ].map((item) => (
                <div key={item.k} className="bg-void-900 px-4 py-4">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    {item.k}
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-slate-200">
                    {item.v}
                  </dd>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-void-700 pt-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-600">
                Made by
              </p>
              <p className="mt-1.5 text-sm font-bold tracking-wide text-slate-200">
                DHRUV SHARMA
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-signal-cyan">
                Trinet Layer Cyber Security Analyst Intern
              </p>
            </div>
          </div>

          {/* Entry */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/start" className="btn-primary !px-6 !py-3 !text-sm">
              ⟶ Enter the training range
            </Link>
            <Link href="/login" className="btn-ghost !px-6 !py-3 !text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">
        ⚠ All systems, domains, credentials and events are synthetic training data
      </p>
    </div>
  );
}
