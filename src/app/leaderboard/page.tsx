import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/db";
import { allRooms } from "@/lib/content";
import { Panel } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard // HackTheAI" };

const TOTAL_TASKS = allRooms.reduce((n, room) => n + room.tasks.length, 0);
const MAX_XP = 2000;

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  const rows = getLeaderboard(100);

  const currentIndex = user
    ? rows.findIndex((row) => row.id === user.id)
    : -1;

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Leaderboard
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-slate-500">
          Ranked by total XP across every room. XP is awarded when all questions
          in a task are answered — revealed answers still complete a task, so
          rank reflects coverage as well as accuracy. Sign-in is not required:
          guest progress is ranked too.
        </p>
      </section>

      {currentIndex >= 0 && (
        <Panel
          title="Your position"
          right={
            <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
              #{currentIndex + 1}
            </span>
          }
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-signal-amber/40 bg-signal-amber/10 text-[11px] font-bold text-signal-amber">
              #{currentIndex + 1}
            </span>
            <span className="text-sm font-bold text-slate-100">
              {rows[currentIndex].callsign}
            </span>
            <span className="ml-auto flex gap-6 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <span>
                <span className="text-signal-amber">
                  {rows[currentIndex].xp}
                </span>{" "}
                XP
              </span>
              <span>{rows[currentIndex].tasks_completed} tasks</span>
            </span>
          </div>
        </Panel>
      )}

      <Panel
        title="All analysts"
        right={
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
            {rows.length} ranked
          </span>
        }
        bodyClassName="p-0"
      >
        {rows.length === 0 ? (
          <p className="p-6 text-[11px] text-slate-600">
            No analysts ranked yet.{" "}
            <Link href="/signup" className="text-signal-green hover:underline">
              Be the first
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-void-600 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  <th className="px-4 py-3 font-normal">#</th>
                  <th className="px-4 py-3 font-normal">Analyst</th>
                  <th className="px-4 py-3 font-normal">XP</th>
                  <th className="px-4 py-3 font-normal">Tasks</th>
                  <th className="px-4 py-3 font-normal">Rank</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const isMe = user?.id === row.id;
                  const completion = Math.min(
                    100,
                    Math.round((row.xp / MAX_XP) * 100),
                  );
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-void-800 last:border-0 ${
                        isMe ? "bg-signal-green/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-600">
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-void-500 bg-void-800 text-[9px] font-bold text-slate-400">
                            {row.callsign.slice(0, 2).toUpperCase()}
                          </span>
                          <span
                            className={
                              isMe
                                ? "font-bold text-signal-green"
                                : "text-slate-300"
                            }
                          >
                            {row.callsign}
                          </span>
                          {isMe && (
                            <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                              YOU
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="text-signal-amber">{row.xp}</span>
                          <span className="hidden h-1 w-20 overflow-hidden rounded-full bg-void-700 sm:block">
                            <span
                              className="block h-full rounded-full bg-signal-amber"
                              style={{ width: `${completion}%` }}
                            />
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {row.tasks_completed}
                        <span className="text-slate-700">/{TOTAL_TASKS}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {row.xp >= 1400
                          ? "Senior Analyst"
                          : row.xp >= 1000
                            ? "Analyst II"
                            : row.xp >= 400
                              ? "Analyst I"
                              : row.xp > 0
                                ? "Trainee"
                                : "Recruit"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
