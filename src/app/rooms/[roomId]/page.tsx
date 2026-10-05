import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, isGuestUser } from "@/lib/auth";
import {
  difficultyMeta,
  getRoom,
  roomTotalQuestions,
  roomTotalXp,
  unlockedTaskIds,
} from "@/lib/content";
import { getRoomSummaryForUser } from "@/lib/progress";
import { Panel, ProgressBar, SeverityChip } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = getRoom(roomId);
  return { title: room ? `${room.name} // HackTheAI` : "Room" };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = getRoom(roomId);
  if (!room) notFound();

  const user = await getCurrentUser();
  const isGuest = user ? isGuestUser(user) : false;
  const summary = getRoomSummaryForUser(user?.id ?? null, room);
  const unlocked = unlockedTaskIds(room, summary.completedTaskIds);
  const meta = difficultyMeta[room.difficulty];

  const nextTask =
    room.tasks.find((t) => !summary.completedTaskIds.includes(t.id)) ??
    room.tasks[0];

  const cta = summary.completed
    ? "Review room"
    : summary.questionsAnswered > 0
      ? "Continue room"
      : "Start room";

  return (
    <div className="space-y-7">
      <nav className="text-[11px] uppercase tracking-[0.16em] text-slate-600">
        <Link href="/" className="hover:text-slate-400">
          Rooms
        </Link>
        <span className="px-2">/</span>
        <span className="text-slate-400">{room.name}</span>
      </nav>

      {/* Room hero */}
      <section className="panel overflow-hidden">
        <span className={`block h-1 w-full ${meta.bar}`} aria-hidden />

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-void-500 bg-void-800 text-2xl">
              {room.glyph}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
                  {room.name}
                </h1>
                <span className={`chip ${meta.border} ${meta.bg} ${meta.text}`}>
                  {room.difficultyLabel}
                </span>
                <span className="chip border-void-500 bg-void-800 text-slate-500">
                  {room.code}
                </span>
                {summary.completed && (
                  <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                    ✓ COMPLETED
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-slate-500">{room.title}</p>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {room.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {room.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-void-800 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded border border-void-600 bg-void-600 sm:grid-cols-4">
            {[
              ["Tasks", String(room.tasks.length)],
              ["Questions", String(roomTotalQuestions(room))],
              ["Duration", room.duration],
              ["XP available", String(roomTotalXp(room))],
            ].map(([k, v]) => (
              <div key={k} className="bg-void-900 px-4 py-3">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  {k}
                </dt>
                <dd className="mt-0.5 text-xs text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/rooms/${room.id}/tasks/${nextTask.id}`}
              className="btn-primary"
            >
              {cta}
            </Link>
            <span className="text-[11px] text-slate-600">
              {room.org} · {room.classification}
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <span>
                {summary.completedTaskIds.length}/{room.tasks.length} tasks
                complete
              </span>
              <span className={meta.text}>
                {summary.percent}% · {summary.xp}/{summary.maxXp} XP
              </span>
            </div>
            <ProgressBar
              value={summary.percent}
              max={100}
              tone={room.id === "echo" ? "cyan" : "violet"}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Opening */}
          <Panel title={`Opening scene · ${room.opening.headline}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse-fast rounded-full bg-signal-red" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                {room.opening.time}
              </span>
            </div>
            <div className="prose-soc text-[13px]">
              {room.opening.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Panel>

          {/* Task list */}
          <Panel
            title="Tasks"
            right={
              <span className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
                {summary.completedTaskIds.length} of {room.tasks.length} done
              </span>
            }
          >
            <ol className="space-y-2">
              {room.tasks.map((task) => {
                const answered = summary.answeredByTask[task.id] ?? {};
                const answeredCount = Object.keys(answered).length;
                const isComplete = summary.completedTaskIds.includes(task.id);
                const isUnlocked = unlocked.includes(task.id);
                const isNext = !isComplete && isUnlocked;

                const inner = (
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border text-[11px] font-bold ${
                        isComplete
                          ? "border-signal-green/40 bg-signal-green/10 text-signal-green"
                          : isNext
                            ? "border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan"
                            : "border-void-600 bg-void-800 text-slate-600"
                      }`}
                    >
                      {isComplete ? "✓" : task.index}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-200">
                        {task.codename}
                      </span>
                      <span className="block truncate text-[10px] uppercase tracking-[0.12em] text-slate-600">
                        {task.topic}
                      </span>
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      {answeredCount}/{task.questions.length} answered
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-signal-amber">
                      {task.xp} XP
                    </span>
                  </div>
                );

                return (
                  <li key={task.id}>
                    {isUnlocked ? (
                      <Link
                        href={`/rooms/${room.id}/tasks/${task.id}`}
                        className={`block rounded border px-4 py-3 transition ${
                          isComplete
                            ? "border-signal-green/30 bg-signal-green/5 hover:border-signal-green/60"
                            : "border-signal-cyan/30 hover:border-signal-cyan/60 hover:bg-signal-cyan/5"
                        }`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="rounded border border-void-700 px-4 py-3 opacity-50">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 border-t border-void-700 pt-3 text-[11px] text-slate-600">
              🔒 Tasks unlock in order. Answer every question in a task to unlock
              the next lead.
            </p>
          </Panel>

          {/* Final report — only when the room is complete */}
          {summary.completed && (
            <>
              <Panel
                title="Room complete · final incident report"
                right={
                  <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                    CASE CLOSED
                  </span>
                }
              >
                <div className="space-y-3">
                  {room.finalFindings.map((finding) => (
                    <div key={finding.id} className="rounded border border-void-600 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="chip border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan">
                          {finding.id}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                          {finding.area}
                        </span>
                        <span className="ml-auto">
                          <SeverityChip severity={finding.severity} />
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-slate-300">
                        {finding.finding}
                      </p>
                      <code className="mt-2 block break-all text-[11px] text-signal-amber">
                        {finding.evidence}
                      </code>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Root cause">
                <div className="mb-3 inline-flex rounded border border-signal-red/40 bg-signal-red/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-signal-red">
                  {room.rootCause}
                </div>
                <div className="prose-soc text-[13px]">
                  {room.rootCauseDetail.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </Panel>

              <Panel title="Reconstruction">
                <ol className="space-y-2">
                  {room.taskIds.map((id, index) => {
                    const task = room.tasks.find((t) => t.id === id);
                    if (!task) return null;
                    return (
                      <li key={id} className="flex flex-col items-center">
                        <span className="w-full rounded border border-void-600 px-4 py-2.5 text-center text-[11px] text-slate-300">
                          {task.evidence.label}
                        </span>
                        {index < room.taskIds.length - 1 && (
                          <span className="py-1 text-slate-700">↓</span>
                        )}
                      </li>
                    );
                  })}
                  <li className="flex flex-col items-center">
                    <span className="mt-1 rounded border border-signal-red/50 bg-signal-red/10 px-4 py-2.5 text-center text-[11px] font-bold text-signal-red">
                      {room.operation} — RECONSTRUCTED ✓
                    </span>
                  </li>
                </ol>
              </Panel>

              <Panel title="Closing">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-void-500 bg-void-800 text-[11px] font-bold text-signal-green">
                      {room.closing.speaker
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-slate-200">
                        {room.closing.speaker}
                      </span>
                      <span className="block text-[10px] uppercase tracking-[0.12em] text-slate-600">
                        {room.closing.role}
                      </span>
                    </span>
                  </div>
                  {room.closing.lines.map((line, i) => (
                    <p key={i} className="text-[13px] leading-relaxed text-slate-400">
                      {line}
                    </p>
                  ))}
                </div>
              </Panel>

              <Panel title="Final takeaway">
                <ul className="space-y-2">
                  {room.takeaway.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 text-[12px] leading-relaxed text-slate-400"
                    >
                      <span className="text-signal-green">·</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}

          {!summary.completed && (
            <Panel title="Final incident report">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔒</span>
                <p className="text-[12px] leading-relaxed text-slate-500">
                  The final report, root cause analysis and reconstruction unlock
                  once all {room.tasks.length} tasks are completed.
                  {user ? (
                    <span className="text-slate-400">
                      {" "}
                      {room.tasks.length - summary.completedTaskIds.length}{" "}
                      remaining.
                    </span>
                  ) : (
                    <Link href="/signup" className="text-signal-green hover:underline">
                      {" "}
                      Create an account to save progress.
                    </Link>
                  )}
                </p>
              </div>
            </Panel>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Panel title="Objective">
            <p className="text-[12px] leading-relaxed text-slate-400">
              {room.objective}
            </p>
          </Panel>

          <Panel title="What you'll learn">
            <ul className="space-y-2">
              {room.learningOutcomes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[11px] leading-relaxed text-slate-400"
                >
                  <span className="text-signal-green">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Your progress">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <span>Questions answered</span>
                <span>
                  {summary.questionsAnswered}/{summary.totalQuestions}
                </span>
              </div>
              <ProgressBar
                value={summary.questionsAnswered}
                max={summary.totalQuestions}
              />
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                <span>XP earned</span>
                <span className="text-signal-amber">
                  {summary.xp}/{summary.maxXp}
                </span>
              </div>
              <ProgressBar value={summary.xp} max={summary.maxXp} />
            </div>

            {isGuest && (
              <p className="mt-4 border-t border-void-700 pt-3 text-[11px] text-slate-600">
                Progress saves automatically to this browser.{" "}
                <Link href="/signup" className="text-signal-green hover:underline">
                  Save to an account
                </Link>
              </p>
            )}
          </Panel>

          <Panel title="Investigation rule">
            <p className="text-[11px] leading-relaxed text-slate-500">
              🏷️ Every task must produce evidence that explains why the next task
              exists. You are not looking for five isolated vulnerabilities — you
              are looking for the connection between them.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
