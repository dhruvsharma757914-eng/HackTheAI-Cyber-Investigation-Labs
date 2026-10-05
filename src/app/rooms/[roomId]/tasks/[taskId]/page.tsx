import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRoom, getTask, toPublicTask, unlockedTaskIds } from "@/lib/content";
import { effectiveAnswered, getRoomSummaryForUser } from "@/lib/progress";
import { Panel } from "@/components/ui";
import { TaskView, type TaskNavItem } from "@/components/TaskView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomId: string; taskId: string }>;
}) {
  const { roomId, taskId } = await params;
  const room = getRoom(roomId);
  const task = getTask(roomId, taskId);
  return {
    title: task ? `Task ${task.index}: ${task.codename} // ${room?.name}` : "Task",
  };
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ roomId: string; taskId: string }>;
}) {
  const { roomId, taskId } = await params;
  const room = getRoom(roomId);
  const task = getTask(roomId, taskId);
  if (!room || !task) notFound();

  const user = await getCurrentUser();
  const summary = getRoomSummaryForUser(user?.id ?? null, room);
  const unlocked = unlockedTaskIds(room, summary.completedTaskIds);
  const isComplete = summary.completedTaskIds.includes(task.id);

  if (!unlocked.includes(taskId) && !isComplete) {
    const previous = room.tasks.find((t) => t.order === task.order - 1);
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <nav className="text-[11px] uppercase tracking-[0.16em] text-slate-600">
          <Link href="/" className="hover:text-slate-400">
            Rooms
          </Link>
          <span className="px-2">/</span>
          <Link href={`/rooms/${roomId}`} className="hover:text-slate-400">
            {room.name}
          </Link>
        </nav>

        <Panel title="Task locked">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔒</span>
              <div>
                <div className="text-sm font-bold text-slate-200">
                  TASK {task.index} — {task.codename}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  This lead has not been discovered yet. Every task must produce
                  the evidence that explains why the next one exists.
                </p>
              </div>
            </div>

            {previous && (
              <p className="rounded border border-void-600 p-3 text-[11px] text-slate-500">
                Complete{" "}
                <Link
                  href={`/rooms/${roomId}/tasks/${previous.id}`}
                  className="text-signal-cyan hover:underline"
                >
                  TASK {previous.index} — {previous.codename}
                </Link>{" "}
                to unlock this investigation.
              </p>
            )}

            <Link href={`/rooms/${roomId}`} className="btn-ghost">
              Back to room
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  // Strip answer keys before anything crosses to the client.
  const publicTask = toPublicTask(task);

  const nav: TaskNavItem[] = room.tasks.map((t) => {
    const answered = summary.answeredByTask[t.id] ?? {};
    const count = Object.keys(answered).length;
    const complete = summary.completedTaskIds.includes(t.id);
    return {
      id: t.id,
      index: t.index,
      codename: t.codename,
      complete,
      answered: complete ? t.questions.length : count,
      total: t.questions.length,
    };
  });

  const previousTask = room.tasks.find((t) => t.order === task.order - 1) ?? null;
  const nextTask = room.tasks.find((t) => t.order === task.order + 1) ?? null;

  return (
    <>
      <div className="mb-5">
        <nav className="text-[11px] uppercase tracking-[0.16em] text-slate-600">
          <Link href="/" className="hover:text-slate-400">
            Rooms
          </Link>
          <span className="px-2">/</span>
          <Link href={`/rooms/${roomId}`} className="hover:text-slate-400">
            {room.name}
          </Link>
          <span className="px-2">/</span>
          <span className="text-slate-400">Task {task.index}</span>
        </nav>
      </div>

      <TaskView
        roomId={room.id}
        roomName={room.name}
        roomCode={room.code}
        task={publicTask}
        nav={nav}
        initialAnswered={effectiveAnswered(
          room,
          task.id,
          summary.answeredByTask[task.id] ?? {},
          isComplete ? task.xp : 0,
        )}
        prevTaskId={previousTask?.id ?? null}
        nextTaskId={nextTask?.id ?? null}
        signedIn={Boolean(user)}
      />
    </>
  );
}
