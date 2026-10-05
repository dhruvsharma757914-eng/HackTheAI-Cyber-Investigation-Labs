import Link from "next/link";
import { getCurrentUser, isGuestUser } from "@/lib/auth";
import { allRooms, difficultyMeta } from "@/lib/content";
import { getOverallSummary, getRoomSummaryForUser } from "@/lib/progress";
import { Panel, ProgressBar, SeverityChip } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile // HackTheAI" };

function rankFor(xp: number): { name: string; next: number } {
  if (xp >= 1400) return { name: "SENIOR ANALYST", next: 2000 };
  if (xp >= 1000) return { name: "ANALYST II", next: 1400 };
  if (xp >= 400) return { name: "ANALYST I", next: 1000 };
  if (xp > 0) return { name: "TRAINEE", next: 400 };
  return { name: "RECRUIT", next: 400 };
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <Panel title="Profile">
          <div className="space-y-4 text-center">
            <p className="text-3xl">🪪</p>
            <p className="text-[12px] leading-relaxed text-slate-500">
              No analyst record loaded. Create an account to track XP, task
              progress and collected evidence.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/signup" className="btn-primary">
                Join free
              </Link>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  const isGuest = isGuestUser(user);
  const overall = getOverallSummary(user.id);
  const rank = rankFor(overall.totalXp);

  const roomSummaries = allRooms.map((room) => ({
    room,
    summary: getRoomSummaryForUser(user.id, room),
  }));

  const evidence = roomSummaries.flatMap(({ room, summary }) =>
    room.tasks
      .filter((task) => summary.completedTaskIds.includes(task.id))
      .map((task) => ({ room, task })),
  );

  const badges = roomSummaries.flatMap(({ room, summary }) =>
    room.tasks.map((task) => ({
      room,
      task,
      earned: summary.completedTaskIds.includes(task.id),
    })),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 p-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-signal-green/40 bg-signal-green/10 text-xl font-bold text-signal-green">
            {user.callsign.slice(0, 2).toUpperCase()}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">
                {user.callsign}
              </h1>
              <span className="chip border-signal-amber/40 bg-signal-amber/10 text-signal-amber">
                {rank.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {isGuest
                ? "Anonymous analyst · progress saved on this browser"
                : user.email}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-700">
              Joined {user.created_at}
            </p>
          </div>

          <dl className="ml-auto grid grid-cols-2 gap-6 text-right sm:grid-cols-4">
            {[
              { k: "XP", v: String(overall.totalXp), tone: "text-signal-amber" },
              {
                k: "Rooms",
                v: `${overall.roomsCompleted}/${overall.totalRooms}`,
                tone: "text-slate-200",
              },
              {
                k: "Tasks",
                v: `${overall.tasksCompleted}/${overall.totalTasks}`,
                tone: "text-slate-200",
              },
              {
                k: "Questions",
                v: `${overall.questionsAnswered}/${overall.totalQuestions}`,
                tone: "text-signal-cyan",
              },
            ].map((stat) => (
              <div key={stat.k}>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  {stat.k}
                </dt>
                <dd className={`text-lg font-bold ${stat.tone}`}>{stat.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-void-600 px-6 py-4">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <span>Overall completion</span>
            <span>
              {overall.percent}% · {overall.totalXp}/{overall.maxXp} XP to{" "}
              {rank.next}
            </span>
          </div>
          <ProgressBar value={overall.percent} max={100} />
        </div>
      </section>

      {/* Rooms */}
      <div className="grid gap-6 lg:grid-cols-2">
        {roomSummaries.map(({ room, summary }) => {
          const meta = difficultyMeta[room.difficulty];
          return (
            <Panel
              key={room.id}
              title={room.name}
              right={
                summary.completed ? (
                  <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                    COMPLETED
                  </span>
                ) : (
                  <span className={`chip ${meta.border} ${meta.bg} ${meta.text}`}>
                    {room.difficultyLabel}
                  </span>
                )
              }
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <span>
                    {summary.completedTaskIds.length}/{room.tasks.length} tasks
                  </span>
                  <span className="text-signal-amber">
                    {summary.xp}/{summary.maxXp} XP
                  </span>
                </div>
                <ProgressBar
                  value={summary.percent}
                  max={100}
                  tone={room.id === "echo" ? "cyan" : "violet"}
                />

                <ul className="space-y-1.5">
                  {room.tasks.map((task) => {
                    const done = summary.completedTaskIds.includes(task.id);
                    const answered =
                      Object.keys(summary.answeredByTask[task.id] ?? {}).length;
                    return (
                      <li
                        key={task.id}
                        className={`flex items-center gap-2 text-[11px] ${
                          done ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        <span className={done ? "text-signal-green" : ""}>
                          {done ? "✓" : "○"}
                        </span>
                        <span className="truncate">{task.codename}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-slate-600">
                          {answered}/{task.questions.length}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href={`/rooms/${room.id}`}
                  className="btn-ghost w-full !py-1.5"
                >
                  {summary.completed ? "Review room" : "Continue room"}
                </Link>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Badges */}
      <Panel
        title="Badges"
        right={
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
            {badges.filter((b) => b.earned).length}/{badges.length} earned
          </span>
        }
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map(({ room, task, earned }) => (
            <li
              key={`${room.id}-${task.id}`}
              className={`rounded border p-3 text-center transition ${
                earned
                  ? "border-signal-green/40 bg-signal-green/5"
                  : "border-void-700 opacity-45"
              }`}
            >
              <span className="block text-xl">
                {earned ? "🏅" : "🔒"}
              </span>
              <span className="mt-1.5 block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                {room.code} · T{task.index}
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                {task.evidence.label}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Evidence locker */}
      <Panel
        title="Evidence locker"
        right={
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
            {evidence.length} item{evidence.length === 1 ? "" : "s"}
          </span>
        }
      >
        {evidence.length === 0 ? (
          <p className="text-[11px] text-slate-600">
            No evidence recovered yet.{" "}
            <Link href="/" className="text-signal-green hover:underline">
              Browse rooms
            </Link>{" "}
            to begin.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {evidence.map(({ room, task }) => (
              <li key={`${room.id}-${task.id}`} className="rounded border border-void-600 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="chip border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan">
                    {task.evidence.id}
                  </span>
                  <SeverityChip severity={task.evidence.severity} />
                  <span className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    {room.code}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {task.evidence.finding}
                </p>
                <code className="mt-2 block text-[10px] text-slate-600">
                  {task.evidence.source}
                </code>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
