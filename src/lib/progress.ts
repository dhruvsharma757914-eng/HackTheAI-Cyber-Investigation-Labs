import {
  allRooms,
  getRoom,
  roomTotalQuestions,
  roomTotalXp,
  taskComplete,
  type Room,
} from "@/lib/content";
import {
  getAllProgress,
  getRoomProgress,
  type AnswerMap,
  type ProgressRow,
} from "@/lib/db";

export interface RoomProgressSummary {
  answeredByTask: Record<string, AnswerMap>;
  completedTaskIds: string[];
  xp: number;
  maxXp: number;
  questionsAnswered: number;
  totalQuestions: number;
  percent: number;
  completed: boolean;
}

export interface OverallSummary {
  totalXp: number;
  maxXp: number;
  tasksCompleted: number;
  totalTasks: number;
  questionsAnswered: number;
  totalQuestions: number;
  percent: number;
  roomsCompleted: number;
  totalRooms: number;
}

function parseAnswered(raw: string | undefined): AnswerMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as AnswerMap;
  } catch {
    // corrupt row — treat as empty rather than throwing
  }
  return {};
}

export function summariseRoom(
  room: Room,
  rows: ProgressRow[],
): RoomProgressSummary {
  const answeredByTask: Record<string, AnswerMap> = {};
  const completedTaskIds: string[] = [];
  let xp = 0;
  let questionsAnswered = 0;

  for (const row of rows) {
    const answered = parseAnswered(row.answered);
    answeredByTask[row.task_id] = answered;
    xp += row.xp;

    let count = Object.keys(answered).length;

    // Rows migrated from the case/mission schema have XP but no per-question
    // state. A completed task should still count fully toward the percentage,
    // otherwise progress reads as 0% while XP and the task tick say otherwise.
    const task = room.tasks.find((t) => t.id === row.task_id);
    if (task && row.xp > 0 && count < task.questions.length) {
      count = task.questions.length;
    }

    questionsAnswered += count;
    if (row.xp > 0) completedTaskIds.push(row.task_id);
  }

  const totalQuestions = roomTotalQuestions(room);
  const percent =
    totalQuestions === 0
      ? 0
      : Math.round((questionsAnswered / totalQuestions) * 100);

  return {
    answeredByTask,
    completedTaskIds,
    xp,
    maxXp: roomTotalXp(room),
    questionsAnswered,
    totalQuestions,
    percent,
    completed: completedTaskIds.length === room.tasks.length,
  };
}

export function getRoomSummaryForUser(
  userId: number | null,
  room: Room,
): RoomProgressSummary {
  if (!userId) return summariseRoom(room, []);
  return summariseRoom(room, getRoomProgress(userId, room.id));
}

export function getOverallSummary(userId: number | null): OverallSummary {
  const rows = userId ? getAllProgress(userId) : [];

  let totalXp = 0;
  let tasksCompleted = 0;
  let questionsAnswered = 0;
  let roomsCompleted = 0;
  const maxXp = allRooms.reduce((sum, room) => sum + roomTotalXp(room), 0);
  const totalTasks = allRooms.reduce((n, room) => n + room.tasks.length, 0);
  const totalQuestions = allRooms.reduce(
    (n, room) => n + roomTotalQuestions(room),
    0,
  );

  for (const room of allRooms) {
    const roomRows = rows.filter((row) => row.room_id === room.id);
    const summary = summariseRoom(room, roomRows);
    totalXp += summary.xp;
    tasksCompleted += summary.completedTaskIds.length;
    questionsAnswered += summary.questionsAnswered;
    if (summary.completed) roomsCompleted += 1;
  }

  return {
    totalXp,
    maxXp,
    tasksCompleted,
    totalTasks,
    questionsAnswered,
    totalQuestions,
    percent:
      totalQuestions === 0
        ? 0
        : Math.round((questionsAnswered / totalQuestions) * 100),
    roomsCompleted,
    totalRooms: allRooms.length,
  };
}

/** Answered state for every task in a room, keyed by task id. */
export function answeredMapForRoom(
  roomId: string,
  rows: ProgressRow[],
): Record<string, AnswerMap> {
  const map: Record<string, AnswerMap> = {};
  for (const row of rows) map[row.task_id] = parseAnswered(row.answered);
  return map;
}

/**
 * Answer map for rendering a task, backfilled for rows that predate
 * per-question tracking. A task already carrying XP is treated as fully
 * answered so the UI agrees with the tick and the awarded points.
 */
export function effectiveAnswered(
  room: Room,
  taskId: string,
  answered: AnswerMap,
  xp: number,
): AnswerMap {
  const task = room.tasks.find((t) => t.id === taskId);
  if (!task || xp <= 0) return answered;

  const filled: AnswerMap = { ...answered };
  for (const question of task.questions) {
    if (!(question.id in filled)) filled[question.id] = "revealed";
  }
  return filled;
}

export function completeTaskIds(room: Room, rows: ProgressRow[]): string[] {
  return rows
    .filter((row) => {
      const task = room.tasks.find((t) => t.id === row.task_id);
      if (!task) return false;
      return taskComplete(task, Object.keys(parseAnswered(row.answered)));
    })
    .map((row) => row.task_id);
}

export { parseAnswered, getRoom };
