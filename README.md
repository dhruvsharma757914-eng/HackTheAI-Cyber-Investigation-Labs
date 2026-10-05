# HackTheAI — Cyber Investigation Labs

A full-stack, TryHackMe-style training platform built around two interconnected
cybersecurity investigation storylines by **Dhruv Sharma** (Trinet Layer,
Cyber Security Analyst Intern).

| Room | Operation | Org | Tasks | Questions | XP |
| --- | --- | --- | --- | --- | --- |
| **VT-047** | 🛰️ Project Echo — *The System They Thought They Deleted* | Vantaris Technologies | 5 | 15 | 1000 |
| **NF-219** | 🌑 Operation Black Relay — *The Breach That Left No Single Trace* | Aurelia Systems | 5 | 15 | 1000 |

Every task ships a **working lab environment** rather than a wall of text. You
analyse the artefact, answer the questions inline, and each completed task
unlocks the next lead.

---

## Architecture — how it mirrors TryHackMe

```
Room catalogue (/)
 └─ Room  (/rooms/echo)                       ← brief, task list, progress
     └─ Task (/rooms/echo/tasks/m1)           ← sticky task nav + lab + questions
         ├─ Briefing / Objectives
         ├─ Lab  (interactive simulator)
         └─ Questions ×N  ──► inline answer box ──► instant ✓ / ✗
                              └─ Reveal answer ──► amber, still counts
```

| TryHackMe concept | Here |
| --- | --- |
| Room | `Room` — a full investigation with 5 tasks |
| Task | `Task` — one numbered section with its own lab |
| Question | `Question` — inline answer box inside the task |
| Answer checking | `POST /api/rooms/:roomId/tasks/:taskId/answer` |
| Reveal answer | Same endpoint with `{ reveal: true }` |
| Task navigation | Sticky sidebar with ticks and per-task answered counts |
| Progress | `%` per room, globally in the navbar |
| Streak/rank/XP | XP per task, ranks from Recruit → Senior Analyst |
| Leaderboard | `/leaderboard`, ranked by total XP |
| Profile | `/profile` with stats, badges and an evidence locker |
| Room catalogue | `/` with search, difficulty filters, tag filters, sort |

### Answer integrity

Question keys (`accept[]`, `correctOptionId`) live **only on the server**.
`toPublicTask()` strips them before any task crosses to the client, and the
client bundle is verified free of them at build time:

```bash
grep -rl "correctOptionId" .next/static   # → 0 files
grep -rl "training_only_secret" .next/static   # → 0 files
```

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 15** (App Router) + React 19 | Server components for per-user rendering, API routes in one repo |
| Language | **TypeScript** (strict) | The content model is fully typed |
| Styling | **Tailwind CSS 3** | Custom SOC/terminal theme |
| Database | **`node:sqlite`** (built into Node 22+) | Zero dependencies, no ORM, no codegen, no native build |
| Auth | **bcryptjs** + **jose** JWT in an httpOnly cookie | Email/password accounts, 30-day sessions |
| Content | Plain TypeScript modules | Type-checked at build time, no CMS |

**No external services required** — no Docker, no hosted database, no API keys.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

### Configuration

Works with zero configuration. Two optional settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | auto-generated into `data/.session-secret` | JWT signing key. **Set this in production.** |
| `PORT` | `3000` | Server port |

The SQLite database is created automatically at `data/labs.sqlite`. `data/` is
gitignored.

---

## The 10 lab environments

### 🛰️ Project Echo (VT-047)

| Task | Topic | Lab |
| --- | --- | --- |
| 01 · The Bucket That Remembered | Cloud Security | Browse `echo-archive-v3`, read the decommissioning checklist and access history |
| 02 · The Extension With a Memory | Browser Security | Static-analyse the Echo Helper package across 5 files, clickable findings |
| 03 · The Hostname That Lied | DNS / Trust | Resolve the hostname repeatedly, watch the answer change, probe both destinations |
| 04 · The Webhook That Trusted Too Much | API Security | Forge signed / unsigned / invalid / replayed requests, read the control trace |
| 05 · The Commit That Refused to Die | Git Forensics | Walk the commit trail, recover a deleted `.env` from history |

### 🌑 Operation Black Relay (NF-219)

