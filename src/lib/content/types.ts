export type Severity = "low" | "medium" | "high" | "critical";

export type Difficulty = "easy" | "medium" | "hard" | "insane";

export interface ChoiceOption {
  id: string;
  label: string;
  detail?: string;
}

/**
 * A question is answered inline inside a task, the way a TryHackMe room works.
 * `choice` is verified by option id, `flag` by matching a normalised string.
 */
export interface Question {
  id: string;
  kind: "choice" | "flag";
  prompt: string;
  hint?: string;
  options?: ChoiceOption[];
  correctOptionId?: string;
  /** Accepted answers for `flag` questions (normalised, case-insensitive). */
  accept?: string[];
  placeholder?: string;
  /** TryHackMe-style answer format hint, e.g. "Format: 4 characters". */
  formatHint?: string;
}

export interface EvidenceCard {
  id: string;
  label: string;
  finding: string;
  confidence: string;
  source: string;
  severity: Severity;
}

export interface Character {
  name: string;
  role: string;
  initials: string;
  /** Tailwind text colour class for the avatar ring. */
  accent: string;
}

export interface Task {
  id: string;
  order: number;
  index: string;
  codename: string;
  title: string;
  tagline: string;
  topic: string;
  statusLabel: string;
  minutes: string;
  xp: number;
  briefing: string[];
  objectives: string[];
  characters: Character[];
  /** Key into the simulator registry. */
  simulatorKey: string;
  questions: Question[];
  evidence: EvidenceCard;
  clueChain: string[];
  nextLead: string;
  debrief: string[];
  secureDesign: string[];
}

export interface FinalFinding {
  id: string;
  area: string;
  finding: string;
  evidence: string;
  severity: Severity;
}

export interface Room {
  id: string;
  code: string;
  /** Short room name used in the catalogue, e.g. "Project Echo". */
  name: string;
  operation: string;
  title: string;
  subtitle: string;
  /** Catalogue blurb. */
  description: string;
  org: string;
  role: string;
  difficulty: Difficulty;
  /** Display label kept from the original brief, e.g. "Medium". */
  difficultyLabel: string;
  duration: string;
  classification: string;
  tags: string[];
  premise: string[];
  opening: { time: string; headline: string; lines: string[] };
  objective: string;
  taskIds: string[];
  tasks: Task[];
  finalFindings: FinalFinding[];
  rootCause: string;
  rootCauseDetail: string[];
  takeaway: string[];
  learningOutcomes: string[];
  closing: { speaker: string; role: string; lines: string[] };
  glyph: string;
  accent: string;
}

export function normaliseAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s"'`]/g, "")
    .replace(/^\.\//, "");
}

/** The answer we reveal when a learner gives up, and show after a correct hit. */
export function canonicalAnswer(question: Question): string {
  if (question.kind === "choice") {
    const option = question.options?.find(
      (o) => o.id === question.correctOptionId,
    );
    return option?.label ?? "";
  }
  return question.accept?.[0] ?? "";
}
