import { projectEcho } from "./echo";
import { nightfall } from "./nightfall";
import {
  canonicalAnswer,
  normaliseAnswer,
  type Question,
  type Room,
  type Task,
} from "./types";

export * from "./types";
// Re-exported for server components. Client components must import
// `@/lib/difficulty` directly so this answer-bearing module stays server-side.
export { difficultyMeta } from "../difficulty";

export const allRooms: Room[] = [projectEcho, nightfall];

export function getRoom(roomId: string): Room | undefined {
  return allRooms.find((room) => room.id === roomId);
}

export function getTask(roomId: string, taskId: string): Task | undefined {
  return getRoom(roomId)?.tasks.find((task) => task.id === taskId);
}

export function roomTotalXp(room: Room): number {
  return room.tasks.reduce((sum, task) => sum + task.xp, 0);
}

export function roomTotalQuestions(room: Room): number {
  return room.tasks.reduce((sum, task) => sum + task.questions.length, 0);
}

export function taskQuestionIds(task: Task): string[] {
  return task.questions.map((q) => q.id);
}

export function taskComplete(task: Task, answeredIds: string[]): boolean {
  return task.questions.every((q) => answeredIds.includes(q.id));
}

function matchesFlag(question: Question, answer: string): boolean {
  if (!question.accept || question.accept.length === 0) return false;
  const given = normaliseAnswer(answer);
  if (given.length === 0) return false;
  return question.accept.some((accepted) => normaliseAnswer(accepted) === given);
}

export function isCorrect(question: Question, answer: string): boolean {
  if (question.kind === "choice") {
    return (
      question.correctOptionId !== undefined &&
      answer.trim() === question.correctOptionId
    );
  }
  return matchesFlag(question, answer);
}

/** Look up a single question inside a task for server-side checking. */
export function findQuestion(
  roomId: string,
  taskId: string,
  questionId: string,
): Question | undefined {
  return getTask(roomId, taskId)?.questions.find((q) => q.id === questionId);
}

export { canonicalAnswer };

/* ------------------------------------------------------------------------
 * Public projections.
 *
 * `accept` arrays and `correctOptionId` must never reach the browser, or the
 * whole point of validating answers on the server is lost. These helpers strip
 * the answer keys while keeping everything the UI needs.
 * ---------------------------------------------------------------------- */

export interface PublicQuestion {
  id: string;
  kind: "choice" | "flag";
  prompt: string;
  hint?: string;
  options?: Array<{ id: string; label: string; detail?: string }>;
  placeholder?: string;
  formatHint?: string;
}

export type PublicTask = Omit<Task, "questions"> & {
  questions: PublicQuestion[];
};

export function toPublicQuestion(question: Question): PublicQuestion {
  const pub: PublicQuestion = {
    id: question.id,
    kind: question.kind,
    prompt: question.prompt,
  };
  if (question.hint) pub.hint = question.hint;
  if (question.placeholder) pub.placeholder = question.placeholder;
  if (question.formatHint) pub.formatHint = question.formatHint;
  if (question.options) {
    pub.options = question.options.map((option) => ({
      id: option.id,
      label: option.label,
      ...(option.detail ? { detail: option.detail } : {}),
    }));
  }
  return pub;
}

export function toPublicTask(task: Task): PublicTask {
  return {
    ...task,
    questions: task.questions.map(toPublicQuestion),
  };
}

/** Tasks unlock sequentially — task N needs tasks 1..N-1 complete. */
export function unlockedTaskIds(room: Room, completedTaskIds: string[]): string[] {
  const completed = new Set(completedTaskIds);
  const unlocked: string[] = [];
  for (const task of room.tasks) {
    unlocked.push(task.id);
    if (!completed.has(task.id)) break;
  }
  return unlocked;
}
