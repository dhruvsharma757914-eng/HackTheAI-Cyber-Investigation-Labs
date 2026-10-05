"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PublicTask } from "@/lib/content";
import type { AnswerMap, AnswerState } from "@/lib/db";
import { Panel, SeverityChip } from "@/components/ui";
import { MissionSimulator } from "@/components/simulators";

export interface TaskNavItem {
  id: string;
  index: string;
  codename: string;
  complete: boolean;
  answered: number;
  total: number;
}

interface TaskViewProps {
  roomId: string;
  roomName: string;
  roomCode: string;
  task: PublicTask;
  nav: TaskNavItem[];
  initialAnswered: AnswerMap;
  prevTaskId: string | null;
  nextTaskId: string | null;
  signedIn: boolean;
}

type Feedback = { status: "correct" | "wrong" | "revealed"; message?: string };

export function TaskView({
  roomId,
  roomName,
  roomCode,
  task,
  nav,
  initialAnswered,
  prevTaskId,
  nextTaskId,
  signedIn,
}: TaskViewProps) {
  const router = useRouter();

  const [answered, setAnswered] = useState<AnswerMap>(initialAnswered);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hintsOpen, setHintsOpen] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string>(
    task.questions.find((q) => !(q.id in initialAnswered))?.id ??
      task.questions[0]?.id ??
      "",
  );

  const answeredCount = useMemo(
    () => task.questions.filter((q) => q.id in answered).length,
    [answered, task.questions],
  );
  const taskDone = answeredCount === task.questions.length;

  async function submit(questionId: string, overrideAnswer?: string) {
    const answer = overrideAnswer ?? inputs[questionId] ?? "";
    setBusyId(questionId);

    try {
      const res = await fetch(
        `/api/rooms/${roomId}/tasks/${task.id}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, answer }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        correct?: boolean;
        state?: AnswerState | null;
        canonical?: string | null;
        answered?: AnswerMap;
        error?: string;
      };

      if (data.error) {
        setFeedback((prev) => ({
          ...prev,
          [questionId]: { status: "wrong", message: data.error },
        }));
      } else if (data.correct && data.answered) {
        setAnswered(data.answered);
        setFeedback((prev) => ({
          ...prev,
          [questionId]: { status: "correct", message: data.canonical ?? undefined },
        }));
        // Auto-advance focus to the next unanswered question.
        const next = task.questions.find(
          (q) => q.id !== questionId && !(q.id in data.answered!),
        );
        if (next) setActiveId(next.id);
        router.refresh();
      } else {
        setFeedback((prev) => ({
          ...prev,
          [questionId]: { status: "wrong" },
        }));
      }
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [questionId]: { status: "wrong", message: "Network error — try again." },
      }));
    }

    setBusyId(null);
  }

  async function reveal(questionId: string) {
    setBusyId(questionId);

    try {
      const res = await fetch(
        `/api/rooms/${roomId}/tasks/${task.id}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, reveal: true }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        answered?: AnswerMap;
        canonical?: string | null;
        error?: string;
      };

      if (data.answered) {
        setAnswered(data.answered);
        setFeedback((prev) => ({
          ...prev,
          [questionId]: { status: "revealed", message: data.canonical ?? "" },
        }));
        router.refresh();
      }
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [questionId]: { status: "wrong", message: "Network error — try again." },
      }));
    }

    setBusyId(null);
  }

  const roomProgress = useMemo(() => {
    const total = nav.reduce((n, item) => n + item.total, 0);
    const done = nav.reduce(
      (n, item) => n + (item.complete ? item.total : item.answered),
      0,
    );
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [nav]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sticky task navigation */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="panel overflow-hidden">
          <div className="border-b border-void-600 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
              {roomCode}
            </div>
            <div className="mt-0.5 text-xs font-bold text-slate-200">
              {roomName}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <span>Room progress</span>
              <span className="text-signal-green">{roomProgress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-void-700">
              <div
                className="h-full rounded-full bg-signal-green transition-all duration-500"
                style={{ width: `${roomProgress}%` }}
              />
            </div>
          </div>

          <ol className="max-h-[60vh] overflow-y-auto p-2">
            {nav.map((item) => {
              const isCurrent = item.id === task.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`/rooms/${roomId}/tasks/${item.id}`}
                    className={`flex items-start gap-2.5 rounded px-3 py-2.5 transition ${
                      isCurrent
                        ? "bg-signal-cyan/10 text-signal-cyan"
                        : "text-slate-400 hover:bg-void-800"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        item.complete
                          ? "bg-signal-green/15 text-signal-green"
                          : "bg-void-700 text-slate-500"
                      }`}
                    >
                      {item.complete ? "✓" : item.index}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] leading-snug">
                        {item.codename}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-600">
                        {item.answered}/{item.total} answered
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <Link
          href={`/rooms/${roomId}`}
          className="btn-ghost mt-3 w-full !py-1.5"
        >
          Room overview
        </Link>
      </aside>

      {/* Task body */}
      <div className="min-w-0 space-y-6">
        <header className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-void-600 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan">
                TASK {task.index}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {task.statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-slate-600">
              <span>⏱ {task.minutes}</span>
              <span className="text-signal-amber">★ {task.xp} XP</span>
              {taskDone && (
                <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                  ✓ TASK COMPLETE
                </span>
              )}
            </div>
          </div>

          <div className="px-5 py-5">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              {task.codename}
            </h1>
            <p className="mt-1 text-xs text-slate-500">{task.title}</p>
            <p className="mt-3 max-w-3xl text-sm italic leading-relaxed text-slate-400">
              {task.tagline}
            </p>
          </div>
        </header>

        {/* Briefing */}
        <Panel title="Briefing">
          <div className="prose-soc text-sm">
            {task.briefing.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="Objectives">
            <ul className="space-y-2">
              {task.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex gap-3 text-[12px] text-slate-400"
                >
                  <span className="text-signal-cyan">▸</span>
                  {objective}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Investigation team">
            <ul className="space-y-3">
              {task.characters.map((character) => (
                <li key={character.name} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-void-500 bg-void-800 text-[10px] font-bold ${character.accent}`}
                  >
                    {character.initials}
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold text-slate-200">
                      {character.name}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.12em] text-slate-600">
                      {character.role}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* The lab */}
        <div className="space-y-3">
          <div className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse-fast rounded-full bg-signal-green" />
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Lab environment · synthetic data · no production access
              </span>
            </div>
          </div>
          <MissionSimulator simulatorKey={task.simulatorKey} />
        </div>

        {/* Questions */}
        <div className="space-y-3">
          <div className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <h2 className="panel-title">
              Answer the questions below ({answeredCount}/{task.questions.length})
            </h2>
          </div>

          {task.questions.map((question, index) => {
            const state = answered[question.id];
            const fb = feedback[question.id];
            const isDone = Boolean(state);
            const showHint = hintsOpen[question.id];

            return (
              <div
                key={question.id}
                onFocus={() => setActiveId(question.id)}
                className={`panel scroll-mt-24 p-5 transition ${
                  state === "correct"
                    ? "border-signal-green/50"
                    : state === "revealed"
                      ? "border-signal-amber/50"
                      : "border-void-600"
                }`}
              >
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                      state === "correct"
                        ? "bg-signal-green/15 text-signal-green"
                        : state === "revealed"
                          ? "bg-signal-amber/15 text-signal-amber"
                          : "bg-void-700 text-slate-500"
                    }`}
                  >
                    {state === "correct" ? "✓" : state === "revealed" ? "!" : index + 1}
                  </span>
                  <p className="flex-1 text-[13px] leading-relaxed text-slate-200">
                    {question.prompt}
                  </p>
                </div>

                {!isDone && (
                  <div className="ml-9 space-y-3">
                    {question.kind === "choice" ? (
                      <div className="space-y-2">
                        {question.options?.map((option) => (
                          <label
                            key={option.id}
                            className={`flex cursor-pointer gap-3 rounded border px-3 py-2.5 text-[12px] transition ${
                              inputs[question.id] === option.id
                                ? "border-signal-cyan/50 bg-signal-cyan/5 text-slate-200"
                                : "border-void-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              checked={inputs[question.id] === option.id}
                              onChange={() =>
                                setInputs((prev) => ({
                                  ...prev,
                                  [question.id]: option.id,
                                }))
                              }
                              className="mt-0.5 h-3.5 w-3.5 accent-teal-400"
                            />
                            <span>
                              {option.label}
                              {option.detail && (
                                <span className="mt-0.5 block text-[10px] text-slate-600">
                                  {option.detail}
                                </span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        className="field max-w-md"
                        value={inputs[question.id] ?? ""}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void submit(question.id);
                          }
                        }}
                        placeholder={question.placeholder ?? "Your answer"}
                      />
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="btn-primary !px-4 !py-1.5"
                        onClick={() => submit(question.id)}
                        disabled={busyId === question.id || !inputs[question.id]}
                      >
                        {busyId === question.id ? "Checking…" : "Submit"}
                      </button>

                      {question.hint && (
                        <button
                          type="button"
                          className="btn-ghost !px-3 !py-1.5"
                          onClick={() =>
                            setHintsOpen((prev) => ({
                              ...prev,
                              [question.id]: !prev[question.id],
                            }))
                          }
                        >
                          {showHint ? "Hide hint" : "Hint"}
                        </button>
                      )}

                      {signedIn && (
                        <button
                          type="button"
                          className="btn-ghost !px-3 !py-1.5"
                          onClick={() => reveal(question.id)}
                          disabled={busyId === question.id}
                        >
                          Reveal answer
                        </button>
                      )}

                      {question.formatHint && (
                        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                          Format: {question.formatHint}
                        </span>
                      )}
                    </div>

                    {showHint && question.hint && (
                      <p className="text-[11px] text-signal-amber">
                        HINT · {question.hint}
                      </p>
                    )}

                    {fb?.status === "wrong" && (
                      <p className="text-[11px] text-signal-red">
                        ✗ {fb.message ?? "Incorrect. Check the lab and try again."}
                      </p>
                    )}
                  </div>
                )}

                {isDone && (
                  <div className="ml-9">
                    <div
                      className={`flex flex-wrap items-center gap-2 rounded border px-3 py-2 text-[11px] ${
                        state === "correct"
                          ? "border-signal-green/40 bg-signal-green/5 text-signal-green"
                          : "border-signal-amber/40 bg-signal-amber/5 text-signal-amber"
                      }`}
                    >
                      <span className="font-bold">
                        {state === "correct" ? "Correct!" : "Answer revealed"}
                      </span>
                      <span className="text-slate-400">
                        {fb?.message ?? ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Task completion */}
        {taskDone && (
          <Panel
            title="Task complete"
            right={
              <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                +{task.xp} XP
              </span>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                {task.debrief.map((line, i) => (
                  <p key={i} className="text-[13px] leading-relaxed text-slate-400">
                    {line}
                  </p>
                ))}
              </div>

              <div className="rounded border border-signal-cyan/40 bg-signal-cyan/5 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="chip border-signal-cyan/40 bg-signal-cyan/10 text-signal-cyan">
                    EVIDENCE {task.evidence.id}
                  </span>
                  <SeverityChip severity={task.evidence.severity} />
                </div>
                <p className="text-[12px] leading-relaxed text-slate-300">
                  {task.evidence.finding}
                </p>
                <dl className="mt-3 space-y-1 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                  <div>CONFIDENCE · {task.evidence.confidence}</div>
                  <div>SOURCE · {task.evidence.source}</div>
                </dl>
              </div>

              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  Clue chain
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {task.clueChain.map((clue, i) => (
                    <span key={`${clue}-${i}`} className="flex items-center gap-2">
                      <span className="rounded border border-void-600 px-2 py-1 text-[10px] text-slate-400">
                        {clue}
                      </span>
                      {i < task.clueChain.length - 1 && (
                        <span className="text-slate-700">→</span>
                      )}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-signal-violet">
                  Unlocks: {task.nextLead}
                </p>
              </div>
            </div>
          </Panel>
        )}

        {/* Secure design */}
        <Panel title="Secure design">
          <ul className="space-y-2">
            {task.secureDesign.map((item) => (
              <li key={item} className="flex gap-3 text-[12px] text-slate-400">
                <span className="text-signal-green">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Panel>

        {/* Prev / next */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {prevTaskId ? (
            <Link
              href={`/rooms/${roomId}/tasks/${prevTaskId}`}
              className="btn-ghost"
            >
              ← Previous task
            </Link>
          ) : (
            <Link href={`/rooms/${roomId}`} className="btn-ghost">
              ← Room overview
            </Link>
          )}

          {nextTaskId ? (
            <Link
              href={`/rooms/${roomId}/tasks/${nextTaskId}`}
              className={`btn-primary ${taskDone ? "" : "opacity-50"}`}
              aria-disabled={!taskDone}
              title={
                taskDone
                  ? undefined
                  : "Answer every question to unlock the next task"
              }
            >
              Next task →
            </Link>
          ) : (
            <Link href={`/rooms/${roomId}`} className="btn-primary">
              Finish room →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