| Task | Topic | Lab |
| --- | --- | --- |
| 01 · The Identity That Should Not Work | Identity / SAML | Replay a stale assertion; toggle the fix and compare |
| 02 · The Container That Opened the Wrong Door | Container Security | Audit `docker inspect` output; diff the host artefact against the dashboard |
| 03 · The Logs That Changed Their Story | Log Integrity | Side-by-side log diff, timestamp drift, poisoned-entry inspector |
| 04 · The Subdomain That Belonged to Nobody | DNS Hygiene | Resolve the CNAME, check claim status, simulate the takeover |
| 05 · The Secret Inside the Pipeline | CI/CD Security | Scan workflow history for secrets, inspect the removal diff |

---

## Routes

| Route | Description |
| --- | --- |
| `/` | Room catalogue with search, filters and per-room progress |
| `/rooms/[roomId]` | Room brief, task list, final report when complete |
| `/rooms/[roomId]/tasks/[taskId]` | Task nav + lab + inline questions |
| `/profile` | Stats, badges, evidence locker |
| `/leaderboard` | Global XP ranking |
| `/login`, `/signup` | Auth |
| `POST /api/auth/signup` · `login` · `logout` | Session endpoints |
| `GET /api/progress` | Rooms, answered maps and overall summary |
| `POST /api/rooms/[roomId]/tasks/[taskId]/answer` | Check one answer, or reveal it |

Legacy URLs still work: `/cases/:id` → `/rooms/:id`, and
`/cases/:id/missions/:mid` → `/rooms/:id/tasks/:mid` (HTTP 308).

All per-user routes are `force-dynamic`, so progress is never served from a
static cache.

---

## Project layout

```
src/
├── app/
│   ├── api/
│   │   ├── auth/{signup,login,logout}/route.ts
│   │   ├── progress/route.ts
│   │   └── rooms/[roomId]/tasks/[taskId]/answer/route.ts
│   ├── rooms/[roomId]/{page.tsx, tasks/[taskId]/page.tsx}
│   ├── cases/[caseId]/…            # legacy redirects
│   ├── profile/ · leaderboard/ · login/ · signup/
│   ├── globals.css                 # SOC theme + panel/btn/field utilities
│   └── layout.tsx                  # shell + NavBar + training notice
├── components/
│   ├── simulators/                 # the 10 lab modules + registry
│   ├── TaskView.tsx                # sticky task nav + inline questions
│   ├── RoomCatalog.tsx             # catalogue with search/filters
│   ├── NavBar.tsx · AuthForm.tsx · ui.tsx
└── lib/
    ├── content/                    # rooms (echo.ts, nightfall.ts) + schema + validation
    ├── difficulty.ts               # content-free styling (keeps answers out of client bundles)
    ├── progress.ts                 # rows → room/task summaries
    ├── auth.ts · db.ts
    └── data/labs.sqlite            # created at runtime (gitignored)
```

---

## Data model

`users` — `id, callsign, email, password_hash, created_at`

`progress` — one row per (analyst, task):

| Column | Meaning |
| --- | --- |
| `user_id`, `room_id`, `task_id` | Unique together |
| `xp` | `0` until every question in the task is answered, then the task's XP |
| `answered` | JSON map `questionId → "correct" \| "revealed"` |

Databases created by the earlier case/mission schema are migrated automatically:
`case_id → room_id`, `mission_id → task_id`, and the `answered` column is added
with existing progress preserved.

---

## Adding a room or task

1. Append a `Task` to the room in `src/lib/content/echo.ts` or `nightfall.ts`.
   If you are adding a new room, export a `Room` and register it in
   `src/lib/content/index.ts`.
2. For a new lab, add a component under `src/components/simulators/` and
   register its key in `src/components/simulators/index.tsx`.
3. Set `simulatorKey`, add `questions`, `evidence` and `nextLead`.

Question types:

- `choice` — validated by `correctOptionId`
- `flag` — validated against `accept[]` after normalisation
  (case-insensitive, whitespace/quote-insensitive)

XP, unlocking, the catalogue, the task nav, badges and the evidence locker all
derive from the content modules automatically.

---

## ⚠️ Training notice

Every system, domain, IP address, credential, user, log, repository and
exploitation scenario in this application is **synthetic** and exists only for
controlled cybersecurity training. The documentation IP ranges
(`203.0.113.0/24`, `192.0.2.0/24`) and all secrets (e.g. `TRAINING_ONLY_SECRET`)
are placeholders with no real-world access.

The `legacy-vite-prototype/` folder holds an earlier prototype of Operation Black
Relay — see its own README.
