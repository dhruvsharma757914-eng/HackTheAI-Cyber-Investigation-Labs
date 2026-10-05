import { NextResponse } from "next/server";
import { ensureGuestIdentity, getCurrentUser } from "@/lib/auth";
import {
  canonicalAnswer,
  findQuestion,
  getRoom,
  getTask,
  isCorrect,
  taskQuestionIds,
  unlockedTaskIds,
} from "@/lib/content";
import {
  getRoomProgress,
  getTaskProgress,
  saveTaskProgress,
  type AnswerMap,
} from "@/lib/db";
import { summariseRoom, parseAnswered } from "@/lib/progress";

/**
 * Checks a single answer inline, the way a TryHackMe room does, and supports
 * revealing the answer when the learner gives up.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string; taskId: string }> },
) {
  // Labs work without an account: make sure this browser has an identity so
  // the answer is persisted, then fall back if the session cannot be established.
  await ensureGuestIdentity();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unable to establish a session for this browser." },
      { status: 500 },
    );
  }

  const { roomId, taskId } = await params;
  const room = getRoom(roomId);
  const task = getTask(roomId, taskId);
  if (!room || !task) {
    return NextResponse.json({ error: "Unknown room or task." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const { questionId, answer, reveal } = (body ?? {}) as {
    questionId?: string;
    answer?: string;
    reveal?: boolean;
  };

  if (!questionId) {
    return NextResponse.json({ error: "questionId is required." }, { status: 400 });
  }

  const question = findQuestion(roomId, taskId, questionId);
  if (!question) {
    return NextResponse.json({ error: "Unknown question." }, { status: 404 });
  }

  // Sequential unlocking is enforced here as well as in the UI.
  const existingRows = getRoomProgress(user.id, roomId);
  const completedIds = existingRows
    .filter((row) => row.xp > 0)
    .map((row) => row.task_id);
  const unlocked = unlockedTaskIds(room, completedIds);
  if (!unlocked.includes(taskId)) {
    return NextResponse.json(
      { error: "Complete the previous task to unlock this one." },
      { status: 409 },
    );
  }

  const answered: AnswerMap = {
    ...parseAnswered(getTaskProgress(user.id, roomId, taskId)?.answered),
  };

  let state: "correct" | "revealed" | null = null;

  if (reveal === true) {
    state = "revealed";
  } else {
    if (typeof answer !== "string" || answer.trim().length === 0) {
      return NextResponse.json(
        { error: "Provide an answer or request the reveal." },
        { status: 400 },
      );
    }
    if (isCorrect(question, answer)) {
      state = "correct";
    } else {
      // Wrong answers are not recorded, so the learner can keep trying.
      return NextResponse.json({
        correct: false,
        state: null,
        answered,
        canonical: null,
        taskComplete: false,
        xpAwarded: 0,
        roomComplete: false,
      });
    }
  }

  answered[questionId] = state;

  const allIds = taskQuestionIds(task);
  const taskIsComplete = allIds.every((id) => id in answered);
  const xp = taskIsComplete ? task.xp : 0;

  saveTaskProgress(user.id, roomId, taskId, answered, xp);

  const rows = getRoomProgress(user.id, roomId);
  const summary = summariseRoom(room, rows);
  const totalXp = (user ? rows : []).reduce((sum, row) => sum + row.xp, 0);

  const taskIndex = room.tasks.findIndex((t) => t.id === taskId);
  const nextTask = room.tasks[taskIndex + 1] ?? null;

  return NextResponse.json({
    correct: true,
    state,
    canonical: canonicalAnswer(question),
    answered,
    taskComplete: taskIsComplete,
    xpAwarded: xp,
    roomComplete: summary.completed,
    roomXp: summary.xp,
    taskXp: totalXp,
    percent: summary.percent,
    nextTaskId: nextTask?.id ?? null,
  });
}
