import Link from "next/link";
import { getCurrentUser, isGuestUser } from "@/lib/auth";
import {
  allRooms,
  roomTotalQuestions,
  roomTotalXp,
} from "@/lib/content";
import { getOverallSummary, getRoomSummaryForUser } from "@/lib/progress";
import { RoomCatalog, type RoomCardData } from "@/components/RoomCatalog";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const user = await getCurrentUser();
  const isGuest = user ? isGuestUser(user) : false;
  const overall = getOverallSummary(user?.id ?? null);

  const cards: RoomCardData[] = allRooms.map((room) => {
    const summary = getRoomSummaryForUser(user?.id ?? null, room);
    return {
      id: room.id,
      code: room.code,
      name: room.name,
      title: room.title,
      description: room.description,
      difficulty: room.difficulty,
      difficultyLabel: room.difficultyLabel,
      duration: room.duration,
      org: room.org,
      tags: room.tags,
      taskCount: room.tasks.length,
      questionCount: roomTotalQuestions(room),
      maxXp: roomTotalXp(room),
      xp: summary.xp,
      percent: summary.percent,
      completedTasks: summary.completedTaskIds.length,
      completed: summary.completed,
      glyph: room.glyph,
    };
  });

  const inProgress = cards.find((c) => c.percent > 0 && !c.completed);

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="panel overflow-hidden">
        <div className="relative px-6 py-9 sm:px-9 sm:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-green/50 to-transparent" />

          <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-signal-green">
            ● training range online
          </p>

          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-100 sm:text-4xl">
            Learn cybersecurity by
            <br />
            <span className="text-signal-green">investigating real incidents</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            {allRooms.length} rooms. {overall.totalTasks} tasks.{" "}
            {overall.totalQuestions} questions. Each room is a self-contained
            investigation where every task hands you a working lab environment and
            each answer unlocks the next lead.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {inProgress ? (
              <Link href={`/rooms/${inProgress.id}`} className="btn-primary">
                Continue {inProgress.name}
              </Link>
            ) : (
              <Link href={`/rooms/${allRooms[0].id}`} className="btn-primary">
                Start {allRooms[0].name}
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="btn-ghost">
                View profile
              </Link>
            ) : (
              <Link href="/signup" className="btn-ghost">
                Create free account
              </Link>
            )}
          </div>

          <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded border border-void-600 bg-void-600 sm:grid-cols-4">
            {[
              { k: "Rooms", v: String(overall.totalRooms) },
              { k: "Tasks", v: String(overall.totalTasks) },
              {
                k: "Your progress",
                v: user ? `${overall.percent}%` : "—",
              },
              {
                k: "XP earned",
                v: user ? `${overall.totalXp}/${overall.maxXp}` : "—",
              },
            ].map((item) => (
              <div key={item.k} className="bg-void-900 px-4 py-4">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  {item.k}
                </dt>
                <dd className="mt-1 text-lg font-bold text-slate-200">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
          Available rooms
        </h2>
        {isGuest && (
          <Link
            href="/signup"
            className="text-[11px] uppercase tracking-[0.14em] text-signal-green hover:underline"
          >
            Progress auto-saves · Create an account →
          </Link>
        )}
      </div>

      <RoomCatalog rooms={cards} signedIn={Boolean(user)} />

      <section className="panel p-5">
        <h2 className="panel-title mb-4">How a room works</h2>
        <ol className="grid gap-5 sm:grid-cols-4">
          {[
            {
              n: "01",
              t: "Open a room",
              d: "Read the case brief, the opening scene and the objective.",
            },
            {
              n: "02",
              t: "Work the task",
              d: "Each task ships a hands-on lab: a bucket, a container, a DNS range, a pipeline.",
            },
            {
              n: "03",
              t: "Answer inline",
              d: "Type your answer, hit submit, get instant feedback. Stuck? Reveal the answer.",
            },
            {
              n: "04",
              t: "Finish the chain",
              d: "Complete every task to reconstruct the incident and close the room.",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="font-bold text-signal-green">{step.n}</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                  {step.t}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  {step.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
