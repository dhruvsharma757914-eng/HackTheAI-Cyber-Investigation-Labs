import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { GUEST_EMAIL_DOMAIN } from "@/lib/guest";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "labs.sqlite");

export interface UserRow {
  id: number;
  callsign: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface ProgressRow {
  id: number;
  user_id: number;
  room_id: string;
  task_id: string;
  xp: number;
  /** JSON map of questionId -> "correct" | "revealed" */
  answered: string;
  completed_at: string;
}

export interface LeaderboardRow {
  id: number;
  callsign: string;
  xp: number;
  tasks_completed: number;
}

/** Answer state for a single question. */
export type AnswerState = "correct" | "revealed";
export type AnswerMap = Record<string, AnswerState>;

// Next.js imports route modules during build-time page data collection. Opening
// the database at import time makes several build workers race for the file, so
// the connection is created lazily on first actual query instead.
const globalForDb = globalThis as unknown as { __labsDb?: DatabaseSync };

function createDatabase(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const database = new DatabaseSync(DB_PATH);

  // busy_timeout must be set before switching journal modes so concurrent
  // workers wait rather than throwing SQLITE_BUSY.
  database.exec("PRAGMA busy_timeout = 5000;");
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      callsign      TEXT    NOT NULL UNIQUE,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id      TEXT    NOT NULL,
      task_id      TEXT    NOT NULL,
      xp           INTEGER NOT NULL DEFAULT 0,
      answered     TEXT    NOT NULL DEFAULT '{}',
      completed_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, room_id, task_id)
    );
  `);

  migrate(database);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_progress_user
      ON progress (user_id, room_id);
  `);

  return database;
}

/**
 * Upgrades databases created by the earlier case/mission vocabulary so existing
 * progress survives the move to rooms and tasks.
 */
function migrate(database: DatabaseSync): void {
  const columns = (
    database.prepare("PRAGMA table_info(progress)").all() as unknown as Array<{
      name: string;
    }>
  ).map((column) => column.name);

  if (columns.includes("case_id") && !columns.includes("room_id")) {
    database.exec("ALTER TABLE progress RENAME COLUMN case_id TO room_id");
  }
  if (columns.includes("mission_id") && !columns.includes("task_id")) {
    database.exec("ALTER TABLE progress RENAME COLUMN mission_id TO task_id");
  }
  if (!columns.includes("answered")) {
    database.exec(
      "ALTER TABLE progress ADD COLUMN answered TEXT NOT NULL DEFAULT '{}'",
    );
  }
}

function getDb(): DatabaseSync {
  if (!globalForDb.__labsDb) {
    globalForDb.__labsDb = createDatabase();
  }
  return globalForDb.__labsDb;
}

/* ------------------------------------------------------------------ users */

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email) as unknown as UserRow | undefined;
}

export function findUserByCallsign(callsign: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE lower(callsign) = lower(?)")
    .get(callsign) as unknown as UserRow | undefined;
}

export function findUserById(id: number): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown as
    | UserRow
    | undefined;
}

export function createUser(
  callsign: string,
  email: string,
  passwordHash: string,
): UserRow {
  const result = getDb()
    .prepare("INSERT INTO users (callsign, email, password_hash) VALUES (?, ?, ?)")
    .run(callsign, email, passwordHash);

  return findUserById(Number(result.lastInsertRowid))!;
}

/**
 * Finds or creates the anonymous analyst record backing a guest cookie.
 *
 * Guests exist purely so progress and XP can be persisted and ranked without a
 * sign-up; the stored password hash is intentionally unusable.
 */
export function findOrCreateGuestUser(guestId: string): UserRow {
  const email = `guest-${guestId}@${GUEST_EMAIL_DOMAIN}`;
  const existing = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as unknown as UserRow | undefined;
  if (existing) return existing;

  const base = `Recruit-${guestId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`;
  let callsign = base;
  for (let n = 1; findUserByCallsign(callsign); n += 1) {
    callsign = `${base}-${n}`;
  }

  const result = getDb()
    .prepare("INSERT INTO users (callsign, email, password_hash) VALUES (?, ?, ?)")
    .run(callsign, email, "guest-account-no-password");
  return findUserById(Number(result.lastInsertRowid))!;
}

/* --------------------------------------------------------------- progress */

export function getRoomProgress(userId: number, roomId: string): ProgressRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM progress WHERE user_id = ? AND room_id = ? ORDER BY completed_at ASC",
    )
    .all(userId, roomId) as unknown as ProgressRow[];
}

export function getTaskProgress(
  userId: number,
  roomId: string,
  taskId: string,
): ProgressRow | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM progress WHERE user_id = ? AND room_id = ? AND task_id = ?",
    )
    .get(userId, roomId, taskId) as unknown as ProgressRow | undefined;
}

export function getAllProgress(userId: number): ProgressRow[] {
  return getDb()
    .prepare("SELECT * FROM progress WHERE user_id = ? ORDER BY completed_at ASC")
    .all(userId) as unknown as ProgressRow[];
}

/** Create the row if needed, then persist the answer map and XP for a task. */
export function saveTaskProgress(
  userId: number,
  roomId: string,
  taskId: string,
  answered: AnswerMap,
  xp: number,
): void {
  getDb()
    .prepare(
      `INSERT INTO progress (user_id, room_id, task_id, xp, answered)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, room_id, task_id)
       DO UPDATE SET xp = excluded.xp, answered = excluded.answered`,
    )
    .run(userId, roomId, taskId, xp, JSON.stringify(answered));
}

/* ------------------------------------------------------------ leaderboard */

export function getLeaderboard(limit = 50): LeaderboardRow[] {
  // Guest records are created for every visitor, so unnamed guests with no
  // progress are hidden — anyone who earns XP earns a place on the board.
  return getDb()
    .prepare(
      `SELECT u.id            AS id,
              u.callsign      AS callsign,
              COALESCE(SUM(p.xp), 0) AS xp,
              COUNT(p.id)     AS tasks_completed
       FROM users u
       LEFT JOIN progress p ON p.user_id = u.id
       GROUP BY u.id
       HAVING SUM(p.xp) > 0 OR u.email NOT LIKE 'guest-%'
       ORDER BY xp DESC, tasks_completed DESC, u.callsign ASC
       LIMIT ?`,
    )
    .all(limit) as unknown as LeaderboardRow[];
}

export function countUsers(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as unknown as {
    n: number;
  };
  return row?.n ?? 0;
}
