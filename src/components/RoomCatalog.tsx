"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { difficultyMeta } from "@/lib/difficulty";
import type { Difficulty } from "@/lib/content/types";
import { ProgressBar } from "@/components/ui";

export interface RoomCardData {
  id: string;
  code: string;
  name: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  duration: string;
  org: string;
  tags: string[];
  taskCount: number;
  questionCount: number;
  maxXp: number;
  xp: number;
  percent: number;
  completedTasks: number;
  completed: boolean;
  glyph: string;
}

type DifficultyFilter = "all" | Difficulty;
type SortKey = "default" | "easiest" | "progress";

export function RoomCatalog({
  rooms,
  signedIn,
}: {
  rooms: RoomCardData[];
  signedIn: boolean;
}) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("default");

  const allTags = useMemo(
    () => [...new Set(rooms.flatMap((room) => room.tags))].sort(),
    [rooms],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = rooms.filter((room) => {
      if (difficulty !== "all" && room.difficulty !== difficulty) return false;
      if (tag && !room.tags.includes(tag)) return false;
      if (!needle) return true;

      return (
        room.name.toLowerCase().includes(needle) ||
        room.title.toLowerCase().includes(needle) ||
        room.code.toLowerCase().includes(needle) ||
        room.org.toLowerCase().includes(needle) ||
        room.tags.some((t) => t.toLowerCase().includes(needle))
      );
    });

    if (sort === "easiest") {
      const order: Difficulty[] = ["easy", "medium", "hard", "insane"];
      return [...filtered].sort(
        (a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty),
      );
    }
    if (sort === "progress") {
      return [...filtered].sort((a, b) => b.percent - a.percent);
    }
    return filtered;
  }, [rooms, query, difficulty, tag, sort]);

  const anyFilter = query !== "" || difficulty !== "all" || tag !== null;

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              ⌕
            </span>
            <input
              className="field pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms, tags, organisations…"
              aria-label="Search rooms"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {(["all", "easy", "medium", "hard", "insane"] as const).map((key) => {
              const active = difficulty === key;
              const meta = key === "all" ? null : difficultyMeta[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDifficulty(key)}
                  className={`chip border transition ${
                    active
                      ? meta
                        ? `${meta.border} ${meta.bg} ${meta.text}`
                        : "border-signal-green/50 bg-signal-green/10 text-signal-green"
                      : "border-void-600 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  {key === "all" ? "All" : meta!.label}
                </button>
              );
            })}
          </div>

          <select
            className="field w-full lg:w-40"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort rooms"
          >
            <option value="default">Default order</option>
            <option value="easiest">Easiest first</option>
            <option value="progress">Most progress</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-void-700 pt-3">
          <span className="mr-1 text-[10px] uppercase tracking-[0.16em] text-slate-600">
            Tags
          </span>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? null : t)}
              className={`rounded px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition ${
                tag === t
                  ? "bg-signal-cyan/15 text-signal-cyan"
                  : "bg-void-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
          {anyFilter && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDifficulty("all");
                setTag(null);
              }}
              className="ml-auto text-[10px] uppercase tracking-[0.14em] text-signal-red hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-600">
        {visible.length} room{visible.length === 1 ? "" : "s"}
        {anyFilter ? " matching" : " available"}
      </p>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((room) => {
          const meta = difficultyMeta[room.difficulty];
          const cta = room.completed
            ? "Review room"
            : room.percent > 0
              ? "Continue room"
              : "Start room";

          return (
            <article
              key={room.id}
              className="panel group relative flex flex-col overflow-hidden transition hover:border-slate-500 hover:shadow-glow"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`}
                aria-hidden
              />

              <div className="flex items-start gap-3 p-5 pl-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-void-500 bg-void-800 text-xl">
                  {room.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight text-slate-100 group-hover:text-white">
                      {room.name}
                    </h2>
                    <span className={`chip ${meta.border} ${meta.bg} ${meta.text}`}>
                      {room.difficultyLabel}
                    </span>
                    {room.completed && (
                      <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                        ✓ COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {room.code} · {room.org}
                  </p>
                </div>
              </div>

              <p className="px-5 pl-6 text-[11px] italic text-slate-500">
                {room.title}
              </p>

              <p className="mt-3 line-clamp-3 px-5 pl-6 text-[12px] leading-relaxed text-slate-400">
                {room.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5 px-5 pl-6">
                {room.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-void-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-slate-500"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-auto space-y-3 p-5 pl-6">
                <dl className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <div>
                    <dt>Tasks</dt>
                    <dd className="mt-0.5 text-xs normal-case tracking-normal text-slate-300">
                      {room.taskCount}
                    </dd>
                  </div>
                  <div>
                    <dt>Questions</dt>
                    <dd className="mt-0.5 text-xs normal-case tracking-normal text-slate-300">
                      {room.questionCount}
                    </dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd className="mt-0.5 text-xs normal-case tracking-normal text-slate-300">
                      {room.duration}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    <span>
                      {room.completedTasks}/{room.taskCount} tasks
                    </span>
                    <span className={meta.text}>
                      {room.percent}% · {room.xp}/{room.maxXp} XP
                    </span>
                  </div>
                  <ProgressBar
                    value={room.percent}
                    max={100}
                    tone={room.id === "echo" ? "cyan" : "violet"}
                  />
                </div>

                <Link
                  href={`/rooms/${room.id}`}
                  className="btn-primary w-full"
                >
                  {cta}
                </Link>
                {!signedIn && (
                  <p className="text-center text-[10px] text-slate-600">
                    Progress saves automatically to this browser
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="panel p-10 text-center">
          <p className="text-2xl">🛰️</p>
          <p className="mt-3 text-sm font-bold text-slate-300">No rooms found</p>
          <p className="mt-1 text-[11px] text-slate-600">
            Try a different search term or clear the filters.
          </p>
        </div>
      )}
    </div>
  );
}
